import { createServerClient } from "@supabase/ssr";
import { type Handle, redirect } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";

import { PRIVATE_SBKey, PRIVATE_SBUrl } from "$env/static/private";

const supabase: Handle = async ({ event, resolve }) => {
	event.locals.supabase = createServerClient(PRIVATE_SBUrl, PRIVATE_SBKey, {
		cookies: {
			get: (key) => event.cookies.get(key),
			set: (key, value, options) => {
				event.cookies.set(key, value, { ...options, path: "/" });
			},
			remove: (key, options) => {
				event.cookies.delete(key, { ...options, path: "/" });
			}
		},
		global: {
			headers: {
				apikey: PRIVATE_SBKey
			}
		}
	});

	event.locals.safeGetSession = async () => {
		// Poznámka: getSession() zde je bezpečné, protože následně ověřujeme
		// autenticitu uživatele kontaktováním Auth serveru přes getUser()
		const {
			data: { session }
		} = await event.locals.supabase.auth.getSession();
		if (!session) {
			return { session: null, user: null };
		}

		// Bezpečné ověření uživatele - kontaktuje Auth server
		const {
			data: { user },
			error
		} = await event.locals.supabase.auth.getUser();
		if (error) {
			return { session: null, user: null };
		}

		return { session, user };
	};

	return resolve(event, {
		filterSerializedResponseHeaders(name) {
			return name === "content-range" || name === "x-supabase-api-version";
		}
	});
};

const authGuard: Handle = async ({ event, resolve }) => {
	// Ignorovat požadavky na statické soubory
	if (event.url.pathname.startsWith('/favi/') || event.url.pathname === '/favicon.ico') {
		return resolve(event);
	}

	const { session, user } = await event.locals.safeGetSession();
	event.locals.session = session;
	event.locals.user = user;

	// Admin section logic
	if (event.url.pathname.startsWith("/admin")) {
		if (!event.locals.session && event.url.pathname !== "/admin/signin") {
			throw redirect(303, "/admin/signin");
		}

		if (event.locals.session && event.url.pathname === "/admin/signin") {
			throw redirect(303, "/admin");
		}
	}

	return resolve(event);
};

export const handle: Handle = sequence(supabase, authGuard);
