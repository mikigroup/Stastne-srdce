import { json, type RequestHandler } from "@sveltejs/kit";
import {
	PRIVATE_FAKTUROID_CLIENT_ID,
	PRIVATE_FAKTUROID_CLIENT_SECRET
} from "$env/static/private";
import { getAccessToken } from "$lib/fakturoidAuth";
import { formatOrderItemName } from "$lib/utils/formatting";
import { fakturoidCircuitBreaker } from "$lib/fakturoidCircuitBreaker";

/**
 * Resilientní wrapper pro Fakturoid API volání
 */
async function callFakturoidAPI(
	url: string, 
	options: RequestInit, 
	operationName: string,
	retryConfig = { maxAttempts: 3, baseDelayMs: 1000, maxDelayMs: 10000, backoffMultiplier: 2 }
) {
	const operation = async () => {
		const response = await fetch(url, {
			...options,
			headers: {
				...options.headers,
				'User-Agent': 'StastneSrdce-API (support@stastne-srdce.cz)'
			}
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
			const error = new Error(`Fakturoid API ${operationName} failed: ${response.status} ${response.statusText}`);
			(error as any).status = response.status;
			(error as any).response = { status: response.status };
			(error as any).data = errorData;
			throw error;
		}

		return response.json();
	};

	// Retry logika s exponential backoff
	const retryOperation = async () => {
		let lastError: any;
		for (let attempt = 1; attempt <= retryConfig.maxAttempts; attempt++) {
			try {
				console.log(`🔄 Attempt ${attempt}/${retryConfig.maxAttempts}: ${operationName}`);
				return await operation();
			} catch (error: any) {
				lastError = error;
				console.error(`❌ Attempt ${attempt} failed for ${operationName}:`, error?.message || error);

				// Non-retryable errors (auth issues, client errors)
				if (error?.status && [400, 401, 403, 404, 422].includes(error.status)) {
					console.log(`🚫 Non-retryable error ${error.status}, not retrying`);
					break;
				}

				if (attempt === retryConfig.maxAttempts) break;

				const delay = Math.min(
					retryConfig.baseDelayMs * Math.pow(retryConfig.backoffMultiplier, attempt - 1) * (0.5 + Math.random() * 0.5),
					retryConfig.maxDelayMs
				);
				console.log(`⏳ Waiting ${delay}ms before next attempt...`);
				await new Promise(resolve => setTimeout(resolve, delay));
			}
		}
		throw lastError;
	};

	// Obalení circuit breaker
	return await fakturoidCircuitBreaker.execute(retryOperation, operationName);
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
		console.log('Creating/finding contact in Fakturoid...');
		const contactData = await callFakturoidAPI(
			"https://app.fakturoid.cz/api/v3/subjects.json",
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${accessToken}`
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
			},
			`create-contact-order-${orderId}`
		);

		// 4. Nastavit ID kontaktu do faktury
		invoiceData.subject_id = contactData.id;

		// 5. Vytvořit fakturu
		console.log('Creating invoice in Fakturoid...');
		const invoiceResult = await callFakturoidAPI(
			"https://app.fakturoid.cz/api/v3/invoices.json",
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${accessToken}`
				},
				body: JSON.stringify(invoiceData)
			},
			`create-invoice-order-${orderId}`
		);

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
		const errorData = (error as any)?.data;
		
		// Circuit breaker je otevřený
		if (errorMessage?.includes('Circuit breaker is open')) {
			return json({
				success: false,
				error: "Fakturoid je momentálně nedostupný. Zkuste to prosím za chvíli.",
				action: "retry_later",
				details: "Systém dočasně omezil volání kvůli problémům s Fakturoid API"
			}, { status: 503 });
		}
		
		// Autentizační problémy
		if (errorMessage?.includes('token') || errorMessage?.includes('unauthorized') || 
		    errorMessage?.includes('401') || (error as any)?.status === 401) {
			return json({
				success: false,
				error: "Problém s Fakturoid autentizací. Zkuste se znovu připojit.",
				action: "reconnect_fakturoid"
			}, { status: 401 });
		}
		
		// Fakturoid API specific errors
		if (errorData && typeof errorData === 'object') {
			let specificError = "Chyba při komunikaci s Fakturoiem";
			if (errorData.errors) {
				// Fakturoid vrací chyby v errors objektu
				const errors = Array.isArray(errorData.errors) ? errorData.errors : [errorData.errors];
				specificError = `Fakturoid: ${errors.join(', ')}`;
			} else if (errorData.message) {
				specificError = `Fakturoid: ${errorData.message}`;
			}
			
			return json({
				success: false,
				error: specificError,
				action: "check_data",
				details: errorData
			}, { status: 400 });
		}
		
		// Rate limiting (429)
		if ((error as any)?.status === 429) {
			return json({
				success: false,
				error: "Příliš mnoho požadavků na Fakturoid. Zkuste to za chvíli.",
				action: "retry_later"
			}, { status: 429 });
		}
		
		// Obecná chyba
		return json(
			{
				success: false,
				error: error instanceof Error ? error.message : "Neznámá chyba při vytváření faktury",
				action: "contact_support"
			},
			{ status: 500 }
		);
	}
};
