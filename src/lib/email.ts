import nodemailer from "nodemailer";
import { PRIVATE_seznam_key } from "$env/static/private";

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

// Funkce pro odesílání e-mailů
export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
	const mailOptions = {
		from: '"Šťastné srdce" <info@stastnesrdce.cz>',
		to,
		subject,
		html
	};

	try {
		await transporter.sendMail(mailOptions);
		console.log("E-mail byl úspěšně odeslán na:", to);
	} catch (error) {
		console.error("Chyba při odesílání e-mailu:", error);
		throw error;
	}
} 