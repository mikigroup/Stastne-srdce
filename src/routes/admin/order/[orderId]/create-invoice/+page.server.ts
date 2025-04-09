/*
import { error, fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import {
	createInvoiceFromOrder,
	sendInvoiceEmail,
	markInvoiceAsPaid
} from "$lib/services/fakturoidService";
import type { Order } from "$lib/types/order";
import type { Profile } from "$lib/types/profile";

export const load: PageServerLoad = async ({
	params,
	locals: { supabase, session }
}) => {
	// Kontrola přihlášení
	if (!session) {
		throw redirect(303, "/admin/signin");
	}

	const { orderId } = params;

	try {
		// Načtení objednávky včetně položek a zákazníka
		const { data: order, error: orderError } = await supabase
			.from("orders")
			.select(
				`
        *,
        order_items(
          *,
          variant:menu_variants(
            id,
            variant_number,
            description,
            price
          )
        )
      `
			)
			.eq("id", orderId)
			.single();

		if (orderError) {
			console.error("Chyba při načítání objednávky:", orderError);
			throw error(500, "Chyba při načítání objednávky");
		}

		if (!order) {
			throw error(404, "Objednávka nenalezena");
		}

		// Načtení profilu zákazníka
		const { data: profile, error: profileError } = await supabase
			.from("profiles")
			.select(
				`
        id,
        first_name,
        last_name,
        email,
        telephone,
        street,
        street_number,
        city,
        zip_code,
        ico,
        dic,
        company
      `
			)
			.eq("id", order.user_id)
			.single();

		if (profileError) {
			console.error("Chyba při načítání profilu zákazníka:", profileError);
			throw error(500, "Chyba při načítání údajů zákazníka");
		}

		if (!profile) {
			throw error(404, "Profil zákazníka nenalezen");
		}

		// Kontrola, zda již faktura byla vytvořena (podle meta údajů v objednávce)
		const hasInvoice = order.meta?.fakturoid_invoice_id;

		return {
			order,
			profile,
			hasInvoice: hasInvoice || false,
			invoiceId: order.meta?.fakturoid_invoice_id || null,
			invoiceNumber: order.meta?.fakturoid_invoice_number || null
		};
	} catch (err) {
		console.error("Chyba při načítání dat:", err);
		throw error(500, "Nastala chyba při načítání potřebných dat");
	}
};

export const actions: Actions = {
	createInvoice: async ({ request, params, locals: { supabase, session } }) => {
		// Kontrola přihlášení
		if (!session) {
			throw error(401, "Pro vytvoření faktury musíte být přihlášeni");
		}

		const { orderId } = params;
		const formData = await request.formData();
		const sendEmail = formData.get("sendEmail") === "true";
		const markPaid = formData.get("markPaid") === "true";

		try {
			// 1. Načtení objednávky
			const { data: order, error: orderError } = await supabase
				.from("orders")
				.select(
					`
          *,
          order_items(
            *,
            variant:menu_variants(
              id,
              variant_number, 
              description,
              price
            )
          )
        `
				)
				.eq("id", orderId)
				.single();

			if (orderError || !order) {
				return fail(404, { success: false, message: "Objednávka nenalezena" });
			}

			// 2. Kontrola, zda faktura už nebyla vytvořena
			if (order.meta?.fakturoid_invoice_id) {
				return fail(400, {
					success: false,
					message: "Pro tuto objednávku již byla faktura vytvořena",
					invoiceId: order.meta.fakturoid_invoice_id,
					invoiceNumber: order.meta.fakturoid_invoice_number
				});
			}

			// 3. Načtení profilu zákazníka
			const { data: profile, error: profileError } = await supabase
				.from("profiles")
				.select("*")
				.eq("id", order.user_id)
				.single();

			if (profileError || !profile) {
				return fail(404, {
					success: false,
					message: "Profil zákazníka nenalezen"
				});
			}

			// 4. Vytvoření faktury pomocí Fakturoid API
			const invoice = await createInvoiceFromOrder(
				order as Order,
				profile as Profile
			);

			// 5. Uložení ID faktury do objednávky
			const { error: updateError } = await supabase
				.from("orders")
				.update({
					meta: {
						...order.meta,
						fakturoid_invoice_id: invoice.id,
						fakturoid_invoice_number: invoice.number,
						fakturoid_created_at: new Date().toISOString()
					}
				})
				.eq("id", orderId);

			if (updateError) {
				console.error("Chyba při aktualizaci objednávky:", updateError);
				return fail(500, {
					success: false,
					message:
						"Faktura byla vytvořena, ale nepodařilo se aktualizovat objednávku"
				});
			}

			// 6. Odeslání faktury e-mailem, pokud je požadováno
			if (sendEmail && invoice.id) {
				try {
					await sendInvoiceEmail(invoice.id);
				} catch (emailError) {
					console.error("Chyba při odesílání faktury e-mailem:", emailError);
					// Nezastavujeme proces, jen logujeme chybu
				}
			}

			// 7. Označení faktury jako uhrazené, pokud je požadováno
			if (markPaid && invoice.id) {
				try {
					await markInvoiceAsPaid(invoice.id);
				} catch (paidError) {
					console.error("Chyba při označení faktury jako uhrazené:", paidError);
					// Nezastavujeme proces, jen logujeme chybu
				}
			}

			// 8. Aktualizace stavu objednávky na 'Vyfakturovaná', pokud je požadováno
			if (markPaid) {
				const { error: stateError } = await supabase
					.from("orders")
					.update({
						state: "Vyfakturovaná",
						pay_state: true
					})
					.eq("id", orderId);

				if (stateError) {
					console.error("Chyba při aktualizaci stavu objednávky:", stateError);
				}
			}

			// 9. Vracíme úspěšný výsledek
			return {
				success: true,
				message: "Faktura byla úspěšně vytvořena",
				invoiceId: invoice.id,
				invoiceNumber: invoice.number
			};
		} catch (err) {
			console.error("Chyba při vytváření faktury:", err);
			return fail(500, {
				success: false,
				message: `Chyba při vytváření faktury: ${err instanceof Error ? err.message : "Neznámá chyba"}`
			});
		}
	}
};
*/
