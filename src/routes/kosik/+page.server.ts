import type { Actions, RequestEvent } from "./$types";
import { fail } from "@sveltejs/kit";
import { PUBLIC_TENANT } from "$env/static/public";
import { sendDeveloperAlert, sendEmail, type OrderFailurePhase } from "$lib/email";
import { createOrderConfirmationEmailTemplate } from "$lib/emailTemplates/orderConfirmationTemplate";
import { checkAndUpdateRegistrationStatus } from "$lib/services/registrationStatusService";
import {
	checkOrderVariantCapacity,
	loadInventorySettings,
	shouldEnforceSalesStockLimits
} from "$lib/services/inventorySalesLimits";
import { shippingPriceForMethod } from "$lib/utils/deliveryPricing";
import { ROUTES } from "$lib/constants/routes";

export const prerender = false;

type CartLine = { variantId: string; quantity: number; price: number };

function cartLinesFrom(cartItems: unknown): CartLine[] {
	if (!Array.isArray(cartItems)) return [];
	return cartItems.flatMap((item) => {
		if (!item || typeof item !== "object") return [];
		const variants = (item as { variants?: unknown }).variants;
		if (!Array.isArray(variants)) return [];
		return variants.map((variant) => {
			const row =
				variant && typeof variant === "object" ? (variant as Record<string, unknown>) : {};
			return {
				variantId: String(row.id ?? ""),
				quantity: Number(row.quantity) || 0,
				price: Number(row.price) || 0
			};
		});
	});
}

function errorParts(error: unknown): {
	code: string;
	message: string;
	details: string;
	hint: string;
} {
	if (error && typeof error === "object") {
		const record = error as Record<string, unknown>;
		const message =
			typeof record.message === "string"
				? record.message
				: error instanceof Error
					? error.message
					: "Neznámá chyba";
		return {
			code: typeof record.code === "string" ? record.code : "",
			message,
			details: typeof record.details === "string" ? record.details : "",
			hint: typeof record.hint === "string" ? record.hint : ""
		};
	}
	if (error instanceof Error) {
		return { code: "", message: error.message, details: "", hint: "" };
	}
	return { code: "", message: error ? String(error) : "Neznámá chyba", details: "", hint: "" };
}

