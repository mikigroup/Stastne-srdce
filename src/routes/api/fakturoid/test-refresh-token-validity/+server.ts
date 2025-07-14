import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals: { supabase, safeGetSession } }) => {
	const { session } = await safeGetSession();
	
	if (!session) {
		return json({ error: 'Nepřihlášený uživatel' }, { status: 401 });
	}

	try {
		console.log('🧪 Testing refresh token validity...');

		// Získáme revoked token z databáze
		const { data: revokedTokens, error: tokenError } = await supabase
			.from('fakturoid_tokens')
			.select('*')
			.eq('status', 'revoked')
			.order('updated_at', { ascending: false })
			.limit(1);

		if (tokenError) {
			console.error('Error fetching revoked tokens:', tokenError);
			return json({ 
				error: 'Chyba při načítání revoked tokenů',
				success: false 
			}, { status: 500 });
		}

		if (!revokedTokens || revokedTokens.length === 0) {
			return json({
				success: true,
				message: 'Žádné revoked tokeny k testování',
				hasRevokedTokens: false
			});
		}

		const tokenData = revokedTokens[0];
		console.log('🔍 Testing revoked token for:', tokenData.account_email);
		console.log('🔄 Refresh token length:', tokenData.refresh_token?.length || 0);

		// Získáme credentials
		const { PRIVATE_FAKTUROID_CLIENT_ID, PRIVATE_FAKTUROID_CLIENT_SECRET } = await import('$env/static/private');
		
		if (!PRIVATE_FAKTUROID_CLIENT_ID || !PRIVATE_FAKTUROID_CLIENT_SECRET) {
			return json({ 
				error: 'Chybí Fakturoid credentials',
				success: false
			}, { status: 500 });
		}

		// Test refresh tokenu BEZ circuit breakeru
		console.log('🌐 Testing refresh token validity...');
		
		const response = await fetch('https://app.fakturoid.cz/api/v3/oauth/token', {
			method: 'POST',
			headers: {
				'Authorization': `Basic ${Buffer.from(`${PRIVATE_FAKTUROID_CLIENT_ID}:${PRIVATE_FAKTUROID_CLIENT_SECRET}`).toString('base64')}`,
				'Content-Type': 'application/x-www-form-urlencoded',
				'Accept': 'application/json',
				'User-Agent': 'StastneSrdce-App (support@stastne-srdce.cz)'
			},
			body: new URLSearchParams({
				grant_type: 'refresh_token',
				refresh_token: tokenData.refresh_token
			}).toString()
		});

		console.log('📡 Response status:', response.status);
		console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

		if (!response.ok) {
			const errorText = await response.text();
			console.error('❌ Refresh token test failed:', errorText);
			
			return json({
				success: false,
				error: `Refresh token je neplatný: ${response.status} ${response.statusText}`,
				details: errorText,
				status: response.status,
				tokenInfo: {
					accountEmail: tokenData.account_email,
					status: tokenData.status,
					refreshAttempts: tokenData.refresh_attempts,
					expiresAt: tokenData.expires_at,
					refreshTokenLength: tokenData.refresh_token?.length || 0
				},
				credentialsInfo: {
					clientIdLength: PRIVATE_FAKTUROID_CLIENT_ID?.length || 0,
					clientSecretLength: PRIVATE_FAKTUROID_CLIENT_SECRET?.length || 0
				}
			}, { status: 400 });
		}

		const tokenResponse = await response.json();
		console.log('✅ Refresh token je platný!');
		console.log('🆕 New token expires in:', tokenResponse.expires_in, 'seconds');

		// Aktualizujeme token v databázi - změníme status z revoked na active
		const { error: updateError } = await supabase
			.from('fakturoid_tokens')
			.update({
				access_token: tokenResponse.access_token,
				refresh_token: tokenResponse.refresh_token || tokenData.refresh_token,
				expires_at: new Date(Date.now() + tokenResponse.expires_in * 1000).toISOString(),
				status: 'active',
				last_used_at: new Date().toISOString(),
				updated_at: new Date().toISOString(),
				refresh_attempts: 0
			})
			.eq('account_email', tokenData.account_email);

		if (updateError) {
			console.error('Error updating token:', updateError);
			return json({
				success: false,
				error: 'Refresh token je platný, ale nepodařilo se aktualizovat v databázi',
				details: updateError
			}, { status: 500 });
		}

		return json({
			success: true,
			message: 'Refresh token je platný a byl úspěšně obnoven',
			newExpiry: tokenResponse.expires_in,
			accessTokenLength: tokenResponse.access_token?.length || 0,
			refreshTokenLength: tokenResponse.refresh_token?.length || 0,
			tokenInfo: {
				accountEmail: tokenData.account_email,
				status: 'active', // Změněno z revoked na active
				refreshAttempts: 0,
				expiresAt: new Date(Date.now() + tokenResponse.expires_in * 1000).toISOString()
			}
		});

	} catch (error) {
		console.error('Error testing refresh token validity:', error);
		return json({ 
			error: `Neočekávaná chyba: ${error instanceof Error ? error.message : 'Unknown error'}`,
			success: false 
		}, { status: 500 });
	}
}; 