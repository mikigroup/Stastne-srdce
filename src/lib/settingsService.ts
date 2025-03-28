import type { SupabaseClient } from "@supabase/supabase-js";
import { writable, readable, type Writable } from "svelte/store";

export interface GeneralSettings {
	shopName: string;
	shortName: string;
	slogan: string;
	legalName: string;
	currency?: string;
	language?: string;
	timezone?: string;
	dateFormat?: string;
	timeFormat?: string;
}

export interface SeoSettings {
	metaTitle: string;
	metaDescription: string;
	metaKeywords: string;
	ogTitle?: string;
	ogDescription?: string;
	ogImage?: string;
	ogType?: string;
	twitterCard?: string;
	twitterTitle?: string;
	twitterDescription?: string;
	googleSiteVerification?: string;
	googleAnalyticsId?: string;
	canonicalDomain?: string;
	robotsTxt?: string;
	structuredData?: any;
}

export interface ContactSettings {
	email: string;
	phone: string;
	secondaryPhone?: string;
	address: string;
	mapCoordinates?: { lat: number; lng: number };
	contactPerson?: string;
	contactPersonPosition?: string;
	openingHours?: Record<string, string>;
	holidayNotice?: string;
}

export interface SocialSettings {
	facebook?: string;
	instagram?: string;
	twitter?: string;
	youtube?: string;
	linkedin?: string;
	pinterest?: string;
	tiktok?: string;
	fbMessenger?: string;
	whatsapp?: string;
	shareButtons?: string[];
	showSocialIcons?: boolean;
}

export interface AppearanceSettings {
	primaryColor?: string;
	secondaryColor?: string;
	accentColor?: string;
	textColor?: string;
	backgroundColor?: string;
	logo?: string;
	logoAlternative?: string;
	favicon?: string;
	footerText?: string;
	customCSS?: string;
	customJavaScript?: string;
	headerStyle?: string;
	footerStyle?: string;
	showCategoryImages?: boolean;
	productCardsStyle?: string;
	homepageBanners?: Array<{
		image: string;
		title?: string;
		description?: string;
		buttonText?: string;
		buttonLink?: string;
	}>;
}

export interface BusinessSettings {
	ico?: string;
	dic?: string;
	bankAccount?: string;
	bankName?: string;
	iban?: string;
	swift?: string;
	vatRate?: number;
	deliveryOptions?: Array<{
		id: string;
		name: string;
		price: number;
		description?: string;
	}>;
	paymentMethods?: Array<{
		id: string;
		name: string;
		description?: string;
	}>;
	orderNumberPrefix?: string;
	orderStartNumber?: number;
	minimumOrderValue?: number;
	freeDeliveryThreshold?: number;
	termsAndConditionsUrl?: string;
	privacyPolicyUrl?: string;
	returnPolicyUrl?: string;
}

export interface EmailSettings {
	orderConfirmationTemplate?: string;
	orderCompletedTemplate?: string;
	contactFormTemplate?: string;
	emailSignature?: string;
	emailLogo?: string;
	sendCopyToAdmin?: boolean;
	adminEmailNotifications?: boolean;
}

export interface IntegrationSettings {
	recaptchaSiteKey?: string;
	recaptchaSecretKey?: string;
	facebookPixelId?: string;
	googleTagManagerId?: string;
	hotjarId?: string;
	cookieConsentEnabled?: boolean;
	cookieConsentText?: string;
	cookieCategories?: Array<{
		id: string;
		name: string;
		description: string;
	}>;
	sentryDsn?: string;
	mailchimpApiKey?: string;
	mailchimpListId?: string;
}

export interface AllSettings {
	general: GeneralSettings;
	seo: SeoSettings;
	contact: ContactSettings;
	social: SocialSettings;
	appearance: AppearanceSettings;
	business: BusinessSettings;
	email: EmailSettings;
	integrations: IntegrationSettings;
}

// Výchozí hodnoty pro všechny kategorie
export const DEFAULT_SETTINGS: AllSettings = {
	general: {
		shopName: "Šťastné srdce",
		shortName: "Šťastné",
		slogan: "Zdravé stravování a rozvoz jídla",
		legalName: "Šťastné srdce s.r.o."
	},
	seo: {
		metaTitle: "Šťastné srdce - Zdravé stravování a rozvoz jídla",
		metaDescription:
			"Šťastné srdce nabízí zdravé stravování a rozvoz jídla v Mikulovicích a Jeseníku.",
		metaKeywords:
			"šťastné srdce, mikulovice, zdraví, dietolog, rozvoz jídla, jeseník"
	},
	contact: {
		email: "info@stastnesrdce.cz",
		phone: "+420 724 448 377",
		address: "Potoční 16, Mikulovice 79084"
	},
	social: {
		facebook: "https://facebook.com/stastnesrdce"
	},
	appearance: {
		primaryColor: "#3CB371",
		logo: "/android-chrome-192x192.png",
		footerText: "Šťastné srdce s.r.o. 2022 - 2025"
	},
	business: {
		ico: "21300674",
		dic: "CZ21300674"
	},
	email: {},
	integrations: {
		cookieConsentEnabled: true
	}
};

