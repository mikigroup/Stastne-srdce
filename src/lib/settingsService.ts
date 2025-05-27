import type { SupabaseClient } from "@supabase/supabase-js";
import { writable, readable, type Writable } from "svelte/store";

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
	primaryColor?: string;
	logo?: string;
	footerText?: string;
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
		primaryColor: "#3CB371",
		logo: "/android-chrome-192x192.png",
		footerText: "Šťastné srdce s.r.o. 2022 - 2025"
	},
	business: {
		ico: "21300674",
		dic: "CZ21300674"
	}
};

// Deep copy funkce
function getDefaultSettings(): AllSettings {
	return JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
}

// Stores pro každou kategorii
export const generalSettings = writable<GeneralSettings>(DEFAULT_SETTINGS.general);
export const seoSettings = writable<SeoSettings>(DEFAULT_SETTINGS.seo);
export const contactSettings = writable<ContactSettings>(DEFAULT_SETTINGS.contact);
export const socialSettings = writable<SocialSettings>(DEFAULT_SETTINGS.social);
export const appearanceSettings = writable<AppearanceSettings>(DEFAULT_SETTINGS.appearance);
export const businessSettings = writable<BusinessSettings>(DEFAULT_SETTINGS.business);

// Cache pro nastavení
let settingsCache: AllSettings | null = null;
let lastCacheUpdate = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minut

// Načtení nastavení
export async function loadAllSettings(
	supabase: SupabaseClient,
	isAuthenticated: boolean = false
): Promise<AllSettings> {
	try {
		// Pro nepřihlášené uživatele vracíme výchozí nastavení
		if (!isAuthenticated) {
			return getDefaultSettings();
		}

		// Kontrola cache
		const now = Date.now();
		if (settingsCache && (now - lastCacheUpdate) < CACHE_DURATION) {
			return settingsCache;
		}

		// Načtení z DB
		const { data, error } = await supabase
			.from("site_settings")
			.select("key, value")
			.in("key", ["general", "seo", "contact", "appearance", "social", "business"])
			.limit(6)
			.throwOnError();

		if (error || !data) {
			return getDefaultSettings();
		}

		// Sestavení nastavení
		const settings = getDefaultSettings();
		for (const item of data) {
			const key = item.key as keyof AllSettings;
			if (key in settings) {
				try {
					const value = typeof item.value === "string" ? JSON.parse(item.value) : item.value;
					settings[key] = { ...settings[key], ...value };
				} catch (error) {
					console.error(`Chyba při parsování ${key}:`, error);
				}
			}
		}

		// Aktualizace stores
		generalSettings.set(settings.general);
		seoSettings.set(settings.seo);
		contactSettings.set(settings.contact);
		socialSettings.set(settings.social);
		appearanceSettings.set(settings.appearance);
		businessSettings.set(settings.business);

		// Aktualizace cache
		settingsCache = settings;
		lastCacheUpdate = now;

		return settings;
	} catch (error) {
		console.error("Chyba při načítání nastavení:", error);
		return getDefaultSettings();
	}
}
