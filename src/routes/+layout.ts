import {
	createBrowserClient,
	createServerClient,
	isBrowser,
	parse
} from "@supabase/ssr";
// import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from "$env/static/public";
// import { PRIVATE_SBKey, PRIVATE_SBUrl } from "$env/static/private";
import type { LayoutLoad } from "./$types";

export const load: LayoutLoad = async ({ data, depends, fetch }) => {
	depends("supabase:auth");

	const supabase = isBrowser()
		? createBrowserClient(
				import.meta.env.VITE_PRIVATE_SBUrl,
				import.meta.env.VITE_PRIVATE_SBKey,
				{
					global: {
						fetch
					}
				}
			)
		: createServerClient(
				import.meta.env.VITE_PRIVATE_SBUrl,
				import.meta.env.VITE_PRIVATE_SBKey,
				{
					global: {
						fetch
					},
					cookies: {
						getAll() {
							return data.cookies;
						}
					}
				}
			);

	/**
	 * It's fine to use `getSession` here, because on the client, `getSession` is
	 * safe, and on the server, it reads `session` from the `LayoutData`, which
	 * safely checked the session using `safeGetSession`.
	 */
	const {
		data: { session }
	} = await supabase.auth.getSession();

	const {
		data: { user }
	} = await supabase.auth.getUser();

	return { session, supabase, user };
};
