import type { PageServerLoad } from "./$types";
import { error } from "@sveltejs/kit";
import { loadMenu } from "$lib/services/menuService";
import type { Menu } from "$lib/types/menu";

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
	try {
		console.log("============== ZAČÁTEK NAČÍTÁNÍ MENU ==============");

		// Výpočet aktuálního data s kontrolou času
		const now = new Date();
		console.log(`Systémový čas: ${now.toISOString()}`);

		let currentDate = new Date(
			now.getFullYear(),
			now.getMonth(),
			now.getDate()
		);

		const currentHour = now.getHours();
		console.log(`Aktuální hodina: ${currentHour}`);

		// Pokud je po 17:00, používáme následující den jako aktuální
		if (currentHour >= 17) {
			console.log("Je po 17:00, posouvám datum na další den");
			currentDate.setDate(currentDate.getDate() + 1);
		}

		const currentDateStr = currentDate.toISOString().split("T")[0]; // YYYY-MM-DD formát
		console.log(`Aktuální datum pro menu: ${currentDateStr}`);

		// Přímé vyhledání menu s verzemi, které mají budoucí datum
		// Použijeme SQL dotaz, který spojí tabulky menus a menu_versions
		const { data, error: menuError } = await supabase.rpc(
			"get_future_menu_ids",
			{ current_date: currentDateStr }
		);

		if (menuError) {
			console.error("Chyba při vyhledávání budoucích menu:", menuError);
			throw error(500, "Nepodařilo se najít budoucí menu");
		}

		// Pokud RPC funkce neexistuje, použijte tento kód:
		/*
		const { data, error: menuError } = await supabase
			.from('menu_versions')
			.select('menu_id')
			.gte('date', currentDateStr)
			.is('valid_to', null)
			.eq('active', true);
		*/

		const menuIds = data || [];
		console.log(`Nalezeno ${menuIds.length} menu s budoucími daty:`, menuIds);

		// Pro každé menu načteme detailní data
		const menuPromises = menuIds.map((item) =>
			loadMenu(supabase, item.menu_id)
		);
		const loadedMenus = (await Promise.all(menuPromises)).filter(Boolean);

		console.log(
			`Úspěšně načteno ${loadedMenus.length} menu z ${menuIds.length}`
		);

		// Načtení textů a alergenů
		const [textsResult, allergensResult] = await Promise.all([
			supabase.from("texts").select("*").eq("page", "jidelnicek"),
			supabase.from("allergens").select("*").order("number")
		]);

		// Rozdělení menu do týdnů
		const weeks: Menu[][] = [[], [], [], []];

		// Seřazení menu podle data
		loadedMenus.sort((a, b) => a.date.localeCompare(b.date));

		if (loadedMenus.length <= 4) {
			loadedMenus.forEach((menu, index) => {
				weeks[index].push(menu);
			});
		} else {
			const menusPerWeek = Math.ceil(loadedMenus.length / 4);
			loadedMenus.forEach((menu, index) => {
				const weekIndex = Math.min(Math.floor(index / menusPerWeek), 3);
				weeks[weekIndex].push(menu);
			});
		}

		return {
			menus: loadedMenus,
			weeks,
			startDate: currentDate.toISOString(),
			endDate: new Date(
				currentDate.getTime() + 27 * 24 * 60 * 60 * 1000
			).toISOString(),
			texts: textsResult.data.length > 0 ? textsResult.data[0] : null,
			allergens: allergensResult.data
		};
	} catch (err) {
		console.error("Error in load function:", err);
		throw error(500, "Nastala chyba při načítání dat");
	}
};
