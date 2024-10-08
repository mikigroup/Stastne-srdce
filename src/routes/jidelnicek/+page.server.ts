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

interface Text {
	id: number;
	title: string | null;
	text: string | null;
	page: string | null;
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

		const [menusResult, textsResult] = await Promise.all([
			supabase
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
				.order("date", { ascending: true }),

			supabase.from("texts").select("*").eq("page", "jidelnicek").single()
		]);

		if (menusResult.error) {
			console.error("Error fetching menus:", menusResult.error);
			throw error(500, "Nepodařilo se načíst menu");
		}

		if (textsResult.error) {
			console.error("Error fetching texts:", textsResult.error);
			throw error(500, "Nepodařilo se načíst texty");
		}

		const menus = menusResult.data as Menu[];
		const texts = textsResult.data as Text[];

		// Rozdělení menu do týdnů
		const weeks: Menu[][] = [[], [], [], []];
		menus.forEach((menu) => {
			const menuDate = new Date(menu.date);
			const weekIndex = Math.floor(
				(menuDate.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000)
			);
			if (weekIndex >= 0 && weekIndex < 4) {
				weeks[weekIndex].push(menu);
			}
		});

		return {
			menus,
			weeks,
			startDate: startDate.toISOString(),
			endDate: endDate.toISOString(),
			texts: texts || ""
		};
	} catch (err) {
		console.error("Error in load function:", err);
		throw error(500, "Nastala chyba při načítání dat");
	}
};
