import type { Actions, PageServerLoad, PageServerData } from "./$types";
import { redirect } from "@sveltejs/kit";

export const load: PageServerLoad = async ({ locals: { supabase, safeGetSession } }) => {
	// const { session } = await safeGetSession();

	const { data: menus, error } = await supabase
		.from("menus")
		.select('*')

	if (error) {
		console.error("Error fetching menus:", error);
	} else {
		// console.log("TEST:", profile);
	}

	return { menus };
};