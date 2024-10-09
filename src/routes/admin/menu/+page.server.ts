import { fail, redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({
	locals: { supabase, session },
	url
}) => {
	if (!session) {
		throw redirect(303, "/");
	}

	const page = parseInt(url.searchParams.get("page") || "1");
	const itemsPerPage = 10;
	const start = (page - 1) * itemsPerPage;
	const searchQuery = url.searchParams.get("search") || "";

	let query = supabase
		.from("menus")
		.select(
			`
      *,
      variants:menu_variants(id, description)
    `,
			{ count: "exact" }
		)
		.order("date", { ascending: false });

	if (searchQuery) {
		query = query.or(
			`soup.ilike.%${searchQuery}%,` +
				`variants.description.ilike.%${searchQuery}%`
		);
	}

	const {
		data: menus,
		error,
		count
	} = await query.range(start, start + itemsPerPage - 1);

	if (error) {
		console.error("Error fetching menus:", error);
		throw error;
	}

	const totalItems = count ?? 0;
	const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
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
