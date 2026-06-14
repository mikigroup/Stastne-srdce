import { fail } from "@sveltejs/kit";
import type { Actions } from "./$types";
import { sendEmail } from "$lib/email";
import { createCustomerSignupEmailTemplate } from "$lib/emailTemplates/customerSignupTemplate";
import { verifyRecaptchaToken, getClientIP } from "$lib/utils/recaptcha";
import { isTemporaryEmail } from "$lib/utils/botDetection";
import { signUpSchema } from "$lib/utils/validationSchemas";
import { createClient } from '@supabase/supabase-js';
import type { Database } from '$lib/types/database.types';
import { PRIVATE_SBUrl, PRIVATE_ServiceKey } from '$env/static/private';
import { PUBLIC_RECAPTCHA_SITE_KEY } from '$env/static/public';
import { ROUTES } from "$lib/constants/routes";

export const actions = {
	signUp: async ({ request, locals: { supabase } }) => {
		try {
			const formData = await request.formData();
			const email = formData.get("email")?.toString() || "";
			const password = formData.get("password")?.toString() || "";
			const repassword = formData.get("repassword")?.toString() || "";		

			const recaptchaToken = formData.get("g-recaptcha-response")?.toString() || 
			                        formData.get("recaptcha_token")?.toString() || "";

			if (PUBLIC_RECAPTCHA_SITE_KEY) {
				if (!recaptchaToken) {
					return fail(400, {
						error: true,
						message: "Ověření selhalo. Zkuste to prosím znovu.",
						email
					});
				}

				const clientIP = getClientIP(request);
				const recaptchaResult = await verifyRecaptchaToken(recaptchaToken, clientIP, 0.5);
				
				if (!recaptchaResult.success) {
					return fail(400, {
						error: true,
						message: "Ověření selhalo. Zkuste to prosím znovu.",
						email
					});
				}
			}

			if (isTemporaryEmail(email)) {
				return fail(400, {
					error: true,
					message: "Dočasné emailové adresy nejsou povoleny. Použijte prosím trvalou emailovou adresu.",
					email
				});
			}

			const validationResult = signUpSchema.safeParse({ email, password, repassword });
			
			if (!validationResult.success) {
				const errors = validationResult.error.errors.reduce((acc, error) => {
					const path = error.path[0];
					if (path) {
						acc[path] = error.message;
					}
					return acc;
				}, {} as Record<string, string>);

				return fail(400, {
					error: true,
					message: "Opravte prosím chyby ve formuláři",
					errors,
					email
				});
			}

			const { data: userData, error } = await supabase.auth.signUp({
				email: email.trim(),
				password: password.trim(),
				options: {
					data: {
						user_type: "customer"
					}
				}
			});

			if (error) {
				const errMsg = (error.message || "").toLowerCase();
				let message = "Chyba při registraci";
				const errors: Record<string, string> = {};
				if (error.message === "User already registered") {
					message = "Tento email je již registrován";
				} else if (
					errMsg.includes("invalid") && errMsg.includes("password") ||
					errMsg.includes("weak") && errMsg.includes("password") ||
					errMsg.includes("password") && (errMsg.includes("least") || errMsg.includes("length"))
				) {
					message = "Heslo nevyhovuje požadavkům.";
					errors.password = "Heslo musí mít alespoň 8 znaků, jedno velké písmeno a jednu číslici. Zkuste ho upravit.";
				}
				return fail(400, {
					error: true,
					message,
					errors,
					email
				});
			}

			if (!userData?.user) {
				return fail(400, {
					error: true,
					message: "Chyba při vytváření uživatele",
					email
				});
			}			

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

			let linkData = null;
			let linkError = null;
			
			const { data: signupLinkData, error: signupLinkError } = await adminSupabase.auth.admin.generateLink({
				type: "signup",
				email: email.trim(),
				password: password.trim()
			});

			if (signupLinkError) {
				if (signupLinkError.message?.includes('already') || signupLinkError.code === 'email_exists') {
					const { data: magicLinkData, error: magicLinkError } = await adminSupabase.auth.admin.generateLink({
						type: "magiclink",
						email: email.trim(),
						options: {
							redirectTo: `${new URL(request.url).origin}${ROUTES.AUTH.CALLBACK}`
						}
					});
					
					linkData = magicLinkData;
					linkError = magicLinkError;
				} else {
					linkData = signupLinkData;
					linkError = signupLinkError;
				}
			} else {
				linkData = signupLinkData;
				linkError = signupLinkError;
			}

			if (linkError || !linkData?.properties?.action_link) {
				try {
					await adminSupabase.auth.admin.deleteUser(userData.user.id);
				} catch (deleteError) {
				}
				
				return fail(500, {
					error: true,
					message: "Chyba při generování potvrzovacího odkazu",
					email
				});
			}

			const originalLink = linkData.properties.action_link;
			const urlParams = new URL(originalLink).searchParams;
			const token_hash = urlParams.get('token_hash') || urlParams.get('token');

			if (!token_hash) {
				return fail(500, {
					error: true,
					message: "Chyba při generování potvrzovacího odkazu",
					email
				});
			}

			const baseUrl = new URL(request.url).origin;
			const confirmationLink = `${baseUrl}/auth/callback?token_hash=${encodeURIComponent(token_hash)}&type=signup&next=${encodeURIComponent(ROUTES.AUTH.SIGNUP_COMPLETE)}`;

			const emailHtml = createCustomerSignupEmailTemplate(confirmationLink, email.trim());
			
			try {
				await sendEmail({
					to: email.trim(),
					subject: "Šťastné srdce - Potvrďte svou registraci",
					html: emailHtml
				});
			} catch (emailError) {
				throw emailError;
			}

			return {
				success: true,
				error: false,
				message: `Na emailovou adresu ${email.trim()} byla odeslána zpráva pro potvrzení registrace. Pro dokončení registrace prosím vyplňte všechna pole v profilu.`
			};
		} catch (error) {
			return fail(500, {
				error: true,
				message: "Došlo k neočekávané chybě"
			});
		}
	}
} satisfies Actions;
