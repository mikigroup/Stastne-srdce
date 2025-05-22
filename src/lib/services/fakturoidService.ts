import { getAccessToken } from "../fakturoidAuth";
import { PRIVATE_FAKTUROID_ACCOUNT_SLUG } from "$env/static/private";
import type { Order } from "$lib/types/order";
import type { Profile } from "$lib/types/profile";
import type { FakturoidContact, FakturoidInvoice, FakturoidInvoiceCreate, FakturoidLine } from "$lib/types/fakturoid";

const API_BASE = "https://app.fakturoid.cz/api/v3";

// Pomocná funkce pro vytvoření hlaviček
async function getHeaders() {
	const token = await getAccessToken();
	return {
		"Authorization": `Bearer ${token}`,
		"Content-Type": "application/json",
		"User-Agent": "StastneSrdce (info@stastnesrdce.cz)"
	};
}

export async function getInvoices(page = 1) {
	const headers = await getHeaders();
	
	const response = await fetch(
		`${API_BASE}/accounts/${PRIVATE_FAKTUROID_ACCOUNT_SLUG}/invoices.json?page=${page}`,
		{ headers }
	);

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
	}

	return {
		data: await response.json(),
		headers: Object.fromEntries(response.headers.entries())
	};
}

export async function createInvoiceFromOrder(order: Order, profile: Profile): Promise<FakturoidInvoice> {
	try {
		const headers = await getHeaders();

		// 1. Vytvoření nebo aktualizace kontaktu
		const contactResponse = await fetch(
			`${API_BASE}/accounts/${PRIVATE_FAKTUROID_ACCOUNT_SLUG}/subjects.json`,
			{
				method: 'POST',
				headers,
				body: JSON.stringify({
					name: `${profile.first_name} ${profile.last_name}`,
					street: `${profile.street} ${profile.street_number}`,
					city: profile.city,
					zip: profile.zip_code,
					email: profile.email,
					phone: profile.telephone,
					registration_no: profile.ico,
					vat_no: profile.dic
				})
			}
		);

		if (!contactResponse.ok) {
			const errorText = await contactResponse.text();
			throw new Error(`Chyba při vytváření kontaktu: ${contactResponse.status} - ${errorText}`);
		}

		const contact = await contactResponse.json();

		// 2. Příprava řádků faktury
		const lines = order.order_items.map(item => ({
			name: item.variant_id.description || 'Položka objednávky',
			quantity: item.quantity,
			unit_price: item.price,
			vat_rate: 0, // Nastaveno na 0, protože nejsme plátci DPH
			unit_name: 'ks'
		}));

		// 3. Vytvoření faktury
		const invoiceResponse = await fetch(
			`${API_BASE}/accounts/${PRIVATE_FAKTUROID_ACCOUNT_SLUG}/invoices.json`,
			{
				method: 'POST',
				headers,
				body: JSON.stringify({
					subject_id: contact.id,
					lines,
					due: 14, // 14 dní splatnost
					issued_on: new Date().toISOString().split('T')[0],
					note: `Objednávka č. ${order.order_number}`,
					currency: 'CZK',
					payment_method: 'bank',
					language: 'cz',
					vat_price_mode: 'without_vat'
				})
			}
		);

		if (!invoiceResponse.ok) {
			const errorText = await invoiceResponse.text();
			throw new Error(`Chyba při vytváření faktury: ${invoiceResponse.status} - ${errorText}`);
		}

		return await invoiceResponse.json();
	} catch (error) {
		console.error('Chyba při vytváření faktury:', error);
		throw error;
	}
}

export async function sendInvoiceEmail(invoiceId: string): Promise<void> {
	const headers = await getHeaders();

	const response = await fetch(
		`${API_BASE}/accounts/${PRIVATE_FAKTUROID_ACCOUNT_SLUG}/invoices/${invoiceId}/message.json`,
		{
			method: 'POST',
			headers
		}
	);

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(`Chyba při odesílání faktury: ${response.status} - ${errorText}`);
	}
}

export async function markInvoiceAsPaid(invoiceId: string): Promise<void> {
	const headers = await getHeaders();

	const response = await fetch(
		`${API_BASE}/accounts/${PRIVATE_FAKTUROID_ACCOUNT_SLUG}/invoices/${invoiceId}/fire.json`,
		{
			method: 'POST',
			headers,
			body: JSON.stringify({
				event: 'pay',
				paid_on: new Date().toISOString().split('T')[0]
			})
		}
	);

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(`Chyba při označování faktury jako zaplacené: ${response.status} - ${errorText}`);
	}
}
