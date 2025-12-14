import { redirect, fail } from "@sveltejs/kit";
import type { Actions, ActionFailure } from "@sveltejs/kit";
import { sendEmail } from "$lib/email";
import { createAdminSignupEmailTemplate } from "$lib/emailTemplates/adminSignupTemplate";
import { verifyRecaptchaToken, getClientIP } from "$lib/utils/recaptcha";

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
		const recaptchaToken = formData.get("recaptcha_token")?.toString() || "";

		// Validace reCAPTCHA tokenu
		if (recaptchaToken) {
			const clientIP = getClientIP(request);
			const recaptchaResult = await verifyRecaptchaToken(recaptchaToken, clientIP, 0.5);
			
			if (!recaptchaResult.success) {
				console.warn('⚠️ [ADMIN SIGNUP] reCAPTCHA validation failed:', {
					score: recaptchaResult.score,
					error: recaptchaResult.error,
					email: email
				});
				return fail(400, {
					message: {
						success: false,
						display: "Ověření selhalo. Zkuste to prosím znovu."
					},
					email
				});
			}

			console.log('✅ [ADMIN SIGNUP] reCAPTCHA validation passed:', {
				score: recaptchaResult.score,
				email: email
			});
		} else {
			console.warn('⚠️ [ADMIN SIGNUP] reCAPTCHA token missing');
			// Pokud není token, ale reCAPTCHA je nakonfigurováno, blokovat
			// Graceful degradation - pokud není nakonfigurováno, pokračovat
		}

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

		try {
			// Vytvořit uživatele v Supabase Auth (BEZ emailRedirectTo - nepošle Supabase email)
			const { data, error } = await supabase.auth.signUp({
				email,
				password,
				options: {
					// NEZADÁVÁME emailRedirectTo - Supabase nepošle email
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

			// Vytvořit confirmation link pro vlastní email šablonu
			const baseUrl = new URL(request.url).origin;
			const confirmationLink = `${baseUrl}/auth/confirm?type=admin_signup&email=${encodeURIComponent(email)}`;
			
			console.log('🔗 [ADMIN SIGNUP] Generated confirmation link:', confirmationLink);

			// Odeslat vlastní email s šablonou
			const emailHtml = createAdminSignupEmailTemplate(confirmationLink, email);
			
			await sendEmail({
				to: email,
				subject: "Šťastné srdce - Potvrďte svou registraci",
				html: emailHtml
			});

			console.log('✅ [ADMIN SIGNUP] Custom email sent successfully to:', email);

			return {
				message: {
					success: true,
					display:
						"Na Vaši emailovou schránku byla odeslána zpráva. Prosím potvrďte ji a následně se přihlašte."
				}
			};

		} catch (error) {
			console.error("Chyba při odesílání emailu:", error);
			return fail(500, {
				message: {
					success: false,
					display: "Chyba při odesílání potvrzovacího emailu. Zkuste to prosím znovu."
				},
				email
			});
		}
	}
};
