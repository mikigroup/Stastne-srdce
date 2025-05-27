import type { SupabaseClient } from "@supabase/supabase-js";
import { DEFAULT_SETTINGS, type AllSettings } from "./settingsService";

// Cache pro nastavení - používáme WeakMap pro lepší GC
const settingsCache = new WeakMap<SupabaseClient, {
	settings: AllSettings;
	timestamp: number;
}>();

const CACHE_DURATION = 5 * 60 * 1000; // 5 minut

// Typy pro nastavení
type SettingKey = keyof AllSettings;
type SettingValue = AllSettings[SettingKey];

// Optimalizované načítání nastavení
export async function loadOptimizedSettings(
	supabase: SupabaseClient,
	isAuthenticated: boolean = false
): Promise<AllSettings> {
	try {
		// Pokud uživatel není přihlášený, vrátíme výchozí nastavení
		if (!isAuthenticated) {
			console.log("Uživatel není přihlášený, používám výchozí nastavení");
			return DEFAULT_SETTINGS;
		}

		// Kontrola cache
		const now = Date.now();
		const cached = settingsCache.get(supabase);
		
		if (cached && (now - cached.timestamp) < CACHE_DURATION) {
			console.log("Používám cache pro nastavení");
			return cached.settings;
		}

		// Načtení všech nastavení najednou - optimalizovaný dotaz
		const { data, error } = await supabase
			.from("site_settings")
			.select("key, value")
			.in("key", ["general", "seo", "contact", "appearance", "social", "business"])
			.limit(6) // Omezení počtu záznamů
			.throwOnError();

		if (error) {
			console.error("Chyba při načítání nastavení:", error);
			return DEFAULT_SETTINGS;
		}

		// Optimalizované sestavení nastavení
		const settings = { ...DEFAULT_SETTINGS };
		
		// Použijeme for...of pro lepší výkon
		for (const item of data) {
			const key = item.key as keyof AllSettings;
			if (key in settings) {
				settings[key] = {
					...DEFAULT_SETTINGS[key],
					...item.value
				};
			}
		}

		// Aktualizace cache
		settingsCache.set(supabase, {
			settings,
			timestamp: now
		});

		console.log("Nastavení úspěšně načteno a uloženo do cache");
		return settings;
	} catch (error) {
		console.error("Chyba při načítání nastavení:", error);
		return DEFAULT_SETTINGS;
	}
}

// Funkce pro invalidaci cache
export function invalidateSettingsCache(supabase: SupabaseClient) {
	settingsCache.delete(supabase);
}

// Funkce pro získání konkrétního nastavení
export function getSetting<T extends SettingKey>(
	settings: AllSettings,
	key: T
): AllSettings[T] {
	return settings[key];
} 