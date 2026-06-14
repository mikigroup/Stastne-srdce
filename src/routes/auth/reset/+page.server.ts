import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ url }) => {
	const token = url.searchParams.get("token");
	if (!token) {
		throw redirect(303, "/auth/forgot?error=missing_token");
	}
	return { token };
};

async function ensureRecoverySession(
	supabase: App.Locals["supabase"],
	token: string
) {
	const {
		data: { session }
	} = await supabase.auth.getSession();

	if (session) {
		return null;
	}

	const { error } = await supabase.auth.verifyOtp({
		type: "recovery",
		token_hash: token
	});

	return error;
}

export const actions: Actions = {
	resetPass: async ({ request, locals: { supabase }, url }) => {
		const formData = await request.formData();
		const password = (formData.get("password") as string)?.trim();
		const repassword = (formData.get("repassword") as string)?.trim();
		const token =
			(formData.get("token") as string) || url.searchParams.get("token");

		if (!token) {
			return fail(400, {
				message: {
					success: false,
					display:
						"Odkaz pro obnovení hesla je neplatný. Požádejte prosím o nový na stránce Zapomenuté heslo."
				}
			});
		}

		if (!password || password.length < 8) {
			return fail(400, {
				password,
				repassword,
				message: {
					success: false,
					display: "Heslo musí mít alespoň 8 znaků"
				}
			});
		}

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

		try {
			const verifyError = await ensureRecoverySession(supabase, token);
			if (verifyError) {
				console.error("Recovery verifyOtp error:", verifyError);
				return fail(400, {
					password,
					repassword,
					message: {
						success: false,
						display:
							"Odkaz pro obnovení hesla vypršel nebo byl již použit. Požádejte prosím o nový."
					}
				});
			}

			const { error } = await supabase.auth.updateUser({ password });

			if (error) {
				console.error("Reset password error:", error);
				let displayMessage =
					"Nepodařilo se změnit heslo. Zkuste to prosím znovu později.";

				if (error.name === "AuthSessionMissingError") {
					displayMessage =
						"Platnost odkazu vypršela. Požádejte prosím o nový e-mail pro obnovení hesla.";
				} else if (error.status === 422) {
					if (error.code === "same_password") {
						displayMessage =
							"Nové heslo musí být odlišné od starého hesla. Zadejte prosím jiné heslo.";
					} else {
						displayMessage =
							"Zadané heslo je neplatné. Zkontrolujte prosím své heslo a zkuste to znovu.";
					}
				} else if (error.status === 400) {
					displayMessage =
						"Došlo k chybě při odesílání požadavku. Zkontrolujte prosím zadané údaje a zkuste to znovu.";
				}

				return fail(error.status || 500, {
					password,
					repassword,
					message: {
						success: false,
						display: displayMessage
					}
				});
			}

			await supabase.auth.signOut();

			return {
				password: "",
				repassword: "",
				message: {
					success: true,
					display: "Heslo bylo úspěšně změněno. Nyní se můžete přihlásit."
				}
			};
		} catch (error) {
			console.error("Unexpected error during password reset:", error);
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