// Deep copy funkce pro bezpečné kopírování DEFAULT_SETTINGS
function getDefaultSettings(): AllSettings {
	return JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
}

// Vytvoření writable stores pro každou kategorii
export const generalSettings = writable<GeneralSettings>({} as GeneralSettings);
export const seoSettings = writable<SeoSettings>({} as SeoSettings);
export const contactSettings = writable<ContactSettings>(
	getDefaultSettings().contact
);
export const socialSettings = writable<SocialSettings>(
	getDefaultSettings().social
);
export const appearanceSettings = writable<AppearanceSettings>(
	getDefaultSettings().appearance
);
export const businessSettings = writable<BusinessSettings>(
	getDefaultSettings().business
);
export const emailSettings = writable<EmailSettings>(
	getDefaultSettings().email
);
export const integrationSettings = writable<IntegrationSettings>(
	getDefaultSettings().integrations
);

// Pomocná funkce pro získání hodnoty z store
function get<T>(store: Writable<T>): T {
	let value: T;
	const unsubscribe = store.subscribe((v) => (value = v));
	unsubscribe();
	return value!;
}

// Vytvoření readable store, který kombinuje všechny kategorie
export const allSettings = readable<AllSettings>(
	getDefaultSettings(),
	(set) => {
		const updateAllSettings = () => {
			set({
				general: get(generalSettings),
				seo: get(seoSettings),
				contact: get(contactSettings),
				social: get(socialSettings),
				appearance: get(appearanceSettings),
				business: get(businessSettings),
				email: get(emailSettings),
				integrations: get(integrationSettings)
			});
		};

		const unsubscribes = [
			generalSettings.subscribe(updateAllSettings),
			seoSettings.subscribe(updateAllSettings),
			contactSettings.subscribe(updateAllSettings),
			socialSettings.subscribe(updateAllSettings),
			appearanceSettings.subscribe(updateAllSettings),
			businessSettings.subscribe(updateAllSettings),
			emailSettings.subscribe(updateAllSettings),
			integrationSettings.subscribe(updateAllSettings)
		];

		return () => unsubscribes.forEach((unsub) => unsub());
	}
);

// Funkce pro načtení všech nastavení
export async function loadAllSettings(
	supabase: SupabaseClient
): Promise<AllSettings> {
	try {
		// Nezačínejte s výchozími hodnotami, ale s prázdným objektem
		const loadedSettings: Partial<AllSettings> = {};

		const { data, error } = await supabase
			.from("site_settings")
			.select("key, value");

		if (error) throw error;

		if (data && data.length > 0) {
			// Naplňte pouze hodnoty z databáze
			data.forEach((item) => {
				const key = item.key as keyof AllSettings;
				loadedSettings[key] = item.value;
			});

			// Aktualizujte store pouze s daty z DB
			generalSettings.set(loadedSettings.general || {});
			seoSettings.set(loadedSettings.seo || {});
			// ... ostatní store
		} else {
			// Pokud DB nevrátí data, použijte výchozí hodnoty
			const defaults = getDefaultSettings();
			Object.entries(defaults).forEach(([key, value]) => {
				loadedSettings[key as keyof AllSettings] = value;
			});
		}

		return loadedSettings as AllSettings;
	} catch (error) {
		console.error("Chyba při načítání nastavení:", error);
		return getDefaultSettings();
	}
}

// Funkce pro aktualizaci jedné kategorie nastavení
export async function updateSettings<T extends keyof AllSettings>(
	supabase: SupabaseClient,
	category: T,
	settings: Partial<AllSettings[T]>,
	userId?: string
): Promise<boolean> {
	try {
		const { data: current } = await supabase
			.from("site_settings")
			.select("value")
			.eq("key", category)
			.single();

		const updatedSettings = {
			...(current?.value || getDefaultSettings()[category]),
			...settings
		};

		const { error } = await supabase.from("site_settings").upsert({
			key: category,
			value: updatedSettings,
			updated_at: new Date().toISOString(),
			updated_by: userId
		});

		if (error) {
			console.error(
				`Chyba při ukládání nastavení kategorie ${category}:`,
				error
			);
			return false;
		}

		const store = getStoreForCategory(category);
		if (store) {
			store.set(updatedSettings);
		}
		return true;
	} catch (error) {
		console.error(
			`Neočekávaná chyba při ukládání nastavení kategorie ${category}:`,
			error
		);
		return false;
	}
}

// Pomocná funkce pro získání správného store pro kategorii
function getStoreForCategory<T extends keyof AllSettings>(
	category: T
): Writable<AllSettings[T]> | null {
	const stores = {
		general: generalSettings,
		seo: seoSettings,
		contact: contactSettings,
		social: socialSettings,
		appearance: appearanceSettings,
		business: businessSettings,
		email: emailSettings,
		integrations: integrationSettings
	};

	return stores[category] || null;
}
