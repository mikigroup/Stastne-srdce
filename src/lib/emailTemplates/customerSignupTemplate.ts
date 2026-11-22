import { renderCustomerEmail } from "$lib/emailTemplates/layout";

export function createCustomerSignupEmailTemplate(confirmationLink: string): string {
	return renderCustomerEmail({
		title: "Potvrďte registraci",
		introHtml: `Dobrý den,<br><br>
			děkujeme za registraci na Šťastné srdce. Pro dokončení potvrďte e-mail tlačítkem níže. Odkaz platí 1 hodinu.<br><br>
			Pokud jste o registraci nežádali, tento e-mail ignorujte.`,
		buttonLabel: "Potvrdit registraci",
		buttonHref: confirmationLink
	});
}
