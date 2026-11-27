import { sendEmail } from "$lib/email";
import { sendCustomerMail } from "$lib/server/tenantEmail";
import {
	createAccountReactivationEmailTemplate,
	createDataDeletionEmailTemplate
} from "$lib/emailTemplates/accountEmailTemplates";

interface DataDeletionEmailParams {
	email: string;
	firstName: string;
	lastName: string;
	deletionDate: string;
	scheduledDate: string;
	reactivationToken: string;
	baseUrl: string;
}

function formatCzechDate(value: string): string {
	return new Date(value).toLocaleDateString("cs-CZ", {
		weekday: "long",
		year: "numeric",
		month: "long",
		day: "numeric",
		timeZone: "Europe/Prague"
	});
}

export async function sendDataDeletionRequestEmail(params: DataDeletionEmailParams) {
	const { email, firstName, lastName, deletionDate, scheduledDate, reactivationToken, baseUrl } = params;
	const reactivationUrl = `${baseUrl}/auth/reactivate?token=${encodeURIComponent(reactivationToken)}`;
	const loginUrl = `${baseUrl}/auth/login`;

	try {
		await sendEmail({
			to: email,
			subject: "Šťastné srdce — žádost o smazání účtu",
			html: createDataDeletionEmailTemplate({
				firstName,
				lastName,
				deletionDate: formatCzechDate(deletionDate),
				scheduledDate: formatCzechDate(scheduledDate),
				reactivationUrl,
				loginUrl
			})
		});
		return { success: true };
	} catch (error) {
		console.error("Chyba při odesílání e-mailu o smazání účtu:", error);
		return { success: false, error };
	}
}

export async function sendAccountReactivationEmail(params: {
	email: string;
	firstName: string;
	lastName: string;
	baseUrl: string;
}) {
	const { email, firstName, lastName, baseUrl } = params;

	try {
		await sendCustomerMail({
			to: email,
			subject: "Šťastné srdce — účet je obnovený",
			templateKey: "reactivationTemplate",
			variables: { firstName, lastName },
			fallbackHtml: createAccountReactivationEmailTemplate({
				firstName,
				lastName,
				loginUrl: `${baseUrl}/auth/login`
			})
		});
		return { success: true };
	} catch (error) {
		console.error("Chyba při odesílání e-mailu o obnovení účtu:", error);
		return { success: false, error };
	}
}
