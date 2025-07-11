import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ locals: { supabase, safeGetSession } }) => {
	const { session } = await safeGetSession();
	
	if (!session) {
		return json({ error: 'Nepřihlášený uživatel' }, { status: 401 });
	}

	try {
		console.log('🧪 Testing Fakturoid token...');

		// Hledáme aktivní token v systému
		const { data: tokenData, error: tokenError } = await supabase
			.from('fakturoid_tokens')
			.select('*')
			.eq('status', 'active')
			.order('last_used_at', { ascending: false })
			.limit(1)
			.single();

		if (tokenError || !tokenData) {
			return json({ 
				error: 'Žádný aktivní token nebyl nalezen',
				success: false,
				requiresReauth: true
			}, { status: 404 });
		}

		console.log('🔍 Testing token for:', tokenData.account_email);

		// Testujeme token s Fakturoid API
		const testResponse = await fetch('https://app.fakturoid.cz/api/v3/user.json', {
			headers: {
				'Authorization': `Bearer ${tokenData.access_token}`,
				'User-Agent': 'StastneSrdce-App (support@stastne-srdce.cz)',
				'Content-Type': 'application/json'
			}
		});

		if (testResponse.ok) {
			const accountData = await testResponse.json();
			console.log('✅ Token test successful for:', accountData.email);

			return json({
				success: true,
				tokenValid: true,
				accountEmail: accountData.email,
				accountName: accountData.name,
				accountSubdomain: accountData.subdomain,
				message: 'Token je platný'
			});
		} else {
			console.log('❌ Token test failed, status:', testResponse.status);
			
			// Zkusíme refresh token
			const refreshResponse = await fetch('https://app.fakturoid.cz/api/v3/oauth/token', {
				method: 'POST',
				headers: {
					'Authorization': `Basic ${Buffer.from('stastnesrdce:nKCGJEGHBFKNFLDCFN').toString('base64')}`,
					'Content-Type': 'application/x-www-form-urlencoded',
					'User-Agent': 'StastneSrdce-App (support@stastne-srdce.cz)'
				},
				body: new URLSearchParams({
					grant_type: 'refresh_token',
					refresh_token: tokenData.refresh_token
				}).toString()
			});

			if (refreshResponse.ok) {
				const refreshData = await refreshResponse.json();
				console.log('✅ Token refresh successful');

				// Aktualizujeme token v databázi
				await supabase
					.from('fakturoid_tokens')
					.update({
						access_token: refreshData.access_token,
						refresh_token: refreshData.refresh_token || tokenData.refresh_token,
						expires_at: new Date(Date.now() + refreshData.expires_in * 1000).toISOString(),
						last_used_at: new Date().toISOString()
					})
					.eq('id', tokenData.id);

				// Testujeme s novým tokenem
				const newTestResponse = await fetch('https://app.fakturoid.cz/api/v3/user.json', {
					headers: {
						'Authorization': `Bearer ${refreshData.access_token}`,
						'User-Agent': 'StastneSrdce-App (support@stastne-srdce.cz)',
						'Content-Type': 'application/json'
					}
				});

				if (newTestResponse.ok) {
					const accountData = await newTestResponse.json();
					return json({
						success: true,
						tokenValid: true,
						accountEmail: accountData.email,
						accountName: accountData.name,
						accountSubdomain: accountData.subdomain,
						message: 'Token byl obnoven a je platný',
						refreshed: true
					});
				}
			}

			return json({
				success: false,
				tokenValid: false,
				error: 'Token je neplatný a nepodařilo se ho obnovit',
				requiresReauth: true
			}, { status: 401 });
		}

	} catch (error) {
		console.error('Token test error:', error);
		return json({ 
			error: `Chyba při testování tokenu: ${error instanceof Error ? error.message : 'Unknown error'}`,
			success: false 
		}, { status: 500 });
	}
}; 