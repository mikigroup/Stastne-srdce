import { redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { PRIVATE_FAKTUROID_CLIENT_ID } from "$env/static/private";

export const GET: RequestHandler = async ({ locals: { safeGetSession, supabase }, url, cookies }) => {
	console.log('=== FAKTUROID OAUTH CONNECT START ===');
	
	const { session } = await safeGetSession();
	if (!session) {
		console.log('No session found, redirecting to login');
		throw redirect(303, "/login");
	}
	
	console.log('User ID:', session.user.id);

	// Generujeme náhodný state pro CSRF ochranu
	const state = crypto.randomUUID();
	
	// Uložíme state do cookie - zjednodušené nastavení pro produkci
	cookies.set('fakturoid_oauth_state', state, {
		path: '/',
		maxAge: 600, // 10 minut
		httpOnly: true,
		secure: false, // Zkusíme bez secure pro test
		sameSite: 'lax'
		// Bez domain - necháme browser rozhodnout
	});

	console.log('State cookie set:', { state, hostname: url.hostname });

	// Sestavíme URL pro OAuth autorizaci
	const authUrl = new URL('https://app.fakturoid.cz/api/v3/oauth');
	authUrl.searchParams.set('client_id', PRIVATE_FAKTUROID_CLIENT_ID);
	authUrl.searchParams.set('redirect_uri', `${url.origin}/auth/callback/fakturoid`);
	authUrl.searchParams.set('response_type', 'code');
	authUrl.searchParams.set('state', state);

	// Přesměrujeme uživatele na Fakturoid pro výběr účtu
	throw redirect(303, authUrl.toString());
}; 