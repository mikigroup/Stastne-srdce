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
	
	let query = supabase
		.from("site_settings")
		.select("*");
	
	// Pokud je specifikován klíč, načteme pouze toto nastavení
	if (settingKey) {
		query = query.eq('key', settingKey);
	}

	// Nejdřív načteme parent data
	const parentData = await parent();
	
	// Pak načteme nastavení
	const { data: settings, error } = await query;

	if (error) {
		console.error("Chyba při načítání nastavení:", error);
		// Pokračujeme s prázdnými nastaveními
	}

	return {
		...parentData,
		settings: settings || [],
		pages: ['hlavni'] // Výchozí hodnota, můžeme přidat dynamické načítání později
	};
};

export const actions: Actions = {
	update: async ({ request, locals: { supabase, safeGetSession } }) => {
		const { session } = await safeGetSession();
		if (!session) throw redirect(303, "/login");

		const formData = await request.formData();
		const settings = Object.fromEntries(formData.entries());

		// Připravíme data pro batch upsert
		const settingsData = Object.entries(settings).map(([key, value]) => ({
			key,
			value: value.toString(),
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

		return { success: true };
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
