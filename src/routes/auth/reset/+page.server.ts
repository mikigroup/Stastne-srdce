import { fail } from "@sveltejs/kit";
import type { Actions } from "./$types";

export const actions: Actions = {
	resetPass: async ({ request, locals: { supabase }, url }) => {
		const formData = await request.formData();
		const password = formData.get("password") as string;
		const repassword = formData.get("repassword") as string;
		const token = url.searchParams.get("token");

		if (password !== repassword) {
			return fail(400, {
				password,
				repassword,
				message: {
					success: false,
					display: "Hesla nejsou stejná"
				}
			});
		}

		// Token není potřeba, protože uživatel je již přihlášen po verifyOtp
		// if (!token) {
		// 	return fail(400, {
		// 		password,
		// 		repassword,
		// 		message: {
		// 			success: false,
		// 			display: "Chybí token pro reset hesla. Zkuste si vyžádat nový odkaz."
		// 		}
		// 	});
		// }

		try {
			// Pro reset hesla po recovery tokenu použijeme updateUser (uživatel je přihlášen)
			const { error } = await supabase.auth.updateUser({
				password: password
			});

			if (error) {
				console.error('Reset password error:', error);
				let displayMessage = "Nepodařilo se změnit heslo. Zkuste to prosím znovu později.";

				if (error.status === 422) {
					if (error.code === "same_password") {
						displayMessage = "Nové heslo musí být odlišné od starého hesla. Zadejte prosím jiné heslo.";
					} else {
						displayMessage = "Zadané heslo je neplatné. Zkontrolujte prosím své heslo a zkuste to znovu.";
					}
				} else if (error.status === 400) {
					displayMessage = "Došlo k chybě při odesílání požadavku. Zkontrolujte prosím zadané údaje a zkuste to znovu.";
				}

				return fail(error.status || 500, {
					password,
					repassword,
					message: {
						success: false,
						display: displayMessage
					}
				});
			} else {
				return {
					password: "",
					repassword: "",
					message: {
						success: true,
						display: "Heslo bylo úspěšně změněno."
					}
				};
			}
		} catch (error) {
			console.error('Unexpected error during password reset:', error);
			return fail(500, {
				password,
				repassword,
				message: {
					success: false,
					display: "Došlo k neočekávané chybě. Zkuste to prosím znovu."
				}
			});
		}
	}
};
