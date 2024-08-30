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
				price: variant.price,
				alergen: variant.alergen,
				ingredient: variant.ingredient
			};
			return map;
		}, {});

		if (!menu) {
			throw error(404, "Menu not found");
		}

		return { menu, variants: variantsMap };
	} catch (err) {
		if (err instanceof Error) {
			console.error("Unexpected error:", err);
			throw error(500, "Unexpected error occurred");
		}
		throw err;
	}
};
