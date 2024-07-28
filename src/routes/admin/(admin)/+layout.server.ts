import type { LayoutServerLoad } from "./$types";
import { redirect } from "@sveltejs/kit";

export const load = (async ({ url, locals: { safeGetSession } }) => {
	const { session, user } = await safeGetSession();

	if (!user && url.pathname === "/admin") {
		throw redirect(302, "/admin/login");
	}

	return {
		session,
		user
	};
}) satisfies LayoutServerLoad;
