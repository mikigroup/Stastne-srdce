import {
	createBrowserClient,
	isBrowser
} from "@supabase/ssr";
import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from "$env/static/public";
import type { LayoutLoad } from "./$types";
import { getSetting } from '$lib/services/siteSettingsService';

export const load: LayoutLoad = async ({ data, depends, fetch }) => {
	depends("supabase:auth");

	// Na serveru: žádný Supabase klient (session řeší +layout.server.ts přes hooks)
	if (!isBrowser()) {
		return {
			session: data.session,
			user: data.user,
			supabase: null,
			settings: {
				general: data.generalSettings,
				contact: data.contactSettings,
				social: data.socialSettings,
				seo: data.seoSettings,
				appearance: data.appearanceSettings
			},
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

	const generalSettings = await getSetting(supabase, 'general');
	const contactSettings = await getSetting(supabase, 'contact');
	const socialSettings = await getSetting(supabase, 'social');
	const seoSettings = await getSetting(supabase, 'seo');
	const appearanceSettings = await getSetting(supabase, 'appearance');

	return {
		session: safeSession,
		supabase,
		user,
		settings: {
			general: generalSettings,
			contact: contactSettings,
			social: socialSettings,
			seo: seoSettings,
			appearance: appearanceSettings
		},
		generalSettings: generalSettings
	};
};
