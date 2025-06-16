import type { PageServerLoad } from "./$types";
import { getOrderSettings } from "$lib/services/eshopSettingsService";

export const load: PageServerLoad = async ({
	locals: { supabase, session },
	url
}) => {
	const page = parseInt(url.searchParams.get("page") || "1");
	const itemsPerPage = 20;
	const start = (page - 1) * itemsPerPage;
	const searchQuery = url.searchParams.get("search") || "";
	const dateQuery = url.searchParams.get("date") || "";

	let query = supabase.from("orders").select("*", { count: "exact" });

	// Aplikujeme vyhledávání podle textu
	if (searchQuery) {
		const parsedSearchQuery = parseInt(searchQuery, 10);

		// Vytvoříme pole podmínek pro vyhledávání
		let searchConditions = [
			`customer_first_name.ilike.%${searchQuery}%`,
			`customer_last_name.ilike.%${searchQuery}%`,
			`customer_email.ilike.%${searchQuery}%`
		];

		// Pokud je searchQuery číslo, přidáme podmínku pro order_number
		if (!isNaN(parsedSearchQuery)) {
			searchConditions.push(`order_number.eq.${parsedSearchQuery}`);
		}

		// Aplikujeme všechny podmínky najednou
		query = query.or(searchConditions.join(","));
	}

	// Aplikujeme vyhledávání podle data - pouze v sloupci date
	if (dateQuery) {
		try {
			// Převedeme datum na formát YYYY-MM-DD (přesně jak očekává Postgres DATE typ)
			const searchDate = new Date(dateQuery);
			if (!isNaN(searchDate.getTime())) {
				const formattedDate = searchDate.toISOString().split('T')[0];
				query = query.eq('date', formattedDate);
			}
		} catch (error) {
			console.error("Invalid date format:", dateQuery, error);
		}
	}

	// Přidáme řazení
	query = query
		.order("date", { ascending: false })
		.range(start, start + itemsPerPage - 1);

	const { data: orders, error, count } = await query;

	if (error) {
		console.error("Error fetching orders:", error);
		throw error;
	}

	// Načteme nastavení objednávek (dříve eshop)
	const orderSettings = await getOrderSettings(supabase);

	const totalItems = count ?? 0;
	const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
	const itemsOnCurrentPage = orders?.length ?? 0;

	const { data: profileTableSettings, error: profileError } = await supabase
		.from("profiles")
		.select("table_settings_orders")
		.eq("id", session?.user.id)
		.single();

	if (profileError) {
		console.error("Error fetching profile:", profileError);
		throw profileError;
	}

	return {
		orders,
		profileTableSettings,
		currentPage: page,
		totalPages,
		totalItems,
		itemsOnCurrentPage,
		itemsPerPage,
		searchQuery,
		dateQuery,
		orderSettings
	};
};
