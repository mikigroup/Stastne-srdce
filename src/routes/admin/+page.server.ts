import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals: { supabase }, url }) => {
	// Helper function to get start/end of day in local time (Europe/Prague)
	const getLocalDayRange = () => {
		const now = new Date();
		const start = new Date(now);
		start.setHours(0, 0, 0, 0);

		const end = new Date(now);
		end.setHours(23, 59, 59, 999);

		return { start, end };
	};

	// Helper function to format date as YYYY-MM-DD
	const formatDate = (date: Date): string => {
		return date.toISOString().split("T")[0];
	};

	// Get date range parameters if provided
	const startDateParam = url.searchParams.get("startDate");
	const endDateParam = url.searchParams.get("endDate");

	// Use provided dates or default to current day range
	const { start: defaultStart, end: defaultEnd } = getLocalDayRange();
	const startDate = startDateParam ? new Date(startDateParam) : defaultStart;
	const endDate = endDateParam ? new Date(endDateParam) : defaultEnd;

	// Convert to start/end of day in local time
	startDate.setHours(0, 0, 0, 0);
	endDate.setHours(23, 59, 59, 999);

	// Get today's date in YYYY-MM-DD format
	const today = formatDate(new Date());

	// Fetch all orders within date range (UTC comparison)
	const { data: orders, error: ordersError } = await supabase
		.from("orders")
		.select("*")
		.gte("created_at", startDate.toISOString())
		.lte("created_at", endDate.toISOString())
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

	// Fetch customers within date range (UTC comparison)
	const { data: customers, error: customersError } = await supabase
		.from("profiles")
		.select("*")
		.gte("created_at", startDate.toISOString())
		.lte("created_at", endDate.toISOString())
		.order("created_at", { ascending: true });

	if (customersError) {
		console.error("Error fetching customers:", customersError);
		return {
			orders: orders || [],
			customers: [],
			todayOrders: [],
			todayOrdersCount: 0,
			todayOrdersTotal: 0
		};
	}

	// Fetch today's orders
	const { data: todayOrders, error: todayOrdersError } = await supabase
		.from("orders")
		.select("*")
		.gte("created_at", startDate.toISOString())
		.lte("created_at", endDate.toISOString())
		.order("order_number", { ascending: false });

	// Calculate today's statistics
	const todayOrdersCount = todayOrders?.length || 0;
	const todayOrdersTotal =
		todayOrders?.reduce((sum, order) => sum + (order.total_price || 0), 0) || 0;

	return {
		orders: orders || [],
		customers: customers || [],
		todayOrders: todayOrders || [],
		todayOrdersCount,
		todayOrdersTotal
	};
};
