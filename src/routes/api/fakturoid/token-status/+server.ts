import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals: { supabase, safeGetSession } }) => {
	const { session } = await safeGetSession();
	
	if (!session) {
		return json({ error: 'Nepřihlášený uživatel' }, { status: 401 });
	}

	try {
		console.log('🌐 Global token status check from admin user:', session.user.id);

		// ZMĚNA: Hledáme token pro aktuálně přihlášeného uživatele
		console.log('🔍 TOKEN STATUS: Looking for token of current user:', session.user.id);
		
		let { data: tokenData, error: tokenError } = await supabase
			.from('fakturoid_tokens')
			.select('*')
			.eq('user_id', session.user.id)
			.in('status', ['active', 'expired', 'refreshing'])
			.order('updated_at', { ascending: false })
			.limit(1);

		// Pokud uživatel nemá token, hledáme stastnesrdce jako fallback pro globální správu
		if (tokenError || !tokenData || tokenData.length === 0) {
			console.log('⚠️ Current user has no token, trying priority token stastnesrdcekk@seznam.cz...');
			
			const { data: priorityData, error: priorityError } = await supabase
				.from('fakturoid_tokens')
				.select('*')
				.eq('account_email', 'stastnesrdcekk@seznam.cz')
				.in('status', ['active', 'expired', 'refreshing'])
				.limit(1);

			if (priorityError || !priorityData || priorityData.length === 0) {
				console.log('⚠️ Priority token not found, trying any active token...');
				
				const { data: fallbackData, error: fallbackError } = await supabase
					.from('fakturoid_tokens')
					.select('*')
					.in('status', ['active', 'expired', 'refreshing'])
					.order('last_used_at', { ascending: false })
					.limit(1);

				if (fallbackError || !fallbackData || fallbackData.length === 0) {
					return json({ 
						error: 'Žádný Fakturoid token nebyl nalezen v systému. Připojte účet.',
						success: false,
						requiresReauth: true
					}, { status: 404 });
				}
				
				tokenData = fallbackData;
				console.log('🔄 Using fallback token for:', fallbackData[0].account_email);
			} else {
				tokenData = priorityData;
				console.log('🏆 Using priority token for:', priorityData[0].account_email);
			}
		} else {
			console.log('✅ Using current user token for:', tokenData[0].account_email);
		}

		const token = tokenData[0];
		console.log('🔍 Found global token for:', token.account_email, 'owned by user:', token.user_id);

		// Zkontrolujeme stav tokenu
		const now = new Date();
		const expiresAt = new Date(token.expires_at);
		const isExpired = now >= expiresAt;
		const minutesToExpiry = Math.floor((expiresAt.getTime() - now.getTime()) / (1000 * 60));
		
		console.log('EXPIRY DEBUG:', {
			now: now.toISOString(),
			expiresAt: expiresAt.toISOString(),
			nowTime: now.getTime(),
			expiryTime: expiresAt.getTime(),
			isExpired,
			minutesToExpiry
		});

		console.log('Global token status check:', {
			tokenOwner: token.account_email,
			originalUserId: token.user_id,
			adminUserId: session.user.id,
			status: token.status,
			expiresAt: token.expires_at,
			isExpired,
			minutesToExpiry,
			refreshAttempts: token.refresh_attempts
		});

		// Test API volání s současným tokenem
		let apiTestResult = false;
		let apiError = '';
		
		if (!isExpired && token.status === 'active') {
			try {
				// Jednoduché test volání na Fakturoid API
				const testResponse = await fetch('https://app.fakturoid.cz/api/v3/user.json', {
					headers: {
						'Authorization': `Bearer ${token.access_token}`,
						'User-Agent': 'StastneSrdce-App (support@stastne-srdce.cz)',
						'Content-Type': 'application/json'
					}
				});
				
				if (testResponse.ok) {
					apiTestResult = true;
					console.log('✅ API test successful');
				} else {
					apiError = `API responded with ${testResponse.status}`;
					console.log('❌ API test failed:', testResponse.status);
				}
			} catch (error) {
				apiError = `Network error: ${error instanceof Error ? error.message : 'Unknown'}`;
				console.log('❌ API test error:', apiError);
			}
		} else {
			apiError = isExpired ? 'Token expired' : `Token status: ${token.status}`;
		}

		return json({
			success: true,
			tokenInfo: {
				account_email: token.account_email,
				account_name: token.account_name,
				account_id: token.account_id,
				account_slug: token.account_slug,
				account_subdomain: token.account_subdomain,
				account_currency: token.account_currency,
				account_plan: token.account_plan,
				expires_at: token.expires_at,
				status: token.status,
				refresh_attempts: token.refresh_attempts,
				last_used_at: token.last_used_at,
				updated_at: token.updated_at,
				original_user_id: token.user_id,
				admin_user_id: session.user.id
			},
			isExpired,
			minutesToExpiry,
			apiTestResult,
			apiError: apiError || undefined
		});

	} catch (error) {
		console.error('Chyba při kontrole globálního tokenu:', error);
		return json({ 
			error: `Neočekávaná chyba: ${error instanceof Error ? error.message : 'Unknown error'}`,
			success: false 
		}, { status: 500 });
	}
}; 