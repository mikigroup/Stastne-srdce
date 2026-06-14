import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";
import type { Profile } from "$lib/types/profile";
import { getSetting } from "$lib/services/siteSettingsService";
import { getDefaultSettings } from "$lib/constants/defaultSettings";
import { getRegistrationStatus } from "$lib/services/registrationStatusService";
import { ROUTES } from "$lib/constants/routes";

export const load: LayoutServerLoad = async ({ url, locals: { safeGetSession, supabase } }) => {
	const { session, user } = await safeGetSession();

	// Načteme společná nastavení pro všechny stránky
	const [generalSettings, appearanceSettings, contactSettings, socialSettings, seoSettings] = await Promise.all([
		getSetting(supabase, 'general').then(data => data || getDefaultSettings('general')),
		getSetting(supabase, 'appearance').then(data => data || getDefaultSettings('appearance')),
		getSetting(supabase, 'contact').then(data => data || getDefaultSettings('contact')),
		getSetting(supabase, 'social').then(data => data || getDefaultSettings('social')),
		getSetting(supabase, 'seo').then(data => data || getDefaultSettings('seo'))
	]);

	if (session && user) {
		// Kontrola dokončené registrace pomocí globální služby (bez auto-update pro performance)
		const registrationStatus = await getRegistrationStatus(supabase, user.id, user.email);
		
		// Pokud registrace není dokončena a uživatel není na stránce dokončení registrace
		if (!registrationStatus.isComplete && url.pathname !== ROUTES.AUTH.SIGNUP_COMPLETE && !url.pathname.startsWith(ROUTES.AUTH.SIGNUP_COMPLETE + '/')) {
			// Pokud je status 'pending' a profil neexistuje, znamená to, že uživatel čeká na potvrzení emailu
			// Nepřesměrovávat na /complete, ale nechat uživatele na aktuální stránce
			if (registrationStatus.actualStatus === 'pending' && registrationStatus.validationResult.missingFields.includes('Profil nenalezen - dokončete registraci')) {
				console.log('ℹ️ [LAYOUT] User waiting for email confirmation, not redirecting to /complete');
				// Necháme uživatele pokračovat - bude vidět informaci o potvrzení emailu
			} else {
				// Pro ostatní případy (incomplete_data nebo pending s existujícím profilem) přesměrovat na /complete
				console.log('🔄 [LAYOUT] Redirecting to /complete for user with incomplete registration');
				throw redirect(303, ROUTES.AUTH.SIGNUP_COMPLETE);
			}
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
			appearanceSettings,
			contactSettings,
			socialSettings,
			seoSettings
		};
	}

	return {
		session,
		user: null,
		profile: null,
		generalSettings,
		appearanceSettings,
		contactSettings,
		socialSettings,
		seoSettings
	};
};
