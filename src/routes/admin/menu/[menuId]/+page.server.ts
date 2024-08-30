import { redirect, error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({
	locals: { supabase },
	params
}) => {
	const id = params.menuId;

	try {
		const { data: menu, error: menuError } = await supabase
			.from("menus")
			.select("*")
			.eq("id", id)
			.single();

		if (menuError) {
			console.error("Error fetching menu:", menuError);
			throw error(500, "Failed to fetch menu");
		}

		const { data: variants, error: variantsError } = await supabase
			.from("menu_variants")
			.select("*")
			.eq("menu_id", id)
			.order("variant_number", { ascending: true });

		if (variantsError) {
			console.error("Error fetching menu variants:", variantsError);
			throw error(500, "Failed to fetch menu variants");
		}

		const variantsMap = variants.reduce((map, variant) => {
			map[variant.variant_number] = {
				id: variant.id,
				description: variant.description,
				price: variant.price
			};
			return map;
		}, {});

		// Načtení názvů alergenů
		const { data: allergens, error: allergensError } = await supabase
			.from("allergens")
			.select("id, name");

		if (allergensError) {
			console.error("Error fetching allergens:", allergensError);
			throw error(500, "Failed to fetch allergens");
		}

		const allergenNames = allergens.reduce((map, allergen) => {
			map[allergen.id] = allergen.name;
			return map;
		}, {});

		// Načtení názvů ingrediencí
		const { data: ingredients, error: ingredientsError } = await supabase
			.from("ingredients")
			.select("id, name");

		if (ingredientsError) {
			console.error("Error fetching ingredients:", ingredientsError);
			throw error(500, "Failed to fetch ingredients");
		}

		const ingredientNames = ingredients.reduce((map, ingredient) => {
			map[ingredient.id] = ingredient.name;
			return map;
		}, {});

		return {
			menu: {
				...menu,
				variants: variantsMap
			},
			allergenNames,
			ingredientNames
		};
	} catch (err) {
		if (err instanceof Error) {
			console.error("Unexpected error:", err);
			throw error(500, "Unexpected error occurred");
		}
		throw err;
	}
};
