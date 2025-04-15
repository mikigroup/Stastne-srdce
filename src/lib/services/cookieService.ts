export type CookieCategory =
	| "necessary"
	| "preferences"
	| "statistics"
	| "marketing";

export interface CookieCategoryConfig {
	id: CookieCategory;
	label: string;
	description: string;
	value: boolean;
	required: boolean;
}

export interface CookieConsentConfig {
	[key: string]: CookieCategoryConfig;
}

export const defaultCategories: CookieConsentConfig = {
	necessary: {
		id: "necessary",
		label: "Nutné",
		description:
			"Tyto cookies jsou nezbytné pro základní funkce webu a nelze je vypnout.",
		value: true,
		required: true
	},
	preferences: {
		id: "preferences",
		label: "Preferenční",
		description:
			"Cookies pro ukládání vašich preferencí, např. jazyk, velikost písma apod.",
		value: false,
		required: false
	},
	statistics: {
		id: "statistics",
		label: "Statistické",
		description:
			"Pomáhají nám pochopit, jak návštěvníci používají náš web prostřednictvím anonymních statistik.",
		value: false,
		required: false
	},
	marketing: {
		id: "marketing",
		label: "Marketingové",
		description:
			"Používají se pro cílení reklamy a sledování vašich preferencí napříč weby.",
		value: false,
		required: false
	}
};

export interface CookieConsentOptions {
	cookieName?: string;
	expireDays?: number;
	path?: string;
	domain?: string;
	sameSite?: "strict" | "lax" | "none";
	secure?: boolean;
}

const defaultOptions: CookieConsentOptions = {
	cookieName: "gdpr_consent",
	expireDays: 365,
	path: "/",
	sameSite: "strict",
	secure: true
};

export class CookieConsentService {
	private options: CookieConsentOptions;
	private categories: CookieConsentConfig;

	constructor(
		options: CookieConsentOptions = {},
		categories: CookieConsentConfig = defaultCategories
	) {
		this.options = { ...defaultOptions, ...options };
		this.categories = { ...categories };
	}

	/**
	 * Kontroluje, zda existuje souhlas s cookies
	 */
	public hasConsent(): boolean {
		return this.getConsent() !== null;
	}

	/**
	 * Získá aktuální souhlas s cookies
	 */
	public getConsent(): Record<string, boolean> | null {
		try {
			const cookie = document.cookie
				.split("; ")
				.find((row) => row.startsWith(`${this.options.cookieName}=`));

			if (cookie) {
				return JSON.parse(decodeURIComponent(cookie.split("=")[1]));
			}
		} catch (error) {
			console.error("Chyba při načítání cookie souhlasu:", error);
		}
		return null;
	}

	/**
	 * Kontroluje, zda je daná kategorie cookies povolena
	 */
	public isCategoryAccepted(category: CookieCategory): boolean {
		const consent = this.getConsent();
		// Nutné cookies jsou vždy povoleny
		if (category === "necessary") return true;
		return consent ? !!consent[category] : false;
	}

	/**
	 * Nastaví souhlas s cookies
	 */
	public setConsent(
		consent: "all" | "none" | "selected",
		selectedCategories?: Record<string, boolean>
	): void {
		// Vytvoříme objekt souhlasu
		const consentObj: Record<string, boolean> = {};

		for (const [key, category] of Object.entries(this.categories)) {
			if (consent === "all") {
				consentObj[key] = true;
			} else if (consent === "none") {
				consentObj[key] = key === "necessary";
			} else if (consent === "selected" && selectedCategories) {
				consentObj[key] =
					key === "necessary" ? true : !!selectedCategories[key];
			} else {
				consentObj[key] = category.value;
			}
		}

		// Uložíme souhlas jako cookie
		const expires = new Date();
		expires.setDate(expires.getDate() + (this.options.expireDays || 365));

		let cookieString = `${this.options.cookieName}=${encodeURIComponent(JSON.stringify(consentObj))};expires=${expires.toUTCString()};path=${this.options.path}`;

		if (this.options.domain) {
			cookieString += `;domain=${this.options.domain}`;
		}

		if (this.options.sameSite) {
			cookieString += `;SameSite=${this.options.sameSite}`;
		}

		if (this.options.secure) {
			cookieString += `;Secure`;
		}

		document.cookie = cookieString;

		// Dispatchneme události pro jednotlivé typy cookies
		for (const [key, value] of Object.entries(consentObj)) {
			if (value) {
				window.dispatchEvent(new CustomEvent(`consent:${key}`));
			}
		}
	}

	/**
	 * Vymaže souhlas s cookies
	 */
	public clearConsent(): void {
		// Vyprázdníme cookie nastavením expirovat v minulosti
		document.cookie = `${this.options.cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=${this.options.path}`;
	}

	/**
	 * Inicializuje sledovací skripty podle souhlasu uživatele
	 */
	public initializeTrackingScripts(): void {
		const consent = this.getConsent();
		if (!consent) return;

		// Příklad: Inicializace Google Analytics, pokud jsou povoleny statistické cookies
		if (consent.statistics) {
			this.initGoogleAnalytics();
		}

		// Příklad: Inicializace marketingových cookies
		if (consent.marketing) {
			this.initMarketingScripts();
		}
	}

	/**
	 * Inicializace Google Analytics
	 * Tuto metodu je potřeba upravit podle skutečné implementace
	 */
	private initGoogleAnalytics(): void {
		// Získání GA ID z konfigurace nebo metadat
		const gaId = document
			.querySelector('meta[name="ga-id"]')
			?.getAttribute("content");

		if (!gaId) return;

		// Přidání GA skriptu
		const script = document.createElement("script");
		script.async = true;
		script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
		document.head.appendChild(script);

		// Inicializace GA
		window.dataLayer = window.dataLayer || [];
		function gtag(...args: any[]) {
			window.dataLayer.push(args);
		}
		gtag("js", new Date());
		gtag("config", gaId);
	}

	/**
	 * Inicializace marketingových skriptů
	 * Tuto metodu je potřeba upravit podle skutečné implementace
	 */
	private initMarketingScripts(): void {
		// Implementace podle potřeb - např. Facebook Pixel, apod.
		const fbPixelId = document
			.querySelector('meta[name="fb-pixel-id"]')
			?.getAttribute("content");

		if (fbPixelId) {
			// Facebook Pixel
			!(function (f, b, e, v, n, t, s) {
				if (f.fbq) return;
				n = f.fbq = function () {
					n.callMethod
						? n.callMethod.apply(n, arguments)
						: n.queue.push(arguments);
				};
				if (!f._fbq) f._fbq = n;
				n.push = n;
				n.loaded = !0;
				n.version = "2.0";
				n.queue = [];
				t = b.createElement(e);
				t.async = !0;
				t.src = v;
				s = b.getElementsByTagName(e)[0];
				s.parentNode.insertBefore(t, s);
			})(
				window,
				document,
				"script",
				"https://connect.facebook.net/en_US/fbevents.js"
			);

			fbq("init", fbPixelId);
			fbq("track", "PageView");
		}
	}
}

declare global {
	interface Window {
		dataLayer: any[];
		fbq: any;
	}
}
