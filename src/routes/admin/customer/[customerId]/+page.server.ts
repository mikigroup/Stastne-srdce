import type { PageServerLoad } from "./$types";
import { calculateCustomerLoyalty, getLoyaltySettings } from "$lib/services/loyaltyService";

export const load: PageServerLoad = async ({
	locals: { supabase, safeGetSession },
	params
}) => {
	const { session } = await safeGetSession();
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

	// Načteme předchozí a následující zákazníka podle data vytvoření
	let previousCustomer = null;
	let nextCustomer = null;

	// Načteme předchozího zákazníka (starší datum vytvoření)
	const { data: prevCustomerData } = await supabase
		.from("profiles")
		.select("id, first_name, last_name, created_at")
		.lt("created_at", customer.created_at)
		.order("created_at", { ascending: false })
		.limit(1)
		.single();

	if (prevCustomerData) {
		previousCustomer = {
			id: prevCustomerData.id,
			name: `${prevCustomerData.first_name || ""} ${prevCustomerData.last_name || ""}`.trim(),
			created_at: prevCustomerData.created_at
		};
	}

	// Načteme následujícího zákazníka (mladší datum vytvoření)
	const { data: nextCustomerData } = await supabase
		.from("profiles")
		.select("id, first_name, last_name, created_at")
		.gt("created_at", customer.created_at)
		.order("created_at", { ascending: true })
		.limit(1)
		.single();

	if (nextCustomerData) {
		nextCustomer = {
			id: nextCustomerData.id,
			name: `${nextCustomerData.first_name || ""} ${nextCustomerData.last_name || ""}`.trim(),
			created_at: nextCustomerData.created_at
		};
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
		.order("created_at", { ascending: false });

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

	// Použití loyaltyService pro výpočet věrnostních dat
	let loyaltyInfo;
	try {
		const loyaltyData = await calculateCustomerLoyalty(supabase, id);
		const loyaltySettings = await getLoyaltySettings(supabase);
		const tierInfo = loyaltySettings.tiers.find(tier => tier.name === loyaltyData.currentTier);
		
		loyaltyInfo = {
			level: loyaltyData.currentTier,
			label: tierInfo?.label || tierInfo?.name || loyaltyData.currentTier,
			icon: tierInfo?.icon || "👤",
			color: tierInfo?.color || "#6B7280",
			isActive: loyaltyData.isActive,
			customerSince: loyaltyData.customerSince,
			daysSinceLastOrder: loyaltyData.daysSinceLastOrder,
			currentPoints: loyaltyData.currentPoints,
			totalPointsEarned: loyaltyData.totalPointsEarned,
			totalPointsSpent: loyaltyData.totalPointsSpent
		};
	} catch (error) {
		console.error("Error calculating loyalty data:", error);
		// Fallback na statickou implementaci
		const getLoyaltyLevel = (orderCount: number) => {
			if (orderCount >= 20) return { level: "VIP", label: "VIP zákazník", icon: "💎", color: "purple" };
			if (orderCount >= 10) return { level: "LOYAL", label: "Stálý zákazník", icon: "⭐", color: "yellow" };
			if (orderCount >= 3) return { level: "REGULAR", label: "Pravidelný zákazník", icon: "👤", color: "blue" };
			return { level: "NEW", label: "Nový zákazník", icon: "🆕", color: "gray" };
		};

		const isActiveCustomer = (lastOrderDate: string | null) => {
			if (!lastOrderDate) return false;
			const threeMonthsAgo = new Date();
			threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
			return new Date(lastOrderDate) > threeMonthsAgo;
		};

		loyaltyInfo = {
			...getLoyaltyLevel(stats.totalOrders),
			isActive: isActiveCustomer(stats.lastOrderDate),
			customerSince: Math.floor((new Date().getTime() - new Date(customer.created_at).getTime()) / (1000 * 60 * 60 * 24)),
			daysSinceLastOrder: stats.lastOrderDate ? 
				Math.floor((new Date().getTime() - new Date(stats.lastOrderDate).getTime()) / (1000 * 60 * 60 * 24)) : null,
			currentPoints: 0,
			totalPointsEarned: 0,
			totalPointsSpent: 0
		};
	}

	return { 
		customer,
		orders: orders || [],
		stats,
		loyaltyInfo,
		previousCustomer,
		nextCustomer,
		session
	};
};

import type { Actions } from "./$types";

export const actions: Actions = {
	updateCustomer: async ({ request, locals: { supabase } }) => {
		const formData = await request.formData();
		const customerId = formData.get("customerId") as string;
		const customerData = JSON.parse(formData.get("customerData") as string);

		try {
			const { data: updatedCustomer, error } = await supabase
				.from("profiles")
				.update(customerData)
				.eq("id", customerId)
				.select()
				.single();

			if (error) {
				console.error("Error updating customer:", error);
				return { 
					success: false, 
					error: error.message 
				};
			}

			return { 
				success: true, 
				data: updatedCustomer 
			};
		} catch (error) {
			console.error("Unexpected error updating customer:", error);
			return { 
				success: false, 
				error: "Neočekávaná chyba při ukládání" 
			};
		}
	}
};
