export const prerender = true; // pro rychlejsi nacitani - Core web vitals

import { fail, redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
	const { data: texts } = await supabase
		.from("texts")
		.select("*")
		.eq("page", "hlavni");

	return { texts };
};
