import type { Actions, PageServerLoad, PageServerData } from "./$types";
import { createClient } from "@supabase/supabase-js";

const supabaseLeo = createClient(
	/*	process.env.SUPABASE_URL_LEO,
	process.env.SUPABASE_ANON_KEY_LEO*/
	"https://palzpgxkjhkksatqkwqf.supabase.co",
			"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhbHpwZ3hramhra3NhdHFrd3FmIiwicm9sZSI6ImFub24iLCJpYXQiOjE2Njk3MzEzODcsImV4cCI6MTk4NTMwNzM4N30.mTC4NMV-1ljAzNwaZJqGiMx9dbMOCkVWY3oiOOv_sOQ")
);

export const load: PageServerLoad = async ({ locals: { supabaseLeo } }) => {
	let { data: menus, error } = await supabaseLeo.from("menus").select("*");
	if (error) {
		console.error("Error fetching menus:", error);
	} else {
		// console.log("TEST:", menus);
	}
	return { menus };
};
