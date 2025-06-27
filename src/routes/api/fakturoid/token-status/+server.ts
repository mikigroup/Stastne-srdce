import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals: { supabase, safeGetSession } }) => {
	const { session } = await safeGetSession();
	
	if (!session) {
		return json({ error: 'Nepřihlášený uživatel' }, { status: 401 });
	}

	try {
		// Načteme token info z databáze
		const { data: tokenData, error: tokenError } = await supabase
			.from('fakturoid_tokens')
			.select('*')
			.eq('user_id', session.user.id)
			.maybeSingle();

		if (tokenError) {
			console.error('Database error:', tokenError);
			return json({ 
				error: 'Chyba při načítání token informací',
				success: false 
			}, { status: 500 });
		}

		if (!tokenData) {
			return json({ 
				error: 'Fakturoid token nebyl nalezen. Připojte si účet.',
				success: false,
				requiresReauth: true
			}, { status: 404 });
		}

		// Zkontrolujeme stav tokenu
		const now = new Date();
		const expiresAt = new Date(tokenData.expires_at);
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

		console.log('Token status check:', {
			userId: session.user.id,
			status: tokenData.status,
			expiresAt: tokenData.expires_at,
			isExpired,
			minutesToExpiry,
			refreshAttempts: tokenData.refresh_attempts
		});

		// Test API volání s současným tokenem
		let apiTestResult = false;
		let apiError = '';

		try {
			const testResponse = await fetch('https://app.fakturoid.cz/api/v3/user.json', {
				headers: {
					'Authorization': `Bearer ${tokenData.access_token}`,
					'User-Agent': 'StastneSrdce-App (support@stastne-srdce.cz)',
					'Content-Type': 'application/json'
				}
			});

			apiTestResult = testResponse.ok;
			if (!apiTestResult) {
				apiError = `API test failed: ${testResponse.status}`;
			}
		} catch (error) {
			apiError = `API test error: ${error instanceof Error ? error.message : 'Unknown error'}`;
		}

		return json({
			success: true,
			tokenInfo: {
				status: tokenData.status,
				expires_at: tokenData.expires_at,
				account_email: tokenData.account_email,
				account_name: tokenData.account_name,
				refresh_attempts: tokenData.refresh_attempts || 0,
				last_used_at: tokenData.last_used_at,
				created_at: tokenData.created_at,
				updated_at: tokenData.updated_at
			},
			tokenHealth: {
				isExpired,
				minutesToExpiry,
				apiTestSuccess: apiTestResult,
				apiError: apiError || null,
				needsRefresh: isExpired || minutesToExpiry < 30,
				requiresReauth: (tokenData.refresh_attempts || 0) > 3
			}
		});

	} catch (error) {
		console.error('Chyba při kontrole token statusu:', error);
		return json({ 
			error: 'Neočekávaná chyba při kontrole tokenu',
			success: false 
		}, { status: 500 });
	}
}; 