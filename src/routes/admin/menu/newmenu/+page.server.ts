import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
	try {
		// Načtení všech alergenů
		const { data: allergens, error: allergensError } = await supabase
			.from("allergens")
			.select("*")
			.order("number");

		if (allergensError) {
			console.error("Error fetching allergens:", allergensError);
			throw error(500, "Failed to load allergens");
		}

		// Načtení všech ingrediencí
		const { data: ingredients, error: ingredientsError } = await supabase
			.from("ingredients")
			.select("*")
			.order("name");

		if (ingredientsError) {
			console.error("Error fetching ingredients:", ingredientsError);
			throw error(500, "Failed to load ingredients");
		}

		return {
			allAllergens: allergens,
			allIngredients: ingredients
		};
	} catch (err) {
		console.error("Unexpected error:", err);
		throw error(500, "An unexpected error occurred");
	}
};
