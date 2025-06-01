import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";
import type { Profile } from "$lib/types/profile";

export const load: LayoutServerLoad = async ({ url, locals: { safeGetSession, supabase } }) => {
	const { session, user } = await safeGetSession();

	if (session && user) {
		// Kontrola dokončené registrace
		const { data: profile } = await supabase
			.from("profiles")
			.select("registration_status")
			.eq("id", user.id)
			.single();

		// Pokud registrace není dokončena a uživatel není na stránce dokončení registrace
		if (profile?.registration_status !== "completed" && !url.pathname.startsWith('/signup/complete')) {
			throw redirect(303, '/signup/complete');
		}

		return {
			session,
			user,
			profile: profile as Profile
		};
	}

	return {
		session,
		user: null,
		profile: null
	};
};
