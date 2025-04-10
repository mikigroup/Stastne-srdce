import { createServerClient } from "@supabase/ssr";
import { type Handle, redirect } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";
import { PRIVATE_SBKey, PRIVATE_SBUrl } from "$env/static/private";

const supabase: Handle = async ({ event, resolve }) => {
	// Inicializace Supabase clienta s rozšířeným cookie managementem
	event.locals.supabase = createServerClient(PRIVATE_SBUrl, PRIVATE_SBKey, {
		cookies: {
			get: (key) => event.cookies.get(key),
			set: (key, value, options) => {
				event.cookies.set(key, value, {
					...options,
					path: "/",
					secure: process.env.NODE_ENV === "production",
					sameSite: "lax",
					httpOnly: true,
					maxAge: 60 * 60 * 24 * 7 // 7 dní
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

	// Vylepšená funkce pro získání session s podporou PKCE
	event.locals.safeGetSession = async () => {
		try {
			const {
				data: { session },
				error: sessionError
			} = await event.locals.supabase.auth.getSession();

			if (sessionError || !session) {
				console.error("Session error:", sessionError);
				return { session: null, user: null };
			}

			// Speciální ošetření pro PKCE flow
			if (session?.access_token?.startsWith("pkce_")) {
				const {
					data: { user }
				} = await event.locals.supabase.auth.getUser(session.access_token);
				return { session, user };
			}

			// Standardní flow
			const {
				data: { user },
				error: userError
			} = await event.locals.supabase.auth.getUser();

			if (userError) {
				console.error("User error:", userError);
				return { session: null, user: null };
			}

			return { session, user };
		} catch (error) {
			console.error("Unexpected auth error:", error);
			return { session: null, user: null };
		}
	};

	return resolve(event, {
		filterSerializedResponseHeaders(name) {
			return name === "content-range" || name === "x-supabase-api-version";
		}
	});
};

const authGuard: Handle = async ({ event, resolve }) => {
	// Získání aktuální session
	const { session, user } = await event.locals.safeGetSession();
	event.locals.session = session;
	event.locals.user = user;

	// Povolení callback URL bez ověření session
	if (event.url.pathname === "/auth/callback") {
		return resolve(event);
	}

	// Ochranná logika pro admin sekci
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
