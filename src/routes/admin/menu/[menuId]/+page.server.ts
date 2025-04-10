import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { loadMenu, type Menu } from "$lib/services/menuService";

export const load: PageServerLoad = async ({
	params,
	locals: { supabase }
}) => {
	const { menuId } = params;

	try {
		// Načtení menu pomocí naší služby
		const menu = await loadMenu(supabase, menuId);

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

		return {
			menu,
			allAllergens,
			allIngredients
		};
	} catch (err) {
		console.error("Unexpected error:", err);
		throw error(500, "An unexpected error occurred");
	}
};
