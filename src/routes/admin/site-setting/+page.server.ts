import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { getSetting, saveSetting } from "$lib/services/siteSettingsService";

interface SettingRecord {
	id?: number;
	key: string;
	value: any;
	updated_at?: string;
	updated_by?: string;
	user_id?: string;
}

// Cache pro sdílení dat mezi requesty
const settingsCache = new Map<string, { data: any, timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minut

export const load: PageServerLoad = async ({
	locals: { supabase, safeGetSession },
	parent,
	url
}) => {
	const { session } = await safeGetSession();
	if (!session) throw redirect(303, "/login");

	// Získáme aktivní záložku z URL
	const activeTab = url.searchParams.get('tab') || 'general';
	
	// Načteme parent data
	const parentData = await parent();
	
	// Zkontrolujeme cache
	const cacheKey = 'all_settings';
	const cached = settingsCache.get(cacheKey);
	const now = Date.now();
	
	let settings;
	if (cached && (now - cached.timestamp) < CACHE_DURATION) {
		// Použijeme cache
		settings = cached.data;
	} else {
		// Načteme všechna nastavení z databáze
		const { data, error } = await supabase
			.from("site_settings")
			.select("*");

		if (error) {
			console.error("Chyba při načítání nastavení:", error);
			settings = [];
		} else {
			settings = data || [];
			// Uložíme do cache
			settingsCache.set(cacheKey, { data: settings, timestamp: now });
		}
	}

	return {
		...parentData,
		settings,
		activeTab,
		pages: ['hlavni']
	};
};

export const actions: Actions = {
	update: async ({ request, locals: { supabase, safeGetSession } }) => {
		const { session } = await safeGetSession();
		if (!session) throw redirect(303, "/login");

		const formData = await request.formData();
		const settingsJson = formData.get('settings');

		if (!settingsJson || typeof settingsJson !== 'string') {
			return fail(400, { error: "Neplatná data nastavení" });
		}

		try {
			const settings = JSON.parse(settingsJson);

		// Připravíme data pro batch upsert
		const settingsData = Object.entries(settings).map(([key, value]) => ({
			key,
				value: JSON.stringify(value),
			updated_at: new Date().toISOString(),
			updated_by: session.user.id,
			user_id: session.user.id
		}));

		// Provedeme jeden batch upsert
		const { error } = await supabase
			.from("site_settings")
			.upsert(settingsData, {
				onConflict: 'key'
			});

		if (error) {
			console.error("Chyba při ukládání nastavení:", error);
			return fail(500, { error: "Nepodařilo se uložit nastavení" });
		}

		// Vyčistíme cache pro aktualizovaná nastavení
		settingsCache.clear();

		return { success: true };
		} catch (error) {
			console.error("Chyba při zpracování nastavení:", error);
			return fail(400, { error: "Neplatný formát nastavení" });
		}
	},

	testFakturoidOAuth: async ({ locals: { supabase, safeGetSession } }) => {
		const { session } = await safeGetSession();
		if (!session) {
			throw redirect(303, "/login");
		}

		try {
			// Importujeme getAccessToken z fakturoidAuth
			const { getAccessToken } = await import('$lib/fakturoidAuth');
			
			// Pokusíme se získat OAuth token
			const accessToken = await getAccessToken();
			
			if (!accessToken) {
				return fail(400, { 
					error: "Nepodařilo se získat OAuth token. Zkontrolujte prosím konfiguraci." 
				});
			}

			// Test připojení k Fakturoid API pomocí OAuth tokenu
			const response = await fetch('https://app.fakturoid.cz/api/v3/user.json', {
				headers: {
					'Authorization': `Bearer ${accessToken}`,
					'User-Agent': 'Stastne-srdce-app (support@stastne-srdce.cz)',
					'Content-Type': 'application/json'
				}
			});

			if (!response.ok) {
				const errorText = await response.text();
				console.error('Fakturoid OAuth API error:', response.status, errorText);
				
				if (response.status === 401) {
					return fail(401, { 
						error: "OAuth token není platný. Zkuste se znovu přihlásit." 
					});
				} else {
					return fail(response.status, { 
						error: `Chyba API: ${response.status} - ${errorText}` 
					});
				}
			}

			const userData = await response.json();
			
			return {
				success: true,
				message: `OAuth připojení úspěšné! Připojen jako: ${userData.email}`,
				userInfo: {
					email: userData.email,
					name: userData.name
				}
			};

		} catch (error) {
			console.error("Chyba při testování Fakturoid OAuth:", error);
			return fail(500, {
				error: "Chyba při testování OAuth připojení",
				details: error instanceof Error ? error.message : "Neznámá chyba"
			});
		}
	},

	disconnectFakturoid: async ({ locals: { supabase, safeGetSession } }) => {
		const { session } = await safeGetSession();
		if (!session) {
			throw redirect(303, "/login");
		}

		try {
			// Importujeme clearStoredToken z fakturoidAuth
			const { clearStoredToken } = await import('$lib/fakturoidAuth');
			
			// Vymažeme uložené tokeny
			await clearStoredToken();

			// Načteme existující integrations nastavení
			const integrationsData = await getSetting(supabase, 'integrations') || {};

			// Odpojíme Fakturoid
			const updatedIntegrations = {
				...integrationsData,
				fakturoid: {
					enabled: false,
					connected: false,
					accounts: []
				}
			};

			// Uložíme aktualizovaná nastavení
			const success = await saveSetting(supabase, 'integrations', updatedIntegrations, session.user.id);

			if (!success) {
				return fail(500, { error: 'Nepodařilo se odpojit Fakturoid' });
			}

			return {
				success: true,
				message: 'Fakturoid byl úspěšně odpojeno'
			};

		} catch (error) {
			console.error("Error disconnecting Fakturoid:", error);
			return fail(500, { error: 'Chyba při odpojování Fakturoid' });
		}
	},

	// Nová akce pro načtení specifického nastavení
	loadSetting: async ({ request, locals: { supabase, safeGetSession } }) => {
		const { session } = await safeGetSession();
		if (!session) {
			return fail(401, { error: "Nepřihlášen" });
		}

		const formData = await request.formData();
		const key = formData.get("key")?.toString();

		if (!key) {
			return fail(400, { error: "Chybí klíč nastavení" });
		}

		const { data, error } = await supabase
			.from("site_settings")
			.select("*")
			.eq("key", key)
			.maybeSingle();

		if (error) {
			console.error("Chyba při načítání nastavení:", error);
			return fail(500, { error: "Nepodařilo se načíst nastavení" });
		}

		return {
			success: true,
			setting: data
		};
	}
};
