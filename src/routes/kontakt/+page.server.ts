import { fail } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import nodemailer from "nodemailer";
import * as yup from "yup";
import type { FormData } from "$lib/types/form";
import { PRIVATE_seznam_key } from "$env/static/private";
import { getDefaultSettings } from "$lib/constants/defaultSettings";
import { getSetting } from "$lib/services/siteSettingsService";

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
			"Neplatný formát telefonu (např. +420 123 456 789)"
		)
		.required("Telefon je povinný"),
	name: yup
		.string()
		.min(2, "Jméno musí mít alespoň 2 znaky")
		.required("Jméno je povinné"),
	content: yup.string().min(10).required(),
	"g-recaptcha-response": yup.string().required("ReCaptcha je povinná")
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
		console.log('🔄 Kontakt - Začínám načítání dat...');

		// Načtení dat pomocí centralizované služby s tenant_id
		// Nyní se používá PUBLIC_TENANT automaticky
		console.log('🎯 Kontakt - Používám PUBLIC_TENANT automaticky');
		
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

		// Logování chyb
		if (contactSettings.status === 'rejected') {
			console.error('❌ Chyba při načítání kontaktních nastavení:', contactSettings.reason);
		}
		if (businessSettings.status === 'rejected') {
			console.error('❌ Chyba při načítání obchodních nastavení:', businessSettings.reason);
		}
		
		// Logování výsledků
		if (contact === null) {
			console.warn('⚠️ Kontakt - Kontaktní nastavení nebyla načtena z databáze');
		} else {
			console.log('✅ Kontakt - Kontaktní nastavení načtena z databáze');
		}
		
		if (business === null) {
			console.warn('⚠️ Kontakt - Obchodní nastavení nebyla načtena z databáze');
		} else {
			console.log('✅ Kontakt - Obchodní nastavení načtena z databáze');
		}

		// Debug výpis pro kontrolu dat
		console.log('🔍 Kontakt - Načtená data:', {
			contact: contact,
			business: business,
			showOpeningHours: contact?.showOpeningHours,
			openingHours: contact?.openingHours,
			hasContactData: contactSettings.status === 'fulfilled' && !!contactSettings.value,
			hasBusinessData: businessSettings.status === 'fulfilled' && !!businessSettings.value,
			contactStatus: contactSettings.status,
			businessStatus: businessSettings.status
		});

		return {
			settings: {
				contact,
				business
			}
		};
	} catch (error) {
		console.error("❌ Nepředvídaná chyba při načítání nastavení:", error);
		console.log('🔄 Kontakt - Vracím null hodnoty kvůli chybě');

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
			"g-recaptcha-response": formData.get("g-recaptcha-response")
		};

		try {
			await contactSchema.validate(formValues, { abortEarly: false });

			const options = {
				from: "info@stastnesrdce.cz",
				to: "info@stastnesrdce.cz",
				subject: "Šťastné srdce - Formulář",
				text: `Dobrý den,\n
								byla Vám poslána zpráva přes formulář ze stránky stastnesrdce.cz.\n
								Kontaktní osoba: ${formValues.name}
								Email: ${formValues.email}
								Telefon: ${formValues.tel}\n
								Obsah zprávy:\n${formValues.content}`
			};

			await transporter.sendMail(options);

			return {
				success: true,
				message: { success: true, display: "Zpráva byla úspěšně odeslána" }
			};
		} catch (error) {
			if (error instanceof yup.ValidationError) {
				const errors = error.inner.reduce(
					(acc, err) => ({
						...acc,
						[err.path || ""]: err.message
					}),
					{} as Record<string, string>
				);

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
				message: { success: false, display: "Chyba při odesílání e-mailu" }
			});
		}
	}
};
