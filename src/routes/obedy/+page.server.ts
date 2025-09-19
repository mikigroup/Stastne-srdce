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
			currentTimeISO: now.toISOString(),
			originalDate: currentDate.toLocaleDateString('cs-CZ')
		});
		
		let isNextDayMenu = false;
		let menuStatus = 'dnešní den';
		
		if (nextDayMenuEnabled) {
			// Parsování času z nastavení (např. "17:00")
			const [hours, minutes] = nextDayMenuTime.split(':').map(Number);
			const nextDayThreshold = new Date(now);
			nextDayThreshold.setHours(hours, minutes, 0, 0);
			
			console.log('🍽️ Obědy - Porovnání časů:', {
				currentTime: now.toLocaleTimeString('cs-CZ'),
				currentTimeISO: now.toISOString(),
				thresholdTime: nextDayThreshold.toLocaleTimeString('cs-CZ'),
				thresholdTimeISO: nextDayThreshold.toISOString(),
				shouldShowNextDay: now < nextDayThreshold,
				timeDifference: now.getTime() - nextDayThreshold.getTime(),
				timeDifferenceMinutes: Math.round((now.getTime() - nextDayThreshold.getTime()) / (1000 * 60))
			});
			
			// Pokud je aktuální čas před nastaveným časem, zobrazíme menu pro další den (lze objednat)
			// Po nastaveném čase už se menu pro další den nezobrazuje (nelze objednat) - zobrazujeme pozítří
			if (now < nextDayThreshold) {
				currentDate.setDate(currentDate.getDate() + 1);
				isNextDayMenu = true;
				menuStatus = 'zítřejší den (lze objednat)';
				console.log('🍽️ Obědy - Zobrazuji menu pro další den (lze objednat):', currentDate.toLocaleDateString('cs-CZ'));
			} else {
				currentDate.setDate(currentDate.getDate() + 2);
				isNextDayMenu = false;
				menuStatus = 'pozítří (objednávky na zítřek uzavřeny)';
				console.log('🍽️ Obědy - Zobrazuji menu pro pozítří (objednávky na zítřek uzavřeny):', currentDate.toLocaleDateString('cs-CZ'));
			}
		} else {
			console.log('🍽️ Obědy - Funkce zobrazení menu pro další den je vypnuta');
		}

		// Výpočet koncového data (větší rozsah pro nalezení dostatečného počtu menu)
		const searchRangeDays = Math.max(visibleDays * 2, 100);
		const endDate = new Date(currentDate);
		endDate.setDate(endDate.getDate() + searchRangeDays - 1);

		// Načtení verzí menu
		console.log('🍽️ Obědy - Hledám menu od:', formatDate(currentDate), 'do:', formatDate(endDate));
		const { data: futureVersions, error: versionsError } = await supabase
			.from("menu_versions")
			.select("menu_id, date")
			.gte("date", formatDate(currentDate))
			.lte("date", formatDate(endDate))
			.is("valid_to", null)
			.is("active", true)
			.order("date", { ascending: true });

		if (versionsError) {
			console.error('❌ Chyba při načítání verzí menu:', versionsError);
			throw error(500, "Nepodařilo se najít budoucí menu");
		}
		
		console.log('🍽️ Obědy - Nalezené verze menu:', futureVersions?.length || 0);

		// Získání unikátních ID menu a načtení kompletních dat
		const uniqueMenuIds = [...new Set(futureVersions?.map((v) => v.menu_id) || [])];
		console.log('🍽️ Obědy - Nalezená menu ID:', uniqueMenuIds);
		console.log('🍽️ Obědy - Počet menu k načtení:', uniqueMenuIds.length);
		
		const menuPromises = uniqueMenuIds.map((menuId) => loadMenu(supabase, menuId));
		const allLoadedMenusResults = await Promise.allSettled(menuPromises);
		
		// Zpracování výsledků - úspěšné menu
		const allLoadedMenus = allLoadedMenusResults
			.filter(result => result.status === 'fulfilled')
			.map(result => result.value)
			.filter(Boolean);
		
		// Zpracování chyb pro debugování
		const failedMenus = allLoadedMenusResults
			.filter(result => result.status === 'rejected')
			.map(result => result.reason);
		
		// Detailní logování pro každé menu
		allLoadedMenusResults.forEach((result, index) => {
			const menuId = uniqueMenuIds[index];
			if (result.status === 'fulfilled') {
				console.log(`✅ Menu ${menuId}: načteno úspěšně`);
			} else {
				console.error(`❌ Menu ${menuId}: chyba -`, result.reason);
			}
		});
		
		if (failedMenus.length > 0) {
			console.warn(`⚠️ Nepodařilo se načíst ${failedMenus.length} menu:`, failedMenus);
			console.warn(`📊 Statistiky načítání: ${allLoadedMenus.length}/${uniqueMenuIds.length} menu načteno úspěšně`);
		} else {
			console.log(`✅ Všechna menu načtena úspěšně: ${allLoadedMenus.length}/${uniqueMenuIds.length}`);
		}
		
		// Filtrace, seřazení a omezení
		const loadedMenus = allLoadedMenus
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

		console.log('🍽️ Obědy - Výsledek načítání:', {
			menuStatus,
			isNextDayMenu,
			startDate: currentDate.toLocaleDateString('cs-CZ'),
			loadedMenusCount: loadedMenus.length,
			firstMenuDate: loadedMenus[0]?.date,
			lastMenuDate: loadedMenus[loadedMenus.length - 1]?.date,
			failedMenusCount: failedMenus.length
		});

		return {
			menus: loadedMenus,
			visibleDays,
			texts: textsResult.data?.[0] || null,
			allergens: allergensResult.data || [],
			productsSettings: {
				...(productsSettings || {}),
				nextDayMenuEnabled,
				nextDayMenuTime,
				isNextDayMenu,
				menuStatus
			},
			loadingStats: {
				totalRequested: uniqueMenuIds.length,
				successfullyLoaded: allLoadedMenus.length,
				failed: failedMenus.length
			}
		};
	} catch (err) {
		console.error("Chyba při načítání jídelníčku:", err);
		throw error(500, "Nastala chyba při načítání dat");
	}
};
