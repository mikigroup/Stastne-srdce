import type { PageServerLoad } from "./$types";
import { error } from "@sveltejs/kit";
import { loadMenu } from "$lib/services/menuService";
import { getSetting } from "$lib/services/siteSettingsService";
import type { Menu } from "$lib/types/menu";

// Helper funkce pro formátování data
function formatDate(date: Date): string {
	return [
		date.getFullYear(),
		String(date.getMonth() + 1).padStart(2, "0"),
		String(date.getDate()).padStart(2, "0")
	].join("-");
}

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
	try {
		// Načtení nastavení produktů
		const productsSettings = await getSetting(supabase, 'products');
		const visibleDays = productsSettings?.visibleDays || 7;

		// Výpočet startovního data (po 17:00 = další den)
		const now = new Date();
		const currentDate = new Date(now);
		if (now.getHours() >= 17) {
			currentDate.setDate(currentDate.getDate() + 1);
		}

		// Výpočet koncového data (větší rozsah pro nalezení dostatečného počtu menu)
		const searchRangeDays = Math.max(visibleDays * 2, 100);
		const endDate = new Date(currentDate);
		endDate.setDate(endDate.getDate() + searchRangeDays - 1);

		// Načtení verzí menu
		const { data: futureVersions, error: versionsError } = await supabase
			.from("menu_versions")
			.select("menu_id, date")
			.gte("date", formatDate(currentDate))
			.lte("date", formatDate(endDate))
			.is("valid_to", null)
			.is("active", true)
			.order("date", { ascending: true });

		if (versionsError) {
			throw error(500, "Nepodařilo se najít budoucí menu");
		}

		// Získání unikátních ID menu a načtení kompletních dat
		const uniqueMenuIds = [...new Set(futureVersions?.map((v) => v.menu_id) || [])];
		const menuPromises = uniqueMenuIds.map((menuId) => loadMenu(supabase, menuId));
		const allLoadedMenus = await Promise.all(menuPromises);
		
		// Filtrace, seřazení a omezení
		const loadedMenus = allLoadedMenus
			.filter(Boolean)
			.sort((a, b) => {
				if (!a.date || !b.date) return 0;
				return new Date(a.date).getTime() - new Date(b.date).getTime();
			})
			.slice(0, visibleDays);

		// Načtení doplňkových informací
		const [textsResult, allergensResult] = await Promise.all([
			supabase.from("texts").select("*").eq("page", "obedy"),
			supabase.from("allergens").select("*").order("number")
		]);

		return {
			menus: loadedMenus,
			visibleDays,
			texts: textsResult.data?.[0] || null,
			allergens: allergensResult.data || []
		};
	} catch (err) {
		console.error("Chyba při načítání jídelníčku:", err);
		throw error(500, "Nastala chyba při načítání dat");
	}
};
