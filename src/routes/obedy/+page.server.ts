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
		const nextDayMenuEnabled = productsSettings?.nextDayMenuEnabled ?? true;
		const nextDayMenuTime = productsSettings?.nextDayMenuTime || '17:00';

		// Výpočet startovního data podle nastavení
		const now = new Date();
		const currentDate = new Date(now);
		
		console.log('🍽️ Obědy - Nastavení zobrazení menu:', {
			nextDayMenuEnabled,
			nextDayMenuTime,
			currentTime: now.toLocaleTimeString('cs-CZ'),
			originalDate: currentDate.toLocaleDateString('cs-CZ')
		});
		
		if (nextDayMenuEnabled) {
			// Parsování času z nastavení (např. "17:00")
			const [hours, minutes] = nextDayMenuTime.split(':').map(Number);
			const nextDayThreshold = new Date(now);
			nextDayThreshold.setHours(hours, minutes, 0, 0);
			
			console.log('🍽️ Obědy - Porovnání časů:', {
				currentTime: now.toLocaleTimeString('cs-CZ'),
				thresholdTime: nextDayThreshold.toLocaleTimeString('cs-CZ'),
				shouldShowNextDay: now >= nextDayThreshold
			});
			
			// Pokud je aktuální čas po nastaveném čase, zobrazíme menu pro další den
			if (now >= nextDayThreshold) {
				currentDate.setDate(currentDate.getDate() + 1);
				console.log('🍽️ Obědy - Zobrazuji menu pro další den:', currentDate.toLocaleDateString('cs-CZ'));
			} else {
				console.log('🍽️ Obědy - Zobrazuji menu pro dnešní den:', currentDate.toLocaleDateString('cs-CZ'));
			}
		} else {
			console.log('🍽️ Obědy - Funkce zobrazení menu pro další den je vypnuta');
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
			allergens: allergensResult.data || [],
			productsSettings: {
				...(productsSettings || {}),
				nextDayMenuEnabled,
				nextDayMenuTime
			}
		};
	} catch (err) {
		console.error("Chyba při načítání jídelníčku:", err);
		throw error(500, "Nastala chyba při načítání dat");
	}
};
