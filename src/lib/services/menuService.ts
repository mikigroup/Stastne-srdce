import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "$lib/types/database.types";
import { PUBLIC_TENANT } from "$env/static/public";

// Definice typů pro práci s menu
export type MenuAllergen = Database["public"]["Tables"]["allergens"]["Row"];
export type MenuIngredient = Database["public"]["Tables"]["ingredients"]["Row"];

export type MenuVariant =
	Database["public"]["Tables"]["menu_variants"]["Row"] & {
		allergens: MenuAllergen[];
		ingredients: MenuIngredient[];
	};

export type Menu = Database["public"]["Tables"]["menus"]["Row"] & {
	variants: MenuVariant[];
	allergens: MenuAllergen[];
};

/**
 * Vytvoří novou verzi menu v databázi.
 */
export async function createMenuVersion(
	supabase: SupabaseClient<Database>,
	menuData: {
		id: string;
		date: string;
		soup: string | null;
		active: boolean | null;
		notes: string | null;
		type: string | null;
		nutri: string | null;
	}
) {
	try {
		const { data: versionId, error } = await supabase.rpc(
			"create_menu_version",
			{
				p_menu_id: menuData.id,
				p_date: menuData.date,
				p_soup: menuData.soup || "",
				p_active: menuData.active || false,
				p_notes: menuData.notes || "",
				p_type: menuData.type || "",
				p_nutri: menuData.nutri || ""
			}
		);

		if (error) {
			console.error("Chyba při vytváření nové verze menu:", error);
			throw error;
		}

		return versionId;
	} catch (error) {
		console.error("Nečekaná chyba při vytváření verze menu:", error);
		throw error;
	}
}

/**
 * Získá ID aktuální verze menu pro danou variantu.
 */
export async function getCurrentMenuVersionForVariant(
	supabase: SupabaseClient<Database>,
	variantId: string
) {
	try {
		// Nejprve zjistíme, ke kterému menu patří varianta
		const { data: variant, error: variantError } = await supabase
			.from("menu_variants")
			.select("menu_id, menu_version_id")
			.eq("id", variantId)
			.single();

		if (variantError) {
			console.error("Chyba při získávání informací o variantě:", variantError);
			return null;
		}

		// Pokud má varianta již přiřazenou verzi menu, vrátíme ji
		if (variant.menu_version_id) {
			return variant.menu_version_id;
		}

		// Jinak získáme aktuální verzi menu pomocí RPC funkce
		const { data: versionId, error: versionError } = await supabase.rpc(
			"get_current_menu_version",
			{ p_menu_id: variant.menu_id }
		);

		if (versionError) {
			console.error("Chyba při získávání aktuální verze menu:", versionError);
			return null;
		}

		return versionId;
	} catch (error) {
		console.error("Nečekaná chyba při získávání verze menu:", error);
		return null;
	}
}

/**
 * Vytvoří novou variantu menu pro danou verzi menu.
 */
export async function createMenuVariant(
	supabase: SupabaseClient<Database>,
	variant: {
		menu_id: string;
		menu_version_id: string;
		variant_number: string;
		description: string;
		price: number | null;
		vegetarian: boolean | null;
	}
) {
	try {
		const { data: insertedVariant, error } = await supabase
			.from("menu_variants")
			.insert(variant)
			.select()
			.single();

		if (error) {
			console.error("Chyba při vytváření varianty menu:", error);
			throw error;
		}

		return insertedVariant;
	} catch (error) {
		console.error("Nečekaná chyba při vytváření varianty menu:", error);
		throw error;
	}
}

/**
 * Přidá alergeny k menu.
 */
export async function updateMenuAllergens(
	supabase: SupabaseClient<Database>,
	menuId: string,
	allergenIds: number[]
) {
	try {
		// Nejprve smažeme existující alergeny
		const { error: deleteError } = await supabase
			.from("menu_allergens")
			.delete()
			.eq("menu_id", menuId);

		if (deleteError) {
			console.error("Chyba při mazání alergenů menu:", deleteError);
			throw deleteError;
		}

		// Pokud máme alergeny k přidání
		if (allergenIds.length > 0) {
			const allergensToInsert = allergenIds.map((id) => ({
				menu_id: menuId,
				allergen_id: id
			}));

			const { error: insertError } = await supabase
				.from("menu_allergens")
				.insert(allergensToInsert);

			if (insertError) {
				console.error("Chyba při vkládání alergenů menu:", insertError);
				throw insertError;
			}
		}

		return true;
	} catch (error) {
		console.error("Nečekaná chyba při aktualizaci alergenů menu:", error);
		throw error;
	}
}

