import type { Cookies } from "@sveltejs/kit";

/**
 * Odstraní poškozené Supabase auth cookies z doby, kdy +layout.ts
 * vracel JSON.stringify(session) místo skutečných cookie hodnot.
 * Jinak auth-js spadne: "Cannot create property 'user' on string".
 */
export function clearCorruptedSupabaseCookies(cookies: Cookies) {
	for (const { name, value } of cookies.getAll()) {
		if (
			name.includes("auth-token") &&
			typeof value === "string" &&
			value.startsWith('{"access_token"')
		) {
			cookies.delete(name, { path: "/" });
		}
	}
}
