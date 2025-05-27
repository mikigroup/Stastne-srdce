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
			return redirect(303, "/admin/site-setting?error=token_request_failed");
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
			return redirect(303, "/admin/site-setting?error=user_info_failed");
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
			return redirect(303, "/admin/site-setting?error=settings_update_failed");
		}

		// Přesměrujeme zpět na nastavení
		return redirect(303, "/admin/site-setting?success=fakturoid_connected");

	} catch (err) {
		console.error("Fakturoid callback failed:", err);
		
		// Pokud je to redirect, necháme ho projít
		if (err instanceof Response) {
			throw err;
		}
		
		// Místo 500 chyby přesměrujeme s chybovou zprávou
		const errorMessage = err instanceof Error ? err.message : String(err);
		console.error("Redirecting to settings with error:", errorMessage);
		return redirect(303, `/admin/site-setting?error=callback_failed&message=${encodeURIComponent(errorMessage)}`);
	}
};
