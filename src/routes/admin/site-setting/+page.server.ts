import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { getSetting, saveSetting, serializeSettingValue } from "$lib/services/siteSettingsService";

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
	const success = url.searchParams.get('success');
	
	// Pokud je success=fakturoid_connected nebo fakturoid_disconnected, vyčistíme cache
	if (success === 'fakturoid_connected' || success === 'fakturoid_disconnected') {
		console.log('OAuth success/disconnect detected, clearing cache...');
		settingsCache.clear();
	}
	
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
		console.log('Using cached settings');
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
	
	// Logujeme specificky integrations nastavení
	const integrationsItem = settings.find(item => item.key === 'integrations');
	if (integrationsItem) {
		console.log('Integrations setting found:', JSON.stringify(integrationsItem.value, null, 2));
	} else {
		console.log('No integrations setting found in database');
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
			value: serializeSettingValue(value),
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
			console.log('=== DISCONNECTING FAKTUROID ===');
			
			// Importujeme clearStoredToken z fakturoidAuth
			const { clearStoredToken } = await import('$lib/fakturoidAuth');
			
			// Vymažeme uložené tokeny
			await clearStoredToken();
			console.log('Tokens cleared');

			// Načteme existující integrations nastavení
			const integrationsData = await getSetting(supabase, 'integrations') || {};
			console.log('Current integrations data:', integrationsData);

			// Odpojíme Fakturoid
			const updatedIntegrations = {
				...integrationsData,
				fakturoid: {
					enabled: false,
					connected: false,
					accounts: []
				}
			};
			console.log('Updated integrations data:', updatedIntegrations);

			// Uložíme aktualizovaná nastavení
			const success = await saveSetting(supabase, 'integrations', updatedIntegrations, session.user.id);
			console.log('Save result:', success);

			if (!success) {
				return fail(500, { error: 'Nepodařilo se odpojit Fakturoid' });
			}

			// Vyčistíme cache na serveru
			settingsCache.clear();
			console.log('Server cache cleared');

			// Přesměrujeme zpět na integrace se zprávou o úspěchu
			throw redirect(303, `/admin/site-setting?tab=integrations&success=fakturoid_disconnected&t=${Date.now()}`);

		} catch (error) {
			// Pokud je to redirect, necháme ho projít
			if (error.status === 303) {
				throw error;
			}
			
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
	},

	// Načtení stavů objednávek z existujících objednávek
	loadOrderStates: async ({ locals: { supabase, safeGetSession } }) => {
		const { session } = await safeGetSession();
		if (!session) {
			return fail(401, { error: "Nepřihlášen" });
		}

		try {
			// Načteme všechny unikátní stavy z objednávek
			const { data: orderStates, error } = await supabase
				.from("orders")
				.select("state")
				.not("state", "is", null)
				.not("state", "eq", "");

			if (error) {
				console.error("Chyba při načítání stavů z objednávek:", error);
				return fail(500, { error: "Nepodařilo se načíst stavy objednávek" });
			}

			// Vytvoříme unikátní seznam stavů
			const uniqueStates = [...new Set(orderStates?.map(order => order.state) || [])];
			
			// Výchozí barvy pro stavy
			const defaultColors: Record<string, string> = {
				'Nová': '#0284c7',
				'Přijatá': '#059669', 
				'Připravuje se': '#d97706',
				'Připraveno': '#7c3aed',
				'Expedovaná': '#eab308',
				'Doručena': '#16a34a',
				'Fakturovaná': '#10b981',
				'Zaplacena': '#059669',
				'Stornovaná': '#dc2626',
				'Dokončena': '#16a34a'
			};

			// Vytvoříme objekty stavů s barvami
			const orderStatesWithColors = uniqueStates.map(stateName => ({
				name: stateName,
				color: defaultColors[stateName] || '#6b7280' // Výchozí šedá pro neznámé stavy
			}));

			console.log(`Načteno ${orderStatesWithColors.length} stavů z objednávek:`, orderStatesWithColors);

			return {
				success: true,
				orderStates: orderStatesWithColors
			};

		} catch (error) {
			console.error("Chyba při zpracování stavů objednávek:", error);
			return fail(500, { error: "Chyba při zpracování stavů objednávek" });
		}
	},

	upload: async ({ request, locals: { supabase, safeGetSession } }) => {
		const { session } = await safeGetSession();
		if (!session) throw redirect(303, "/login");

		const formData = await request.formData();
		const file = formData.get('file') as File;
		const fileType = formData.get('fileType') as string; // 'logo' or 'favicon'

		if (!file || file.size === 0) {
			return fail(400, { error: "Nebyl vybrán žádný soubor" });
		}

		// Validace souboru
		if (!file.type.startsWith('image/')) {
			return fail(400, { error: "Soubor musí být obrázek" });
		}

		if (file.size > 2 * 1024 * 1024) { // 2MB limit
			return fail(400, { error: "Soubor je příliš velký (max 2MB)" });
		}

		try {
			// Generujeme jedinečný název souboru
			const fileExt = file.name.split('.').pop();
			const fileName = `${fileType}-${Date.now()}.${fileExt}`;
			const filePath = `uploads/${fileName}`;

			// Převedeme File na ArrayBuffer
			const fileArrayBuffer = await file.arrayBuffer();

			// Nahrajeme do Supabase Storage
			const { data, error } = await supabase.storage
				.from('site-assets')
				.upload(filePath, fileArrayBuffer, {
					contentType: file.type,
					upsert: false
				});

			if (error) {
				console.error('Chyba při nahrávání souboru:', error);
				return fail(500, { error: "Nepodařilo se nahrát soubor" });
			}

			// Získáme veřejnou URL
			const { data: urlData } = supabase.storage
				.from('site-assets')
				.getPublicUrl(filePath);

			// Aktualizujeme příslušné nastavení
			const settingKey = 'appearance';
			const currentSetting = await getSetting(supabase, settingKey);
			
			const updatedAppearance = {
				...currentSetting,
				[fileType]: urlData.publicUrl
			};

			const { error: updateError } = await supabase
				.from("site_settings")
				.upsert({
					key: settingKey,
					value: serializeSettingValue(updatedAppearance),
					updated_at: new Date().toISOString(),
					updated_by: session.user.id,
					user_id: session.user.id
				}, {
					onConflict: 'key'
				});

			if (updateError) {
				console.error("Chyba při ukládání nastavení:", updateError);
				return fail(500, { error: "Nepodařilo se uložit nastavení" });
			}

			// Vyčistíme cache
			settingsCache.clear();

			return { 
				success: true, 
				fileUrl: urlData.publicUrl,
				message: `${fileType === 'logo' ? 'Logo' : 'Favicon'} bylo úspěšně nahráno`
			};

		} catch (error) {
			console.error("Chyba při zpracování uploadu:", error);
			return fail(500, { error: "Chyba při zpracování souboru" });
		}
	}
};