/**
 * Přidá alergeny k variantě menu.
 */
export async function updateVariantAllergens(
	supabase: SupabaseClient<Database>,
	variantId: string,
	allergenIds: number[]
) {
	try {
		// Nejprve smažeme existující alergeny
		const { error: deleteError } = await supabase
			.from("variant_allergens")
			.delete()
			.eq("variant_id", variantId);

		if (deleteError) {
			console.error("Chyba při mazání alergenů varianty:", deleteError);
			throw deleteError;
		}

		// Pokud máme alergeny k přidání
		if (allergenIds.length > 0) {
			const allergensToInsert = allergenIds.map((id) => ({
				variant_id: variantId,
				allergen_id: id
			}));

			const { error: insertError } = await supabase
				.from("variant_allergens")
				.insert(allergensToInsert);

			if (insertError) {
				console.error("Chyba při vkládání alergenů varianty:", insertError);
				throw insertError;
			}
		}

		return true;
	} catch (error) {
		console.error("Nečekaná chyba při aktualizaci alergenů varianty:", error);
		throw error;
	}
}

/**
 * Přidá ingredience k variantě menu.
 */
export async function updateVariantIngredients(
	supabase: SupabaseClient<Database>,
	variantId: string,
	ingredientIds: number[]
) {
	try {
		// Nejprve smažeme existující ingredience
		const { error: deleteError } = await supabase
			.from("variant_ingredients")
			.delete()
			.eq("variant_id", variantId);

		if (deleteError) {
			console.error("Chyba při mazání ingrediencí varianty:", deleteError);
			throw deleteError;
		}

		// Pokud máme ingredience k přidání
		if (ingredientIds.length > 0) {
			const ingredientsToInsert = ingredientIds.map((id) => ({
				variant_id: variantId,
				ingredient_id: id
			}));

			const { error: insertError } = await supabase
				.from("variant_ingredients")
				.insert(ingredientsToInsert);

			if (insertError) {
				console.error("Chyba při vkládání ingrediencí varianty:", insertError);
				throw insertError;
			}
		}

		return true;
	} catch (error) {
		console.error(
			"Nečekaná chyba při aktualizaci ingrediencí varianty:",
			error
		);
		throw error;
	}
}

/**
 * Načte menu včetně variant, alergenů a ingrediencí z aktuální verze menu.
 */
