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

type SEOData = {
	title: string;
	author: string;
	description: string;
	keywords: string;
	copyright: string;
	ogTitle: string;
	ogDescription: string;
	url: string;
	twitterTitle: string;
	twitterDescription: string;
	googleAnalyticsId?: string;
};

export const load: LayoutLoad = async ({ data, depends, fetch, url }) => {
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
		contactSettings: settings.contact,
		seo: {
			title: `${settings.general.shopName} - ${settings.general.slogan}`,
			author: settings.general.legalName,
			description: settings.seo.metaDescription,
			keywords: settings.seo.metaKeywords,
			copyright: settings.general.legalName,
			ogTitle: settings.seo.ogTitle || settings.seo.metaTitle,
			ogDescription: settings.seo.ogDescription || settings.seo.metaDescription,
			url: url.origin,
			twitterTitle: settings.seo.twitterTitle || settings.seo.metaTitle,
			twitterDescription:
				settings.seo.twitterDescription || settings.seo.metaDescription,
			googleAnalyticsId: settings.seo.googleAnalyticsId
		} as SEOData
	};
};
