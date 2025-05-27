import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

interface SettingRecord {
	id?: number;
	key: string;
	value: any;
	updated_at?: string;
	updated_by?: string;
	user_id?: string;
}

export const load: PageServerLoad = async ({
	locals: { supabase, safeGetSession },
	parent,
	url
}) => {
	const { session } = await safeGetSession();
	if (!session) throw redirect(303, "/login");

	// Zkontrolujeme, zda chceme načíst pouze specifické nastavení
	const settingKey = url.searchParams.get('key');
	
	let query = supabase.from("site_settings").select("*");
	
	// Pokud je specifikován klíč, načteme pouze toto nastavení
	if (settingKey) {
		query = query.eq('key', settingKey);
	}

	const { data: settings, error } = await query;

	if (error) {
		console.error("Chyba při načítání nastavení:", error);
		// Pokračujeme s prázdnými nastaveními
	}

	return {
		...(await parent()),
		settings: settings || [],
		pages: ['hlavni'] // Výchozí hodnota, můžeme přidat dynamické načítání později
	};
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
				dataKeys: Object.keys(settingsData),
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

			// 4. Připravíme všechna data pro batch upsert
			const upsertData = Object.entries(settingsData).map(([key, value]) => ({
				key: key,
				value: value,
				updated_at: new Date().toISOString(),
				updated_by: session.user.id,
				user_id: session.user.id
			}));

			console.log(`Provádím batch upsert pro ${upsertData.length} nastavení...`);

			// 5. Provedeme jediný batch upsert
			const { error: upsertError } = await supabase
				.from("site_settings")
				.upsert(upsertData, {
					onConflict: 'key'
				});

			if (upsertError) {
				console.error("Chyba při ukládání:", upsertError);
				return fail(500, {
					error: "Nepodařilo se uložit nastavení",
					details: upsertError.message
				});
			}

			console.log(`Úspěšně dokončeno za ${Date.now() - startTime}ms`);
			return {
				success: true,
				updated: upsertData.length
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
