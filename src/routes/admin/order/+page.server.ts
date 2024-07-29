import { fail, redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({
	locals: { supabase, session }
}) => {
	const { data: orders, error } = await supabase
		.from("orders")
		.select(
			"state, date, id, customer_first_name, customer_last_name, customer_street, customer_street_number, customer_city, customer_zip_code, customer_telephone, customer_email, delivery_street, delivery_street_number, delivery_zip_code, delivery_first_name, delivery_last_name, delivery_telephone, pay_state, delivery_city, currency, order_number, items, shipping_method, pay_method"
		);
	if (error) {
		console.error("Error fetching orders:", error);
		throw error;
	}

	const { data: profileTableSettings } = await supabase
		.from("profiles")
		.select("table_settings_orders")
		.eq("id", session?.user.id)
		.single();
	if (error) {
		console.error("Error fetching profile:", error);
		throw error;
	}
	return { orders, profileTableSettings };
};
