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
			.is("valid_to", null); // Pouze aktivní verze

		if (versionsError) {
			throw error(500, "Nepodařilo se najít budoucí menu");
		}

		// Získáme unikátní ID menu z verzí s budoucím datem
		const uniqueMenuIds = [
			...new Set(futureVersions?.map((v) => v.menu_id) || [])
		];

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

		// ===== UPRAVENÁ LOGIKA PRO ROZDĚLENÍ MENU DO TÝDNŮ =====

		// Rozdělíme menu do týdnů po 7 dnech (počínaje aktuálním datem)
		const weeks: Menu[][] = [[], [], [], []];

		// Vytvoříme hraniční data pro rozdělení týdnů
		const weekBoundaries: Date[] = [];
		let tempDate = new Date(currentDate);

		// Vytvoříme hraniční data pro 4 týdny
		for (let i = 0; i < 4; i++) {
			weekBoundaries.push(new Date(tempDate));
			tempDate.setDate(tempDate.getDate() + 7);
		}
		// Přidáme ještě jedno hraniční datum pro poslední týden
		weekBoundaries.push(new Date(tempDate));

		// Rozdělíme menu do příslušných týdnů
		for (const menu of loadedMenus) {
			if (!menu.date) continue;

			const menuDate = new Date(menu.date);

			// Najdeme správný týden pro toto menu
			for (let i = 0; i < 4; i++) {
				if (menuDate >= weekBoundaries[i] && menuDate < weekBoundaries[i + 1]) {
					weeks[i].push(menu);
					break;
				}
			}
		}

		return {
			menus: loadedMenus,
			weeks: weeks,
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
