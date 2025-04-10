import { fail } from "@sveltejs/kit";
import type { Actions } from "./$types";

/* export type ActionData = {
  password: string;
  newpassword: string;
  message: {
    success: boolean;
    display: string;
  };
};
 */
export const actions: Actions = {
	resetPass: async ({ request, locals: { supabase } }) => {
		const formData = await request.formData();
		const password = formData.get("password") as string;
		const newpassword = formData.get("newpassword") as string;

		if (password !== newpassword) {
			return fail(400, {
				password,
				message: {
					success: false,
					display: "Hesla nejsou stejná"
				}
			});
		} else {
			const { error } = await supabase.auth.updateUser({
				password: newpassword
			});

			if (error) {
				console.error(error);
				let errorMessage = "Nepodařilo se změnit heslo";
				let displayMessage =
					"Nepodařilo se změnit heslo. Zkuste to prosím znovu později.";

				if (error.status === 422) {
					if (error.code === "same_password") {
						errorMessage = "Nové heslo musí být odlišné od starého hesla";
						displayMessage =
							"Nové heslo musí být odlišné od starého hesla. Zadejte prosím jiné heslo.";
					} else {
						errorMessage = "Neplatné heslo";
						displayMessage =
							"Zadané heslo je neplatné. Zkontrolujte prosím své heslo a zkuste to znovu.";
					}
				} else if (error.status === 400) {
					errorMessage = "Chybný požadavek";
					displayMessage =
						"Došlo k chybě při odesílání požadavku. Zkontrolujte prosím zadané údaje a zkuste to znovu.";
				}

				return fail(error.status || 500, {
					password,
					message: {
						success: false,
						display: displayMessage
					}
				});
			} else {
				return {
					password: "",
					newpassword: "",
					message: {
						success: true,
						display: "Heslo bylo úspěšně změněno."
					}
				};
			}
		}
	}
};
