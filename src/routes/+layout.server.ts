import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";
import type { Profile } from "$lib/types/profile";
import { getSetting } from "$lib/services/siteSettingsService";
import { getDefaultSettings } from "$lib/constants/defaultSettings";
import { getRegistrationStatus } from "$lib/services/registrationStatusService";

export const load: LayoutServerLoad = async ({ url, locals: { safeGetSession, supabase } }) => {
	const { session, user } = await safeGetSession();

	// Načteme společná nastavení pro všechny stránky
	const [generalSettings, appearanceSettings] = await Promise.all([
		getSetting(supabase, 'general').then(data => data || getDefaultSettings('general')),
		getSetting(supabase, 'appearance').then(data => data || getDefaultSettings('appearance'))
	]);

	if (session && user) {
		// Kontrola dokončené registrace pomocí globální služby (bez auto-update pro performance)
		const registrationStatus = await getRegistrationStatus(supabase, user.id, user.email);
		
		// Pokud registrace není dokončena a uživatel není na stránce dokončení registrace
		if (!registrationStatus.isComplete && url.pathname !== '/signup/complete' && !url.pathname.startsWith('/signup/complete/')) {
			throw redirect(303, '/signup/complete');
		}

		// Načteme celý profil pro return
		const { data: profile } = await supabase
			.from("profiles")
			.select("*")
			.eq("id", user.id)
			.single();

		return {
			session,
			user,
			profile: profile as Profile,
			generalSettings,
			appearanceSettings
		};
	}

	return {
		session,
		user: null,
		profile: null,
		generalSettings,
		appearanceSettings
	};
};
