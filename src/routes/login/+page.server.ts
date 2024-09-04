import { fail, redirect } from "@sveltejs/kit";
import type { Actions } from "./$types";

export const actions: Actions = {
	handleLogin: async ({ request, locals: { supabase } }) => {
		const formData = await request.formData();
		const email = formData.get("email") as string;
		const password = formData.get("password") as string;

		const { data, error } = await supabase.auth.signInWithPassword({
			email,
			password
		});

		if (error) {
			console.error(error);
			return fail(400, {
				message: {
					success: false,
					display:
						"Neplatné přihlašovací údaje. Zkontrolujte prosím e-mail a heslo."
				}
			});
		}

		if (data.user) {
			throw redirect(303, "/jidelnicek");
		}

		return fail(500, {
			message: {
				success: false,
				display: "Nastala neočekávaná chyba při přihlašování."
			}
		});
	}
};
