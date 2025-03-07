import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals: { supabase }, url }) => {
	// Get date range parameters if provided
	const startDate = url.searchParams.get("startDate") || getStartOfMonth();
	const endDate = url.searchParams.get("endDate") || getEndOfMonth();

	// Get today's date range for today's orders
	const todayStart = new Date();
	todayStart.setHours(0, 0, 0, 0);
	const todayEnd = new Date();
	todayEnd.setHours(23, 59, 59, 999);

	// Fetch all orders within date range
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
			todayOrders: [],
			todayOrdersCount: 0,
			todayOrdersTotal: 0
		};
	}

	// Fetch customers within date range
	const { data: customers, error: customersError } = await supabase
		.from("profiles")
		.select("*")
		.gte("created_at", startDate)
		.lte("created_at", endDate)
		.order("created_at", { ascending: true });

	if (customersError) {
		console.error("Error fetching customers:", customersError);
		return {
			orders: [],
			customers: [],
			todayOrders: [],
			todayOrdersCount: 0,
			todayOrdersTotal: 0
		};
	}

	// Fetch today's orders specifically
	const { data: todayOrders, error: todayOrdersError } = await supabase
		.from("orders")
		.select("*")
		.gte("created_at", todayStart.toISOString())
		.lte("created_at", todayEnd.toISOString())
		.order("created_at", { ascending: false });

	if (todayOrdersError) {
		console.error("Error fetching today's orders:", todayOrdersError);
		return {
			orders,
			customers,
			todayOrders: [],
			todayOrdersCount: 0,
			todayOrdersTotal: 0
		};
	}

	// Calculate today's statistics
	const todayOrdersCount = todayOrders ? todayOrders.length : 0;
	const todayOrdersTotal = todayOrders
		? todayOrders.reduce((sum, order) => sum + (order.total_price || 0), 0)
		: 0;

	return {
		orders: orders || [],
		customers: customers || [],
		todayOrders: todayOrders || [],
		todayOrdersCount,
		todayOrdersTotal
	};
};

// Helper functions for default date ranges
function getStartOfMonth(): string {
	const now = new Date();
	return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
}

function getEndOfMonth(): string {
	const now = new Date();
	return new Date(
		now.getFullYear(),
		now.getMonth() + 1,
		0,
		23,
		59,
		59,
		999
	).toISOString();
}
