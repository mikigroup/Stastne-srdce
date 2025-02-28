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

	// Získáme menu s verzemi
	let menusWithVersions = [];

	try {
		// 1. Získáme základní seznam menu
		let menuQuery = supabase
			.from("menus")
			.select("*", { count: "exact" })
			.order("date", { ascending: false })
			.eq("deleted", false);

		// 2. Aplikujeme vyhledávání, pokud existuje
		if (searchQuery) {
			// Nejdřív získáme všechny menu_id z variant, které obsahují hledaný text
			const { data: variantResults } = await supabase
				.from("menu_variants")
				.select("menu_id")
				.ilike("description", `%${searchQuery}%`);

			const menuIds = variantResults?.map((v) => v.menu_id) || [];

			// Pak vytvoříme podmínku pro vyhledávání
			if (menuIds.length > 0) {
				menuQuery = menuQuery.or(
					`id.in.(${menuIds.join(",")}),soup.ilike.%${searchQuery}%`
				);
			} else {
				menuQuery = menuQuery.ilike("soup", `%${searchQuery}%`);
			}
		}

		// 3. Nejdřív získáme celkový počet výsledků
		const { count } = await menuQuery;
		const totalItems = count ?? 0;
		const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

		// 4. Pak aplikujeme stránkování na filtrované výsledky
		const start = (page - 1) * itemsPerPage;
		const { data: menus, error: menusError } = await menuQuery.range(
			start,
			start + itemsPerPage - 1
		);

		if (menusError) {
			console.error("Error fetching menus:", menusError);
			throw menusError;
		}

		// 5. Pro každé menu načteme aktuální verzi variant
		menusWithVersions = await Promise.all(
			menus.map(async (menu) => {
				try {
					// Získáme aktuální verzi menu
					const { data: versionId, error: versionError } = await supabase.rpc(
						"get_current_menu_version",
						{ p_menu_id: menu.id }
					);

					if (versionError) {
						console.error(
							`Error getting current version for menu ${menu.id}:`,
							versionError
						);
						return { ...menu, variants: [] };
					}

					// Pokud není dostupná žádná verze menu, načteme varianty bez filtru na verzi
					if (versionId === null) {
						console.log(
							`No current version found for menu ${menu.id}, fetching all variants`
						);

						const { data: variants, error: variantsError } = await supabase
							.from("menu_variants")
							.select("id, description, variant_number")
							.eq("menu_id", menu.id)
							.order("variant_number");

						if (variantsError) {
							console.error(
								`Error fetching variants for menu ${menu.id}:`,
								variantsError
							);
							return { ...menu, variants: [] };
						}

						return { ...menu, variants };
					}

					// Získáme varianty pro aktuální verzi
					const { data: variants, error: variantsError } = await supabase
						.from("menu_variants")
						.select("id, description, variant_number")
						.eq("menu_id", menu.id)
						.eq("menu_version_id", versionId)
						.order("variant_number");

					if (variantsError) {
						console.error(
							`Error fetching variants for menu ${menu.id}:`,
							variantsError
						);
						return { ...menu, variants: [] };
					}

					return { ...menu, variants };
				} catch (error) {
					console.error(`Unexpected error processing menu ${menu.id}:`, error);
					return { ...menu, variants: [] };
				}
			})
		);

		const itemsOnCurrentPage = menusWithVersions?.length ?? 0;

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
			currentPage: page,
			totalPages,
			totalItems,
			itemsOnCurrentPage,
			itemsPerPage,
			searchQuery
		};
	} catch (error) {
		console.error("Error in menu page server load:", error);
		throw error;
	}
};
