import nodemailer from "nodemailer";
import { PRIVATE_seznam_key } from "$env/static/private";

const DEVELOPER_ALERT_EMAIL = "mikigroup@gmail.com";

const transporter = nodemailer.createTransport({
	host: "smtp.seznam.cz",
	port: 465,
	secure: true,
	auth: {
		user: "info@stastnesrdce.cz",
		pass: PRIVATE_seznam_key
	}
});

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
	const mailOptions = {
		from: '"Šťastné srdce" <info@stastnesrdce.cz>',
		to,
		subject,
		html
	};

	try {
		await transporter.sendMail(mailOptions);
	} catch (error) {
		console.error("Chyba při odesílání e-mailu:", error);
		throw error;
	}
}

export type OrderFailurePhase =
	| "rpc"
	| "prazdna_odpoved"
	| "chybi_cislo"
	| "vyjimka"
	| "profil"
	| "kapacita";

export type DeveloperOrderAlert = {
	phase: OrderFailurePhase;
	tenantId?: string | null;
	userId?: string | null;
	customerEmail?: string | null;
	errorCode?: string | null;
	errorMessage?: string | null;
	errorDetails?: string | null;
	errorHint?: string | null;
	cartLines: Array<{ variantId: string; quantity: number; price: number }>;
	totalPieces?: number | null;
	totalPrice?: number | null;
};

function escapeHtml(value: string): string {
	return value
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;");
}

function textOrDash(value: string | number | null | undefined): string {
	if (value === null || value === undefined || value === "") return "—";
	return String(value);
}

/**
 * Pošle vývojáři technické hlášení, když se objednávku nepodaří zapsat.
 * Vrací true jen když e-mail opravdu odešel. Výpadek SMTP nevyhodí výjimku.
 */
export async function sendDeveloperAlert(alert: DeveloperOrderAlert): Promise<boolean> {
	const to = DEVELOPER_ALERT_EMAIL;

	const when = new Date().toLocaleString("cs-CZ", { timeZone: "Europe/Prague" });
	const cartHtml =
		alert.cartLines.length > 0
			? `<ul>${alert.cartLines
					.map(
						(line) =>
							`<li>${escapeHtml(line.variantId)} — ${line.quantity} ks × ${line.price} Kč</li>`
					)
					.join("")}</ul>`
			: "<p>—</p>";

	const html = `<!DOCTYPE html>
<html lang="cs">
<head><meta charset="UTF-8"></head>
<body>
	<h1>Objednávku se nepodařilo vytvořit</h1>
	<table>
		<tr><th align="left">Čas</th><td>${escapeHtml(when)}</td></tr>
		<tr><th align="left">Fáze</th><td>${escapeHtml(alert.phase)}</td></tr>
		<tr><th align="left">Tenant</th><td>${escapeHtml(textOrDash(alert.tenantId))}</td></tr>
		<tr><th align="left">Uživatel</th><td>${escapeHtml(textOrDash(alert.userId))}</td></tr>
		<tr><th align="left">E-mail zákazníka</th><td>${escapeHtml(textOrDash(alert.customerEmail))}</td></tr>
		<tr><th align="left">Kód chyby</th><td>${escapeHtml(textOrDash(alert.errorCode))}</td></tr>
		<tr><th align="left">Text chyby</th><td>${escapeHtml(textOrDash(alert.errorMessage))}</td></tr>
		<tr><th align="left">Detail</th><td>${escapeHtml(textOrDash(alert.errorDetails))}</td></tr>
		<tr><th align="left">Nápověda</th><td>${escapeHtml(textOrDash(alert.errorHint))}</td></tr>
		<tr><th align="left">Počet kusů</th><td>${escapeHtml(textOrDash(alert.totalPieces))}</td></tr>
		<tr><th align="left">Cena</th><td>${escapeHtml(textOrDash(alert.totalPrice))}</td></tr>
	</table>
	<h2>Košík</h2>
	${cartHtml}
</body>
</html>`;

	try {
		await transporter.sendMail({
			from: '"Šťastné srdce" <info@stastnesrdce.cz>',
			to,
			subject: "Šťastné srdce — objednávku se nepodařilo vytvořit",
			html
		});
		return true;
	} catch (error) {
		console.error("Hlášení vývojáři se nepodařilo odeslat:", error);
		return false;
	}
}
