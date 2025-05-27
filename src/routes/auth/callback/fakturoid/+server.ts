import { error, redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { 
	PRIVATE_FAKTUROID_CLIENT_ID,
	PRIVATE_FAKTUROID_CLIENT_SECRET
} from "$env/static/private";

export const GET: RequestHandler = async ({ url, locals: { supabase, safeGetSession }, cookies }) => {
	console.log('=== FAKTUROID CALLBACK START ===');
	console.log('URL:', url.toString());
	
	try {
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
			throw redirect(303, "/login?error=session_lost&message=OAuth session expired, please try again");
		}

		const code = url.searchParams.get("code");
		const state = url.searchParams.get("state");
		console.log('OAuth params:', { code: code ? 'present' : 'missing', state: state ? 'present' : 'missing' });

		if (!code || !state) {
			throw error(400, "Missing required OAuth parameters");
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
			throw error(400, "Invalid state format");
		}
		
		// Ověříme state z cookie
		const savedState = cookies.get('fakturoid_oauth_state');
		console.log('State verification:', { 
			savedState, 
			receivedState: state, 
			cookiesAvailable: Object.keys(cookies.getAll())
		});
		
		if (!savedState || savedState !== state) {
			console.error('Invalid state parameter:', { 
				savedState, 
				receivedState: state
			});
			throw error(400, "Invalid state parameter");
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
		const tokenResponse = await fetch('https://app.fakturoid.cz/api/v3/oauth/token', {
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

		console.log('Token response status:', tokenResponse.status);
		if (!tokenResponse.ok) {
			const errorText = await tokenResponse.text();
			console.error('Token request failed:', tokenResponse.status, errorText);
			throw error(500, "Failed to obtain access token");
		}

		const tokenData = await tokenResponse.json();
		console.log('Token received successfully');

		// Získáme informace o uživateli
		const userResponse = await fetch('https://app.fakturoid.cz/api/v3/user.json', {
			headers: {
				'Authorization': `Bearer ${tokenData.access_token}`,
				'User-Agent': 'StastneSrdce-App (support@stastne-srdce.cz)',
				'Content-Type': 'application/json'
			}
		});

		if (!userResponse.ok) {
			console.error('Failed to fetch user info:', await userResponse.text());
			throw error(500, "Failed to fetch user info");
		}

		const userData = await userResponse.json();

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
				account_name: userData.name
			});

		if (tokenSaveError) {
			console.error('Failed to save token:', tokenSaveError);
			console.error('Token save error details:', JSON.stringify(tokenSaveError, null, 2));
			throw error(500, "Failed to save authentication data");
		}
		console.log('Token saved successfully');

		// Aktualizujeme nastavení integrace
		const { data: existingSettings } = await supabase
			.from('site_settings')
			.select('value')
			.eq('key', 'integrations')
			.maybeSingle();

		const integrationsData = existingSettings?.value || {};
		const updatedIntegrations = {
			...integrationsData,
			fakturoidEnabled: true,
			fakturoidConnected: true,
			fakturoidAccountName: userData.email || userData.name
		};

		const { error: settingsError } = await supabase
			.from('site_settings')
			.upsert({
				key: 'integrations',
				value: updatedIntegrations,
				updated_at: new Date().toISOString(),
				updated_by: session.user.id,
				user_id: session.user.id
			}, {
				onConflict: 'key'
			});

		if (settingsError) {
			console.error('Failed to update settings:', settingsError);
			throw error(500, "Failed to update integration settings");
		}

		// Přesměrujeme zpět na nastavení
		throw redirect(303, "/admin/site-setting?success=fakturoid_connected");

	} catch (err) {
		console.error("Fakturoid callback failed:", err);
		
		if (err instanceof Response) throw err;
		
		throw error(500, {
			message: "Failed to connect Fakturoid account: " + (err instanceof Error ? err.message : String(err))
		});
	}
};
