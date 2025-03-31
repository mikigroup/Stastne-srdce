import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
	try {
		// Načtení alergenů z databáze (pokud jsou uloženy)
		const { data: allergens, error } = await supabase
			.from("allergens")
			.select("*")
			.order("number");

		// Pro případ, že není potřeba načítat z databáze, nebo došlo k chybě,
		// stačí vrátit prázdný objekt a alergeny jsou definovány v komponentě

		if (error) {
			console.error("Chyba při načítání alergenů:", error);
			return {};
		}

		return {
			allergens: allergens || []
		};
	} catch (err) {
		console.error("Chyba při načítání dat:", err);
		return {};
	}
};

// Nastavení pro možnost statického prerenderu
export const prerender = true;
