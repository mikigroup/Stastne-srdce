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
		const settings = getDefaultSettings();

		const { data, error } = await supabase
			.from("site_settings")
			.select("key, value");

		if (error) {
			console.error("Chyba při načítání nastavení:", error);
			return settings;
		}

		if (data) {
			for (const item of data) {
				const key = item.key as keyof AllSettings;
				if (key in settings) {
					try {
						// Podpora pro oba formáty - objekt i JSON string
						const value =
							typeof item.value === "string"
								? JSON.parse(item.value)
								: item.value;

						settings[key] = { ...settings[key], ...value };
					} catch (parseError) {
						console.error(
							`Chyba při parsování hodnoty pro ${key}:`,
							parseError
						);
						continue;
					}
				}
			}

			// Aktualizace všech stores
			generalSettings.set(settings.general);
			seoSettings.set(settings.seo);
			contactSettings.set(settings.contact);
			socialSettings.set(settings.social);
			appearanceSettings.set(settings.appearance);
			businessSettings.set(settings.business);
			emailSettings.set(settings.email);
			integrationSettings.set(settings.integrations);
		}

		return settings;
	} catch (error) {
		console.error("Neočekávaná chyba při načítání nastavení:", error);
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
		// Získání aktuálních hodnot
		const { data: current } = await supabase
			.from("site_settings")
			.select("value")
			.eq("key", category)
			.single();

		// Sloučení nastavení
		const currentValue = current?.value
			? typeof current.value === "string"
				? JSON.parse(current.value)
				: current.value
			: getDefaultSettings()[category];

		const updatedSettings = { ...currentValue, ...settings };

		// Uložení (s podporou obou formátů)
		const { error } = await supabase.from("site_settings").upsert(
			{
				key: category,
				value: updatedSettings, // Ukládáme přímo objekt
				updated_at: new Date().toISOString(),
				updated_by: userId
			},
			{
				onConflict: "key"
			}
		);

		if (error) throw error;

		// Aktualizace store
		const store = getStoreForCategory(category);
		if (store) store.set(updatedSettings);

		return true;
	} catch (error) {
		console.error(`Chyba při ukládání nastavení ${category}:`, error);
		return false;
	}
}

// Pomocná funkce pro získání správného store pro kategorii
function getStoreForCategory<T extends keyof AllSettings>(
	category: T
): Writable<AllSettings[T]> | null {
	switch (category) {
		case "general":
			return generalSettings as unknown as Writable<AllSettings[T]>;
		case "seo":
			return seoSettings as unknown as Writable<AllSettings[T]>;
		case "contact":
			return contactSettings as unknown as Writable<AllSettings[T]>;
		case "social":
			return socialSettings as unknown as Writable<AllSettings[T]>;
		case "appearance":
			return appearanceSettings as unknown as Writable<AllSettings[T]>;
		case "business":
			return businessSettings as unknown as Writable<AllSettings[T]>;
		case "email":
			return emailSettings as unknown as Writable<AllSettings[T]>;
		case "integrations":
			return integrationSettings as unknown as Writable<AllSettings[T]>;
		default:
			return null;
	}
}

// Pomocná funkce pro získání default hodnot pro konkrétní sekci
function getDefaultSection<T extends keyof AllSettings>(
	section: T
): AllSettings[T] {
	return JSON.parse(JSON.stringify(DEFAULT_SETTINGS[section]));
}

// Funkce pro načtení konkrétní sekce nastavení
export async function loadSettingsSection<T extends keyof AllSettings>(
	supabase: SupabaseClient,
	section: T
): Promise<AllSettings[T]> {
	try {
		const { data, error } = await supabase
			.from("site_settings")
			.select("value")
			.eq("key", section)
			.single();

		if (error || !data) {
			console.log(`Používám default hodnoty pro sekci ${section}`);
			return getDefaultSection(section);
		}

		// Podpora pro oba formáty (objekt i JSON string)
		const value =
			typeof data.value === "string" ? JSON.parse(data.value) : data.value;

		return { ...getDefaultSection(section), ...value };
	} catch (error) {
		console.error(`Chyba při načítání sekce ${section}:`, error);
		return getDefaultSection(section);
	}
}

// Funkce pro uložení jedné sekce
export async function updateSettingsSection<T extends keyof AllSettings>(
	supabase: SupabaseClient,
	section: T,
	data: Partial<AllSettings[T]>,
	userId?: string
): Promise<boolean> {
	try {
		// Načteme aktuální hodnoty
		const current = await loadSettingsSection(supabase, section);
		const updated = { ...current, ...data };

		// Uložíme pouze tuto sekci
		const { error } = await supabase.from("site_settings").upsert(
			{
				key: section,
				value: updated,
				updated_at: new Date().toISOString(),
				updated_by: userId
			},
			{
				onConflict: "key"
			}
		);

		if (error) throw error;

		// Aktualizujeme příslušný store
		const store = getStoreForCategory(section);
		if (store) store.set(updated);

		return true;
	} catch (error) {
		console.error(`Chyba při ukládání sekce ${section}:`, error);
		return false;
	}
}
