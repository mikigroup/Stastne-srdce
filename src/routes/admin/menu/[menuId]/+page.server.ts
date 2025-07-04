import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { loadMenu, type Menu } from "$lib/services/menuService";
import { getSetting } from "$lib/services/siteSettingsService";
import { getDefaultSettings } from "$lib/constants/defaultSettings";

export const load: PageServerLoad = async ({
	params,
	locals: { supabase }
}) => {
	const { menuId } = params;

	try {
		// Načtení menu pomocí naší služby
		const menu = await loadMenu(supabase, menuId);

		// Načtení předchozí a následující menu pro navigaci
		let prevMenuId = null;
		let nextMenuId = null;

		if (menu) {
			// Najít předchozí menu (starší podle data)
			const { data: prevMenu } = await supabase
				.from("menus")
				.select("id")
				.lt("date", menu.date)
				.order("date", { ascending: false })
				.limit(1)
				.single();

			if (prevMenu) {
				prevMenuId = prevMenu.id;
			}

			// Najít následující menu (novější podle data)
			const { data: nextMenu } = await supabase
				.from("menus")
				.select("id")
				.gt("date", menu.date)
				.order("date", { ascending: true })
				.limit(1)
				.single();

			if (nextMenu) {
				nextMenuId = nextMenu.id;
			}
		}

		// Načtení všech alergenů pro výběr
		const { data: allAllergens, error: allergensError } = await supabase
			.from("allergens")
			.select("*")
			.order("number");

		if (allergensError) {
			console.error("Error fetching allergens:", allergensError);
			throw error(500, "Failed to load allergens");
		}

		// Načtení všech ingrediencí pro výběr
		const { data: allIngredients, error: ingredientsError } = await supabase
			.from("ingredients")
			.select("*")
			.order("name");

		if (ingredientsError) {
			console.error("Error fetching ingredients:", ingredientsError);
			throw error(500, "Failed to load ingredients");
		}

		// Načtení products settings s fallback na výchozí hodnoty
		const productsSettings = await getSetting(supabase, 'products') || getDefaultSettings('products');

		// Načtení general settings pro měny - pouze z DB
		const generalSettings = await getSetting(supabase, 'general');

		return {
			menu,
			allAllergens,
			allIngredients,
			productsSettings,
			generalSettings,
			navigation: {
				prevMenuId,
				nextMenuId
			}
		};
	} catch (err) {
		console.error("Unexpected error:", err);
		throw error(500, "An unexpected error occurred");
	}
};
