import type { PageServerLoad } from "./$types";
import { error } from "@sveltejs/kit";

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
	try {
		const { data: menus, error: menusError } = await supabase
			.from("menus")
			.select(
				`
        id,
        date,
        soup,
        price,
        active,
        notes,
        type,
        nutri,
        alergens,
        variants:menu_variants(
          id,
          variant_number,
          description
        )
      `
			)
			.order("date", { ascending: true });

		if (menusError) {
			console.error("Error fetching menus:", menusError);
			throw error(500, "Nepodařilo se načíst menu");
		}

		return { menus };
	} catch (err) {
		console.error("Error in load function:", err);
		throw error(500, "Nastala chyba při načítání dat");
	}
};
