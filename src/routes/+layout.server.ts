import type { LayoutServerLoad } from "./$types";
import type { Profile } from "$lib/types/profile";
import { getPublicSettings } from "$lib/services/siteSettingsService";
import { getDefaultSettings } from "$lib/constants/defaultSettings";
import type { AuthUser } from "$lib/types/auth";

function publicUser(user: AuthUser | null): AuthUser | null {
	if (!user) return null;
	return { id: user.id, email: user.email };
}

export const load: LayoutServerLoad = async ({ locals: { session, user, supabase } }) => {
	const publicSessionUser = publicUser(user ?? session?.user ?? null);

	const publicSettings = await getPublicSettings([
		"general",
		"appearance",
		"contact",
		"social",
		"seo"
	]);
	const generalSettings = publicSettings.general || getDefaultSettings("general");
	const appearanceSettings = publicSettings.appearance || getDefaultSettings("appearance");
	const contactSettings = publicSettings.contact || getDefaultSettings("contact");
	const socialSettings = publicSettings.social || getDefaultSettings("social");
	const seoSettings = publicSettings.seo || getDefaultSettings("seo");

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
