import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { clearCorruptedSupabaseCookies } from "$lib/utils/supabaseCookies";

export const load: PageServerLoad = async ({ cookies, locals: { safeGetSession } }) => {
	clearCorruptedSupabaseCookies(cookies);

	const { session } = await safeGetSession();
	if (!session) {
		throw redirect(303, "/auth/forgot?error=missing_session");
	}

	return {};
};

export const actions: Actions = {
	resetPass: async ({ request, locals: { supabase, safeGetSession } }) => {
		const { session } = await safeGetSession();
		if (!session) {
			return fail(400, {
				message: {
					success: false,
					display:
						"Odkaz pro obnovení hesla vypršel nebo byl již použit. Požádejte prosím o nový."
				}
			});
		}

		const formData = await request.formData();
		const password = (formData.get("password") as string)?.trim();
		const repassword = (formData.get("repassword") as string)?.trim();

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
			const { error: updateError } = await supabase.auth.updateUser({ password });

			if (updateError) {
				let displayMessage =
					"Nepodařilo se změnit heslo. Zkuste to prosím znovu později.";

				if (updateError.message?.toLowerCase().includes("same")) {
					displayMessage =
						"Nové heslo musí být odlišné od starého hesla. Zadejte prosím jiné heslo.";
				}

				return fail(400, {
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
			console.error("[RESET] Unexpected error:", error);
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
