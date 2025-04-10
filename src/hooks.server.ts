import { createServerClient } from "@supabase/ssr";
import { type Handle, redirect } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";
import { PRIVATE_SBKey, PRIVATE_SBUrl } from "$env/static/private";

const supabase: Handle = async ({ event, resolve }) => {
	// Vylepšená inicializace Supabase clienta
	event.locals.supabase = createServerClient(PRIVATE_SBUrl, PRIVATE_SBKey, {
		cookies: {
			get: (key) => event.cookies.get(key),
			set: (key, value, options) => {
				event.cookies.set(key, value, {
					...options,
					path: "/",
					secure: process.env.NODE_ENV === "production",
					sameSite: "lax",
					httpOnly: true
				});
			},
			remove: (key, options) => {
				event.cookies.delete(key, {
					...options,
					path: "/"
				});
			}
		}
	});

	// Vylepšená session management funkce
	event.locals.safeGetSession = async () => {
		const {
			data: { session },
			error: sessionError
		} = await event.locals.supabase.auth.getSession();

		if (sessionError || !session) {
			return { session: null, user: null };
		}

		const {
			data: { user },
			error: userError
		} = await event.locals.supabase.auth.getUser();

		if (userError) {
			console.error("User error:", userError);
			return { session: null, user: null };
		}

		// Pro PKCE flow - dodatečná validace
		if (session?.access_token?.startsWith("pkce_")) {
			try {
				const {
					data: { user: pkceUser }
				} = await event.locals.supabase.auth.getUser(session.access_token);
				if (!pkceUser) throw new Error("PKCE user not found");
				return { session, user: pkceUser };
			} catch (pkceError) {
				console.error("PKCE validation failed:", pkceError);
				return { session: null, user: null };
			}
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
	const { session, user } = await event.locals.safeGetSession();
	event.locals.session = session;
	event.locals.user = user;

	// Povolení registračního callbacku bez session
	if (event.url.pathname === "/auth/callback") {
		return resolve(event);
	}

	// Původní admin logika
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
