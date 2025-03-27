export const prerender = "auto";
export const trailingSlash = "always";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({
	parent,
	locals: { supabase }
}) => {
	let texts = [];
	try {
		const { data, error } = await supabase
			.from("texts")
			.select("*")
			.eq("page", "hlavni");

		if (error) throw error;
		texts = data || [];
	} catch (error) {
		console.error("Chyba při načítání textů:", error);
	}

	return {
		texts
	};
};
