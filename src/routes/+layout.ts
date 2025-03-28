import {
	createBrowserClient,
	createServerClient,
	isBrowser,
	parse
} from "@supabase/ssr";
// import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from "$env/static/public";
// import { PRIVATE_SBKey, PRIVATE_SBUrl } from "$env/static/private";
import { DEFAULT_SETTINGS, type AllSettings } from "$lib/settingsService";
import type { LayoutLoad } from "./$types";

export const load: LayoutLoad = async ({ data, depends, fetch }) => {
	depends("supabase:auth");

	const supabase = isBrowser()
		? createBrowserClient(
				import.meta.env.VITE_PRIVATE_SBUrl,
				import.meta.env.VITE_PRIVATE_SBKey,
				{
					global: {
						fetch
					},
					cookies: {
						get(key) {
							const cookie = parse(document.cookie);
							return cookie[key];
						}
					}
				}
			)
		: createServerClient(
				import.meta.env.VITE_PRIVATE_SBUrl,
				import.meta.env.VITE_PRIVATE_SBKey,
				{
					global: {
						fetch
					},
					cookies: {
						get() {
							return JSON.stringify(data.session);
						}
					}
				}
			);

	const {
		data: { session }
	} = await supabase.auth.getSession();

	const {
		data: { user }
	} = await supabase.auth.getUser();

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
		supabase,
		user,
		settings,
		generalSettings: settings.general,
		seoSettings: settings.seo,
		contactSettings: settings.contact
	};
};
