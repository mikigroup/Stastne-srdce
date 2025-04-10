import { redirect, fail } from "@sveltejs/kit";
import type { Actions, ActionFailure } from "@sveltejs/kit";

type ActionData = {
	message: {
		success: boolean;
		display: string;
	};
	confirmpassword?: string;
	email?: string;
	password?: string;
};

export const actions: Actions = {
	signUp: async ({
		request,
		locals: { supabase }
	}): Promise<ActionFailure<ActionData> | ActionData> => {
		const formData = await request.formData();

		const email = formData.get("email") as string;
		const password = formData.get("password") as string;
		const confirmpassword = formData.get("confirmpassword") as string;

		if (password !== confirmpassword) {
			return fail(400, {
				message: {
					success: false,
					display: "Hesla nejsou stejná"
				},
				email,
				confirmpassword
			});
		}

		const { data, error } = await supabase.auth.signUp({
			email,
			password,
			options: {
				data: {
					user_type: "admin"
				}
			}
		});

		if (error) {
			console.error("Chyba při registraci uživatele:", error.message);
			return fail(400, {
				message: {
					success: false,
					display: "Chyba při registraci"
				},
				email
			});
		}

		const user = data.user;

		if (!user) {
			return fail(400, {
				message: {
					success: false,
					display: "Tento e-mail je již registrován."
				},
				email
			});
		}

		return {
			message: {
				success: true,
				display:
					"Na Vaši emailovou schránku byla odeslána zpráva. Prosím potvrďte ji a následně se přihlašte."
			}
		};
	}
};
