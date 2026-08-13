export const prerender = false;
export const trailingSlash = "always";
import type { PageServerLoad } from "./$types";
import { PUBLIC_TENANT } from "$env/static/public";

const HOME_POSITIONS = ["left", "center", "right"] as const;

export const load: PageServerLoad = async ({
	locals: { supabase }
}) => {
	let texts: Array<Record<string, unknown> | null> = HOME_POSITIONS.map(() => null);

	try {
		const { data, error } = await supabase
			.from("texts")
			.select("*")
			.eq("page", "hlavni")
			.eq("tenant_id", PUBLIC_TENANT);

		if (error) throw error;

		const rows = data || [];
		texts = HOME_POSITIONS.map(
			(position) => rows.find((text) => text.position === position) ?? null
		);
	} catch (error) {
		console.error("Chyba při načítání textů:", error);
	}

	return {
		texts
	};
};
