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
		if (!session?.user?.id) {
			return fail(401, {
				message: { success: false, display: "Uživatel není přihlášen" }
			});
		}

		const formData = await request.formData();
		const title = formData.get("title") as string;
		const text = formData.get("text") as string;
		const page = formData.get("page") as string;
		const position = formData.get("position") as string;
		const id = formData.get("id") as string;

		if (!text || !page) {
			return fail(400, {
				message: {
					success: false,
					display: "Text a stránka jsou povinné"
				},
				title,
				text,
				page,
				position
			});
		}

		try {
			const updateData = {
				text,
				page,
				position,
				title,
				updated_at: new Date().toISOString()
			};

			// Přidáme title pouze pokud není prázdný
			if (title) {
				updateData.title = title;
			}

			if (id && id !== "0" && id !== "") {
				// Aktualizace existujícího textu
				const { error } = await supabase
					.from("texts")
					.update(updateData)
					.eq("id", id);

				if (error) throw error;

				return { message: { success: true, display: "Text uložen" } };
			} else {
				// Vytvoření nového textu
				const { error } = await supabase.from("texts").insert(updateData);

				if (error) throw error;

				return { message: { success: true, display: "Text přidán" } };
			}
		} catch (error) {
			console.error("Chyba při aktualizaci/přidávání textu:", error);
			return fail(500, {
				message: {
					success: false,
					display: "Chyba při aktualizaci/přidávání textu"
				},
				title,
				text,
				page,
				position
			});
		}
	}
};
