import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({
	locals: { supabase, safeGetSession },
	parent
}) => {
	const parentData = await parent();

	const { session } = await safeGetSession();
	if (!session) {
		throw redirect(303, "/login");
	}

	const { data: settings } = await supabase.from("site_settings").select("*");

	return {
		...parentData,
		settings
	};
};
