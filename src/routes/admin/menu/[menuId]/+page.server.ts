import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import type { Database } from "$lib/database.types";

type Menu = Database["public"]["Tables"]["menus"]["Row"] & {
	variants: (Database["public"]["Tables"]["menu_variants"]["Row"] & {
		allergens: Database["public"]["Tables"]["allergens"]["Row"][];
		ingredients: Database["public"]["Tables"]["ingredients"]["Row"][];
	})[];
	allergens: Database["public"]["Tables"]["allergens"]["Row"][];
	ingredients: Database["public"]["Tables"]["ingredients"]["Row"][];
};

export const load: PageServerLoad = async ({
	params,
	locals: { supabase }
}) => {
	const { menuId } = params;

	try {
		// Načtení menu s variantami, allergeny a ingrediencemi
		// Load menu with variants, allergens and ingredients
		const { data: menu, error: menuError } = await supabase
			.from("menus")
			.select(
				`
        *,
        variants:menu_variants(
          *,
          allergens:variant_allergens(allergen:allergens(*)),
          ingredients:variant_ingredients(ingredient:ingredients(*))
        )
      `
			)
			.eq("id", menuId)
			.order("variant_number", { referencedTable: "menu_variants" })
			.single();

		if (menuError) {
			throw error(404, "Menu not found");
		}

		// Načtení všech alergenů z DB (statické)
		// Load all allergens from DB (static)
		const { data: allergens, error: allergensError } = await supabase
			.from("allergens")
			.select("*");

		if (allergensError) {
			console.error("Error fetching allergens:", allergensError);
			throw error(500, "Failed to load allergens");
		}

		// Načtení všech ingrediencí
		// Load all ingredients
		const { data: ingredients, error: ingredientsError } = await supabase
			.from("ingredients")
			.select("*");

		if (ingredientsError) {
			console.error("Error fetching ingredients:", ingredientsError);
			throw error(500, "Failed to load ingredients");
		}

		// Načtení alergenů pro menu
		// Load allergens for menu item
		const { data: menuAllergens, error: menuAllergensError } = await supabase
			.from("menu_allergens")
			.select("allergen:allergens(*)")
			.eq("menu_id", menuId);

		if (menuAllergensError) {
			console.error("Error fetching menu allergens:", menuAllergensError);
			throw error(500, "Failed to load menu allergens");
		}

		// Načtení ingrediencí pro menu
		// Load all ingredients for menu item
		const { data: menuIngredients, error: menuIngredientsError } =
			await supabase
				.from("menu_ingredients")
				.select("ingredient:ingredients(*)")
				.eq("menu_id", menuId);

		if (menuIngredientsError) {
			console.error("Error fetching menu ingredients:", menuIngredientsError);
			throw error(500, "Failed to load menu ingredients");
		}

		// Přidání alergenů a ingrediencí k menu
		// Add alergens and ingredients to the menu
		const fullMenu: Menu = {
			...menu,
			allergens: menuAllergens.map((ma) => ma.allergen),
			ingredients: menuIngredients.map((mi) => mi.ingredient),
			variants: menu.variants.map((variant: any) => ({
				...variant,
				allergens: variant.allergens.map((va: any) => va.allergen),
				ingredients: variant.ingredients.map((vi: any) => vi.ingredient)
			}))
		};

		console.log("Full menu:", JSON.stringify(fullMenu, null, 2));

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
