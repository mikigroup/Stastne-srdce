import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { loadMenuList } from "$lib/services/menuService";

export const load: PageServerLoad = async ({
	locals: { supabase, session },
	url
}) => {
	if (!session) {
		throw redirect(303, "/admin");
	}

	const page = parseInt(url.searchParams.get("page") || "1");
	const searchQuery = url.searchParams.get("search") || "";

	try {
		// Use the new loadMenuList function
		const {
			menus: menusWithVersions,
			totalItems,
			currentPage,
			totalPages
		} = await loadMenuList(supabase, {
			page,
			itemsPerPage: 10,
			searchQuery,
			sort: "date_desc"
		});

		// 6. Získáme nastavení tabulky z profilu
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
			menus: menusWithVersions,
			profileTableSettings,
			currentPage,
			totalPages,
			totalItems,
			itemsOnCurrentPage: menusWithVersions.length,
			itemsPerPage: 10,
			searchQuery
		};
	} catch (error) {
		console.error("Error in menu page server load:", error);
		throw error;
	}
};
