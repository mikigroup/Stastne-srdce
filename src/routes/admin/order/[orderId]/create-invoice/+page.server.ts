import { error, fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import {
	createInvoiceFromOrder,
	sendInvoiceEmail,
	markInvoiceAsPaid
} from "$lib/services/fakturoidService";
import type { Order } from "$lib/types/order";
import type { Profile } from "$lib/types/profile";
import { getSetting } from "$lib/services/siteSettingsService";
import type { IntegrationsSettings } from "$lib/types/siteSettings";

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
          variant_id:menu_variants(
            id,
            variant_number,
            description,
            price,
            menu_id:menus(id, date),
            menu_version_id:menu_versions(id, date)
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

		// Načtení Fakturoid nastavení
		const integrations = await getSetting(supabase, 'integrations') as IntegrationsSettings;
		const activeAccount = integrations?.fakturoid?.accounts?.find(acc => acc.isActive) || null;
		const activeAccountId = activeAccount?.subdomain || null;

		// Kontrola, zda již faktura byla vytvořena PRO SOUČASNÝ ÚČET
		let hasInvoice = false;
		let isFromCurrentAccount = false;
		
		if (order.fakturoid_data?.invoice_id) {
			// Pokud faktura má account_id, porovnej s aktuálním
			if (order.fakturoid_data.account_id) {
				isFromCurrentAccount = order.fakturoid_data.account_id === activeAccountId;
				hasInvoice = isFromCurrentAccount;
			} else {
				// Stará faktura bez account_id - považuj za z jiného účtu
				hasInvoice = true;
			}
		}

		return {
			order,
			profile,
			hasInvoice,
			invoiceId: order.fakturoid_data?.invoice_id || null,
			invoiceNumber: order.fakturoid_data?.invoice_number || null,
			isFromCurrentAccount,
			activeAccount,
			activeAccountId
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
            variant_id:menu_variants(
              id,
              variant_number, 
              description,
              price,
              menu_id:menus(id, date),
              menu_version_id:menu_versions(id, date)
            )
          )
        `
				)
				.eq("id", orderId)
				.single();

			if (orderError || !order) {
				return fail(404, { success: false, message: "Objednávka nenalezena" });
			}

			// 2. Načtení integračních nastavení pro Fakturoid
			const integrations = await getSetting(supabase, 'integrations') as IntegrationsSettings;
			const activeAccount = integrations?.fakturoid?.accounts?.find(acc => acc.isActive) || null;
			const activeAccountId = activeAccount?.subdomain || null;

			if (!activeAccount || !activeAccountId) {
				return fail(400, {
					success: false,
					message: "Žádný aktivní Fakturoid účet není nastaven"
				});
			}

			// Získáme Fakturoid konfiguraci pro předání ostatním funkcím
			const { getFakturoidConfigFromSettings } = await import('$lib/services/fakturoidService');
			const fakturoidConfig = getFakturoidConfigFromSettings({ integrations });
			
			if (!fakturoidConfig) {
				return fail(400, {
					success: false,
					message: "Nepodařilo se načíst Fakturoid konfiguraci"
				});
			}

			// 3. Kontrola, zda faktura už nebyla vytvořena PRO SOUČASNÝ ÚČET
			if (order.fakturoid_data?.invoice_id) {
				let isFromCurrentAccount = false;
				
				if (order.fakturoid_data.account_id) {
					isFromCurrentAccount = order.fakturoid_data.account_id === activeAccountId;
				} else {
					// Stará faktura bez account_id - považuj za z jiného účtu
					isFromCurrentAccount = false;
				}

				if (isFromCurrentAccount) {
					return fail(400, {
						success: false,
						message: `Pro tuto objednávku již byla faktura vytvořena účtem ${activeAccount.name}`,
						invoiceId: order.fakturoid_data.invoice_id,
						invoiceNumber: order.fakturoid_data.invoice_number
					});
				}
				// Pokud je z jiného účtu, můžeme pokračovat a přepsat fakturu
			}

			// 4. Načtení profilu zákazníka
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

			// 5. Vytvoření faktury
			const invoice = await createInvoiceFromOrder(order, profile, integrations, supabase);

			if (!invoice?.id) {
				return fail(500, {
					success: false,
					message: "Chyba při vytváření faktury"
				});
			}

			// 6. Aktualizace objednávky s ID faktury
			const { error: updateError } = await supabase
				.from("orders")
				.update({
					fakturoid_data: {
						invoice_id: invoice.id,
						invoice_number: invoice.number,
						invoice_url: invoice.html_url,
						account_id: activeAccountId,
						created_at: new Date().toISOString()
					}
				})
				.eq("id", orderId);

			if (updateError) {
				console.error("Chyba při aktualizaci objednávky:", updateError);
				return fail(500, {
					success: false,
					message: "Faktura byla vytvořena, ale nepodařilo se aktualizovat objednávku"
				});
			}

			// 7. Odeslání emailu (pokud požadováno)
			if (sendEmail) {
				try {
					await sendInvoiceEmail(invoice.id, supabase, fakturoidConfig);
				} catch (error) {
					console.error("Chyba při odesílání emailu:", error);
					// Pokračujeme dál, i když se email nepodařilo odeslat
				}
			}

			// 8. Označení jako zaplaceno (pokud požadováno)
			if (markPaid) {
				try {
					await markInvoiceAsPaid(invoice.id, supabase, fakturoidConfig);
				} catch (error) {
					console.error("Chyba při označování faktury jako zaplacené:", error);
					// Pokračujeme dál, i když se nepodařilo označit jako zaplacené
				}
			}

			return {
				success: true,
				message: "Faktura byla úspěšně vytvořena",
				invoiceId: invoice.id,
				invoiceNumber: invoice.number
			};
		} catch (err) {
			console.error("Chyba při vytváření faktury:", err);
			
			// Specifické zpracování Fakturoid chyb
			if (err instanceof Error) {
				const errorMessage = err.message;
				
				// 401 Unauthorized - token vypršel nebo je neplatný
				if (errorMessage.includes('401') || errorMessage.includes('unauthorized')) {
					return fail(401, {
						success: false,
						message: "Váš Fakturoid token vypršel. Prosím reconnectujte svůj Fakturoid účet.",
						reconnectUrl: "/admin/site-setting?tab=integrations",
						errorType: "unauthorized"
					});
				}
				
				// 403 Forbidden - nedostatečná oprávnění
				if (errorMessage.includes('403') || errorMessage.includes('forbidden')) {
					return fail(403, {
						success: false,
						message: "Nemáte oprávnění vytvářet faktury v tomto Fakturoid účtu. Zkontrolujte nastavení účtu.",
						reconnectUrl: "/admin/site-setting?tab=integrations",
						errorType: "forbidden"
					});
				}
				
				// Chyba připojení
				if (errorMessage.includes('připojit k Fakturoid API')) {
					return fail(400, {
						success: false,
						message: "Nepodařilo se připojit k Fakturoid API. Zkontrolujte internetové připojení a zkuste reconnect.",
						reconnectUrl: "/admin/site-setting?tab=integrations",
						errorType: "connection"
					});
				}
				
				// Jiné specifické Fakturoid chyby
				if (errorMessage.includes('Fakturoid')) {
					return fail(400, {
						success: false,
						message: `Chyba Fakturoid: ${errorMessage}`,
						reconnectUrl: "/admin/site-setting?tab=integrations",
						errorType: "fakturoid"
					});
				}
			}
			
			return fail(500, {
				success: false,
				message: "Nastala neočekávaná chyba při vytváření faktury",
				errorType: "unknown"
			});
		}
	}
};
