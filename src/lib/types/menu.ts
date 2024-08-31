import type { Database } from "$lib/database.types";

export type Menu = Database["public"]["Tables"]["menus"]["Row"] & {
	variants: (Database["public"]["Tables"]["menu_variants"]["Row"] & {
		allergens: Database["public"]["Tables"]["allergens"]["Row"][];
		ingredients: Database["public"]["Tables"]["ingredients"]["Row"][];
	})[];
	allergens: Database["public"]["Tables"]["allergens"]["Row"][];
	ingredients: Database["public"]["Tables"]["ingredients"]["Row"][];
};
