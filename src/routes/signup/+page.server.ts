import { redirect, fail } from "@sveltejs/kit";
import type { Actions } from "./$types";

export const actions: Actions = {
	signUp: async ({ request, locals: { supabase } }) => {
		const formData = await request.formData();
		const email = formData.get("email") as string;
		const password = formData.get("password") as string;
		const repassword = formData.get("repassword") as string;

		if (password !== repassword) {
			return fail(400, {
				message: { success: false, display: "Hesla nejsou stejná" }
			});
		} else {
			const { data, error } = await supabase.auth.signUp({
				email,
				password,
				options: {
					data: {
						user_role: "customer"
					}
				}
			});

			if (error) {
				console.error("Chyba při registraci uživatele:", error.message);
				return fail(400, {
					message: { success: false, display: "Chyba při registraci" }
				});
			} else {
				const user = data.user;
				console.log("Registrovaný uživatel:", user);
				console.log(
					"Registrovaný uživatel role:",
					user?.user_metadata?.user_role
				);

				if (!user) {
					return fail(400, {
						message: {
							success: false,
							display: "Tento e-mail je již registrován."
						}
					});
				} else {
					return {
						message: {
							success: true,
							display:
								"Na Vaši emailovou schránku byla odeslána zpráva. Prosím potvrďte ji a následně se přihlašte."
						}
					};
				}
			}
		}
	}
};