export const actions: Actions = {
	sendOrder: async ({ request, url, locals: { supabase, safeGetSession, tenantId } }: RequestEvent) => {
		const { session, user } = await safeGetSession();

		if (!session || !user) {
			return {
				success: false,
				type: 'failure',
				message: "Pro vytvoření objednávky se musíte přihlásit.",
				redirectUrl: "/prihlaseni?redirect=/kosik"
			};
		}

		const email = user.email;
		if (!email) {
			return {
				success: false,
				type: 'failure',
				message: "Email uživatele není k dispozici"
			};
		}

		let reportCart: unknown[] = [];
		let reportPieces = 0;
		let reportPrice = 0;
		let reportTenant = tenantId ?? PUBLIC_TENANT;

		const reportFailure = async (phase: OrderFailurePhase, message: string, cause?: unknown) => {
			const parts = errorParts(cause);
			let developerNotified = false;
			try {
				developerNotified = await sendDeveloperAlert({
					phase,
					tenantId: reportTenant,
					userId: user.id,
					customerEmail: email,
					errorCode: parts.code,
					errorMessage: parts.message,
					errorDetails: parts.details,
					errorHint: parts.hint,
					cartLines: cartLinesFrom(reportCart),
					totalPieces: reportPieces,
					totalPrice: reportPrice
				});
			} catch (notifyError) {
				console.error("Hlášení vývojáři se nepodařilo odeslat:", notifyError);
			}
			return fail(500, {
				success: false,
				message,
				developerNotified
			});
		};

		try {
			const formData = await request.formData();
			const note = formData.get("note") as string;
			const timeSlot = formData.get("timeSlot") as string;
			const cartItemsStr = formData.get("cartItems");

			if (!cartItemsStr) {
				return {
					success: false,
					type: 'failure',
					message: "Košík je prázdný."
				};
			}

			const cartItems = JSON.parse(cartItemsStr as string);
			reportCart = cartItems;
			const totalPieces = cartItems.reduce(
				(sum: number, item: any) =>
					sum +
					item.variants.reduce(
						(variantSum: number, variant: any) =>
							variantSum + (variant.quantity || 0),
						0
					),
				0
			);

			const totalPrice = cartItems.reduce(
				(sum: number, item: any) =>
					sum +
					item.variants.reduce(
						(variantSum: number, variant: any) =>
							variantSum + (variant.price || 0) * (variant.quantity || 0),
						0
					),
				0
			);
			reportPieces = totalPieces;
			reportPrice = totalPrice;

			// Načtení nastavení dopravy pro validaci
			const { data: deliveryData } = await supabase
				.from('site_settings')
				.select('value')
				.eq('key', 'delivery')
				.eq('tenant_id', tenantId ?? PUBLIC_TENANT)
				.single();

			let deliverySettings = null;
			if (deliveryData?.value) {
				deliverySettings = typeof deliveryData.value === 'string' 
					? JSON.parse(deliveryData.value) 
					: deliveryData.value;
			}

			const { data: productsData } = await supabase
				.from('site_settings')
				.select('value')
				.eq('key', 'products')
				.eq('tenant_id', tenantId ?? PUBLIC_TENANT)
				.single();

			let productsSettings = null;
			if (productsData?.value) {
				productsSettings = typeof productsData.value === 'string'
					? JSON.parse(productsData.value)
					: productsData.value;
			}

			const definedSlots = Array.isArray(productsSettings?.timeSlots) ? productsSettings.timeSlots : [];
			if (productsSettings?.timeSlotsEnabled && definedSlots.length > 0 && !timeSlot?.trim()) {
				return {
					success: false,
					type: 'failure',
					message: 'Vyberte čas vyzvednutí objednávky.'
				};
			}

			// Validace minimální hodnoty objednávky
			if (deliverySettings?.minimumOrderValue && totalPrice < deliverySettings.minimumOrderValue) {
				return {
					success: false,
					type: 'failure',
					message: `Minimální hodnota objednávky je ${deliverySettings.minimumOrderValue} Kč. Aktuální hodnota: ${totalPrice} Kč.`
				};
			}

			// Kontrola a automatická aktualizace statusu registrace pomocí globální služby
			const registrationCheck = await checkAndUpdateRegistrationStatus(supabase, user.id, email);
			
			if (!registrationCheck.isComplete) {
				return {
					success: false,
					type: 'failure',
					message: `Pro vytvoření objednávky musíte mít vyplněné všechny povinné údaje v <a href="/profile" class="text-blue-600 underline">profilu</a>. Chybí: ${registrationCheck.validationResult.missingFields.join(', ')}.`
				};
			}

			// Get customer data for order creation
			const { data: customer, error: customerError } = await supabase
				.from("profiles")
				.select(`
					first_name, last_name, street, street_number, city, zip_code, 
					telephone, delivery_method, payment_method, company, ico, dic, 
					allergies, allergies_description
				`)
				.eq("id", user.id)
				.single();

			if (customerError || !customer) {
				console.error("Chyba při načítání dat zákazníka:", customerError);
				return reportFailure("profil", "Nepodařilo se načíst data zákazníka.", customerError);
			}

			const resolvedTenantId = tenantId ?? PUBLIC_TENANT;
			reportTenant = resolvedTenantId;

			// Limity skladu/kapacity: výchozí je sellWithoutStockLimit=true → žádná kontrola (jako dosud).
			// Enforce jen když inventory.enabled && salesLimits.sellWithoutStockLimit === false.
			const inventorySettings = await loadInventorySettings(supabase, resolvedTenantId);
			if (shouldEnforceSalesStockLimits(inventorySettings)) {
				const capacityItems = cartItems.flatMap((item: any) =>
					(item.variants ?? []).map((variant: any) => ({
						variant_id: String(variant.id ?? ""),
						quantity: Number(variant.quantity) || 0
					}))
				);
				const capacityCheck = await checkOrderVariantCapacity(
					supabase,
					resolvedTenantId,
					capacityItems,
					inventorySettings
				);
				if (capacityCheck.error) {
					console.error("Kontrola kapacity selhala:", capacityCheck.error);
					return reportFailure(
						"kapacita",
						"Nepodařilo se ověřit dostupnost porcí. Zkuste to prosím znovu, nebo kontaktujte provozovatele.",
						capacityCheck.error
					);
				}
				if (!capacityCheck.ok) {
					const detail = capacityCheck.violations
						.map(
							(v) =>
								`zbývá ${v.remaining_qty} (požadováno ${v.requested_qty})`
						)
						.join("; ");
					return {
						success: false,
						type: "failure",
						message: `Objednávka překračuje dostupnou kapacitu porcí: ${detail}.`
					};
				}
			}

			const shippingMethod = String(customer.delivery_method ?? "").trim();
			if (!shippingMethod) {
				return {
					success: false,
					type: "failure",
					message:
						'V profilu chybí způsob dodání. Doplňte ho v <a href="/profile#delivery_method" class="text-blue-600 underline">profilu</a> a objednávku odešlete znovu.'
				};
			}

			const shippingLabel = deliveryMethodLabel(shippingMethod, deliverySettings);
			const shippingPrice = shippingPriceForMethod(deliverySettings, shippingMethod, totalPrice);
			const totalPriceWithDelivery = totalPrice + shippingPrice;
			reportPrice = totalPriceWithDelivery;

			// Create order using the stored procedure.
			// Uloží se přesně kód z profilu, i když už není v aktuální nabídce.
			const { data: orderArray, error: orderError } = await supabase.rpc('create_order_with_items1', {
				p_user_id: user.id,
				p_created_at: new Date().toISOString(),
				p_date: new Date().toISOString(),
				p_customer_first_name: customer.first_name || '',
				p_customer_last_name: customer.last_name || '',
				p_customer_street: customer.street || '',
				p_customer_street_number: customer.street_number || '',
				p_customer_city: customer.city || '',
				p_customer_zip_code: customer.zip_code || '',
				p_customer_telephone: customer.telephone || '',
				p_customer_email: email,
				p_note: timeSlot ? `Čas vyzvednutí: ${timeSlot}${note ? `\nPoznámka: ${note}` : ''}` : note,
				p_total_pieces: totalPieces,
				p_total_price: totalPriceWithDelivery,
				p_currency: "CZK",
				p_pay_state: false,
				p_shipping_method: shippingMethod,
				p_tenant_id: resolvedTenantId,
				p_order_items: cartItems.flatMap((item: any) =>
					item.variants.map((variant: any) => ({
						variant_id: variant.id,
						price: variant.price,
						quantity: variant.quantity
					}))
				)
			});

			if (orderError) {
				console.error("Chyba při vytváření objednávky:", orderError);
				return reportFailure("rpc", "Chyba při vytváření objednávky.", orderError);
			}

			if (!orderArray || !Array.isArray(orderArray) || orderArray.length === 0) {
				console.error("Objednávka nebyla vytvořena - žádná data nebyla vrácena");
				return reportFailure(
					"prazdna_odpoved",
					"Objednávku se nepodařilo vytvořit - zkuste to prosím znovu"
				);
			}

			const order = orderArray[0]; // Bereme první (a jediný) prvek pole

			if (order.id && shippingPrice > 0) {
				const { error: shippingError } = await supabase.rpc('snapshot_order_shipping_price', {
					p_order_id: order.id,
					p_shipping_price: shippingPrice
				});
				if (shippingError) {
					console.error("Snímek ceny dopravy se nepodařilo uložit:", shippingError);
				}
			}

			try {
				await sendOrderConfirmationEmail(
					email,
					order.order_number?.toString() || order.id || "unknown",
					cartItems,
					totalPriceWithDelivery,
					totalPieces,
					note,
					shippingLabel,
					`${url.origin}${ROUTES.MAIN.PROFILE}`
				);
			} catch (emailError) {
				console.error("Chyba při odesílání potvrzovacího emailu:", emailError);
			}

			// Get the order details
			const orderId = order.order_number || order.id;

			if (!orderId) {
				console.error("Missing order ID:", orderArray);
				return reportFailure(
					"chybi_cislo",
					"Chyba při vytváření objednávky - chybí číslo objednávky."
				);
			}

			// Return a properly structured response with the actual order number
			return {
				success: true,
				type: 'success',
				message: "Objednávka byla úspěšně vytvořena.",
				orderId: orderId,
				redirectUrl: `/thankyou?order=${orderId}`
			};
		} catch (error) {
			console.error("Chyba při zpracování objednávky:", error);
			return reportFailure(
				"vyjimka",
				"Při zpracování objednávky došlo k chybě.",
				error
			);
		}
	}
};

function deliveryMethodLabel(
	code: string,
	settings: { shippingMethods?: Array<{ code?: string; name?: string }> } | null
): string {
	const methods = Array.isArray(settings?.shippingMethods) ? settings.shippingMethods : [];
	const match = methods.find((method) => method?.code === code || method?.name === code);
	return match?.name || code;
}

async function sendOrderConfirmationEmail(
	email: string,
	orderId: string,
	items: Parameters<typeof createOrderConfirmationEmailTemplate>[0]["items"],
	totalPrice: number,
	totalPieces: number,
	note: string | null,
	shippingLabel: string,
	orderUrl: string
) {
	await sendEmail({
		to: email,
		subject: `Šťastné srdce — objednávka ${orderId}`,
		html: createOrderConfirmationEmailTemplate({
			orderId,
			items,
			totalPrice,
			totalPieces,
			note,
			shippingLabel,
			orderUrl
		})
	});
}
