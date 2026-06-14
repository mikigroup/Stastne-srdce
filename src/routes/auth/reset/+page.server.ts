import { fail, isRedirect, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { clearCorruptedSupabaseCookies } from "$lib/utils/supabaseCookies";
import { ROUTES } from "$lib/constants/routes";

export const load: PageServerLoad = async ({ cookies, locals: { safeGetSession } }) => {
	clearCorruptedSupabaseCookies(cookies);

	const { session } = await safeGetSession();
	if (!session) {
		throw redirect(303, `${ROUTES.AUTH.FORGOT}?error=missing_session`);
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
				// Supabase vrací pro shodu se stávajícím heslem kód "same_password"
				// (HTTP 422). Starší verze nemusí kód mít, proto fallback na text.
				const isSamePassword =
					updateError.code === "same_password" ||
					updateError.message?.toLowerCase().includes("should be different") ||
					updateError.message?.toLowerCase().includes("same");

				// Slabé / příliš krátké heslo dle politiky projektu
				const isWeakPassword =
					updateError.code === "weak_password" ||
					updateError.message?.toLowerCase().includes("weak");

				let displayMessage =
					"Nepodařilo se změnit heslo. Zkuste to prosím znovu později.";

				if (isSamePassword) {
					displayMessage =
						"Nové heslo se shoduje s vaším stávajícím heslem. Z bezpečnostních důvodů zadejte prosím heslo, které jste dosud nepoužívali.";
				} else if (isWeakPassword) {
					displayMessage =
						"Heslo je příliš slabé. Použijte prosím delší heslo a kombinaci malých a velkých písmen, číslic a symbolů.";
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

			throw redirect(303, `${ROUTES.AUTH.LOGIN}?message=password_reset`);
		} catch (error) {
			if (isRedirect(error)) {
				throw error;
			}
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
