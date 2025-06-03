import { json, type RequestHandler } from "@sveltejs/kit";
import {
	PRIVATE_FAKTUROID_CLIENT_ID,
	PRIVATE_FAKTUROID_CLIENT_SECRET
} from "$env/static/private";
import { getAccessToken } from "$lib/fakturoidAuth";

// Pomocná funkce pro formátování názvu položky
function formatItemName(item: any): string {
	// Zkusíme získat datum z různých možných míst ve struktuře
	let menuDate = null;
	
	// Priorita: menu_id > menu_version_id > jiné možnosti
	if (item.variant_id?.menu_id?.date) {
		menuDate = item.variant_id.menu_id.date;
	} else if (item.variant_id?.menu_version_id?.date) {
		menuDate = item.variant_id.menu_version_id.date;
	} else if (item.menuVersionData?.date) {
		menuDate = item.menuVersionData.date;
	}
	
	// Získání čísla varianty
	const variantNumber = item.variant_id?.variant_number || item.variant?.variant_number;
	
	// Formátování data do českého formátu
	let formattedDate = '';
	if (menuDate) {
		try {
			const date = new Date(menuDate);
			if (!isNaN(date.getTime())) {
				formattedDate = date.toLocaleDateString('cs-CZ', {
					day: 'numeric',
					month: 'numeric', 
					year: 'numeric'
				});
			}
		} catch (e) {
			console.warn('Chyba při formátování data:', e);
		}
	}
	
	// Sestavení názvu - pouze datum, "Menu" a číslo
	let itemName = '';
	
	// Přidáme datum pokud máme
	if (formattedDate) {
		itemName += `${formattedDate} `;
	}
	
	// Přidáme "Menu" a číslo
	if (variantNumber) {
		itemName += `Menu ${variantNumber}`;
	} else {
		itemName += 'Menu';
	}
	
	// Fallback pokud nemáme žádné údaje
	return itemName || 'Položka objednávky';
}

export const POST: RequestHandler = async ({
	request,
	locals: { supabase }
}) => {
	try {
		const { orderId, userId } = await request.json();

		// Ověření uživatele
		const {
			data: { user },
			error: authError
		} = await supabase.auth.getUser();
		if (authError || !user || user.id !== userId) {
			return json({ error: "Unauthorized" }, { status: 401 });
		}

		// 1. Načíst objednávku z DB
		const { data: order, error } = await supabase
			.from("orders")
			.select(
				`
        *,
        order_items(
          *,
          variant_id(
            *,
            menu_id(*)
          )
        )
      `
			)
			.eq("id", orderId)
			.single();

		if (error) throw error;
		if (!order) throw new Error("Order not found");

		// Získáme access token pro Fakturoid API
		const accessToken = await getAccessToken();

		// 2. Připravit data pro fakturu s upraveným názvem položek
		const invoiceData = {
			subject_id: null, // Budeme hledat nebo vytvoříme nového
			subject_custom_id: order.customer_email,
			lines: order.order_items.map((item: any) => ({
				name: formatItemName(item),
				quantity: item.quantity,
				unit_price: item.price,
				vat_rate: 21 // nebo podle nastavení
			})),
			due: 14, // Splatnost za 14 dní
			note: `Objednávka č. ${order.order_number}`,
			custom_id: order.id
		};

		// 3. Nejprve zkontrolovat/založit kontakt ve Fakturoidu
		const contactResponse = await fetch(
			"https://app.fakturoid.cz/api/v3/subjects.json",
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${accessToken}`,
					"User-Agent": "YourApp (your@email.com)"
				},
				body: JSON.stringify({
					name: `${order.customer_first_name} ${order.customer_last_name}`,
					street: `${order.customer_street} ${order.customer_street_number}`,
					city: order.customer_city,
					zip: order.customer_zip_code,
					email: order.customer_email,
					phone: order.customer_telephone,
					custom_id: order.customer_email
				})
			}
		);

		const contactData = await contactResponse.json();
		if (!contactResponse.ok) throw contactData;

		// 4. Nastavit ID kontaktu do faktury
		invoiceData.subject_id = contactData.id;

		// 5. Vytvořit fakturu
		const invoiceResponse = await fetch(
			"https://app.fakturoid.cz/api/v3/invoices.json",
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${accessToken}`,
					"User-Agent": "YourApp (your@email.com)"
				},
				body: JSON.stringify(invoiceData)
			}
		);

		const invoiceResult = await invoiceResponse.json();
		if (!invoiceResponse.ok) throw invoiceResult;

		// 6. Vrátit URL faktury
		return json({
			success: true,
			invoice_url: invoiceResult.html_url,
			invoice_number: invoiceResult.number
		});
	} catch (error) {
		console.error("Error creating invoice:", error);
		return json(
			{
				success: false,
				error: error instanceof Error ? error.message : "Unknown error"
			},
			{ status: 500 }
		);
	}
};
