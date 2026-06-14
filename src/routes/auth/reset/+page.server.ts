import { fail, redirect } from "@sveltejs/kit";
import { createClient } from "@supabase/supabase-js";
import type { Actions, PageServerLoad } from "./$types";
import type { Database } from "$lib/types/database.types";
import { PRIVATE_SBUrl, PRIVATE_ServiceKey } from "$env/static/private";

const adminSupabase = createClient<Database>(PRIVATE_SBUrl, PRIVATE_ServiceKey, {
	auth: {
		autoRefreshToken: false,
		persistSession: false
	}
});

export const load: PageServerLoad = async ({ url }) => {
	const token = url.searchParams.get("token");
	if (!token) {
		throw redirect(303, "/auth/forgot?error=missing_token");
	}
	return { token };
};

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
			// Zrušit případnou neplatnou session z cookies (jinak se verifyOtp přeskočí)
			await supabase.auth.signOut();

			const { data: verifyData, error: verifyError } =
				await supabase.auth.verifyOtp({
					type: "recovery",
					token_hash: token
				});

			if (verifyError || !verifyData.user) {
				console.error("[RESET] verifyOtp failed:", verifyError);
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

			console.log("[RESET] verifyOtp OK, updating password via admin for:", verifyData.user.id);

			// Admin API nevyžaduje session v cookies — spolehlivé na Vercelu
			const { error: updateError } = await adminSupabase.auth.admin.updateUserById(
				verifyData.user.id,
				{ password }
			);

			if (updateError) {
				console.error("[RESET] admin.updateUserById failed:", updateError);
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
