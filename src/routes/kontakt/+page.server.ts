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
const MAILBOX = "info@stastnesrdce.cz";

const transporter = nodemailer.createTransport({
	host: "smtp.seznam.cz",
	port: 465,
	secure: true,
	auth: {
		user: MAILBOX,
		pass: PRIVATE_seznam_key
	}
});

function fulfilledValue<T>(result: PromiseSettledResult<T>): T | null {
	return result.status === "fulfilled" && result.value ? result.value : null;
}

async function readContactPageSettings(supabase: Parameters<typeof getSetting>[0]) {
	const [contactSettings, businessSettings, generalSettings] = await Promise.allSettled([
		getSetting(supabase, "contact"),
		getSetting(supabase, "business"),
		getSetting(supabase, "general")
	]);
	const general = fulfilledValue(generalSettings) as { shopName?: string } | null;
	const shopName = String(general?.shopName || "").trim();
	return {
		contact: fulfilledValue(contactSettings),
		business: fulfilledValue(businessSettings),
		shopName
	};
}

function recipientFromContact(contact: { email?: string } | null): string {
	const email = sanitizeEmailAddress(contact?.email);
	if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "";
	return email;
}

// Načítání dat z site_settings
export const load: PageServerLoad = async ({ locals: { supabase } }) => {
	try {
		const { contact, business, shopName } = await readContactPageSettings(supabase);

		return {
			settings: {
				contact,
				business,
				shopName
			}
		};
	} catch (error) {
		console.error("Chyba při načítání nastavení:", error);

		return {
			settings: {
				contact: null,
				business: null,
				shopName: ""
			}
		};
	}
};

export const actions: Actions = {
	sendForm: async ({ request, locals: { supabase } }) => {
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

		const { contact, shopName } = await readContactPageSettings(supabase);
		const recipient = recipientFromContact(contact as { email?: string } | null);
		if (!recipient) {
			return fail(400, {
				errors: {},
				status: {
					success: false,
					display: "E-mail v nastavení kontaktu není vyplněný. Zprávu teď nelze odeslat."
				},
				...submitted
			});
		}

		try {
			// Sanitizace hodnot před vložením do emailu
			const sanitizedName = sanitizeEmailText(validationResult.data.name);
			const sanitizedEmail = sanitizeEmailAddress(validationResult.data.email);
			const sanitizedTel = sanitizePhone(validationResult.data.tel);
			const sanitizedContent = sanitizeEmailText(validationResult.data.content);
			const brand = sanitizeEmailText(shopName);
			const subject = brand ? `${brand} - Formulář` : "Formulář";
			const intro = brand
				? `byla Vám poslána zpráva přes formulář ${brand}.`
				: "byla Vám poslána zpráva přes kontaktní formulář.";

			const options = {
				from: MAILBOX,
				to: recipient,
				subject,
				text: `Dobrý den,

${intro}

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
