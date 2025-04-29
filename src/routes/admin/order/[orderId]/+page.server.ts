import type { PageServerLoad } from "./$types";
import { error } from "@sveltejs/kit";

// Definujeme typovou strukturu pro business nastavení
interface BusinessSettings {
	paymentMethods?: string[];
	deliveryOptions?: string[];
	[key: string]: any;
}

export const load: PageServerLoad = async ({
	locals: { supabase },
	params
}) => {
	const id = params.orderId;

	try {
		// Načtení nastavení webu pro získání platebních metod a způsobů doručení
		const { data: siteSettings, error: settingsError } = await supabase
			.from("site_settings")
			.select("*")
			.eq("key", "business")
			.single();

		let businessSettings: BusinessSettings = {};
		if (!settingsError && siteSettings?.value) {
			try {
				// Pokud je hodnota string, parsujeme ji, jinak použijeme přímo objekt
				businessSettings =
					typeof siteSettings.value === "string"
						? JSON.parse(siteSettings.value)
						: siteSettings.value;
			} catch (e) {
				console.error("Chyba při parsování business nastavení:", e);
			}
		}

		// Načtení objednávky se všemi daty pomocí *
		const { data: order, error: orderError } = await supabase
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
			.eq("id", id)
			.single();

		if (orderError) {
			console.error("Error fetching order:", orderError);
			throw error(500, "Chyba při načítání objednávky");
		}

		if (!order) {
			throw error(404, "Objednávka nenalezena");
		}

		// Pro každou položku objednávky načteme data z příslušné verze menu
		for (let i = 0; i < order.order_items.length; i++) {
			const item = order.order_items[i];

			// Pokud položka má menu_id, načteme poslední platnou verzi menu
			if (item.variant_id.menu_id) {
				const { data: versionId, error: versionIdError } = await supabase.rpc(
					"get_current_menu_version",
					{ p_menu_id: item.variant_id.menu_id.id }
				);

				if (versionIdError) {
					console.error(
						"Chyba při získávání poslední validní verze menu:",
						versionIdError
					);
					continue;
				}

				// Pokud máme platnou verzi menu, načteme její data
				if (versionId) {
					const { data: menuVersion, error: menuVersionError } = await supabase
						.from("menu_versions")
						.select("*")
						.eq("id", versionId)
						.single();

					if (menuVersionError) {
						console.error(
							"Chyba při získávání dat poslední validní verze menu:",
							menuVersionError
						);
					} else if (menuVersion) {
						// Připojíme data verze menu k položce objednávky
						order.order_items[i].menuVersionData = menuVersion;
					}
				}
			}
		}

		// Získání platebních metod a způsobů doručení z nastavení
		const paymentMethods = Array.isArray(businessSettings?.paymentMethods)
			? businessSettings.paymentMethods
			: ["Hotově", "Převodem"];

		const deliveryOptions = Array.isArray(businessSettings?.deliveryOptions)
			? businessSettings.deliveryOptions
			: ["Osobní odběr", "Rozvoz"];

		return {
			order,
			paymentMethods,
			deliveryOptions,
			businessSettings
		};
	} catch (err) {
		console.error("Error fetching order details:", err);
		throw error(500, "Nastala chyba při načítání detailů objednávky");
	}
};
