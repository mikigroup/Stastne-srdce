import { fail } from "@sveltejs/kit";
import type { Actions } from "./$types";
import { sendEmail } from "$lib/email";
import { createCustomerSignupEmailTemplate } from "$lib/emailTemplates/customerSignupTemplate";
import { verifyRecaptchaToken, getClientIP } from "$lib/utils/recaptcha";
import * as yup from "yup";

// Yup schéma pro validaci registrace
const signUpSchema = yup.object({
	email: yup
		.string()
		.trim()
		.email("Zadejte platný email")
		.required("Email je povinný"),
	password: yup
		.string()
		.trim()
		.min(8, "Heslo musí mít alespoň 8 znaků")
		.matches(/[A-Z]/, "Heslo musí obsahovat alespoň jedno velké písmeno")
		.matches(/[0-9]/, "Heslo musí obsahovat alespoň jedno číslo")
		.required("Heslo je povinné"),
	repassword: yup
		.string()
		.trim()
		.oneOf([yup.ref("password")], "Hesla se neshodují")
		.required("Potvrzení hesla je povinné")
});

export const actions = {
	signUp: async ({ request, locals: { supabase } }) => {
		try {
			const formData = await request.formData();
			const email = formData.get("email")?.toString() || "";
			const password = formData.get("password")?.toString() || "";
			const repassword = formData.get("repassword")?.toString() || "";
			const recaptchaToken = formData.get("recaptcha_token")?.toString() || "";

			// Validace reCAPTCHA tokenu
			if (recaptchaToken) {
				const clientIP = getClientIP(request);
				const recaptchaResult = await verifyRecaptchaToken(recaptchaToken, clientIP, 0.5);
				
				if (!recaptchaResult.success) {
					console.warn('⚠️ [CUSTOMER SIGNUP] reCAPTCHA validation failed:', {
						score: recaptchaResult.score,
						error: recaptchaResult.error,
						email: email.trim()
					});
					return fail(400, {
						error: true,
						message: "Ověření selhalo. Zkuste to prosím znovu.",
						email
					});
				}

				console.log('✅ [CUSTOMER SIGNUP] reCAPTCHA validation passed:', {
					score: recaptchaResult.score,
					email: email.trim()
				});
			} else {
				console.warn('⚠️ [CUSTOMER SIGNUP] reCAPTCHA token missing');
				// Pokud není token, ale reCAPTCHA je nakonfigurováno, blokovat
				// Graceful degradation - pokud není nakonfigurováno, pokračovat
			}

			// Validace pomocí yup
			try {
				await signUpSchema.validate({ email, password, repassword }, { abortEarly: false });
			} catch (validationError) {
				if (validationError instanceof yup.ValidationError) {
					const errors = validationError.inner.reduce((acc, error) => {
						if (error.path) {
							acc[error.path] = error.message;
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
			}

			console.log('🔧 [CUSTOMER SIGNUP] Attempting to create user in Supabase:', email.trim());
			
			// Vytvořit uživatele v Supabase Auth (BEZ emailRedirectTo - nepošle Supabase email)
			const { data: userData, error } = await supabase.auth.signUp({
				email: email.trim(),
				password: password.trim(),
				options: {
					// NEZADÁVÁME emailRedirectTo - Supabase nepošle email
					data: {
						user_type: "customer"
					}
				}
			});

			console.log('📊 [CUSTOMER SIGNUP] Supabase signUp result:', { 
				success: !error, 
				error: error?.message,
				userId: userData?.user?.id,
				emailConfirmed: userData?.user?.email_confirmed_at
			});

			if (error) {
				console.error('❌ [CUSTOMER SIGNUP] Supabase signUp failed:', error);
				return fail(400, {
					error: true,
					message:
						error.message === "User already registered"
							? "Tento email je již registrován"
							: "Chyba při registraci",
					email
				});
			}

			if (!userData?.user) {
				console.error('❌ [CUSTOMER SIGNUP] No user data returned from Supabase');
				return fail(400, {
					error: true,
					message: "Chyba při vytváření uživatele",
					email
				});
			}

			console.log('✅ [CUSTOMER SIGNUP] User created successfully in Supabase:', userData.user.id);

			// Vytvořit confirmation link pro vlastní email šablonu
			const baseUrl = new URL(request.url).origin;
			const confirmationLink = `${baseUrl}/auth/confirm?type=customer_signup&email=${encodeURIComponent(email.trim())}`;
			
			console.log('🔗 [CUSTOMER SIGNUP] Generated confirmation link:', confirmationLink);

			console.log('📧 [CUSTOMER SIGNUP] Attempting to send email to:', email.trim());
			
			// Odeslat vlastní email s šablonou
			const emailHtml = createCustomerSignupEmailTemplate(confirmationLink, email.trim());
			
			try {
				await sendEmail({
					to: email.trim(),
					subject: "Šťastné srdce - Potvrďte svou registraci",
					html: emailHtml
				});

				console.log('✅ [CUSTOMER SIGNUP] Custom email sent successfully to:', email.trim());
			} catch (emailError) {
				console.error('❌ [CUSTOMER SIGNUP] Email sending failed:', emailError);
				throw emailError;
			}

			// Úspěšná registrace
			return {
				success: true,
				error: false,
				message: `Na emailovou adresu ${email.trim()} byla odeslána zpráva pro potvrzení registrace. Pro dokončení registrace prosím vyplňte všechna pole v profilu.`
			};
		} catch (error) {
			console.error("Unexpected error:", error);
			return fail(500, {
				error: true,
				message: "Došlo k neočekávané chybě"
			});
		}
	}
} satisfies Actions;
