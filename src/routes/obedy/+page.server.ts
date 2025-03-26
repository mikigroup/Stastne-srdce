import type { PageServerLoad } from "./$types";
import { error } from "@sveltejs/kit";
import { loadMenu } from "$lib/services/menuService";
import type { Menu } from "$lib/types/menu";

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
	try {
		// Výpočet aktuálního data s kontrolou času
		const now = new Date();
		let currentDate = new Date(
			now.getFullYear(),
			now.getMonth(),
			now.getDate()
		);

		// Pokud je po 17:00, používáme následující den jako aktuální
		if (now.getHours() >= 17) {
			currentDate.setDate(currentDate.getDate() + 1);
		}

		const currentDateStr = currentDate.toISOString().split("T")[0]; // YYYY-MM-DD formát

		// Začneme rovnou načtením verzí s budoucím datem
		const { data: futureVersions, error: versionsError } = await supabase
			.from("menu_versions")
			.select("menu_id, date")
			.gte("date", currentDateStr)
			.is("valid_to", null)
			.is("active", true);

		if (versionsError) {
			throw error(500, "Nepodařilo se najít budoucí menu");
		}

		// Získáme unikátní ID menu z verzí s budoucím datem
		const uniqueMenuIds = [
			...new Set(futureVersions?.map((v) => v.menu_id) || [])
		];

		// Načteme menu s kontrolou, zda nejsou smazaná
		const { data: menus, error: menusError } = await supabase
			.from("menus")
			.select("id")
			.in("id", uniqueMenuIds)
			.eq("deleted", false);

		if (menusError) {
			throw error(500, "Nepodařilo se načíst menu");
		}

		// Pro každé menu načteme kompletní data
		const menuPromises = uniqueMenuIds.map((menuId) =>
			loadMenu(supabase, menuId)
		);
		const loadedMenus = (await Promise.all(menuPromises)).filter(Boolean);

		// Načtení textů a alergenů
		const [textsResult, allergensResult] = await Promise.all([
			supabase.from("texts").select("*").eq("page", "obedy"),
			supabase.from("allergens").select("*").order("number")
		]);

		// Seřazení menu podle data s ošetřením možných null hodnot
		loadedMenus.sort((a, b) => {
			// Pokud některé datum chybí, umístíme ho na konec
			if (!a.date) return 1;
			if (!b.date) return -1;
			return a.date.localeCompare(b.date);
		});

		// Načteme pouze první max. 28 menu (4 týdny x 7 dní)
		const limitedMenus = loadedMenus.slice(0, 28);

		// Rozdělíme menu do skupin po různém počtu položek pro výběr uživatele
		const menuGroups = {
			7: limitedMenus.slice(0, 7), // 1 týden
			14: limitedMenus.slice(0, 14), // 2 týdny
			21: limitedMenus.slice(0, 21), // 3 týdny
			28: limitedMenus // 4 týdny (všechno)
		};

		return {
			menus: limitedMenus,
			menuGroups,
			startDate: currentDate.toISOString(),
			endDate: new Date(
				currentDate.getTime() + 27 * 24 * 60 * 60 * 1000
			).toISOString(),
			texts:
				textsResult.data && textsResult.data.length > 0
					? textsResult.data[0]
					: null,
			allergens: allergensResult.data || []
		};
	} catch (err) {
		console.error("Chyba při načítání jídelníčku:", err);
		throw error(500, "Nastala chyba při načítání dat");
	}
};
