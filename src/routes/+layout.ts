import {
	createBrowserClient,
	isBrowser
} from "@supabase/ssr";
import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from "$env/static/public";
import type { LayoutLoad } from "./$types";
export const load: LayoutLoad = async ({ data, depends, fetch }) => {
	depends("supabase:auth");

	const settings = {
		general: data.generalSettings,
		contact: data.contactSettings,
		social: data.socialSettings,
		seo: data.seoSettings,
		appearance: data.appearanceSettings
	};

	// Na serveru: žádný Supabase klient (session řeší +layout.server.ts přes hooks).
	// Nastavení se nenačítají znovu v prohlížeči: dotaz bez řádku by přepsal
	// serverová data na null a shodil hlavičku i formuláře.
	if (!isBrowser()) {
		return {
			session: data.session,
			user: data.user,
			supabase: null,
			settings,
			generalSettings: data.generalSettings
		};
	}

	const supabase = createBrowserClient(
		PUBLIC_SUPABASE_URL,
		PUBLIC_SUPABASE_ANON_KEY,
		{
			global: { fetch }
		}
	);

	const {
		data: { session }
	} = await supabase.auth.getSession();

	const {
		data: { user }
	} = await supabase.auth.getUser();

	const safeSession = user ? session : null;

	return {
		session: safeSession,
		supabase,
		user,
		settings,
		generalSettings: data.generalSettings
	};
};
