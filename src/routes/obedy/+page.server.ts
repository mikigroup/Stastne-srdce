import type { PageServerLoad } from "./$types";
import { error } from "@sveltejs/kit";
import type { Menu } from "$lib/types/menu";
import type { Database } from "$lib/database.types";

type Text = Database["public"]["Tables"]["texts"]["Row"];
type Allergen = Database["public"]["Tables"]["allergens"]["Row"];

import { loadMenu } from "$lib/services/menuService";

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
	try {
		// Výpočet datumového rozsahu pro menu
		const now = new Date();
		let startDate = new Date(
			now.getFullYear(),
			now.getMonth(),
			now.getDate() + 1
		);

		// Pokud je po 17:00, začínáme od následujícího dne
		if (now.getHours() >= 17) {
			startDate.setDate(startDate.getDate() + 1);
		}

		const endDate = new Date(startDate);
		endDate.setDate(endDate.getDate() + 27); // 4 týdny od startDate

		// Nejprve získáme všechna platná menu v daném časovém rozsahu
		const { data: validMenus, error: menusError } = await supabase
			.from("menus")
			.select("id, date")
			.eq("active", true)
			.gte("date", startDate.toISOString())
			.lte("date", endDate.toISOString())
			.order("date", { ascending: true });

		if (menusError) {
			throw error(500, "Nepodařilo se načíst základní menu");
		}

		console.log("Nalezená menu:", validMenus);

		// Pro každé menu načteme kompletní data
		const menuPromises = validMenus.map((menu) => loadMenu(supabase, menu.id));
		const menus = await Promise.all(menuPromises);

		// Paralelní načtení textů a alergenů
		const [textsResult, allergensResult] = await Promise.all([
			supabase.from("texts").select("*").eq("page", "jidelnicek"),
			supabase.from("allergens").select("*").order("number")
		]);

		// Kontrola chyb při načítání
		if (textsResult.error) {
			console.error("Error fetching texts:", textsResult.error);
			throw error(500, "Nepodařilo se načíst texty");
		}

		if (allergensResult.error) {
			console.error("Error fetching allergens:", allergensResult.error);
			throw error(500, "Nepodařilo se načíst alergeny");
		}

		// Rozdělení menu do týdnů
		const weeks: Menu[][] = [[], [], [], []];
		menus.forEach((menu) => {
			if (menu.date) {
				const menuDate = new Date(menu.date);
				const weekIndex = Math.floor(
					(menuDate.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000)
				);
				if (weekIndex >= 0 && weekIndex < 4) {
					weeks[weekIndex].push(menu);
				}
			} else {
				console.warn(`Menu s id ${menu.id} nemá nastavené datum.`);
			}
		});

		// Vrácení zpracovaných dat
		return {
			menus,
			weeks,
			startDate: startDate.toISOString(),
			endDate: endDate.toISOString(),
			texts: textsResult.data.length > 0 ? textsResult.data[0] : null,
			allergens: allergensResult.data
		};
	} catch (err) {
		console.error("Error in load function:", err);
		throw error(500, "Nastala chyba při načítání dat");
	}
};
