import { renderCustomerEmail } from "$lib/emailTemplates/layout";

export function createPasswordResetEmailTemplate(resetLink: string): string {
	return renderCustomerEmail({
		title: "Obnovení hesla",
		introHtml: `Dobrý den,<br><br>
			obdrželi jsme žádost o obnovení hesla k účtu na Šťastné srdce. Pokud jste o změnu žádali, pokračujte tlačítkem níže. Odkaz platí 1 hodinu.<br><br>
			Pokud jste o změnu nežádali, e-mail ignorujte. Stávající heslo zůstane beze změny.`,
		buttonLabel: "Obnovit heslo",
		buttonHref: resetLink
	});
}
