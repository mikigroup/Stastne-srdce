import { fail, redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({
	locals: { supabase, session }
}) => {
	if (!session) {
		throw redirect(303, "/login");
	}

	const { data: orders, error: ordersError } = await supabase
		.from("orders")
		.select(
			"state, date, id, customer_first_name, customer_last_name, customer_street, customer_street_number, customer_city, customer_zip_code, customer_telephone, customer_email, delivery_street, delivery_street_number, delivery_zip_code, delivery_first_name, delivery_last_name, delivery_telephone, pay_state, delivery_city, currency, order_number, items, shipping_method, pay_method"
		);
	if (ordersError) {
		console.error("Error fetching orders:", ordersError);
		return fail(500, {
			message: "Error fetching orders. Please try again later."
		});
	}

	const { data: profileTableSettings, error: profileError } = await supabase
		.from("profiles")
		.select("table_settings_orders")
		.eq("id", session.user.id)
		.single();
	if (profileError) {
		console.error("Error fetching profile:", profileError);
		return fail(500, {
			message: "Error fetching profile settings. Please try again later."
		});
	}

	return { orders, profileTableSettings };
};
