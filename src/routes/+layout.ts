import {
	createBrowserClient,
	createServerClient,
	isBrowser,
	parse
} from "@supabase/ssr";
import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from "$env/static/public";
// import { PRIVATE_SBKey, PRIVATE_SBUrl } from "$env/static/private";
import { loadSettings } from "$lib/settingsService";
import type { LayoutLoad } from "./$types";

export const load: LayoutLoad = async ({ data, depends, fetch, url }) => {
	depends("supabase:auth");

	const supabase = isBrowser()
		? createBrowserClient(
				PUBLIC_SUPABASE_URL,
				PUBLIC_SUPABASE_ANON_KEY,
				{
					global: {
						fetch
					},
					cookies: {
						get(key) {
							const cookie = parse(document.cookie);
							return cookie[key];
						}
					},
					auth: {
						persistSession: true,
						autoRefreshToken: true,
						detectSessionInUrl: true
					}
				}
			)
		: createServerClient(
				PUBLIC_SUPABASE_URL,
				PUBLIC_SUPABASE_ANON_KEY,
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

	// Nejdříve získáme session
	const {
		data: { session }
	} = await supabase.auth.getSession();

	// Bezpečné ověření uživatele - kontaktuje Auth server pro ověření autenticity
	const {
		data: { user }
	} = await supabase.auth.getUser();

	// Použijeme session pouze pokud user je ověřený
	const safeSession = user ? session : null;

	// Načtení nastavení s optimalizovaným cachováním a pouze pro aktuální stránku
	const settings = await loadSettings(supabase, url.pathname, !!user);

	return {
		session: safeSession,
		supabase,
		user,
		settings,
		generalSettings: settings.general
	};
};
