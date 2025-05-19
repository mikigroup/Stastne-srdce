import type { Database } from "$lib/types/database.types";

export type MenuAllergen = Database["public"]["Tables"]["allergens"]["Row"];
export type MenuIngredient = Database["public"]["Tables"]["ingredients"]["Row"];

export type MenuVariant =
	Database["public"]["Tables"]["menu_variants"]["Row"] & {
		allergens: (MenuAllergen | null)[];
		ingredients: (MenuIngredient | null)[];
	};

export type Menu = Database["public"]["Tables"]["menus"]["Row"] & {
	variants: MenuVariant[];
	allergens: (MenuAllergen | null)[];
	ingredients?: (MenuIngredient | null)[];
};
