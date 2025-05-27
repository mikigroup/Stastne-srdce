import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import type { SupabaseClient } from "@supabase/supabase-js";
import { 
	getDefaultZakazkySettings, 
	getDefaultDopravaSettings, 
	getDefaultProductSettings, 
	getDefaultGeneralSettings,
	getDefaultCustomerSettings,
	getDefaultInventorySettings
} from "$lib/services/eshopSettingsService";

// Výchozí nastavení pro integrace
function getDefaultIntegrationsSettings() {
	return {
		// Fakturoid OAuth
		fakturoidEnabled: false,
		fakturoidConnected: false,
		fakturoidAccountName: '',
		fakturoidSubdomain: '',
		fakturoidDefaultLanguage: 'cz',
		fakturoidAutoCreateInvoices: false,
		fakturoidInvoiceDueDays: 14,
		fakturoidDefaultPaymentMethod: 'bank',
		fakturoidSendInvoiceEmail: false,
		fakturoidInvoiceNote: '',
		
		// Google Analytics
		googleAnalyticsEnabled: false,
		googleAnalyticsTrackingId: '',
		
		// Facebook Pixel
		facebookPixelEnabled: false,
		facebookPixelId: ''
	};
}

interface SettingRecord {
	id?: number;
	key: string;
	value: any;
	updated_at?: string;
	updated_by?: string;
	user_id?: string;
}

// Definice všech požadovaných nastavení
const REQUIRED_SETTINGS = [
	{ key: 'general', defaultValue: getDefaultGeneralSettings() },
	{ key: 'seo', defaultValue: {} },
	{ key: 'contact', defaultValue: {} },
	{ key: 'social', defaultValue: {} },
	{ key: 'appearance', defaultValue: {} },
	{ key: 'business', defaultValue: {} },
	{ key: 'email', defaultValue: {} },
	{ key: 'integrations', defaultValue: getDefaultIntegrationsSettings() },
	{ key: 'eshop', defaultValue: getDefaultZakazkySettings() },
	{ key: 'doprava', defaultValue: getDefaultDopravaSettings() },
	{ key: 'products', defaultValue: getDefaultProductSettings() },
	{ key: 'customer', defaultValue: getDefaultCustomerSettings() },
	{ key: 'inventory', defaultValue: getDefaultInventorySettings() }
];

export const load: PageServerLoad = async ({
	locals: { supabase, safeGetSession },
	parent
}) => {
	const { session } = await safeGetSession();
	if (!session) throw redirect(303, "/login");

	console.log("Načítám nastavení z DB...");
	
	try {
		// 1. Načteme pouze nastavení (pages jsou volitelné)
		const { data: existingSettings, error: settingsError } = await supabase
			.from("site_settings")
			.select("*");

		if (settingsError) {
			console.error("Chyba při načítání nastavení:", settingsError);
			return fail(500, { error: "Nepodařilo se načíst nastavení" });
		}

		// 2. Rychlá kontrola chybějících nastavení v paměti
		const existingKeys = new Set(existingSettings?.map(s => s.key) || []);
		const missingSettings = REQUIRED_SETTINGS.filter(s => !existingKeys.has(s.key));

		// 3. Pokud chybí nastavení, přidáme je jedním batch insertem
		if (missingSettings.length > 0) {
			console.log(`Přidávám ${missingSettings.length} chybějících nastavení...`);
			
			const newRecords = missingSettings.map(setting => ({
				key: setting.key,
				value: setting.defaultValue,
				updated_at: new Date().toISOString()
			}));

			const { error: insertError } = await supabase
				.from('site_settings')
				.insert(newRecords);

			if (insertError) {
				console.error("Chyba při vkládání výchozích nastavení:", insertError);
				// Pokračujeme i s chybou - použijeme co máme
			}

			// Znovu načteme všechna nastavení
			const { data: allSettings } = await supabase
				.from('site_settings')
				.select('*');

			// 4. Zkusíme načíst pages, ale není to kritické
			let pages = ['hlavni'];
			try {
				const { data: pagesData } = await supabase
					.rpc('get_routes')
					.eq('is_admin', false);
				
				if (pagesData) {
					pages = [...new Set(['hlavni', ...pagesData])];
				}
			} catch (pagesError) {
				console.warn("Nepodařilo se načíst seznam stránek:", pagesError);
			}

			return {
				...(await parent()),
				settings: allSettings || existingSettings || [],
				pages
			};
		}

		// 5. Pokud nic nechybí, zkusíme načíst pages paralelně
		let pages = ['hlavni'];
		try {
			// Nepoužíváme Promise.all, protože pages nejsou kritické
			const { data: pagesData } = await supabase
				.rpc('get_routes')
				.eq('is_admin', false);
			
			if (pagesData) {
				pages = [...new Set(['hlavni', ...pagesData])];
			}
		} catch (pagesError) {
			console.warn("Nepodařilo se načíst seznam stránek:", pagesError);
		}

		return {
			...(await parent()),
			settings: existingSettings || [],
			pages
		};

	} catch (err) {
		console.error("Kritická chyba při načítání nastavení:", err);
		// Vrátíme alespoň prázdná data, aby stránka fungovala
		return {
			...(await parent()),
			settings: [],
			pages: ['hlavni']
		};
	}
};

