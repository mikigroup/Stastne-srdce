import { fail } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import nodemailer from "nodemailer";
import * as yup from "yup";
import { PRIVATE_seznam_key } from "$env/static/private";
import { getSetting } from "$lib/services/siteSettingsService";
import { verifyRecaptchaToken, getClientIP } from "$lib/utils/recaptcha";
import { sanitizeEmailText, sanitizeEmailAddress, sanitizePhone } from "$lib/utils/emailSanitization";

export const prerender = false;

// Definice schématu pro validaci formuláře
const contactSchema = yup.object({
	email: yup
		.string()
		.email("Neplatný formát emailu")
		.required("Email je povinný"),
	tel: yup
		.string()
		.matches(
			/^(\+420)?\s*\d{3}\s*\d{3}\s*\d{3}$/,
			"Neplatný formát telefonu (např. +420123456789)"
		)
		.required("Telefon je povinný"),
	name: yup
		.string()
		.min(2, "Jméno musí mít alespoň 2 znaky")
		.required("Jméno je povinné"),
	content: yup.string().min(10, "Zpráva musí mít alespoň 10 znaků").required("Zpráva je povinná"),
});

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
		const formValues = {
			email: formData.get("email"),
			tel: formData.get("tel"),
			name: formData.get("name"),
			content: formData.get("content"),
			recaptchaToken: formData.get("recaptcha_token")?.toString() || ""
		};

		console.log('📧 Kontakt - Odesílání formuláře:', {
			email: formValues.email ? String(formValues.email).substring(0, 20) + '...' : 'prázdné',
			tel: formValues.tel ? String(formValues.tel).substring(0, 10) + '...' : 'prázdné',
			name: formValues.name ? String(formValues.name).substring(0, 20) + '...' : 'prázdné',
			content: formValues.content ? `${String(formValues.content).substring(0, 50)}...` : 'prázdné'
		});

		// Validace reCAPTCHA tokenu
		if (formValues.recaptchaToken) {
			const clientIP = getClientIP(request);
			const recaptchaResult = await verifyRecaptchaToken(formValues.recaptchaToken, clientIP, 0.5);
			
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
					email: formValues.email,
					tel: formValues.tel,
					name: formValues.name,
					content: formValues.content
				});
			}

			console.log('✅ [KONTAKT] reCAPTCHA validation passed:', {
				score: recaptchaResult.score
			});
		} else {
			console.warn('⚠️ [KONTAKT] reCAPTCHA token missing');
			// Graceful degradation - pokud není nakonfigurováno, pokračovat
		}

		try {
			await contactSchema.validate(formValues, { abortEarly: false });
			console.log('✅ Kontakt - Validace prošla úspěšně');

			// Sanitizace hodnot před vložením do emailu
			const sanitizedName = sanitizeEmailText(formValues.name);
			const sanitizedEmail = sanitizeEmailAddress(formValues.email);
			const sanitizedTel = sanitizePhone(formValues.tel);
			const sanitizedContent = sanitizeEmailText(formValues.content);

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
			if (error instanceof yup.ValidationError) {
				console.log('❌ Kontakt - Chyba validace:', error.inner);
				const errors = error.inner.reduce(
					(acc, err) => ({
						...acc,
						[err.path || ""]: err.message
					}),
					{} as Record<string, string>
				);

				console.log('❌ Kontakt - Chybové zprávy:', errors);

				return fail(400, {
					errors,
					status: {
						success: false,
						display: "Prosím opravte chyby ve formuláři"
					},
					email: formValues.email,
					tel: formValues.tel,
					name: formValues.name,
					content: formValues.content
				});
			}

			console.error("Chyba při odesílání e-mailu:", error);

			return fail(500, {
				status: { success: false, display: "Chyba při odesílání e-mailu" }
			});
		}
	}
};
