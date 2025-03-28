import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

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

		// 1. Ověření session
		const { session } = await safeGetSession();
		if (!session) {
			console.error("Uživatel není přihlášen");
			throw redirect(303, "/login");
		}

		try {
			// 2. Zpracování vstupních dat
			const formData = await request.formData();
			const settingsData = JSON.parse(
				formData.get("settings")?.toString() || "{}"
			);

			console.log("Obdržená data:", {
				user: session.user.id,
				data: settingsData,
				timestamp: new Date().toISOString()
			});

			// 3. Validace dat
			if (Object.keys(settingsData).length === 0) {
				console.error("Prázdná data pro update");
				return fail(400, { error: "Žádná data k uložení" });
			}

			// 4. Příprava batch operací
			const updates = Object.entries(settingsData).map(async ([key, value]) => {
				console.log(`Zpracovávám klíč: ${key}`);

				// 4a. Najdi existující záznam
				const { data: existing, error: fetchError } = await supabase
					.from("site_settings")
					.select("id")
					.eq("key", key)
					.maybeSingle();

				if (fetchError) throw fetchError;

				// 4b. Připrav data pro update
				const recordData = {
					value: JSON.stringify(value),
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
					return supabase.from("site_settings").insert({ ...recordData, key });
				}
			});

			// 5. Provedení všech operací
			console.log("Provádím batch operací...");
			const results = await Promise.all(updates);
			const errors = results.filter((r) => r.error);

			// 6. Zpracování výsledků
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
				error: error.message,
				stack: error.stack,
				timestamp: new Date().toISOString()
			});
			return fail(500, {
				error: "Interní chyba serveru",
				details: error.message
			});
		}
	}
};
