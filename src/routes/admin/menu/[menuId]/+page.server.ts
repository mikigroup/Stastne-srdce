import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({
	locals: { supabase },
	params
}) => {
	const id = params.menuId;

	const { data: menu, error: menuError } = await supabase
		.from("menus")
		.select("*")
		.eq("id", id)
		.single();

	if (menuError) {
		console.error("Error fetching menu:", menuError);
		throw menuError;
	}

	const { data: variants, error: variantsError } = await supabase
		.from("menu_variants")
		.select("*")
		.eq("menu_id", id)
		.order("variant_number", { ascending: true });

	if (variantsError) {
		console.error("Error fetching menu variants:", variantsError);
		throw variantsError;
	}

	const variantsMap = variants.reduce((map, variant) => {
		map[variant.variant_number] = variant.description;
		return map;
	}, {});

	return { menu, variants: variantsMap };
};
