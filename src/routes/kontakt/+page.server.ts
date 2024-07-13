import { fail } from "@sveltejs/kit";
import type { Actions } from "./$types";
// import Hello from "./Hello.svelte";
import nodemailer from "nodemailer";

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
	sendForm: async ({ request }) => {
		const formData = await request.formData();
		const email = formData.get("email") as string;
		const tel = formData.get("tel") as string;
		const name = formData.get("name") as string;
		const message = formData.get("message") as string;

		const options = {
			from: "info@stastnesrdce.cz",
			to: "info@stastnesrdce.cz",
			// cc: "mikigroup@gmail.com",
			subject: "Šťastné srdce - Formulář",
			text: `Dobrý den,\nbyla Vám poslána zpráva přes formulář ze stránky stastnesrdce.cz .\n\nKontaktní osoba: ${name}\nEmail: ${email}\nTelefon: ${tel}\n\nObsah zprávy:\n ${message}`
		};

		try {
			await transporter.sendMail(options);
			console.log("E-mail odeslán na adresu:", email);
			return { success: true };
		} catch (error) {
			console.error("Chyba při odesílání e-mailu:", error);
			return fail(500, {
				message: { success: false, display: "Chyba při odesílání e-mailu" }
			});
		}
	}
};
