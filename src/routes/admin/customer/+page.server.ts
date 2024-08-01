import { fail, redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({
	locals: { supabase, session }
}) => {
	const { data: customers, error } = await supabase
		.from("customers")
		.select("*")
		.order("created_at", { ascending: false })
		.limit(100);

	if (error) {
		console.error("Error fetching customers:", error);
		throw error;
	}

	const { data: profileTableSettings, error: profileError } = await supabase
		.from("profiles")
		.select("table_settings_customers")
		.eq("id", session?.user.id)
		.single();

	if (profileError) {
		console.error("Error fetching profile:", profileError);
		throw profileError;
	}

	return { customers, profileTableSettings };
};
