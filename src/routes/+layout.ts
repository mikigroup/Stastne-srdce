import { createBrowserClient, isBrowser } from "@supabase/ssr";
import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from "$env/static/public";
import type { LayoutLoad } from "./$types";
import type { AuthUser } from "$lib/types/auth";

function publicUser(user: AuthUser | null | undefined): AuthUser | null {
	if (!user?.id) return null;
	return { id: user.id, email: user.email };
}

export const load: LayoutLoad = async ({ data, depends, fetch }) => {
	depends("supabase:auth");

	const settings = {
		general: data.generalSettings,
		contact: data.contactSettings,
		social: data.socialSettings,
		seo: data.seoSettings,
		appearance: data.appearanceSettings
	};

	const user = publicUser(data.user);
	const session = user ? { user } : null;

	if (!isBrowser()) {
		return {
			session,
			user,
			supabase: null,
			settings,
			generalSettings: data.generalSettings
		};
	}

	const supabase = createBrowserClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
		global: { fetch }
	});

	return {
		session,
		user,
		supabase,
		settings,
		generalSettings: data.generalSettings
	};
};