export async function loadMenu(
	supabase: SupabaseClient<Database>,
	menuId: string
) {
	try {
		console.log(`🔄 Načítání menu pro ID: ${menuId}`);
		
		// Debug: Zkontrolovat tenant context (pokud existuje RPC funkce)
		// const { data: tenantContext } = await supabase.rpc('get_current_tenant');
		// console.log(`🏢 Aktuální tenant context:`, tenantContext);

		// 1. Nejprve získáme aktuální verzi menu
		const { data: currentVersionId, error: versionError } = await supabase.rpc(
			"get_current_menu_version",
			{ p_menu_id: menuId }
		);

		if (versionError) {
			console.error(`❌ Chyba při získávání aktuální verze menu ${menuId}:`, versionError);
			// Místo throw error, vrátíme null - menu se přeskočí
			return null;
		}

		console.log(`📋 Aktuální verze menu ${menuId}: ${currentVersionId}`);

		// 2. Načteme samotné menu (s alergeny)
		console.log(`🔍 Načítání menu ${menuId} z databáze...`);
		
		const { data: menu, error: menuError } = await supabase
			.from("menus")
			.select(
				`
        *,
        allergens:menu_allergens(
          allergen:allergens(*)
        )
      `
			)
			.eq("id", menuId)
			.eq("tenant_id", PUBLIC_TENANT) // ← Filtrovat podle tenant_id v aplikaci
			.single();

		// Error handling pro menu
		if (menuError) {
			console.error(`❌ Chyba při načítání menu ${menuId}:`, menuError);
			return null;
		}

		if (!menu) {
			console.warn(`⚠️ Menu s ID ${menuId} nebylo nalezeno`);
			return null;
		}

		// 3. Pokud menu nemá verzi, použijeme data přímo z menu tabulky
		let currentVersion = null;
		
		if (!currentVersionId) {
			console.warn(`⚠️ Menu ${menuId} nemá žádnou verzi - použiji data přímo z menu tabulky`);
			// Použijeme data přímo z menu tabulky
			currentVersion = {
				date: menu.date,
				soup: menu.soup,
				active: menu.active,
				notes: menu.notes,
				type: menu.type,
				nutri: menu.nutri
			};
		} else {
			// 4. Načteme verzi menu pro získání aktuálních dat
			const { data: versionData, error: currentVersionError } = await supabase
				.from("menu_versions")
				.select("*")
				.eq("id", currentVersionId)
				.single();

			if (currentVersionError) {
				console.error(
					`❌ Chyba při načítání aktuální verze menu ${menuId}:`,
					currentVersionError
				);
				// Místo throw error, vrátíme null - menu se přeskočí
				return null;
			}
			
			currentVersion = versionData;
		}

		// 5. Načteme varianty
		console.log(
			`🍽️ Načítání variant pro menu_id: ${menuId}, menu_version_id: ${currentVersionId || 'žádná verze'}`
		);

		let finalVariants = [];

		// Pokud menu má verzi, načteme varianty pro tuto verzi
		if (currentVersionId) {
			const { data: variants, error: variantsError } = await supabase
				.from("menu_variants")
				.select(
					`
          *,
          allergens:variant_allergens(
            allergen:allergens(*)
          ),
          ingredients:variant_ingredients(
            ingredient:ingredients(*)
          )
        `
				)
				.eq("menu_id", menuId)
				.eq("menu_version_id", currentVersionId)
				.order("variant_number");

			if (variantsError) {
				console.error(`❌ Chyba při načítání variant menu ${menuId}:`, variantsError);
				// Místo throw error, vrátíme null - menu se přeskočí
				return null;
			}

			finalVariants = variants || [];
		} else {
			// Pokud menu nemá verzi, zkusíme načíst všechny varianty pro toto menu
			console.log(`Menu ${menuId} nemá verzi - zkouším načíst všechny varianty`);
			
			const { data: allVariants, error: allVariantsError } = await supabase
				.from("menu_variants")
				.select(
					`
          *,
          allergens:variant_allergens(
            allergen:allergens(*)
          ),
          ingredients:variant_ingredients(
            ingredient:ingredients(*)
          )
        `
				)
				.eq("menu_id", menuId)
				.order("variant_number");

			if (allVariantsError) {
				console.error(`❌ Chyba při načítání všech variant menu ${menuId}:`, allVariantsError);
				// Místo throw error, vrátíme null - menu se přeskočí
				return null;
			}

			finalVariants = allVariants || [];
		}

		// 6. Formátování dat - použití údajů z aktuální verze nebo přímo z menu
		const formattedMenu = {
			...(menu || {}),
			// Použijeme data z aktuální verze
			date: currentVersion.date,
			soup: currentVersion.soup,
			active: currentVersion.active,
			notes: currentVersion.notes,
			type: currentVersion.type,
			nutri: currentVersion.nutri,
			allergens: menu?.allergens?.map((a) => a.allergen) || [],
			variants:
				finalVariants
					.map((v) => ({
						...v,
						allergens: v.allergens?.map((a) => a.allergen) || [],
						ingredients: v.ingredients?.map((i) => i.ingredient) || []
					}))
					.sort((a, b) => {
						const aNum = parseInt(a.variant_number);
						const bNum = parseInt(b.variant_number);
						return aNum - bNum;
					}) || []
		};
		console.log(`✅ Menu ${menuId} úspěšně načteno s ${finalVariants.length} variantami`);
		return formattedMenu;
	} catch (error) {
		console.error(`❌ Nečekaná chyba při načítání menu ${menuId}:`, error);
		// Místo throw error, vrátíme null - menu se přeskočí
		return null;
	}
}

