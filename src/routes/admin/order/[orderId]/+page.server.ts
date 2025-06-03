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
	console.log("====== ORDER PAGE SERVER LOAD START ======");
	console.log("Params:", params);
	
	const { session } = await safeGetSession();
	if (!session) {
		throw redirect(303, "/login");
	}

	const { orderId } = params;
	console.log("Loading order with ID:", orderId);

	try {
		// Načtení objednávky
		const { data: order, error: orderError } = await supabase
			.from("orders")
			.select(
				`*,
				order_items(*, variant_id(*, menu_id(*), menu_version_id(*)))`
			)
			.eq("id", orderId)
			.single();

		console.log("Order loaded:", order ? "SUCCESS" : "UNDEFINED");
		if (orderError) {
			console.error("Error loading order:", orderError);
			if (orderError.code === "PGRST116") {
				throw error(404, {
					message: "Objednávka nenalezena"
				});
			}
			throw error(500, {
				message: orderError.message
			});
		} else {
			console.log("Order data structure:", JSON.stringify(order, null, 2).substring(0, 500) + "...");
		}

		// Načteme nastavení e-shopu
		const eshopSettings = await getEshopSettings(supabase);

		const returnData = {
			order,
			eshopSettings
		};

		console.log("Final return data keys:", Object.keys(returnData || {}));
		console.log("====== ORDER PAGE SERVER LOAD END ======");
		
		return returnData;
	} catch (err) {
		console.error("Unexpected error in order page load:", err);
		console.log("====== ORDER PAGE SERVER LOAD ERROR ======");
		throw err;
	}
};
