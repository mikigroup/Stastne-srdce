import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals: { supabase }, url }) => {
	// Helper function to get last 24 hours in local time (Europe/Prague)
	const getLast24HoursRange = () => {
		const now = new Date();
		const start = new Date(now);
		start.setHours(now.getHours() - 24); // 24 hours ago

		return { start, end: now };
	};

	// Use last 24 hours range by default
	const { start, end } = getLast24HoursRange();
	const startDate = start.toISOString();
	const endDate = end.toISOString();

	// Fetch orders from last 24 hours
	const { data: orders, error: ordersError } = await supabase
		.from("orders")
		.select("*")
		.gte("created_at", startDate)
		.lte("created_at", endDate)
		.order("created_at", { ascending: false });

	if (ordersError) {
		console.error("Error fetching orders:", ordersError);
		return {
			orders: [],
			customers: [],
			last24hOrders: [],
			last24hOrdersCount: 0,
			last24hOrdersTotal: 0
		};
	}

	// Fetch customers from last 24 hours
	const { data: customers, error: customersError } = await supabase
		.from("profiles")
		.select("*")
		.gte("created_at", startDate)
		.lte("created_at", endDate)
		.order("created_at", { ascending: true });

	if (customersError) {
		console.error("Error fetching customers:", customersError);
		return {
			orders: orders || [],
			customers: [],
			last24hOrders: [],
			last24hOrdersCount: 0,
			last24hOrdersTotal: 0
		};
	}

	// Calculate statistics for last 24 hours
	const last24hOrdersCount = orders?.length || 0;
	const last24hOrdersTotal =
		orders?.reduce((sum, order) => sum + (order.total_price || 0), 0) || 0;

	return {
		orders: orders || [],
		customers: customers || [],
		last24hOrders: orders || [], // All orders are from last 24h now
		last24hOrdersCount,
		last24hOrdersTotal
	};
};
