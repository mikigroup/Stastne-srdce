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
					},
					cookies: {
						get(key) {
							const cookie = parse(document.cookie);
							return cookie[key];
						}
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
						get() {
							return JSON.stringify(data.session);
						}
					}
				}
			);

	const {
		data: { session }
	} = await supabase.auth.getSession();

	const {
		data: { user }
	} = await supabase.auth.getUser();

	return { session, supabase, user };
};
