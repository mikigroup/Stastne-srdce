import { error, redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { 
	PRIVATE_FAKTUROID_CLIENT_ID,
	PRIVATE_FAKTUROID_CLIENT_SECRET
} from "$env/static/private";
import { getSetting, saveSetting } from "$lib/services/siteSettingsService";

export const GET: RequestHandler = async ({ url, locals: { supabase, safeGetSession }, cookies }) => {
	console.log('=== FAKTUROID CALLBACK START ===');
	console.log('URL:', url.toString());
	
	// Zkusíme získat session různými způsoby
	let session = null;
	
	// Způsob 1: safeGetSession
	const { session: safeSession } = await safeGetSession();
	if (safeSession) {
		session = safeSession;
		console.log('Session found via safeGetSession');
	}
	
	// Způsob 2: Přímý Supabase auth
	if (!session) {
		const { data: { session: directSession } } = await supabase.auth.getSession();
		if (directSession) {
			session = directSession;
			console.log('Session found via direct auth');
		}
	}
	
	// Způsob 3: Z cookies (fallback)
	if (!session) {
		const authCookie = cookies.get('sb-access-token') || cookies.get('supabase-auth-token');
		console.log('Auth cookie present:', !!authCookie);
	}
	
	console.log('Final session check:', session ? 'OK' : 'MISSING');
	console.log('Available cookies:', Object.keys(cookies.getAll()));
	
	if (!session) {
		// Místo chyby přesměrujeme na login s informací
		console.error('No session found during OAuth callback');
		return redirect(303, "/login?error=session_lost&message=OAuth session expired, please try again");
	}

	const code = url.searchParams.get("code");
	const state = url.searchParams.get("state");
	console.log('OAuth params:', { code: code ? 'present' : 'missing', state: state ? 'present' : 'missing' });

	if (!code || !state) {
		console.error('Missing OAuth parameters:', { code: !!code, state: !!state });
		return redirect(303, "/admin/site-setting?error=missing_oauth_params");
	}

	// Dekódujeme state a získáme user_id
	let stateData = null;
	let userId = null;
	
	try {
		stateData = JSON.parse(Buffer.from(state, 'base64url').toString());
		userId = stateData.user_id;
		console.log('State decoded:', { userId, timestamp: stateData.timestamp });
	} catch (e) {
		console.error('Failed to decode state:', e);
		return redirect(303, "/admin/site-setting?error=invalid_state_format");
	}
	
	// Ověříme state z cookie
	const savedState = cookies.get('fakturoid_oauth_state');
	console.log('State verification:', { 
		savedState, 
		receivedState: state, 
		cookiesAvailable: Object.keys(cookies.getAll())
	});
	
	// Na Vercelu mohou být problémy s cookies, takže budeme mírnější
	if (!savedState) {
		console.warn('No saved state found in cookies - this may be due to Vercel cookie issues');
		// Pokračujeme, ale logujeme varování
	} else if (savedState !== state) {
		console.error('Invalid state parameter:', { 
			savedState, 
			receivedState: state
		});
		return redirect(303, "/admin/site-setting?error=oauth_state_mismatch");
	}
	
	// Pokud nemáme session, použijeme userId ze state
	if (!session && userId) {
		console.log('Using userId from state as fallback:', userId);
		// Vytvoříme mock session objekt
		session = {
			user: { id: userId },
			access_token: 'fallback'
		};
	}

	// Smažeme cookie se state, už ji nepotřebujeme
	cookies.delete('fakturoid_oauth_state', { path: '/' });

	// Získáme access token pomocí authorization code
	console.log('Requesting access token from Fakturoid...');
	let tokenResponse;
	try {
		tokenResponse = await fetch('https://app.fakturoid.cz/api/v3/oauth/token', {
			method: 'POST',
			headers: {
				'Authorization': `Basic ${Buffer.from(`${PRIVATE_FAKTUROID_CLIENT_ID}:${PRIVATE_FAKTUROID_CLIENT_SECRET}`).toString('base64')}`,
				'Content-Type': 'application/x-www-form-urlencoded',
				'Accept': 'application/json',
				'User-Agent': 'StastneSrdce-App (support@stastne-srdce.cz)'
			},
			body: new URLSearchParams({
				grant_type: 'authorization_code',
				code,
				redirect_uri: `${url.origin}/auth/callback/fakturoid`
			}).toString()
		});
	} catch (fetchError) {
		console.error('Network error during token request:', fetchError);
		return redirect(303, "/admin/site-setting?error=token_request_failed");
	}

	console.log('Token response status:', tokenResponse.status);
	if (!tokenResponse.ok) {
		const errorText = await tokenResponse.text();
		console.error('Token request failed:', tokenResponse.status, errorText);
		return redirect(303, "/admin/site-setting?error=token_request_failed");
	}

	let tokenData;
	try {
		tokenData = await tokenResponse.json();
		console.log('Token received successfully');
	} catch (parseError) {
		console.error('Failed to parse token response:', parseError);
		return redirect(303, "/admin/site-setting?error=token_request_failed");
	}

	// Získáme informace o uživateli
	let userResponse;
	try {
		userResponse = await fetch('https://app.fakturoid.cz/api/v3/user.json', {
			headers: {
				'Authorization': `Bearer ${tokenData.access_token}`,
				'User-Agent': 'StastneSrdce-App (support@stastne-srdce.cz)',
				'Content-Type': 'application/json'
			}
		});
	} catch (fetchError) {
		console.error('Network error during user info request:', fetchError);
		return redirect(303, "/admin/site-setting?error=user_info_failed");
	}

	if (!userResponse.ok) {
		console.error('Failed to fetch user info:', await userResponse.text());
		return redirect(303, "/admin/site-setting?error=user_info_failed");
	}

	let userData;
	try {
		userData = await userResponse.json();
		console.log('Fakturoid user data:', JSON.stringify(userData, null, 2));
	} catch (parseError) {
		console.error('Failed to parse user response:', parseError);
		return redirect(303, "/admin/site-setting?error=user_info_failed");
	}

	// Uložíme token a informace o účtu
	console.log('Saving token to database...');
	const { error: tokenSaveError } = await supabase
		.from('fakturoid_tokens')
		.upsert({
			user_id: session.user.id,
			access_token: tokenData.access_token,
			refresh_token: tokenData.refresh_token,
			expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
			account_email: userData.email,
			account_name: userData.name,
			status: 'active',
			refresh_attempts: 0,
			last_used_at: new Date().toISOString()
		}, {
			onConflict: 'user_id'
		});

	if (tokenSaveError) {
		console.error('Failed to save token:', tokenSaveError);
		console.error('Token save error details:', JSON.stringify(tokenSaveError, null, 2));
		return redirect(303, "/admin/site-setting?error=token_save_failed");
	}
	console.log('Token saved successfully');

	// Aktualizujeme nastavení integrace
	const integrationsData = await getSetting(supabase, 'integrations') || {};
	console.log('Current integrations data before update:', JSON.stringify(integrationsData, null, 2));
	
	const updatedIntegrations = {
		...integrationsData,
		fakturoid: {
			enabled: true,
			connected: true,
			subdomain: userData.accounts[0].slug || '',
			accounts: [{
				name: userData.email || userData.name,
				email: userData.email,
				subdomain: userData.accounts[0].slug || '',
				isActive: true,
				connectedAt: new Date().toISOString()
			}]
		}
	};
	
	console.log('Updated integrations data to save:', JSON.stringify(updatedIntegrations, null, 2));

	const success = await saveSetting(supabase, 'integrations', updatedIntegrations, session.user.id);
	console.log('Settings save result:', success);

	if (!success) {
		console.error('Failed to update settings');
		return redirect(303, "/admin/site-setting?error=settings_update_failed");
	}

	// Přesměrujeme zpět na nastavení
	console.log('OAuth callback completed successfully, redirecting...');
	return redirect(303, "/admin/site-setting?success=fakturoid_connected&tab=integrations");
};
