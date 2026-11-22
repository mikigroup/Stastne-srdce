import { fail } from "@sveltejs/kit";
import type { Actions } from "./$types";
import { createClient } from "@supabase/supabase-js";
import { PRIVATE_SBUrl, PRIVATE_ServiceKey } from "$env/static/private";
import { sendEmail } from "$lib/email";
import { createPasswordResetEmailTemplate } from "$lib/emailTemplates/passwordResetTemplate";

const supabaseAdmin = createClient(PRIVATE_SBUrl, PRIVATE_ServiceKey, {
	auth: {
		autoRefreshToken: false,
		persistSession: false
	}
});

const RESET_REQUEST_MESSAGE =
	"Pokud je tento e-mail u nás registrovaný, poslali jsme na něj instrukce k obnovení hesla.";

export const actions: Actions = {
	resetRequest: async ({ request, url }) => {
		const formData = await request.formData();
		const email = (formData.get("email") as string).toLowerCase().trim();

		if (!email || !email.includes("@")) {
			return fail(400, {
				message: {
					success: false,
					display: "Prosím zadejte platný email"
				},
				email
			});
		}

		const sent = {
			message: {
				success: true,
				display: RESET_REQUEST_MESSAGE
			},
			email
		};

		try {
			const { data: profileData, error: profileError } = await supabaseAdmin
				.from("profiles")
				.select("id, email")
				.eq("email", email)
				.maybeSingle();

			if (profileError || !profileData) {
				if (profileError) console.error("[FORGOT] Profile lookup failed:", profileError);
				return sent;
			}

			const { data, error } = await supabaseAdmin.auth.admin.generateLink({
				type: "recovery",
				email
			});

			const token_hash = data?.properties?.hashed_token;

			if (error || !token_hash) {
				console.error("[FORGOT] Recovery link failed:", error);
				return fail(500, {
					message: {
						success: false,
						display: "Vyskytla se chyba při odesílání e-mailu. Zkuste to prosím znovu."
					},
					email
				});
			}

			const resetLink = `${url.origin}/auth/callback?token_hash=${encodeURIComponent(token_hash)}&type=recovery&next=/auth/reset`;

			let emailSent = false;
			try {
				await sendEmail({
					to: email,
					subject: "Šťastné srdce — obnovení hesla",
					html: createPasswordResetEmailTemplate(resetLink)
				});
				emailSent = true;
			} catch (err) {
				console.error("Chyba při odesílání e-mailu:", err);
			}

			if (!emailSent) {
				return fail(500, {
					message: {
						success: false,
						display: "Vyskytla se chyba při odesílání e-mailu pro reset hesla."
					},
					email
				});
			}

			return sent;
		} catch (error) {
			console.error("Nečekaná chyba při resetu hesla:", error);
			return fail(500, {
				message: {
					success: false,
					display: "Vyskytla se nečekaná chyba. Zkuste to prosím později."
				},
				email
			});
		}
	}
};
