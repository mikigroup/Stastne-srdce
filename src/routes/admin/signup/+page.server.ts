import { redirect, fail } from "@sveltejs/kit";
import type { Actions, ActionFailure } from "@sveltejs/kit";
import { sendEmail } from "$lib/email";
import { createAdminSignupEmailTemplate } from "$lib/emailTemplates/adminSignupTemplate";
import { verifyRecaptchaToken, getClientIP } from "$lib/utils/recaptcha";
import { createClient } from '@supabase/supabase-js';
import type { Database } from '$lib/types/database.types';
import { PRIVATE_SBUrl, PRIVATE_ServiceKey } from '$env/static/private';

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

			// Vytvořit admin Supabase klient pro generování tokenu
			const adminSupabase = createClient<Database>(
				PRIVATE_SBUrl,
				PRIVATE_ServiceKey,
				{
					auth: {
						autoRefreshToken: false,
						persistSession: false
					}
				}
			);

			// Generovat Supabase token pomocí generateLink
			console.log('🔧 [ADMIN SIGNUP] Generating confirmation token for:', email);
			const { data: linkData, error: linkError } = await adminSupabase.auth.admin.generateLink({
				type: "signup",
				email: email
			});

			if (linkError || !linkData?.properties?.action_link) {
				console.error('❌ [ADMIN SIGNUP] Error generating confirmation link:', linkError);
				return fail(500, {
					message: {
						success: false,
						display: "Chyba při generování potvrzovacího odkazu"
					},
					email
				});
			}

			// Extrahovat token_hash z linku
			const originalLink = linkData.properties.action_link;
			const urlParams = new URL(originalLink).searchParams;
			const token_hash = urlParams.get('token_hash') || urlParams.get('token');

			if (!token_hash) {
				console.error('❌ [ADMIN SIGNUP] Token not found in generated link');
				return fail(500, {
					message: {
						success: false,
						display: "Chyba při generování potvrzovacího odkazu"
					},
					email
				});
			}

			console.log('✅ [ADMIN SIGNUP] Token generated successfully');

			// Vytvořit confirmation link s token_hash pro vlastní email šablonu
			const baseUrl = new URL(request.url).origin;
			const confirmationLink = `${baseUrl}/auth/confirm?type=admin_signup&email=${encodeURIComponent(email)}&token_hash=${token_hash}`;
			
			console.log('🔗 [ADMIN SIGNUP] Generated confirmation link with token:', confirmationLink.substring(0, 100) + '...');

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
