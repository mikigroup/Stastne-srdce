import { redirect, fail } from "@sveltejs/kit";
import type { Actions } from "@sveltejs/kit";

type ActionData = {
	message: {
		success: boolean;
		display: string;
	};
	confirmpassword: string;
	email: string;
	password: string;
};

export const actions: Actions = {
	signUp: async ({ request, locals: { supabase } }) => {
		const formData = await request.formData();

		const email = formData.get("email") as string;
		const password = formData.get("password") as string;
		const confirmpassword = formData.get("confirmpassword") as string;

		if (password !== confirmpassword) {
			return fail(400, {
				message: {
					success: false,
					display: "Hesla nejsou stejná"
				}
			});
		}

		const { data, error } = await supabase.auth.signUp({ email, password });

		if (error) {
			console.error("Chyba při registraci uživatele:", error.message);
			return fail(400, {
				message: {
					success: false,
					display: "Chyba při registraci"
				}
			});
		}

		const user = data.user;

		if (user?.role === "") {
			return fail(400, {
				message: {
					success: false,
					display: "Tento e-mail je již registrován."
				}
			});
		}

		return {
			message: {
				success: true,
				display:
					"Na Vaši emailovou schránku byla odeslána zpráva. Prosím potvrďte ji a následně se přihlašte."
			}
		} as ActionData;
	}

	/*   signInWithGoogle: async ({ locals: { supabase } }) => {
			const { error } = await supabase.auth.signInWithOAuth({
				provider: "google",
				options: {
					redirectTo: "https://localhost:5173/auth/callback",
				},
			});
	
			if (error) {
				console.error("Chyba při přihlášení pomocí Google:", error.message);
				return fail(400, {
					message: {
						success: false,
						display: "Chyba při přihlášení pomocí Google",
					},
				});
			}

			throw redirect(303, "/");
		}, */
};
