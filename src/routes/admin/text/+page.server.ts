import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

export type Text = {
	id: number;
	title: string;
	text: string;
	updated_at: string;
	user_id: string;
};

export type LoadData = {
	session: any;
	texts: Text[];
};

export const load: PageServerLoad = async ({
	locals: { supabase, session }
}): Promise<LoadData> => {
	const { data: texts, error } = await supabase.from("texts").select("*");

	if (error) {
		console.error("Chyba při načítání textů:", error);
		// Zde můžete rozhodnout, jak naložit s chybou. Například:
		// throw error;
		// nebo
		// return { session, texts: [] };
	}

	return { session, texts: texts || [] };
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

		if (!title || !text) {
			return fail(400, {
				message: { success: false, display: "Název a text jsou povinné" },
				title,
				text
			});
		}

		try {
			const { error } = await supabase.from("texts").insert({
				title,
				text,
				updated_at: new Date().toISOString()
				// user_id: session.user.id // Přidáno pro identifikaci uživatele
			});

			if (error) throw error;

			return { message: { success: true, display: "Text přidán" } };
		} catch (error) {
			console.error("Chyba při přidávání textu:", error);
			return fail(500, {
				message: { success: false, display: "Chyba při přidávání textu" },
				title,
				text
			});
		}
	}
};
