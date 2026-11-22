import type { LayoutServerLoad } from "./$types";
import type { Profile } from "$lib/types/profile";
import { getSetting } from "$lib/services/siteSettingsService";
import { getDefaultSettings } from "$lib/constants/defaultSettings";
import type { AuthUser } from "$lib/types/auth";

function publicUser(user: AuthUser | null): AuthUser | null {
	if (!user) return null;
	return { id: user.id, email: user.email };
}

export const load: LayoutServerLoad = async ({ locals: { session, user, supabase } }) => {
	const publicSessionUser = publicUser(user ?? session?.user ?? null);

	// Načteme společná nastavení pro všechny stránky
	const [generalSettings, appearanceSettings, contactSettings, socialSettings, seoSettings] = await Promise.all([
		getSetting(supabase, 'general').then(data => data || getDefaultSettings('general')),
		getSetting(supabase, 'appearance').then(data => data || getDefaultSettings('appearance')),
		getSetting(supabase, 'contact').then(data => data || getDefaultSettings('contact')),
		getSetting(supabase, 'social').then(data => data || getDefaultSettings('social')),
		getSetting(supabase, 'seo').then(data => data || getDefaultSettings('seo'))
	]);

	if (publicSessionUser) {
		const { data: profile } = await supabase
			.from("profiles")
			.select("*")
			.eq("id", publicSessionUser.id)
			.single();

		return {
			session: { user: publicSessionUser },
			user: publicSessionUser,
			profile: profile as Profile,
			generalSettings,
			appearanceSettings,
			contactSettings,
			socialSettings,
			seoSettings
		};
	}

	return {
		session: null,
		user: null,
		profile: null,
		generalSettings,
		appearanceSettings,
		contactSettings,
		socialSettings,
		seoSettings
	};
};
