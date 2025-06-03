import type { SupabaseClient } from "@supabase/supabase-js";
import { writable, derived } from "svelte/store";

// Základní rozhraní pro nastavení
export interface GeneralSettings {
	shopName: string;
	shortName: string;
	slogan: string;
	legalName: string;
}

export interface SeoSettings {
	metaTitle: string;
	metaDescription: string;
	metaKeywords: string;
}

export interface ContactSettings {
	email: string;
	phone: string;
	address: string;
}

export interface SocialSettings {
	facebook?: string;
}

export interface AppearanceSettings {
	footerText?: string;
	headerText?: string;
	showLogo?: boolean;
	showFooter?: boolean;
}

export interface BusinessSettings {
	ico?: string;
	dic?: string;
}

export interface AllSettings {
	general: GeneralSettings;
	seo: SeoSettings;
	contact: ContactSettings;
	social: SocialSettings;
	appearance: AppearanceSettings;
	business: BusinessSettings;
}

// Výchozí hodnoty
export const DEFAULT_SETTINGS: AllSettings = {
	general: {
		shopName: "Šťastné srdce",
		shortName: "Šťastné",
		slogan: "Zdravé stravování a rozvoz jídla",
		legalName: "Šťastné srdce s.r.o."
	},
	seo: {
		metaTitle: "Šťastné srdce - Zdravé stravování a rozvoz jídla",
		metaDescription: "Šťastné srdce nabízí zdravé stravování a rozvoz jídla v Mikulovicích a Jeseníku.",
		metaKeywords: "šťastné srdce, mikulovice, zdraví, dietolog, rozvoz jídla, jeseník"
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
		footerText: "Šťastné srdce s.r.o. 2022 - 2025",
		headerText: "Šťastné srdce",
		showLogo: true,
		showFooter: true
	},
	business: {
		ico: "21300674",
		dic: "CZ21300674"
	}
};

// Definice potřebných settings pro jednotlivé stránky
export const PAGE_SETTINGS = {
	'/': ['general', 'seo', 'appearance'],
	'/kontakt': ['general', 'contact', 'seo', 'appearance'],
	'/prednasky-a-kurzy': ['general', 'seo', 'appearance'],
	'/kosik': ['general', 'business', 'appearance'],
	'/admin': ['general', 'business'], // Admin část bez appearance
	'*': ['general', 'appearance'] // výchozí pro ostatní stránky
} as const;

// Cache konfigurace
const CACHE_DURATION = 5 * 60 * 1000; // 5 minut

// In-memory cache
interface SettingsCache {
	data: AllSettings | null;
	timestamp: number;
	pageSettings: Map<string, Partial<AllSettings>>;
}

const settingsCache: SettingsCache = {
	data: null,
	timestamp: 0,
	pageSettings: new Map()
};

// Single store for all settings
export const settingsStore = writable<AllSettings>(DEFAULT_SETTINGS);

// Derived stores pro specifické kategorie
export const generalSettings = derived(settingsStore, $settings => $settings.general);
export const seoSettings = derived(settingsStore, $settings => $settings.seo);
export const contactSettings = derived(settingsStore, $settings => $settings.contact);
export const socialSettings = derived(settingsStore, $settings => $settings.social);
export const appearanceSettings = derived(settingsStore, $settings => $settings.appearance);
export const businessSettings = derived(settingsStore, $settings => $settings.business);

// Hlavní funkce pro načtení settings
export async function loadSettings(
	supabase: SupabaseClient,
	path: string = '/',
	isAuthenticated: boolean = false
): Promise<Partial<AllSettings>> {
	try {
		const now = Date.now();
		const neededKeys = PAGE_SETTINGS[path as keyof typeof PAGE_SETTINGS] || PAGE_SETTINGS['*'];
		
		// Kontrola cache pro konkrétní stránku
		if (settingsCache.pageSettings.has(path)) {
			const cached = settingsCache.pageSettings.get(path);
			if (cached && (now - settingsCache.timestamp) < CACHE_DURATION) {
				return cached;
			}
		}

		// Načtení pouze potřebných settings
		const { data, error } = await supabase
			.from('site_settings')
			.select('key, value')
			.in('key', neededKeys)
			.throwOnError();

		if (error || !data) {
			return DEFAULT_SETTINGS;
		}

		// Zpracování settings
		const settings = { ...DEFAULT_SETTINGS };
		for (const item of data) {
			const key = item.key as keyof AllSettings;
			if (key in settings) {
				try {
					const value = typeof item.value === 'string' 
						? JSON.parse(item.value) 
						: item.value;
					settings[key] = { ...settings[key], ...value };
				} catch (error) {
					console.error(`Error parsing ${key}:`, error);
				}
			}
		}

		// Aktualizace cache
		settingsCache.data = settings;
		settingsCache.timestamp = now;
		settingsCache.pageSettings.set(path, settings);

		// Aktualizace store
		settingsStore.set(settings);

		return settings;
	} catch (error) {
		console.error('Error loading settings:', error);
		return DEFAULT_SETTINGS;
	}
}

// Funkce pro invalidaci cache
export function invalidateSettingsCache(): void {
	settingsCache.data = null;
	settingsCache.timestamp = 0;
	settingsCache.pageSettings.clear();
}

// Pomocná funkce pro získání konkrétního nastavení
export function getSetting<T extends keyof AllSettings>(
	settings: Partial<AllSettings>,
	key: T
): AllSettings[T] | undefined {
	return settings[key] as AllSettings[T] | undefined;
}
