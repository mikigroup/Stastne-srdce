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
      created_at,
      allergies,
      allergies_description,
      delivery_method,
      payment_method,
      registration_status
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
			pay_state,
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

	// Výpočet statistik zákazníka
	const stats = {
		totalOrders: orders?.length || 0,
		totalSpent: orders?.reduce((sum: number, order: any) => sum + (order.total_price || 0), 0) || 0,
		averageOrderValue: orders?.length ? 
			(orders.reduce((sum: number, order: any) => sum + (order.total_price || 0), 0) / orders.length) : 0,
		firstOrderDate: orders?.length ? 
			orders.sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())[0]?.created_at : null,
		lastOrderDate: orders?.length ? 
			orders.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]?.created_at : null,
		unpaidOrders: orders?.filter((order: any) => order.pay_state === false).length || 0,
		unpaidAmount: orders?.filter((order: any) => order.pay_state === false)
			.reduce((sum: number, order: any) => sum + (order.total_price || 0), 0) || 0
	};

	// Systém věrnosti zákazníků
	const getLoyaltyLevel = (orderCount: number) => {
		if (orderCount >= 20) return { level: 'VIP', label: 'VIP zákazník', icon: '💎', color: 'purple' };
		if (orderCount >= 10) return { level: 'LOYAL', label: 'Stálý zákazník', icon: '⭐', color: 'yellow' };
		if (orderCount >= 3) return { level: 'REGULAR', label: 'Pravidelný zákazník', icon: '👤', color: 'blue' };
		return { level: 'NEW', label: 'Nový zákazník', icon: '🆕', color: 'gray' };
	};

	const isActiveCustomer = (lastOrderDate: string | null) => {
		if (!lastOrderDate) return false;
		const threeMonthsAgo = new Date();
		threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
		return new Date(lastOrderDate) > threeMonthsAgo;
	};

	const loyaltyInfo = {
		...getLoyaltyLevel(stats.totalOrders),
		isActive: isActiveCustomer(stats.lastOrderDate),
		customerSince: stats.firstOrderDate ? 
			Math.floor((new Date().getTime() - new Date(stats.firstOrderDate).getTime()) / (1000 * 60 * 60 * 24)) : 0,
		daysSinceLastOrder: stats.lastOrderDate ? 
			Math.floor((new Date().getTime() - new Date(stats.lastOrderDate).getTime()) / (1000 * 60 * 60 * 24)) : null
	};

	return { 
		customer,
		orders: orders || [],
		stats,
		loyaltyInfo
	};
};
