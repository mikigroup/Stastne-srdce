import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({
	locals: { supabase },
	params
}) => {
	// Extract customerId from route parameters
	const id = params.customerId;

	// Načtení profilu zákazníka
	const { data: customer, error: customerError } = await supabase
		.from("profiles")
		.select(
			`
      first_name,
      last_name,
      telephone,
      street,
      city,
      street_number,
      zip_code,
      email,
      ico,
      dic,
      company,
      website,
      username,
      id,
      allergies,
      allergies_description,
      delivery_method,
      payment_method
    `
		)
		.eq("id", id)
		.single();

	if (customerError) {
		console.error("Error fetching customer:", customerError);
		// Lepší error handling pro případ že zákazník neexistuje
		if (customerError.code === "PGRST116") {
			throw new Error("Zákazník nebyl nalezen");
		}
		throw customerError;
	}

	// Načtení objednávek zákazníka s položkami
	const { data: orders, error: ordersError } = await supabase
		.from("orders")
		.select(`
			id,
			created_at,
			state,
			total_price,
			order_number,
			order_items (
				id,
				quantity,
				price,
				variant_id,
				menu_variants (
					id,
					variant_number,
					description,
					price,
					menu_id,
					menus (
						id,
						date,
						soup
					)
				)
			)
		`)
		.eq("user_id", id)
		.order('created_at', { ascending: false });

	if (ordersError) {
		console.error("Error fetching orders:", ordersError);
		throw ordersError;
	}

	return { 
		customer,
		orders: orders || []
	};
};
