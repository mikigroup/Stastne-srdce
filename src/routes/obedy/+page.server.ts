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

		// Nejprve získáme všechna platná menu v daném časovém rozsahu
		const { data: validMenus, error: menusError } = await supabase
			.from("menus")
			.select("id")
			.eq("active", true)
			.gte("date", startDate.toISOString())
			.lte("date", endDate.toISOString());

		if (menusError) {
			throw error(500, "Nepodařilo se načíst základní menu");
		}

		// Pro každé menu získáme jeho aktuální verzi
		const menuPromises = validMenus.map(async (menu) => {
			// Zde voláme funkci get_current_menu_version
			const { data: versionData, error: versionError } = await supabase.rpc(
				"get_current_menu_version",
				{ p_menu_id: menu.id }
			);

			if (versionError) {
				console.error(
					`Error getting current version for menu ${menu.id}:`,
					versionError
				);
				return null;
			}

			const versionId = versionData;

			// Pokud jsme získali ID verze, načteme kompletní data
			if (versionId) {
				const { data: menuVersionData, error: menuVersionError } =
					await supabase
						.from("menu_versions")
						.select(
							`
            id, date, soup, active, notes, type, nutri,
            menu_id,
            menu:menus!inner(*),
            variants:menu_variants(
              id, variant_number, description, price,
              allergens:variant_allergens(
                allergen:allergens(*)
              )
            )
          `
						)
						.eq("id", versionId)
						.single();

				if (menuVersionError) {
					console.error(
						`Error loading menu version ${versionId}:`,
						menuVersionError
					);
					return null;
				}

				return menuVersionData;
			}

			return null;
		});

		// Počkáme na dokončení všech dotazů
		const menuVersionsResults = await Promise.all(menuPromises);

		// Odfiltrujeme null hodnoty
		const menuVersions = menuVersionsResults.filter((menu) => menu !== null);

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

		// Transformace dat do struktury očekávané typem Menu
		const processedMenus = menuVersions.map((menuVersion) => {
			// Přidáme potřebná data z původního menu
			const processedMenu = {
				id: menuVersion.menu_id,
				date: menuVersion.date,
				soup: menuVersion.soup,
				active: menuVersion.active,
				notes: menuVersion.notes,
				type: menuVersion.type,
				nutri: menuVersion.nutri,
				// Transformace variant s udržením všech původních vlastností
				variants: (menuVersion.variants || [])
					.map((variant) => {
						// Extrahujeme alergeny z vnořené struktury
						const variantAllergens = (variant.allergens || [])
							.map((wrapper) => {
								if (wrapper && wrapper.allergen) {
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
				// Prázdné hodnoty pro alergeny a ingredience menu
				allergens: [] as Database["public"]["Tables"]["allergens"]["Row"][],
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

		// Seřadíme menu podle data
		transformedMenus.sort((a, b) => {
			if (!a.date || !b.date) return 0;
			return new Date(a.date).getTime() - new Date(b.date).getTime();
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
