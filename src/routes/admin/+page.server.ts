import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals: { supabase }, url }) => {
	// Helper function to format date as YYYY-MM-DD
	const formatDate = (date: Date): string => {
		return date.toISOString().split("T")[0];
	};

	// Get date range parameters if provided, formatted as YYYY-MM-DD
	const startDateParam = url.searchParams.get("startDate");
	const endDateParam = url.searchParams.get("endDate");

	const startDate = startDateParam
		? formatDate(new Date(startDateParam))
		: formatDate(getStartOfMonth());
	const endDate = endDateParam
		? formatDate(new Date(endDateParam))
		: formatDate(getEndOfMonth());

	// Get today's date in YYYY-MM-DD format
	const today = formatDate(new Date());

	// Fetch all orders within date range (using date field)
	const { data: orders, error: ordersError } = await supabase
		.from("orders")
		.select("*")
		.gte("created_at", startDate) // Removed .toISOString() since startDate is already formatted
		.lte("created_at", endDate) // Removed .toISOString() here too
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

	// Fetch customers within date range (using created_at timestamp)
	const { data: customers, error: customersError } = await supabase
		.from("profiles")
		.select("*")
		.gte("created_at", `${startDate}T00:00:00Z`) // Add time component for timestamp
		.lte("created_at", `${endDate}T23:59:59Z`)
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

	// Fetch today's orders using exact date match
	const { data: todayOrders, error: todayOrdersError } = await supabase
		.from("orders")
		.select("*")
		.eq("date", today) // Exact match for today's date
		.order("order_number", { ascending: false });

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

// Helper functions for default date ranges (return Date objects)
function getStartOfMonth(): Date {
	const now = new Date();
	return new Date(now.getFullYear(), now.getMonth(), 1);
}

function getEndOfMonth(): Date {
	const now = new Date();
	return new Date(now.getFullYear(), now.getMonth() + 1, 0);
}
