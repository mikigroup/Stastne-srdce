import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import type { Database } from "$lib/database.types";

type Menu = Database["public"]["Tables"]["menus"]["Row"] & {
	variants: Database["public"]["Tables"]["menu_variants"]["Row"][];
};

export const load: PageServerLoad = async ({
	params,
	locals: { supabase }
}) => {
	const { menuId } = params;

	try {
		// Načtení menu s variantami, alergeny a ingrediencemi
		const { data: menu, error: menuError } = await supabase
			.from("menus")
			.select(
				`
        *,
        variants:menu_variants(
          *,
          allergens:variant_allergens(allergen_id(id, name)),
          ingredients:variant_ingredients(ingredient_id(id, name))
        )
      `
			)
			.eq("id", menuId)
			.single();

		if (menuError) {
			throw error(404, "Menu not found");
		}

		// Načtení všech alergenů
		const { data: allergens, error: allergensError } = await supabase
			.from("allergens")
			.select("*");

		if (allergensError) {
			console.error("Error fetching allergens:", allergensError);
			throw error(500, "Failed to load allergens");
		}

		// Načtení všech ingrediencí
		const { data: ingredients, error: ingredientsError } = await supabase
			.from("ingredients")
			.select("*");

		if (ingredientsError) {
			console.error("Error fetching ingredients:", ingredientsError);
			throw error(500, "Failed to load ingredients");
		}

		// Načtení alergenů pro menu
		const { data: menuAllergens, error: menuAllergensError } = await supabase
			.from("menu_allergens")
			.select("allergen_id")
			.eq("menu_id", menuId);

		if (menuAllergensError) {
			console.error("Error fetching menu allergens:", menuAllergensError);
			throw error(500, "Failed to load menu allergens");
		}

		// Načtení ingrediencí pro menu
		const { data: menuIngredients, error: menuIngredientsError } =
			await supabase
				.from("menu_ingredients")
				.select("ingredient_id")
				.eq("menu_id", menuId);

		if (menuIngredientsError) {
			console.error("Error fetching menu ingredients:", menuIngredientsError);
			throw error(500, "Failed to load menu ingredients");
		}

		// Přidání alergenů a ingrediencí k menu
		const fullMenu: Menu = {
			...menu,
			allergens: menuAllergens.map((ma) =>
				allergens.find((a) => a.id === ma.allergen_id)
			),
			ingredients: menuIngredients.map((mi) =>
				ingredients.find((i) => i.id === mi.ingredient_id)
			)
		};
		//console.log(fullMenu);
		return {
			menu: fullMenu,
			allAllergens: allergens,
			allIngredients: ingredients
		};
	} catch (err) {
		console.error("Unexpected error:", err);
		throw error(500, "An unexpected error occurred");
	}
};
