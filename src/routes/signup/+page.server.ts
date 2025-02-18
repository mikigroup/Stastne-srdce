import { redirect, fail } from "@sveltejs/kit";
import type { Actions } from "./$types";

export const actions: Actions = {
	signUp: async ({ request, locals: { supabase } }) => {
		try {
			const formData = await request.formData();
			const email = formData.get("email") as string;
			const password = formData.get("password") as string;
			const repassword = formData.get("repassword") as string;

			// Validace
			if (!email || !password || !repassword) {
				return fail(400, {
					message: {
						success: false,
						display: "Vyplňte prosím všechna pole"
					}
				});
			}

			if (password !== repassword) {
				return fail(400, {
					email,
					message: {
						success: false,
						display: "Hesla se neshodují"
					}
				});
			}

			if (password.length < 6) {
				return fail(400, {
					email,
					message: {
						success: false,
						display: "Heslo musí mít alespoň 6 znaků"
					}
				});
			}

			// Registrace
			const { data, error } = await supabase.auth.signUp({
				email,
				password,
				options: {
					emailRedirectTo: `${new URL(request.url).origin}/auth/callback`
				}
			});

			if (error) {
				return fail(400, {
					email,
					message: {
						success: false,
						display:
							error.message === "User already registered"
								? "Tento email je již registrován"
								: "Chyba při registraci. Zkuste to prosím později."
					}
				});
			}

			if (!data.user) {
				return fail(400, {
					email,
					message: {
						success: false,
						display: "Chyba při vytváření účtu"
					}
				});
			}

			// Úspěšná registrace
			return {
				success: true,
				email,
				message: {
					success: true,
					display: `Na emailovou adresu ${email} byla odeslána zpráva pro potvrzení registrace. Pro dokončení registrace prosím potvrďte odkaz ve zprávě.`
				}
			};
		} catch (error) {
			console.error("Neočekávaná chyba:", error);
			return fail(500, {
				message: {
					success: false,
					display: "Došlo k neočekávané chybě. Zkuste to prosím později."
				}
			});
		}
	}
};
