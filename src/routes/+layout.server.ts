import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

export const load = (async ({ url, locals: { safeGetSession } }) => {
	const { session, user } = await safeGetSession();
	if (!user && url.pathname === "/kosik") {
		throw redirect(303, "/prihlaseni?redirect=/kosik"); // 303 pro GET request + přidáme redirect URL
	}

	return {
		session,
		user
	};
}) satisfies LayoutServerLoad;
