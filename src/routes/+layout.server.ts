/*
import type { LayoutServerLoad } from "./$types";

import type { Actions } from "./$types";

export const load = (async ({ url, locals: { safeGetSession } }) => {
	const { session, user } = await safeGetSession();

	if (!user && url.pathname === "/kosik") {
		throw redirect(302, "/");
	}

	return {
		session,
		user
	};
}) satisfies LayoutServerLoad;
*/

import type { LayoutServerLoad } from "./$types";
import { redirect } from "@sveltejs/kit";

export const load: LayoutServerLoad = async ({
	url,
	locals: { user, session },
	cookies
}) => {
	if (!user && url.pathname === "/kosik") {
		throw redirect(302, "/");
	}
	return {
		session,
		cookies: cookies.getAll()
	};
};
