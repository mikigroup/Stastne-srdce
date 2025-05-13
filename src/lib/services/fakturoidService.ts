import { getAccessToken } from "../fakturoidAuth";
import { FAKTUROID_ACCOUNT_SLUG } from "$env/static/private";

export async function getInvoices(page = 1) {
	const token = await getAccessToken();

	const response = await fetch(
		`https://app.fakturoid.cz/api/v3/accounts/${FAKTUROID_ACCOUNT_SLUG}/invoices.json?page=${page}`,
		{
			headers: {
				Authorization: `Bearer ${token}`,
				"User-Agent": "Your App (your@email.com)"
			}
		}
	);

	return {
		data: await response.json(),
		headers: Object.fromEntries(response.headers.entries())
	};
}