export const actions: Actions = {
	update: async ({ request, locals: { supabase, safeGetSession } }) => {
		console.log("--- ZAČÁTEK AKCE UPDATE ---");
		const startTime = Date.now();

		// 1. Session verification
		const { session } = await safeGetSession();
		if (!session) {
			console.error("Uživatel není přihlášen");
			throw redirect(303, "/login");
		}

		try {
			// 2. Process input data
			const formData = await request.formData();
			const settingsJson = formData.get("settings")?.toString() || "{}";

			let settingsData: Record<string, any>;
			try {
				settingsData = JSON.parse(settingsJson);
			} catch (e) {
				console.error("Neplatný JSON formát:", e);
				return fail(400, { error: "Neplatný formát dat" });
			}

			console.log("Obdržená data:", {
				user: session.user.id,
				data: settingsData,
				timestamp: new Date().toISOString()
			});

			// 3. Data validation
			if (
				!settingsData ||
				typeof settingsData !== "object" ||
				Array.isArray(settingsData)
			) {
				console.error("Prázdná nebo neplatná data pro update");
				return fail(400, { error: "Žádná platná data k uložení" });
			}

			// 4. Prepare batch operations
			const updates = Object.entries(settingsData).map(async ([key, value]) => {
				console.log(`Zpracovávám klíč: ${key}`);

				// 4a. Najdi existující záznam
				const { data: existing, error: fetchError } = await supabase
					.from("site_settings")
					.select("id, key")
					.eq("key", key)
					.maybeSingle();

				if (fetchError) throw fetchError;

				// 4b. Připrav typově bezpečná data
				const recordData: SettingRecord = {
					key: key,
					value: value,
					updated_at: new Date().toISOString(),
					updated_by: session.user.id,
					user_id: session.user.id
				};

				// 4c. Proveď operaci
				if (existing?.id) {
					console.log(`Updatuji existující záznam ID: ${existing.id}`);
					return supabase
						.from("site_settings")
						.update(recordData)
						.eq("id", existing.id);
				} else {
					console.log(`Vytvářím nový záznam pro klíč: ${key}`);
					return supabase.from("site_settings").insert(recordData);
				}
			});

			// 5. Execute all operations
			console.log("Provádím batch operací...");
			const results = await Promise.all(updates);
			const errors = results.filter((r) => r.error);

			// 6. Process results
			if (errors.length > 0) {
				console.error("Chyby při ukládání:", errors);
				return fail(500, {
					error: "Částečné selhání",
					details: errors.map((e) => e.error?.message)
				});
			}

			console.log(`Úspěšně dokončeno za ${Date.now() - startTime}ms`);
			return {
				success: true,
				updated: Object.keys(settingsData).length
			};
		} catch (error) {
			console.error("Kritická chyba:", {
				error: error instanceof Error ? error.message : String(error),
				stack: error instanceof Error ? error.stack : undefined,
				timestamp: new Date().toISOString()
			});
			return fail(500, {
				error: "Interní chyba serveru",
				details: error instanceof Error ? error.message : "Neznámá chyba"
			});
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
			const { data: existingSettings, error: fetchError } = await supabase
				.from('site_settings')
				.select('value')
				.eq('key', 'integrations')
				.maybeSingle();

			if (fetchError) {
				console.error('Error fetching existing settings:', fetchError);
				return fail(500, { error: 'Nepodařilo se načíst nastavení' });
			}

			// Sloučíme existující nastavení s odpojením Fakturoid
			let integrationsData = {};
			if (existingSettings?.value) {
				try {
					integrationsData = typeof existingSettings.value === 'string' 
						? JSON.parse(existingSettings.value) 
						: existingSettings.value;
				} catch (e) {
					console.error('Error parsing existing integrations:', e);
				}
			}

			// Odpojíme Fakturoid
			const updatedIntegrations = {
				...integrationsData,
				fakturoidEnabled: false,
				fakturoidConnected: false,
				fakturoidAccountName: ''
			};

			// Uložíme aktualizovaná nastavení
			const { error: updateError } = await supabase
				.from('site_settings')
				.upsert({
					key: 'integrations',
					value: JSON.stringify(updatedIntegrations),
					updated_at: new Date().toISOString(),
					updated_by: session.user.id,
					user_id: session.user.id
				}, {
					onConflict: 'key'
				});

			if (updateError) {
				console.error('Error updating settings:', updateError);
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
	}
};
