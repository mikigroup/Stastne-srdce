import type { PageServerLoad } from "./$types";
import { PUBLIC_TENANT } from "$env/static/public";

export const load: PageServerLoad = async ({
	locals: { supabase, session },
	url
}) => {
	const page = parseInt(url.searchParams.get("page") || "1");
	const itemsPerPage = parseInt(url.searchParams.get("itemsPerPage") || "20");
	const start = (page - 1) * itemsPerPage;
	const searchQuery = url.searchParams.get("search") || "";

	let query = supabase
		.from("profiles")
		.select("*", { count: "exact" })
		.eq("tenant_id", PUBLIC_TENANT)
		.order("created_at", { ascending: false });

	if (searchQuery) {
		const searchConditions = [
			"first_name",
			"last_name",
			"email",
			"telephone",
			"street",
			"city",
			"zip_code"
		].map((field) => `${field}.ilike.%${searchQuery}%`);

		query = query.or(searchConditions.join(","));
	}

	const {
		data: customers,
		error,
		count
	} = await query.range(start, start + itemsPerPage - 1);

	if (error) {
		console.error("Error fetching customers:", error);
		throw error;
	}

	const totalItems = count ?? 0;
	const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
	const itemsOnCurrentPage = customers?.length ?? 0;

	const { data: profileTableSettings, error: profileError } = await supabase
		.from("profiles")
		.select("table_settings_customers")
		.eq("id", session?.user?.id)
		.eq("tenant_id", PUBLIC_TENANT)
		.single();

	if (profileError) {
		console.error("Error fetching profile:", profileError);
		throw profileError;
	}

	return {
		customers,
		profileTableSettings,
		currentPage: page,
		totalPages,
		totalItems,
		itemsOnCurrentPage,
		itemsPerPage,
		searchQuery
	};
};
