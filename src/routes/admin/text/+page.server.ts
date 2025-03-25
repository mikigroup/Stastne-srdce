import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

export type Text = {
	id: number;
	created_at: string;
	updated_at: string | null;
	text: string | null;
	title: string | null;
	page: string | null;
	position: string | null;
};

type OccupiedPosition = {
	position: string;
	id: number;
};

export type LoadData = {
	texts: Text[];
	pages: string[];
	occupiedPositions: OccupiedPosition[];
};

export const load: PageServerLoad = async ({
	locals: { supabase }
}): Promise<LoadData> => {
	const { data: texts, error } = await supabase.from("texts").select("*");

	if (error) {
		console.error("Chyba při načítání textů:", error);
	}

	const pages = [
		...new Set(texts?.map((text) => text.page).filter(Boolean) || [])
	];

	const occupiedPositions: OccupiedPosition[] =
		texts
			?.filter((text) => text.page === "hlavni" && text.position)
			.map((text) => ({ position: text.position!, id: text.id })) || [];

	return {
		texts: texts || [],
		pages,
		occupiedPositions
	};
};

export const actions: Actions = {
	update: async ({ request, locals: { supabase, session } }) => {
		// Zkontrolujeme, zda je uživatel přihlášen
		if (!session?.user) {
			return fail(401, {
				message: { success: false, display: "Uživatel není přihlášen" }
			});
		}

		// Získání dat z formuláře
		const formData = await request.formData();
		const title = formData.get("title") as string;
		const text = formData.get("text") as string;
		const page = formData.get("page") as string;
		const position = formData.get("position") as string;

		try {
			// Připravení dat pro aktualizaci
			const updateData = {
				text,
				page,
				position: position || null,
				title: title || null,
				updated_at: new Date().toISOString()
			};

			// Speciální logika pro různé typy stránek
			if (page === "hlavni") {
				// Pro hlavní stránku musí být pozice vyplněna
				if (!position) {
					return fail(400, {
						message: {
							success: false,
							display: "Pro hlavní stránku musí být vyplněna pozice"
						}
					});
				}

				// Vyhledání existujícího záznamu pro danou stránku a pozici
				const { data: existingText, error: searchError } = await supabase
					.from("texts")
					.select("id")
					.eq("page", page)
					.eq("position", position)
					.maybeSingle();

				if (searchError) {
					console.error("Chyba při hledání textu:", searchError);
					return fail(500, {
						message: {
							success: false,
							display: "Chyba při vyhledávání textu: " + searchError.message
						}
					});
				}

				// Pokud text pro danou stránku a pozici neexistuje, vrátíme chybu
				if (!existingText) {
					return fail(404, {
						message: {
							success: false,
							display: `Nebyl nalezen text pro stránku ${page} a pozici ${position}`
						}
					});
				}

				// Aktualizace existujícího textu pro hlavní stránku
				const { data: updatedText, error: updateError } = await supabase
					.from("texts")
					.update(updateData)
					.eq("id", existingText.id)
					.select();

				if (updateError) {
					console.error("Chyba při aktualizaci textu:", updateError);
					return fail(500, {
						message: {
							success: false,
							display: "Chyba při aktualizaci textu: " + updateError.message
						}
					});
				}
			} else if (page === "obedy" || page === "jidelnicek") {
				// Pro stránky obedy a jidelnicek stačí jen text
				const { data: existingText, error: searchError } = await supabase
					.from("texts")
					.select("id")
					.eq("page", page)
					.maybeSingle();

				if (searchError) {
					console.error("Chyba při hledání textu:", searchError);
					return fail(500, {
						message: {
							success: false,
							display: "Chyba při vyhledávání textu: " + searchError.message
						}
					});
				}

				// Pokud text pro danou stránku neexistuje, vrátíme chybu
				if (!existingText) {
					return fail(404, {
						message: {
							success: false,
							display: `Nebyl nalezen text pro stránku ${page}`
						}
					});
				}

				// Aktualizace existujícího textu pro stránky obedy/jidelnicek
				const { data: updatedText, error: updateError } = await supabase
					.from("texts")
					.update({
						text,
						page,
						updated_at: new Date().toISOString()
					})
					.eq("id", existingText.id)
					.select();

				if (updateError) {
					console.error("Chyba při aktualizaci textu:", updateError);
					return fail(500, {
						message: {
							success: false,
							display: "Chyba při aktualizaci textu: " + updateError.message
						}
					});
				}
			} else {
				// Pro jakékoli jiné stránky ponecháme původní logiku
				return fail(400, {
					message: {
						success: false,
						display: `Neplatná stránka: ${page}`
					}
				});
			}

			return {
				message: {
					success: true,
					display: "Text byl úspěšně aktualizován"
				}
			};
		} catch (error) {
			console.error("Chyba při ukládání textu:", error);
			return fail(500, {
				message: {
					success: false,
					display: "Chyba při ukládání textu: " + (error.message || error)
				}
			});
		}
	}
};
