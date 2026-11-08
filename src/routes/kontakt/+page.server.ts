import { fail } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import nodemailer from "nodemailer";
import { PRIVATE_seznam_key } from "$env/static/private";
import { PUBLIC_RECAPTCHA_SITE_KEY } from "$env/static/public";
import { getSetting } from "$lib/services/siteSettingsService";
import { verifyRecaptchaToken, getClientIP } from "$lib/utils/recaptcha";
import { sanitizeEmailText, sanitizeEmailAddress, sanitizePhone } from "$lib/utils/emailSanitization";
import { contactFormSchema } from "$lib/utils/validationSchemas";

export const prerender = false;

// Konfigurace nodemailer transporteru
const transporter = nodemailer.createTransport({
	host: "smtp.seznam.cz",
	port: 465,
	secure: true,
	auth: {
		user: "info@stastnesrdce.cz",
		pass: PRIVATE_seznam_key
	}
});

// Načítání dat z site_settings
export const load: PageServerLoad = async ({ locals: { supabase } }) => {
	try {
		// Načtení dat pomocí centralizované služby s tenant_id
		// Nyní se používá PUBLIC_TENANT automaticky
		
		const [contactSettings, businessSettings] = await Promise.allSettled([
			getSetting(supabase, 'contact'),
			getSetting(supabase, 'business')
		]);

		// Zpracování výsledků - pouze z databáze, bez fallbacku
		const contact = contactSettings.status === 'fulfilled' && contactSettings.value 
			? contactSettings.value 
			: null;
		
		const business = businessSettings.status === 'fulfilled' && businessSettings.value 
			? businessSettings.value 
			: null;


		return {
			settings: {
				contact,
				business
			}
		};
	} catch (error) {
		console.error("Chyba při načítání nastavení:", error);

		return {
			settings: {
				contact: null,
				business: null
			}
		};
	}
};

export const actions: Actions = {
	sendForm: async ({ request }) => {
		const formData = await request.formData();
		const field = (name: string) => {
			const value = formData.get(name);
			return typeof value === "string" ? value : "";
		};
		const email = field("email");
		const tel = field("tel");
		const name = field("name");
		const content = field("content");
		const recaptchaToken = formData.get("recaptcha_token")?.toString() || "";
		const submitted = { email, tel, name, content };

		console.log('📧 Kontakt - Odesílání formuláře:', {
			email: email ? email.substring(0, 20) + '...' : 'prázdné',
			tel: tel ? tel.substring(0, 10) + '...' : 'prázdné',
			name: name ? name.substring(0, 20) + '...' : 'prázdné',
			content: content ? `${content.substring(0, 50)}...` : 'prázdné'
		});

		if (PUBLIC_RECAPTCHA_SITE_KEY) {
			if (!recaptchaToken) {
				console.warn('⚠️ [KONTAKT] reCAPTCHA token missing');
				return fail(400, {
					errors: {},
					status: {
						success: false,
						display: "Ověření selhalo. Zkuste to prosím znovu."
					},
					...submitted
				});
			}

			const clientIP = getClientIP(request);
			const recaptchaResult = await verifyRecaptchaToken(
				recaptchaToken,
				clientIP,
				0.5,
				"contact_form"
			);

			if (!recaptchaResult.success) {
				console.warn('⚠️ [KONTAKT] reCAPTCHA validation failed:', {
					score: recaptchaResult.score,
					error: recaptchaResult.error
				});
				return fail(400, {
					errors: {},
					status: {
						success: false,
						display: "Ověření selhalo. Zkuste to prosím znovu."
					},
					...submitted
				});
			}

			console.log('✅ [KONTAKT] reCAPTCHA validation passed:', {
				score: recaptchaResult.score
			});
		}

		// Validace pomocí Zod
		const validationResult = contactFormSchema.safeParse(submitted);
		
		if (!validationResult.success) {
			console.log('❌ Kontakt - Chyba validace:', validationResult.error.issues);
			const errors = validationResult.error.issues.reduce(
				(acc, err) => {
					const key = String(err.path[0] ?? "");
					if (key && !acc[key]) acc[key] = err.message;
					return acc;
				},
				{} as Record<string, string>
			);

			console.log('❌ Kontakt - Chybové zprávy:', errors);

			return fail(400, {
				errors,
				status: {
					success: false,
					display: "Prosím opravte chyby ve formuláři"
				},
				...submitted
			});
		}

		console.log('✅ Kontakt - Validace prošla úspěšně');

		try {
			// Sanitizace hodnot před vložením do emailu
			const sanitizedName = sanitizeEmailText(validationResult.data.name);
			const sanitizedEmail = sanitizeEmailAddress(validationResult.data.email);
			const sanitizedTel = sanitizePhone(validationResult.data.tel);
			const sanitizedContent = sanitizeEmailText(validationResult.data.content);

			const options = {
				from: "info@stastnesrdce.cz",
				to: "info@stastnesrdce.cz",
				subject: "Šťastné srdce - Formulář",
				text: `Dobrý den,

byla Vám poslána zpráva přes formulář ze stránky stastnesrdce.cz.

Kontaktní osoba: ${sanitizedName}
Email: ${sanitizedEmail}
Telefon: ${sanitizedTel}

Obsah zprávy:
${sanitizedContent}`
			};

			console.log('📧 Kontakt - Odesílám email...');
			await transporter.sendMail(options);
			console.log('✅ Kontakt - Email úspěšně odeslán');

			return {
				success: true,
				status: { success: true, display: "Zpráva byla úspěšně odeslána" }
			};
		} catch (error) {
			console.error("Chyba při odesílání e-mailu:", error);

			return fail(500, {
				status: { success: false, display: "Chyba při odesílání e-mailu" },
				...submitted
			});
		}
	}
};
