import type { PageServerLoad } from "./$types";
import { error } from "@sveltejs/kit";
import { loadMenu } from "$lib/services/menuService";
import { getSetting } from "$lib/services/siteSettingsService";
import { readShortCache, writeShortCache } from "$lib/server/shortCache";
import { PUBLIC_TENANT } from "$env/static/public";

type LoadedMenu = NonNullable<Awaited<ReturnType<typeof loadMenu>>>;

type ObedyPage = {
	menus: LoadedMenu[];
	visibleDays: number;
	texts: { text?: string | null } | null;
	allergens: unknown[];
	productsSettings: {
		nextDayMenuEnabled: boolean;
		nextDayMenuTime: string;
		isNextDayMenu: boolean;
		menuStatus: string;
	};
	loadingStats: {
		totalRequested: number;
		successfullyLoaded: number;
		failed: number;
	};
};

export const prerender = false;

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
		
		
		let isNextDayMenu = false;
		let menuStatus = 'dnešní den';
		
		if (nextDayMenuEnabled) {
			// Parsování času z nastavení (např. "17:00")
			const [hours, minutes] = nextDayMenuTime.split(':').map(Number);
			const nextDayThreshold = new Date(now);
			nextDayThreshold.setHours(hours, minutes, 0, 0);
			
			
			// Pokud je aktuální čas před nastaveným časem, zobrazíme menu pro další den (lze objednat)
			// Po nastaveném čase už se menu pro další den nezobrazuje (nelze objednat) - zobrazujeme pozítří
			if (now < nextDayThreshold) {
				currentDate.setDate(currentDate.getDate() + 1);
				isNextDayMenu = true;
				menuStatus = 'zítřejší den (lze objednat)';
			} else {
				currentDate.setDate(currentDate.getDate() + 2);
				isNextDayMenu = false;
				menuStatus = 'pozítří (objednávky na zítřek uzavřeny)';
			}
		}

		const cacheKey = `obedy:${PUBLIC_TENANT}:${formatDate(currentDate)}`;
		const cached = readShortCache<ObedyPage>(cacheKey);
		if (cached) return cached;

		// Výpočet koncového data (větší rozsah pro nalezení dostatečného počtu menu)
		const searchRangeDays = Math.max(visibleDays * 2, 100);
		const endDate = new Date(currentDate);
		endDate.setDate(endDate.getDate() + searchRangeDays - 1);

		// Načtení menu podle data verze místo data menu
		const { data: futureMenus, error: menusError } = await supabase
			.from("menu_versions")
			.select("menu_id, date")
			.gte("date", formatDate(currentDate))
			.eq("active", true)
			.lte("date", formatDate(endDate))
			.is("valid_to", null) // ← Pouze neukončené verze (nejaktuálnější)
			.order("date", { ascending: true });

		if (menusError) {
			console.error('❌ Chyba při načítání menu:', menusError);
			throw error(500, "Nepodařilo se najít budoucí menu");
		}
		

		// Získání unikátních ID menu a načtení kompletních dat
		const uniqueMenuIds = futureMenus?.map((m) => m.menu_id) || [];

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
		
		allLoadedMenusResults.forEach((result, index) => {
			const menuId = uniqueMenuIds[index];
			if (result.status === 'fulfilled') {
				if (!result.value) {
					console.warn(`⚠️ Menu ${menuId}: vráceno null (není dostupné pro tenant)`);
				}
			} else {
				console.error(`❌ Menu ${menuId}: chyba -`, result.reason);
			}
		});

		if (failedMenus.length > 0) {
			console.warn(`⚠️ Nepodařilo se načíst ${failedMenus.length} menu:`, failedMenus);
			console.warn(`📊 Statistiky načítání: ${allLoadedMenus.length}/${uniqueMenuIds.length} menu načteno úspěšně`);
		}
		
		// Filtrace, seřazení a omezení
		const loadedMenus = allLoadedMenus
			.sort((a, b) => {
				if (!a?.date || !b?.date) return 0;
				return new Date(a.date).getTime() - new Date(b.date).getTime();
			})
			.slice(0, visibleDays);

		// Načtení doplňkových informací s tenant ID filtrací
		const [textsResult, allergensResult] = await Promise.all([
			supabase.from("texts").select("*").eq("page", "obedy").eq("tenant_id", PUBLIC_TENANT),
			supabase.from("allergens").select("*").order("number")
		]);


		return writeShortCache<ObedyPage>(cacheKey, {
			menus: loadedMenus.flatMap((menu) => (menu ? [menu] : [])),
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
		});
	} catch (err) {
		console.error("Chyba při načítání jídelníčku:", err);
		throw error(500, "Nastala chyba při načítání dat");
	}
};
