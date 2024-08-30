import type { PageServerLoad } from "./$types";
import { error } from "@sveltejs/kit";

export const load: PageServerLoad = async ({
	locals: { supabase, session }
}) => {
	if (!session) {
		throw error(401, { message: "Unauthorized" });
	}

	try {
		// Fetch order data
		const { data: orders, error: orderError } = await supabase
			.from("orders")
			.select("created_at, id")
			.gte(
				"created_at",
				new Date(
					new Date().getFullYear(),
					new Date().getMonth(),
					1
				).toISOString()
			)
			.order("created_at");

		if (orderError) throw orderError;

		// Fetch customer data
		const { data: customers, error: customerError } = await supabase
			.from("customers")
			.select("created_at, id")
			.order("created_at");

		if (customerError) throw customerError;

		return {
			orders,
			customers
		};
	} catch (err) {
		console.error("Error fetching data:", err);
		throw error(500, { message: "Error fetching dashboard data" });
	}
};
