import type { PageServerLoad } from "./$types";
import { error } from "@sveltejs/kit";
import type { Menu } from "$lib/types/menu";
import type { Database } from "$lib/database.types";

type Text = Database["public"]["Tables"]["texts"]["Row"];
type Allergen = Database["public"]["Tables"]["allergens"]["Row"];

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

		// Paralelní načtení menu, textů a alergenů
		const [menusResult, textsResult, allergensResult] = await Promise.all([
			supabase
				.from("menus")
				.select(
					`
          id, date, soup, active, notes, type, nutri,
          variants:menu_variants(
            id, variant_number, description, price,
            allergens:variant_allergens(
              allergen:allergens(*)
            )
          ),
          allergens:menu_allergens(
            allergen:allergens(*)
          )
        `
				)
				.eq("active", true)
				.gte("date", startDate.toISOString())
				.lte("date", endDate.toISOString())
				.order("date", { ascending: true }),

			supabase.from("texts").select("*").eq("page", "jidelnicek"),

			supabase.from("allergens").select("*").order("number")
		]);

		// Kontrola chyb při načítání
		if (menusResult.error) {
			console.error("Error fetching menus:", menusResult.error);
			throw error(500, "Nepodařilo se načíst menu");
		}

		if (textsResult.error) {
			console.error("Error fetching texts:", textsResult.error);
			throw error(500, "Nepodařilo se načíst texty");
		}

		if (allergensResult.error) {
			console.error("Error fetching allergens:", allergensResult.error);
			throw error(500, "Nepodařilo se načíst alergeny");
		}

		// Transformace dat do struktury očekávané typem Menu
		const processedMenus = menusResult.data.map((menu) => {
			// Přidáme console.log pro ladění
			// console.log("Menu data structure:", JSON.stringify(menu, null, 2));

			// Zpracování menu
			const processedMenu = {
				...menu,
				// Transformace variant s udržením všech původních vlastností
				variants: (menu.variants || [])
					.map((variant) => {
						// Extrahujeme alergeny z vnořené struktury
						const variantAllergens = (variant.allergens || [])
							.map((wrapper) => {
								// console.log("Variant allergen wrapper:", JSON.stringify(wrapper, null, 2));
								if (wrapper && wrapper.allergen) {
									// Použití dvojitého přetypování přes unknown
									return wrapper.allergen as unknown as Database["public"]["Tables"]["allergens"]["Row"];
								}
								return null;
							})
							.filter(
								(
									allergen
								): allergen is Database["public"]["Tables"]["allergens"]["Row"] =>
									allergen !== null
							);

						// Vrátíme původní variantu se správně typovanými alergeny
						return {
							...variant,
							allergens: variantAllergens,
							ingredients:
								[] as Database["public"]["Tables"]["ingredients"]["Row"][]
						};
					})
					.sort(
						(a, b) => parseInt(a.variant_number) - parseInt(b.variant_number)
					),
				// Transformace alergenů menu
				allergens: (menu.allergens || [])
					.map((wrapper) => {
						// console.log("Menu allergen wrapper:", JSON.stringify(wrapper, null, 2));
						if (wrapper && wrapper.allergen) {
							// Použití dvojitého přetypování přes unknown
							return wrapper.allergen as unknown as Database["public"]["Tables"]["allergens"]["Row"];
						}
						return null;
					})
					.filter(
						(
							allergen
						): allergen is Database["public"]["Tables"]["allergens"]["Row"] =>
							allergen !== null
					),
				// Prázdné pole ingrediencí, které typ Menu očekává
				ingredients: [] as Database["public"]["Tables"]["ingredients"]["Row"][]
			};

			return processedMenu;
		});

		// Přetypování na Menu[] - tento krok je nutný pro plnou typovou kompatibilitu
		const transformedMenus = processedMenus as unknown as Menu[];

		const texts = textsResult.data as Text[];
		const allAllergens = allergensResult.data as Allergen[];

		// Rozdělení menu do týdnů
		const weeks: Menu[][] = [[], [], [], []];
		transformedMenus.forEach((menu) => {
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
			menus: transformedMenus,
			weeks,
			startDate: startDate.toISOString(),
			endDate: endDate.toISOString(),
			texts: texts.length > 0 ? texts[0] : null,
			allergens: allAllergens
		};
	} catch (err) {
		console.error("Error in load function:", err);
		throw error(500, "Nastala chyba při načítání dat");
	}
};
