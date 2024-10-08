import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

export type Text = {
	id: number;
	created_at: string;
	updated_at: string | null;
	text: string | null;
	title: string | null;
	page: string | null;
};

export type LoadData = {
	session: any;
	texts: Text[];
	pages: string[]; // Unikátní stránky
};

export const load: PageServerLoad = async ({
	locals: { supabase, session }
}): Promise<LoadData> => {
	const { data: texts, error } = await supabase.from("texts").select("*");

	if (error) {
		console.error("Chyba při načítání textů:", error);
	}

	// Získání unikátních stránek z textů
	const pages = [
		...new Set(texts?.map((text) => text.page).filter(Boolean) || [])
	];

	return {
		session,
		texts: texts || [],
		pages
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

		if (!title || !text || !page) {
			return fail(400, {
				message: {
					success: false,
					display: "Název, text a stránka jsou povinné"
				},
				title,
				text,
				page
			});
		}

		try {
			const { error } = await supabase.from("texts").insert({
				title,
				text,
				page,
				updated_at: new Date().toISOString()
			});

			if (error) throw error;

			return { message: { success: true, display: "Text přidán" } };
		} catch (error) {
			console.error("Chyba při přidávání textu:", error);
			return fail(500, {
				message: { success: false, display: "Chyba při přidávání textu" },
				title,
				text,
				page
			});
		}
	}
};
