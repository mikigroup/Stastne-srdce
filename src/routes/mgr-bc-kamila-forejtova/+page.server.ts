import type { PageServerLoad } from "./$types";
import { getSetting } from "$lib/services/siteSettingsService";

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
	try {
		// Načtení general settings pro název obchodu
		const generalSettings = await getSetting(supabase, 'general');
		
		return {
			generalSettings
		};
	} catch (err) {
		console.error("Chyba při načítání dat:", err);
		return {
			generalSettings: null
		};
	}
};

export const prerender = true;
