import { redirect } from "@sveltejs/kit";
import { DEFAULT_SETTINGS, type AllSettings } from "$lib/settingsService";
import type { LayoutServerLoad } from "./$types";

export const load = (async ({ url, locals: { safeGetSession, supabase } }) => {
	// Načtení session a uživatele
	const { session, user } = await safeGetSession();
	// Přesměrování pokud není uživatel a jde o košík
	if (!user && url.pathname === "/kosik") {
		throw redirect(303, "/prihlaseni?redirect=/kosik"); // 303 pro GET request + přidáme redirect URL
	}

	// Načtení nastavení
	const loadSettings = async (): Promise<AllSettings> => {
		try {
			const { data, error } = await supabase
				.from("site_settings")
				.select("key, value");

			if (error) throw error;

			if (!data) return DEFAULT_SETTINGS;

			return data.reduce(
				(acc, item) => {
					const key = item.key as keyof AllSettings;
					if (key in acc) {
						return {
							...acc,
							[key]: {
								...DEFAULT_SETTINGS[key],
								...item.value
							}
						};
					}
					return acc;
				},
				{ ...DEFAULT_SETTINGS }
			);
		} catch (error) {
			console.error("Chyba při načítání nastavení:", error);
			return DEFAULT_SETTINGS;
		}
	};

	const settings = await loadSettings();

	return {
		session,
		user,
		settings,
		generalSettings: settings.general,
		seoSettings: settings.seo,
		contactSettings: settings.contact,
		test: "TEST"
	};
}) satisfies LayoutServerLoad;
