import { fail } from "@sveltejs/kit";
import type { Actions } from "./$types";
import nodemailer from "nodemailer";
import * as yup from "yup";
import type { FormData } from "$lib/types/form";

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

const transporter = nodemailer.createTransport({
	host: "smtp.seznam.cz",
	port: 465,
	secure: true,
	auth: {
		user: "info@stastnesrdce.cz",
		pass: "#QFUtwxDsQW5LEDT"
	}
});

export const actions: Actions = {
	sendForm: async ({ request }): Promise<FormData | Response> => {
		const formData = await request.formData();

		const formValues = {
			email: formData.get("email"),
			tel: formData.get("tel"),
			name: formData.get("name"),
			message: formData.get("message"),
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
								Obsah zprávy:\n${formValues.message}`
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
						[err.path]: err.message
					}),
					{}
				);

				return fail(400, {
					errors,
					status: {
						// přejmenováno z message
						success: false,
						display: "Prosím opravte chyby ve formuláři"
					},
					email: formValues.email,
					tel: formValues.tel,
					name: formValues.name,
					content: formValues.message // přejmenováno
				});
			}

			console.error("Chyba při odesílání e-mailu:", error);
			return fail(500, {
				message: { success: false, display: "Chyba při odesílání e-mailu" }
			});
		}
	}
};
