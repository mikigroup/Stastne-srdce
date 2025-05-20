import { error, redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { getEshopSettings } from "$lib/services/eshopSettingsService";

// Definujeme typovou strukturu pro business nastavení
interface BusinessSettings {
	paymentMethods?: string[];
	deliveryOptions?: string[];
	[key: string]: any;
}

export const load: PageServerLoad = async ({
	params,
	locals: { supabase, safeGetSession }
}) => {
	const { session } = await safeGetSession();
	if (!session) {
		throw redirect(303, "/login");
	}

	const { data: order, error: orderError } = await supabase
		.from("orders")
		.select(`
			*,
			order_items(
				id,
				variant_id,
				price,
				quantity,
				menu_variants(
					id,
					variant_number,
					description,
					price,
					menu_id,
					menus(
						id,
						date,
						notes,
						soup
					)
				)
			)
		`)
		.eq("id", params.orderId)
		.single();

	if (orderError) {
		if (orderError.code === "PGRST116") {
			throw error(404, {
				message: "Objednávka nenalezena"
			});
		}
		throw error(500, {
			message: orderError.message
		});
	}

	// Načteme nastavení e-shopu
	const eshopSettings = await getEshopSettings(supabase);

	return {
		order,
		eshopSettings
	};
};
