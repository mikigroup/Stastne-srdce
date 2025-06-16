import { json, type RequestHandler } from "@sveltejs/kit";
import {
	PRIVATE_FAKTUROID_CLIENT_ID,
	PRIVATE_FAKTUROID_CLIENT_SECRET
} from "$env/static/private";
import { getAccessToken } from "$lib/fakturoidAuth";
import { formatOrderItemName } from "$lib/utils/formatting";

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

		// Explicitní ověření a refresh Fakturoid tokenu
		console.log('Verifying and refreshing Fakturoid token...');
		const accessToken = await getAccessToken();
		if (!accessToken) {
			console.error('Failed to get valid Fakturoid access token');
			return json({ 
				error: "Fakturoid není připojen nebo token nelze obnovit. Zkuste se znovu připojit k Fakturoidu.",
				action: "reconnect_fakturoid"
			}, { status: 401 });
		}
		console.log('Fakturoid token verified successfully');

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

		// 2. Připravit data pro fakturu s upraveným názvem položek
		const invoiceData = {
			subject_id: null, // Budeme hledat nebo vytvoříme nového
			subject_custom_id: order.customer_email,
			lines: order.order_items.map((item: any) => ({
				name: formatOrderItemName(item),
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

		// 6. Aktualizovat objednávku s informacemi o faktuře
		console.log('Updating order with invoice information...');
		const { error: updateError } = await supabase
			.from('orders')
			.update({
				invoice_url: invoiceResult.html_url,
				invoice_number: invoiceResult.number,
				invoice_created_at: new Date().toISOString(),
				status: 'invoiced' // Označíme objednávku jako vyfakturovanou
			})
			.eq('id', orderId);

		if (updateError) {
			console.error('Failed to update order with invoice info:', updateError);
			// Není kritická chyba - faktura byla vytvořena úspěšně
		} else {
			console.log('Order updated successfully with invoice information');
		}

		// 7. Vrátit URL faktury a potvrzení
		return json({
			success: true,
			invoice_url: invoiceResult.html_url,
			invoice_number: invoiceResult.number,
			order_updated: !updateError,
			message: 'Faktura byla úspěšně vytvořena a objednávka aktualizována'
		});

	} catch (error: unknown) {
		console.error("Error creating invoice:", error);
		
		// Rozlišíme různé typy chyb
		const errorMessage = error instanceof Error ? error.message : String(error);
		if (errorMessage?.includes('token') || errorMessage?.includes('unauthorized')) {
			return json({
				success: false,
				error: "Problém s Fakturoid autentizací. Zkuste se znovu připojit.",
				action: "reconnect_fakturoid"
			}, { status: 401 });
		}
		
		return json(
			{
				success: false,
				error: error instanceof Error ? error.message : "Neznámá chyba při vytváření faktury"
			},
			{ status: 500 }
		);
	}
};
