import { redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { PRIVATE_FAKTUROID_CLIENT_ID } from "$env/static/private";

export const GET: RequestHandler = async ({ locals: { safeGetSession, supabase }, url, cookies }) => {
	console.log('=== FAKTUROID OAUTH CONNECT START ===');
	
	const { session } = await safeGetSession();
	if (!session) {
		console.log('No session found, redirecting to login');
		return redirect(303, "/login");
	}
	
	console.log('User ID:', session.user.id);

	// Generujeme state s user_id pro případ ztráty session
	const stateData = {
		random: crypto.randomUUID(),
		user_id: session.user.id,
		timestamp: Date.now()
	};
	const state = Buffer.from(JSON.stringify(stateData)).toString('base64url');
	
	// Uložíme state do cookie - optimalizované pro Vercel
	const isProduction = url.hostname !== 'localhost' && !url.hostname.includes('127.0.0.1');
	cookies.set('fakturoid_oauth_state', state, {
		path: '/',
		maxAge: 600, // 10 minut
		httpOnly: true,
		secure: isProduction, // Secure pouze v produkci
		sameSite: isProduction ? 'none' : 'lax' // None pro cross-site v produkci
	});

	console.log('State cookie set:', { state, hostname: url.hostname });

	// Sestavíme URL pro OAuth autorizaci
	const authUrl = new URL('https://app.fakturoid.cz/api/v3/oauth');
	authUrl.searchParams.set('client_id', PRIVATE_FAKTUROID_CLIENT_ID);
	authUrl.searchParams.set('redirect_uri', `${url.origin}/auth/callback/fakturoid`);
	authUrl.searchParams.set('response_type', 'code');
	authUrl.searchParams.set('state', state);

	// Přesměrujeme uživatele na Fakturoid pro výběr účtu
	return redirect(303, authUrl.toString());
}; 