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
		const id = formData.get("id") as string;

		console.log("Přijatá data:", {
			id,
			title,
			page,
			position,
			textLength: text?.length
		});

		try {
			// Připravení dat pro aktualizaci
			const updateData = {
				text,
				page,
				position: position || null,
				title: title || null,
				updated_at: new Date().toISOString()
			};

			// Nejprve zkontrolujeme, zda již existuje text pro tuto stránku
			const { data: existingTexts } = await supabase
				.from("texts")
				.select("id")
				.eq("page", page)
				.eq("position", updateData.position)
				.maybeSingle();

			if (updateData.title === undefined) {
				updateData.title = ""; // Nastavíme prázdný řetězec místo undefined
			}

			let result;

			if (id && id !== "0" && id !== "") {
				// Používáme existující ID z formuláře
				console.log("Aktualizuji text s ID:", id);
				result = await supabase
					.from("texts")
					.update(updateData)
					.eq("id", id)
					.select();
			} else if (existingTexts?.id) {
				// Aktualizujeme existující text pro tuto stránku
				console.log(
					"Aktualizuji existující text pro stránku:",
					page,
					"s ID:",
					existingTexts.id
				);
				result = await supabase
					.from("texts")
					.update(updateData)
					.eq("id", existingTexts.id)
					.select();
			} else {
				// Výjimečně vytvoříme nový záznam, pokud žádný pro tuto stránku neexistuje
				console.log("Vytvářím nový text pro stránku:", page);
				result = await supabase.from("texts").insert(updateData).select();
			}

			if (result.error) {
				console.error("Supabase chyba:", result.error);
				throw result.error;
			}

			console.log("Úspěch, vrácená data:", result.data);
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
