import type { Actions, PageServerLoad, PageServerData } from "./$types";

export const load: PageServerLoad = async ({ locals: { supabase, safeGetSession } }) => {
	let { data: menus, error } = await supabase
		.from('menus')
		.select('*')
	if (error) {
		console.error("Error fetching menus:", error);
	} else {
		// console.log("TEST:", menus);
	}
	return { menus };
};