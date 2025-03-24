import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "$lib/database.types";

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
				p_soup: menuData.soup,
				p_active: menuData.active,
				p_notes: menuData.notes,
				p_type: menuData.type,
				p_nutri: menuData.nutri
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
		console.log(`Načítání menu pro ID: ${menuId}`);

		// 1. Nejprve získáme aktuální verzi menu
		const { data: currentVersionId, error: versionError } = await supabase.rpc(
			"get_current_menu_version",
			{ p_menu_id: menuId }
		);

		if (versionError) {
			console.error("Chyba při získávání aktuální verze menu:", versionError);
			throw versionError;
		}

		console.log(`Aktuální verze menu: ${currentVersionId}`);

		// Ošetření případu, kdy není vrácena žádná verze menu
		let versionId = currentVersionId;
		let isNewVersion = false;

		if (!versionId) {
			console.warn(
				`Pro menu ${menuId} nebyla nalezena žádná verze, vytvářím novou...`
			);

			// Získáme základní data menu
			const { data: menuData, error: menuDataError } = await supabase
				.from("menus")
				.select("*")
				.eq("id", menuId)
				.single();

			if (menuDataError) {
				console.error("Chyba při načítání menu dat:", menuDataError);
				throw menuDataError;
			}

			// Vytvoříme novou verzi
			const newVersionId = await createMenuVersion(supabase, {
				id: menuId,
				date: menuData.date || new Date().toISOString(), // Zajištění, že date není null
				soup: menuData.soup || "",
				active: menuData.active === null ? false : menuData.active,
				notes: menuData.notes || "",
				type: menuData.type || "",
				nutri: menuData.nutri || ""
			});

			versionId = newVersionId;
			isNewVersion = true;
			console.log("Vytvořena nová verze menu s ID:", versionId);
		}

		// 2. Načteme samotné menu
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
			.single();

		if (menuError) {
			console.error("Chyba při načítání menu:", menuError);
			throw menuError;
		}

		// 3. Načteme verzi menu pro získání aktuálních dat
		const { data: currentVersion, error: currentVersionError } = await supabase
			.from("menu_versions")
			.select("*")
			.eq("id", versionId)
			.single();

		if (currentVersionError) {
			console.error(
				"Chyba při načítání aktuální verze menu:",
				currentVersionError
			);
			throw currentVersionError;
		}

		// 4. Načteme varianty
		console.log(
			`Načítání variant pro menu_id: ${menuId}, menu_version_id: ${versionId}`
		);

		let finalVariants = [];

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
			.eq("menu_version_id", versionId)
			.order("variant_number");

		console.log(
			"SQL dotaz na varianty:",
			JSON.stringify({
				table: "menu_variants",
				filters: {
					menu_id: menuId,
					menu_version_id: versionId
				}
			})
		);

		if (variantsError) {
			console.error("Chyba při načítání variant menu:", variantsError);
			throw variantsError;
		}

		// console.log(`Načteno ${variants?.length || 0} variant:`, variants);

		finalVariants = variants || [];

		// Pokud varianty nejsou nalezeny, zkusme načíst varianty bez filtru na verzi
		if (!variants || variants.length === 0) {
			console.log(
				"Žádné varianty nenalezeny s verzí, zkouším načíst všechny varianty pro toto menu"
			);

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
				console.error(
					"Chyba při načítání všech variant menu:",
					allVariantsError
				);
			} else {
				console.log(
					`Nalezeno ${allVariants?.length || 0} variant bez filtru na verzi:`,
					allVariants
				);

				// Pokud existují varianty, ale nemají správnou verzi, aktualizujme je
				if (allVariants && allVariants.length > 0) {
					console.log(
						`Aktualizuji verzi pro ${allVariants.length} variant na ${versionId}`
					);

					for (const variant of allVariants) {
						const { error: updateError } = await supabase
							.from("menu_variants")
							.update({ menu_version_id: versionId })
							.eq("id", variant.id);

						if (updateError) {
							console.error(
								`Chyba při aktualizaci varianty ${variant.id}:`,
								updateError
							);
						}
					}

					// Znovu načteme varianty s aktuální verzí
					const { data: updatedVariants, error: updatedVariantsError } =
						await supabase
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
							.eq("menu_version_id", versionId)
							.order("variant_number");

					if (updatedVariantsError) {
						console.error(
							"Chyba při načítání aktualizovaných variant:",
							updatedVariantsError
						);
					} else {
						console.log(
							`Načteno ${updatedVariants?.length || 0} aktualizovaných variant:`,
							updatedVariants
						);
						finalVariants = updatedVariants || [];
					}
				}
			}
		}

		// 5. Formátování dat - použití údajů z aktuální verze
		const formattedMenu = {
			...menu,
			// Použijeme data z aktuální verze
			date: currentVersion.date,
			soup: currentVersion.soup,
			active: currentVersion.active,
			notes: currentVersion.notes,
			type: currentVersion.type,
			nutri: currentVersion.nutri,
			allergens: menu.allergens?.map((a) => a.allergen) || [],
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
		console.log("Vracím formátované menu:", formattedMenu);
		return formattedMenu;
	} catch (error) {
		console.error("Nečekaná chyba při načítání menu:", error);
		throw error;
	}
}

export async function loadMenuList(
	supabase: SupabaseClient<Database>,
	options: {
		page?: number;
		itemsPerPage?: number;
		searchQuery?: string;
		sort?: "date_desc" | "date_asc";
	} = {}
) {
	try {
		// Výchozí nastavení
		const {
			page = 1,
			itemsPerPage = 20,
			searchQuery = "",
			sort = "date_desc"
		} = options;

		// Začátek a konec rozsahu pro stránkování
		const start = (page - 1) * itemsPerPage;
		const end = start + itemsPerPage - 1;

		// Základní dotaz pro načtení menu
		let query = supabase
			.from("menu_versions")
			.select(
				`
                *,
                menu:menus(id),
                variants:menu_variants(
                    id,
                    variant_number,
                    description
                )
            `,
				{ count: "exact" }
			)
			.order("date", { ascending: sort === "date_asc" });

		// Přidání fulltextového vyhledávání, pokud je zadán search query
		if (searchQuery) {
			query = query.or(
				`soup.ilike.%${searchQuery}%,` +
					`notes.ilike.%${searchQuery}%,` +
					`variants.description.ilike.%${searchQuery}%`
			);
		}

		// Stránkování
		query = query.range(start, end);

		// Provedení dotazu
		const { data, count, error } = await query;

		if (error) {
			console.error("Chyba při načítání seznamu menu:", error);
			throw error;
		}

		// Formátování výsledků
		const formattedMenus = data.map((version) => ({
			id: version.menu.id,
			date: version.date,
			soup: version.soup,
			active: version.active,
			notes: version.notes,
			type: version.type,
			nutri: version.nutri,
			variants: version.variants.map((variant) => ({
				id: variant.id,
				variant_number: variant.variant_number,
				description: variant.description
			}))
		}));

		return {
			menus: formattedMenus,
			totalItems: count || 0,
			currentPage: page,
			totalPages: Math.ceil((count || 0) / itemsPerPage)
		};
	} catch (error) {
		console.error("Nečekaná chyba při načítání seznamu menu:", error);
		throw error;
	}
}
