// $lib/services/menuService.ts
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
 * Načte menu včetně variant, alergenů a ingrediencí.
 */
export async function loadMenu(
	supabase: SupabaseClient<Database>,
	menuId: string
) {
	try {
		// 1. Nejprve získáme aktuální verzi menu
		const { data: currentVersionId, error: versionError } = await supabase.rpc(
			"get_current_menu_version",
			{ p_menu_id: menuId }
		);

		if (versionError) {
			console.error("Chyba při získávání aktuální verze menu:", versionError);
			throw versionError;
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

		// 3. Načteme varianty z aktuální verze menu
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
			.eq("menu_version_id", currentVersionId);

		if (variantsError) {
			console.error("Chyba při načítání variant menu:", variantsError);
			throw variantsError;
		}

		// 4. Formátování dat pro snadnější práci v UI
		const formattedMenu = {
			...menu,
			allergens: menu.allergens?.map((a) => a.allergen) || [],
			variants:
				variants.map((v) => ({
					...v,
					allergens: v.allergens?.map((a) => a.allergen) || [],
					ingredients: v.ingredients?.map((i) => i.ingredient) || []
				})) || []
		};

		return formattedMenu;
	} catch (error) {
		console.error("Nečekaná chyba při načítání menu:", error);
		throw error;
	}
}
