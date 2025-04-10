import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({
	locals: { supabase, session },
	url
}) => {
	const page = parseInt(url.searchParams.get("page") || "1");
	const itemsPerPage = 20;
	const start = (page - 1) * itemsPerPage;
	const searchQuery = url.searchParams.get("search") || "";

	let query = supabase.from("orders").select("*", { count: "exact" });

	// Aplikujeme vyhledávání pouze pokud existuje searchQuery
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

	// Přidáme řazení
	query = query
		.order("date", { ascending: false })
		.range(start, start + itemsPerPage - 1);

	const { data: orders, error, count } = await query;

	if (error) {
		console.error("Error fetching orders:", error);
		throw error;
	}

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
		searchQuery
	};
};
