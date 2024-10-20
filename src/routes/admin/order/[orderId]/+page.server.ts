import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({
	locals: { supabase },
	params
}) => {
	const id = params.orderId;

	const { data: order, error: orderError } = await supabase
		.from("orders")
		.select(
			`
     *,
     order_items(
       *,
       variant_id(
         *,
         menu_id(
           *
         )
       )
     )
   `
		)
		.eq("id", id)
		.single();

	if (orderError) {
		console.error("Error fetching order:", orderError);
		throw orderError;
	}

	return {
		order
	};
};
