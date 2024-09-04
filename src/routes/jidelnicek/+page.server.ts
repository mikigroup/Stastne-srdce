import type { PageServerLoad } from "./$types";
import { error } from "@sveltejs/kit";

interface MenuVariant {
	id: string;
	variant_number: string;
	description: string;
	price: number | null;
}

interface Menu {
	id: string;
	date: string | null;
	soup: string | null;
	active: boolean | null;
	notes: string | null;
	type: string | null;
	nutri: string | null;
	variants: MenuVariant[];
}

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
	try {
		const now = new Date();
		let startDate = new Date(
			now.getFullYear(),
			now.getMonth(),
			now.getDate() + 1
		);
		if (now.getHours() >= 17) {
			startDate.setDate(startDate.getDate() + 1);
		}

		const endDate = new Date(startDate);
		endDate.setDate(endDate.getDate() + 27); // 4 týdny od startDate (28 dní - 1)

		const { data: menus, error: menusError } = await supabase
			.from("menus")
			.select(
				`
    id,
    date,
    soup,
    active,
    notes,
    type,
    nutri,
    variants:menu_variants(
      id,
      variant_number,
      description,
      price
    )
  `
			)
			.eq("active", true)
			.gte("date", startDate.toISOString())
			.lte("date", endDate.toISOString())
			.order("date", { ascending: true });

		if (menusError) {
			console.error("Error fetching menus:", menusError);
			throw error(500, "Nepodařilo se načíst menu");
		}

		// Rozdělení menu do týdnů
		const weeks: Menu[][] = [[], [], [], []];
		(menus as Menu[]).forEach((menu) => {
			const menuDate = new Date(menu.date);
			const weekIndex = Math.floor(
				(menuDate.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000)
			);
			if (weekIndex >= 0 && weekIndex < 4) {
				weeks[weekIndex].push(menu);
			}
		});

		return {
			menus: menus as Menu[],
			weeks,
			startDate: startDate.toISOString(),
			endDate: endDate.toISOString()
		};
	} catch (err) {
		console.error("Error in load function:", err);
		throw error(500, "Nastala chyba při načítání dat");
	}
};
