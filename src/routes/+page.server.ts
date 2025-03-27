export const prerender = "auto";
export const trailingSlash = "always";

import { fail, redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({
	locals: { supabase },
	parent
}) => {
	// Získání dat z parent layoutu
	const { test, session, user, generalSettings } = await parent();

	// Načtení textů
	const { data: texts } = await supabase
		.from("texts")
		.select("*")
		.eq("page", "hlavni");

	return {
		texts,
		test,
		session,
		user,
		generalSettings
	};
};
