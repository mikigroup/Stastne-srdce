import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({
	locals: { supabase, session },
	url
}) => {
	if (!session) {
		throw redirect(303, "/admin");
	}

	const page = parseInt(url.searchParams.get("page") || "1");
	const itemsPerPage = 10;
	const searchQuery = url.searchParams.get("search") || "";

	// Základní query bez range omezení pro vyhledávání
	let query = supabase
		.from("menus")
		.select(
			`
      *,
      variants:menu_variants(id, description, variant_number)
    `,
			{
				count: "exact"
			}
		)
		.order("date", { ascending: false })
		.eq("deleted", false);

	// Vyhledávání v celé DB
	if (searchQuery) {
		// Nejdřív získáme všechny menu_id z variant, které obsahují hledaný text
		const { data: variantResults } = await supabase
			.from("menu_variants")
			.select("menu_id")
			.ilike("description", `%${searchQuery}%`);

		const menuIds = variantResults?.map((v) => v.menu_id) || [];

		// Pak vytvoříme podmínku pro vyhledávání
		if (menuIds.length > 0) {
			query = query.or(
				`id.in.(${menuIds.join(",")}),soup.ilike.%${searchQuery}%`
			);
		} else {
			query = query.ilike("soup", `%${searchQuery}%`);
		}
	}

	// Nejdřív získáme celkový počet výsledků
	const { count } = await query;
	const totalItems = count ?? 0;
	const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

	// Pak aplikujeme stránkování na filtrované výsledky
	const start = (page - 1) * itemsPerPage;
	const { data: menus, error } = await query.range(
		start,
		start + itemsPerPage - 1
	);

	if (error) {
		console.error("Error fetching menus:", error);
		throw error;
	}

	const itemsOnCurrentPage = menus?.length ?? 0;

	const { data: profileTableSettings, error: profileError } = await supabase
		.from("profiles")
		.select("table_settings_menus")
		.eq("id", session.user.id)
		.single();

	if (profileError) {
		console.error("Error fetching profile:", profileError);
		throw profileError;
	}

	return {
		menus,
		profileTableSettings,
		currentPage: page,
		totalPages,
		totalItems,
		itemsOnCurrentPage,
		itemsPerPage,
		searchQuery
	};
};
