import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({
	locals: { supabase },
	params
}) => {
	const id = params.orderId;
	// console.log("params.orderId:", params.orderId);

	const { data: orders, error: orderError } = await supabase
		.from("orders")
		.select("*")
		.eq("id", id)
		.single();

	if (orderError) {
		console.error("Error fetching order:", orderError);
		throw orderError;
	}

	const { data: orderItems, error: orderItemsError } = await supabase
		.from("order_items")
		.select(
			`
        *,
        menus(
            id,
            variants
        )
    `
		)
		.eq("order_id", id);

	if (orderItemsError) {
		console.error("Error fetching order items:", orderItemsError);
		throw orderItemsError;
	}

	return {
		orders,
		orderItems
	};
};
