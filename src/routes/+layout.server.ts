import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

type SeoData = {
	global: {
		shopName: string;
		slogan: string;
		defaultDescription: string;
		siteUrl: string;
		legalName: string;
	};
	pages: {
		[key: string]: {
			title?: string;
			description?: string;
		};
	};
};

export const load = (async ({ url, locals: { safeGetSession, supabase } }) => {
	const { session, user } = await safeGetSession();

	if (!user && url.pathname === "/kosik") {
		throw redirect(303, "/prihlaseni?redirect=/kosik");
	}

	const loadSeoData = async (): Promise<SeoData> => {
		try {
			const { data: settings, error } = await supabase
				.from("site_settings")
				.select("*")
				.single();

			if (error || !settings) {
				throw new Error("Nepodařilo se načíst nastavení");
			}

			return {
				global: {
					shopName: settings.shop_name || "Restaurace",
					slogan: settings.slogan || "Dobré jídlo",
					defaultDescription: settings.meta_description || "Popis restaurace",
					siteUrl: url.origin,
					legalName: settings.legal_name || ""
				},
				pages: {
					menu: {
						title: settings.menu_page_title || "Nabídka jídel",
						description: settings.menu_page_description || "Naše denní nabídka"
					},
					kosik: {
						title: "Nákupní košík",
						description: "Váš nákupní košík"
					},
					prihlaseni: {
						title: "Přihlášení",
						description: "Přihlášení do účtu"
					}
					// další stránky podle potřeby...
				}
			};
		} catch (error) {
			console.error("Chyba při načítání SEO dat:", error);
			return {
				global: {
					shopName: "Restaurace",
					slogan: "Dobré jídlo",
					defaultDescription: "Popis restaurace",
					siteUrl: url.origin,
					legalName: ""
				},
				pages: {}
			};
		}
	};

	const seoData = await loadSeoData();

	return {
		session,
		user,
		seo: seoData
	};
}) satisfies LayoutServerLoad;