export async function loadMenuList(
	supabase: SupabaseClient<Database>,
	options: {
		page?: number;
		itemsPerPage?: number;
		searchQuery?: string;
		sort?: "date_desc" | "date_asc";
		showDeleted?: boolean;
	} = {}
) {
	try {
		// Výchozí nastavení
		const {
			page = 1,
			itemsPerPage = 50,
			searchQuery = "",
			sort = "date_desc",
			showDeleted = false
		} = options;

		console.log(`--- Načítání menu - stránka ${page} ---`);
		console.log(`Parametry:`, {
			itemsPerPage,
			searchQuery,
			sort,
			showDeleted
		});

		// Základní dotaz pro nalezení všech relevantních menu - BEZ STRÁNKOVÁNÍ
		let baseQuery = supabase.from("menus").select("*");

		// Přidání filtru pro deleted sloupec
		if (!showDeleted) {
			baseQuery = baseQuery.eq("deleted", false);
		}

		// Přidání fulltextového vyhledávání, pokud je zadán search query
		if (searchQuery) {
			console.log(`Provádím vyhledávání pro: ${searchQuery}`);

			// Nejdřív získáme všechny menu_id z variant, které obsahují hledaný text
			const { data: variantResults } = await supabase
				.from("menu_variants")
				.select("menu_id")
				.ilike("description", `%${searchQuery}%`);

			const menuIds = variantResults?.map((v) => v.menu_id) || [];
			console.log(`Nalezená menu_id z variant:`, menuIds);

			// Pak vytvoříme podmínku pro vyhledávání
			if (menuIds.length > 0) {
				baseQuery = baseQuery.or(
					`id.in.(${menuIds.join(",")}),soup.ilike.%${searchQuery}%`
				);
			} else {
				baseQuery = baseQuery.ilike("soup", `%${searchQuery}%`);
			}
		}

		// Načteme VŠECHNA menu odpovídající filtru bez stránkování
		const { data: allMenus, error: menusError } = await baseQuery;

		if (menusError) {
			console.error("Error fetching menus:", menusError);
			throw menusError;
		}

		console.log(`Celkový počet načtených menu: ${allMenus.length}`);

		// Pro každé menu načteme aktuální verzi pomocí RPC funkce
		const menusWithVersions = await Promise.all(
			allMenus.map(async (menu) => {
				try {
					// Použijeme RPC funkci pro získání aktuální verze menu
					const { data: versionId, error: versionError } = await supabase.rpc(
						"get_current_menu_version",
						{ p_menu_id: menu.id }
					);

					if (versionError || versionId === null) {
						console.warn(`Nenalezena verze pro menu ${menu.id}`);
						return {
							...menu,
							variants: [],
							currentVersion: null
						};
					}

					// Načteme data aktuální verze menu
					const { data: versionData, error: versionDataError } = await supabase
						.from("menu_versions")
						.select("*")
						.eq("id", versionId)
						.single();

					if (versionDataError) {
						console.error(
							`Chyba načítání dat verze pro menu ${menu.id}:`,
							versionDataError
						);
						return {
							...menu,
							variants: [],
							currentVersion: null
						};
					}

					// Získáme varianty pro aktuální verzi
					const { data: variants, error: variantsError } = await supabase
						.from("menu_variants")
						.select("id, description, variant_number")
						.eq("menu_id", menu.id)
						.eq("menu_version_id", versionId)
						.order("variant_number");

					if (variantsError) {
						console.error(
							`Chyba načítání variant pro menu ${menu.id}:`,
							variantsError
						);
					}

					return {
						...menu,
						date: versionData.date,
						soup: versionData.soup || menu.soup,
						active: versionData.active ?? menu.active,
						notes: versionData.notes || menu.notes,
						type: versionData.type || menu.type,
						nutri: versionData.nutri || menu.nutri,
						variants: variants || [],
						currentVersion: versionData
					};
				} catch (error) {
					console.error(`Nečekaná chyba zpracování menu ${menu.id}:`, error);
					return {
						...menu,
						variants: [],
						currentVersion: null
					};
				}
			})
		);

		// Seřadit všechna menu podle nových dat z verzí
		menusWithVersions.sort((a, b) => {
			// Ošetřit případy, kdy datum chybí
			if (!a.date) return 1;
			if (!b.date) return -1;

			// Převést řetězce data na objekty Date pro správné porovnání
			const dateA = new Date(a.date);
			const dateB = new Date(b.date);

			// Seřadit podle parametru sort
			return options.sort === "date_asc"
				? dateA.getTime() - dateB.getTime()
				: dateB.getTime() - dateA.getTime();
		});

		const totalItems = menusWithVersions.length;
		const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
		const startIndex = (page - 1) * itemsPerPage;
		const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
		const paginatedMenus = menusWithVersions.slice(startIndex, endIndex);

		return {
			menus: paginatedMenus,
			totalItems,
			currentPage: page,
			totalPages,
			itemsPerPage,
			itemsOnCurrentPage: paginatedMenus.length
		};
	} catch (error) {
		console.error("Nečekaná chyba při načítání seznamu menu:", error);
		throw error;
	}
}
