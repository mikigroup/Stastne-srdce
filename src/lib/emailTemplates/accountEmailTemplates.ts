import { emailNoticeRow, emailTextRow, escapeEmailHtml, renderCustomerEmail } from "$lib/emailTemplates/layout";

function greeting(firstName: string, lastName: string): string {
	const name = [firstName, lastName]
		.map((part) => part.trim())
		.filter(Boolean)
		.join(" ");
	if (!name) return "Dobrý den,";
	return `Dobrý den, ${escapeEmailHtml(name)},`;
}

export function createDataDeletionEmailTemplate(params: {
	firstName: string;
	lastName: string;
	deletionDate: string;
	scheduledDate: string;
	reactivationUrl: string;
	loginUrl: string;
}): string {
	const loginUrl = escapeEmailHtml(params.loginUrl);
	return renderCustomerEmail({
		title: "Žádost o smazání účtu",
		introHtml: `${greeting(params.firstName, params.lastName)}<br><br>obdrželi jsme žádost o smazání osobních údajů.`,
		beforeButtonHtml: `${emailNoticeRow(`<strong>Žádost podána:</strong> ${escapeEmailHtml(params.deletionDate)}<br><strong>Plánované smazání:</strong> ${escapeEmailHtml(params.scheduledDate)}`)}
			${emailTextRow("Do plánovaného data můžete žádost zrušit. Účet je do té doby pozastavený. Faktury zůstanou uložené 10 let, protože to ukládá zákon.")}`,
		buttonLabel: "Zrušit žádost",
		buttonHref: params.reactivationUrl,
		afterButtonHtml: emailTextRow(
			`Žádost zruší také přihlášení:<br><a href="${loginUrl}" style="color:#166534;word-break:break-all;">${loginUrl}</a>`,
			"12px 32px 0"
		)
	});
}

export function createAccountReactivationEmailTemplate(params: {
	firstName: string;
	lastName: string;
	loginUrl: string;
}): string {
	return renderCustomerEmail({
		title: "Účet je obnovený",
		introHtml: `${greeting(params.firstName, params.lastName)}<br><br>žádost o smazání osobních údajů je zrušená. Účet je znovu aktivní a můžete se přihlásit.`,
		buttonLabel: "Přihlásit se",
		buttonHref: params.loginUrl
	});
}
