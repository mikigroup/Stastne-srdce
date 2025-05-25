import { error, fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import {
	createInvoiceFromOrder,
	sendInvoiceEmail,
	markInvoiceAsPaid
} from "$lib/services/fakturoidService";
import type { Order } from "$lib/types/order";
import type { Profile } from "$lib/types/profile";
import { FakturoidAccountService } from "$lib/services/fakturoidAccountService";

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
		const { data: integrationsData } = await supabase
			.from("site_settings")
			.select("value")
			.eq("key", "integrations")
			.maybeSingle();

		let integrations = {};
		if (integrationsData?.value) {
			integrations = typeof integrationsData.value === 'string' 
				? JSON.parse(integrationsData.value) 
				: integrationsData.value;
		}

		// Migrace a získání aktuálního účtu
		const migratedIntegrations = FakturoidAccountService.migrateFromLegacyFormat(integrations);
		const activeAccount = FakturoidAccountService.getActiveAccount(migratedIntegrations);
		const activeAccountId = FakturoidAccountService.getActiveAccountId(migratedIntegrations);

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
				isFromCurrentAccount = false;
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
			const { data: integrationsData, error: integrationsError } = await supabase
				.from("site_settings")
				.select("value")
				.eq("key", "integrations")
				.maybeSingle();

			if (integrationsError) {
				console.error("Chyba při načítání integračních nastavení:", integrationsError);
				return fail(500, {
					success: false,
					message: "Chyba při načítání nastavení integrace"
				});
			}

			let integrations = {};
			if (integrationsData?.value) {
				try {
					integrations = typeof integrationsData.value === 'string' 
						? JSON.parse(integrationsData.value) 
						: integrationsData.value;
				} catch (e) {
					console.error('Error parsing integrations settings:', e);
					return fail(500, {
						success: false,
						message: "Chyba při zpracování nastavení integrace"
					});
				}
			}

			// 3. Migrace a kontrola aktivního účtu
			const migratedIntegrations = FakturoidAccountService.migrateFromLegacyFormat(integrations);
			const activeAccount = FakturoidAccountService.getActiveAccount(migratedIntegrations);
			const activeAccountId = FakturoidAccountService.getActiveAccountId(migratedIntegrations);

			if (!activeAccount || !activeAccountId) {
				return fail(400, {
					success: false,
					message: "Žádný aktivní Fakturoid účet není nastaven"
				});
			}

			// 4. Kontrola, zda faktura už nebyla vytvořena PRO SOUČASNÝ ÚČET
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

			// 5. Načtení profilu zákazníka
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

			// 6. Vytvoření faktury pomocí Fakturoid API (používáme starý formát pro kompatibilitu)
			const legacyIntegrationsSettings = {
				fakturoidEnabled: true,
				fakturoidConnected: true,
				fakturoidAccountName: activeAccount.name,
				fakturoidSubdomain: activeAccount.subdomain,
				...integrations // ostatní nastavení
			};

			const invoice = await createInvoiceFromOrder(
				order as Order,
				profile as Profile,
				legacyIntegrationsSettings
			);

			// 7. Uložení ID faktury do objednávky S ACCOUNT ID
			const { error: updateError } = await supabase
				.from("orders")
				.update({
					fakturoid_data: {
						invoice_id: invoice.id,
						invoice_number: invoice.number,
						invoice_url: invoice.html_url,
						created_at: new Date().toISOString(),
						account_id: activeAccountId
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

			// 8. Odeslání faktury e-mailem, pokud je požadováno
			if (sendEmail && invoice.id) {
				try {
					await sendInvoiceEmail(invoice.id);
				} catch (emailError) {
					console.error("Chyba při odesílání faktury e-mailem:", emailError);
					// Nezastavujeme proces, jen logujeme chybu
				}
			}

			// 9. Označení faktury jako uhrazené, pokud je požadováno
			if (markPaid && invoice.id) {
				try {
					await markInvoiceAsPaid(invoice.id);
				} catch (paidError) {
					console.error("Chyba při označení faktury jako uhrazené:", paidError);
					// Nezastavujeme proces, jen logujeme chybu
				}
			}

			// 10. Aktualizace stavu objednávky na 'Vyfakturovaná', pokud je požadováno
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

			// 11. Vracíme úspěšný výsledek
			return {
				success: true,
				message: `Faktura byla úspěšně vytvořena účtem ${activeAccount.name}`,
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
