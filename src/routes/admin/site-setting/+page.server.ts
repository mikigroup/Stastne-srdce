import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import type { SupabaseClient } from "@supabase/supabase-js";

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
	const { data: settings, error } = await supabase
		.from("site_settings")
		.select("*");

	if (error) {
		console.error("Chyba při načítání nastavení:", error);
		return fail(500, { error: "Nepodařilo se načíst nastavení" });
	}

	return {
		...(await parent()),
		settings: settings || []
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

				// 4a. Find existing record
				const { data: existing, error: fetchError } = await supabase
					.from("site_settings")
					.select("id")
					.eq("key", key)
					.maybeSingle();

				if (fetchError) throw fetchError;

				// 4b. Prepare data for update
				const recordData: SettingRecord = {
					value: value,
					updated_at: new Date().toISOString(),
					updated_by: session.user.id
				};

				// 4c. Execute operation
				if (existing?.id) {
					console.log(`Updatuji existující záznam ID: ${existing.id}`);
					return supabase
						.from("site_settings")
						.update(recordData)
						.eq("id", existing.id);
				} else {
					console.log(`Vytvářím nový záznam pro klíč: ${key}`);
					return supabase.from("site_settings").insert({ ...recordData, key });
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
