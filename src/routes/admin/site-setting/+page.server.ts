import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import type { SupabaseClient } from "@supabase/supabase-js";
import { 
	getDefaultZakazkySettings, 
	getDefaultDopravaSettings, 
	getDefaultProductSettings, 
	getDefaultGeneralSettings
} from "$lib/services/eshopSettingsService";

interface SettingRecord {
	id?: number;
	key: string;
	value: any;
	updated_at?: string;
	updated_by?: string;
}

export const load: PageServerLoad = async ({
	locals: { supabase, safeGetSession },
	parent
}) => {
	const { session } = await safeGetSession();
	if (!session) throw redirect(303, "/login");

	console.log("Načítám nastavení z DB...");
	const { data: existingSettings, error } = await supabase
		.from("site_settings")
		.select("*");

	if (error) {
		console.error("Chyba při načítání nastavení:", error);
		return fail(500, { error: "Nepodařilo se načíst nastavení" });
	}

	// Příprava seznamu stránek pro nastavení
	const { data: pagesData } = await supabase
		.rpc('get_routes')
		.eq('is_admin', false);

	let pages = ['hlavni'];
	if (pagesData) {
		pages = [...new Set(['hlavni', ...pagesData])];
	}

	// Kontrola a přidání chybějících nastavení
	await ensureSettingsExist(supabase, existingSettings || []);

	// Znovu načtení nastavení po možném přidání výchozích hodnot
	const { data: settings } = await supabase
		.from('site_settings')
		.select('*');

	return {
		...(await parent()),
		settings,
		pages
	};
};

// Funkce pro kontrolu existence všech potřebných nastavení a jejich doplnění
async function ensureSettingsExist(supabase: SupabaseClient, existingSettings: SettingRecord[]) {
	const requiredSettings = [
		{ key: 'general', defaultValue: getDefaultGeneralSettings() },
		{ key: 'seo', defaultValue: {} },
		{ key: 'contact', defaultValue: {} },
		{ key: 'social', defaultValue: {} },
		{ key: 'appearance', defaultValue: {} },
		{ key: 'business', defaultValue: {} },
		{ key: 'email', defaultValue: {} },
		{ key: 'integrations', defaultValue: {} },
		{ key: 'eshop', defaultValue: getDefaultZakazkySettings() },
		{ key: 'doprava', defaultValue: getDefaultDopravaSettings() },
		{ key: 'products', defaultValue: getDefaultProductSettings() }
	];

	for (const setting of requiredSettings) {
		const exists = existingSettings.some(s => s.key === setting.key);
		
		if (!exists) {
			console.log(`Adding default value for missing setting: ${setting.key}`);
			const { error } = await supabase
				.from('site_settings')
				.insert({
					key: setting.key,
					value: JSON.stringify(setting.defaultValue),
					created_at: new Date().toISOString(),
					updated_at: new Date().toISOString()
				});
			
			if (error) {
				console.error(`Error adding default value for ${setting.key}:`, error);
			}
		}
	}
}

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
					updated_by: session.user.id
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
	}
};
