import type { SupabaseClient } from "@supabase/supabase-js";
import { writable, derived } from "svelte/store";

// Základní rozhraní pro nastavení
export interface GeneralSettings {
	shopName: string;
	shortName: string;
	slogan: string;
	legalName: string;
	currencies: string[];
}

export interface SeoSettings {
	metaTitle: string;
	metaDescription: string;
	metaKeywords: string;
	ogImage?: string;
	googleAnalyticsId?: string;
	googleAnalyticsEnabled: boolean;
	facebookPixelEnabled: boolean;
	facebookPixelId?: string;
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
	logo?: string;
	favicon?: string;
	primaryColor?: string;
	secondaryColor?: string;
	footerText?: string;
	headerText?: string;
	showLogo?: boolean;
	showFooter?: boolean;
	// Meta tagy
	metaAuthor?: string;
	metaCopyright?: string;
	metaRobots?: string;
	// Open Graph
	ogType?: string;
	ogUrl?: string;
	ogLocale?: string;
	// Twitter
	twitterCard?: string;
	// Apple touch icon
	appleTouchIcon?: string;
	// Web manifest
	webManifest?: string;
	// FontAwesome
	fontAwesomeEnabled?: boolean;
	fontAwesomeKit?: string;
	// Lottie player
	lottiePlayerEnabled?: boolean;
	// Custom scripts
	customHeadScripts?: string;
	customBodyScripts?: string;
}

export interface BusinessSettings {
	ico?: string;
	dic?: string;
}

// Rozšířené nastavení pro kompletní systém
export interface EshopSettings {
	enabled: boolean;
	orderStates: Array<{
		name: string;
		color: string;
	}>;
}

export interface ProductsSettings {
	menuTitle?: string;
	menuIntroText: string;
	visibleDays: number;
	features: Array<any>;
	showAllergens: boolean;
	showAllergensTooltip: boolean;
}

export interface CustomerSettings {
	allowRegistration: boolean;
	requireEmailVerification: boolean;
	defaultRole: string;
}

export interface InventorySettings {
	trackInventory: boolean;
	lowStockThreshold: number;
}

export interface DopravaSettings {
	shippingMethods: Array<any>;
	minimumOrderValue: number;
	freeDeliveryThreshold: number;
}

export interface AllSettings {
	general: GeneralSettings;
	seo: SeoSettings;
	contact: ContactSettings;
	social: SocialSettings;
	appearance: AppearanceSettings;
	business: BusinessSettings;
	eshop: EshopSettings;
	products: ProductsSettings;
	customer: CustomerSettings;
	inventory: InventorySettings;
	doprava: DopravaSettings;
}

// Import unified default values
import { UNIFIED_DEFAULT_SETTINGS } from '$lib/constants/defaultSettings';

// Use unified defaults as the single source of truth (deep copy to make mutable)
export const DEFAULT_SETTINGS: AllSettings = JSON.parse(JSON.stringify(UNIFIED_DEFAULT_SETTINGS));

// Definice potřebných settings pro jednotlivé stránky
export const PAGE_SETTINGS = {
	'/': ['general', 'seo', 'appearance'],
	'/kontakt': ['general', 'contact', 'seo', 'appearance'],
	'/prednasky-a-kurzy': ['general', 'seo', 'appearance'],
	'/obedy': ['general', 'products', 'seo', 'appearance'],
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
export const eshopSettings = derived(settingsStore, $settings => $settings.eshop);
export const productsSettings = derived(settingsStore, $settings => $settings.products);
export const customerSettings = derived(settingsStore, $settings => $settings.customer);
export const inventorySettings = derived(settingsStore, $settings => $settings.inventory);
export const dopravaSettings = derived(settingsStore, $settings => $settings.doprava);

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
