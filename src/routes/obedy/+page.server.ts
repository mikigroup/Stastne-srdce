import type { PageServerLoad } from "./$types";
import { error } from "@sveltejs/kit";
import { loadMenu } from "$lib/services/menuService";
import type { Menu } from "$lib/types/menu";

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
	try {
		// Výpočet aktuálního data s kontrolou času
		const now = new Date();
		let currentDate = new Date(now);

		// Pokud je po 17:00, přejdi na další den
		if (now.getHours() >= 17) {
			currentDate.setDate(currentDate.getDate() + 1);
		}

		// Formátování data bez časové zóny (YYYY-MM-DD)
		const currentDateStr = [
			currentDate.getFullYear(),
			String(currentDate.getMonth() + 1).padStart(2, "0"),
			String(currentDate.getDate()).padStart(2, "0")
		].join("-");

		// Načtení verzí menu pouze pro budoucí data (včetně dnešního, pokud je před 17:00)
		const { data: futureVersions, error: versionsError } = await supabase
			.from("menu_versions")
			.select("menu_id, date")
			.gt("date", currentDateStr) // Pouze STRICTLĚ větší než aktuální datum
			.is("valid_to", null)
			.is("active", true)
			.order("date", { ascending: true });

		if (versionsError) {
			throw error(500, "Nepodařilo se najít budoucí menu");
		}

		// Získání unikátních ID menu
		const uniqueMenuIds = [
			...new Set(futureVersions?.map((v) => v.menu_id) || [])
		];

		// Načtení základních informací o menu
		const { data: menus, error: menusError } = await supabase
			.from("menus")
			.select("id")
			.in("id", uniqueMenuIds)
			.eq("deleted", false);

		if (menusError) {
			throw error(500, "Nepodařilo se načíst menu");
		}

		// Načtení kompletních dat menu
		const menuPromises = uniqueMenuIds.map((menuId) =>
			loadMenu(supabase, menuId)
		);

		// Filtrace načtených menu - odstranění null/undefined a menu se starším datem
		const loadedMenus = (await Promise.all(menuPromises))
			.filter(Boolean)
			.filter((menu) => {
				if (!menu.date) return false;
				const menuDate = new Date(menu.date);
				return menuDate >= currentDate;
			});

		// Načtení doplňkových informací
		const [textsResult, allergensResult] = await Promise.all([
			supabase.from("texts").select("*").eq("page", "obedy"),
			supabase.from("allergens").select("*").order("number")
		]);

		// Seřazení menu podle data
		loadedMenus.sort((a, b) => {
			if (!a.date) return 1;
			if (!b.date) return -1;
			return new Date(a.date).getTime() - new Date(b.date).getTime();
		});

		// Omezení na maximálně 28 menu (4 týdny)
		const limitedMenus = loadedMenus.slice(0, 28);

		// Rozdělení menu do skupin
		const menuGroups = {
			7: limitedMenus.slice(0, 7),
			14: limitedMenus.slice(0, 14),
			21: limitedMenus.slice(0, 21),
			28: limitedMenus,
			70: limitedMenus.slice(0, 70)
		};

		return {
			menus: limitedMenus,
			menuGroups,
			startDate: currentDate.toISOString(),
			endDate: new Date(
				currentDate.getTime() + 27 * 24 * 60 * 60 * 1000
			).toISOString(),
			texts: textsResult.data?.[0] || null,
			allergens: allergensResult.data || []
		};
	} catch (err) {
		console.error("Chyba při načítání jídelníčku:", err);
		throw error(500, "Nastala chyba při načítání dat");
	}
};
