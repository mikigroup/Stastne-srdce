import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { getSetting } from "$lib/services/siteSettingsService";
import { getDefaultSettings } from "$lib/constants/defaultSettings";

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
	try {
		// Načtení všech alergenů
		const { data: allergens, error: allergensError } = await supabase
			.from("allergens")
			.select("*")
			.order("number");

		if (allergensError) {
			throw error(500, "Failed to load allergens");
		}

		// Načtení všech ingrediencí
		const { data: ingredients, error: ingredientsError } = await supabase
			.from("ingredients")
			.select("*")
			.order("name");

		if (ingredientsError) {
			throw error(500, "Failed to load ingredients");
		}

		// Načtení products settings s fallback na výchozí hodnoty
		const productsSettings = await getSetting(supabase, 'products') || getDefaultSettings('products');

		return {
			allAllergens: allergens,
			allIngredients: ingredients,
			productsSettings
		};
	} catch (err) {
		throw error(500, "An unexpected error occurred");
	}
};
