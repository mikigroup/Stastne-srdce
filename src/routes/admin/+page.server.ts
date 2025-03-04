import type { PageServerLoad } from "./$types";
import { error } from "@sveltejs/kit";

export const load: PageServerLoad = async ({
	locals: { supabase, session }
}) => {
	if (!session) {
		throw error(401, { message: "Unauthorized" });
	}

	try {
		// Získání dnešního data (začátek a konec dne)
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		const tomorrow = new Date(today);
		tomorrow.setDate(tomorrow.getDate() + 1);

		// Fetch dnes vytvořených objednávek včetně detailů
		const { data: todayOrders, error: todayOrdersError } = await supabase
			.from("orders")
			.select(
				`
        id, 
        order_number, 
        created_at, 
        customer_first_name, 
        customer_last_name, 
        customer_email, 
        customer_telephone,
        total_price, 
        total_pieces, 
        state, 
        pay_state
      `
			)
			.gte("created_at", today.toISOString())
			.lt("created_at", tomorrow.toISOString())
			.order("created_at", { ascending: false });

		if (todayOrdersError) throw todayOrdersError;

		// Fetch měsíčních dat pro grafy
		const { data: orders, error: orderError } = await supabase
			.from("orders")
			.select("created_at, id, total_price")
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

		// Fetch zákaznických dat
		const { data: customers, error: customerError } = await supabase
			.from("profiles")
			.select("created_at, id")
			.order("created_at");

		if (customerError) throw customerError;

		return {
			todayOrders,
			todayOrdersCount: todayOrders.length,
			todayOrdersTotal: todayOrders.reduce(
				(sum, order) => sum + (order.total_price || 0),
				0
			),
			orders,
			customers
		};
	} catch (err) {
		console.error("Error fetching data:", err);
		throw error(500, { message: "Error fetching dashboard data" });
	}
};
