import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals: { supabase } }) => {
	try {
		console.log('🔍 TESTING: Testing all tokens in database');

		// Načteme všechny tokeny
		const { data: allTokens, error: tokenError } = await supabase
			.from('fakturoid_tokens')
			.select('*')
			.in('status', ['active', 'expired']);

		if (tokenError || !allTokens || allTokens.length === 0) {
			return json({ error: 'No tokens found' }, { status: 404 });
		}

		console.log(`📊 Found ${allTokens.length} tokens in database`);

		const results = [];

		// Testujme každý token
		for (const token of allTokens) {
			console.log(`\n🧪 Testing token for: ${token.account_email}`);
			console.log('🏢 Account name in DB:', token.account_name || 'EMPTY');

			const result = {
				tokenEmail: token.account_email,
				tokenAccountName: token.account_name || 'EMPTY',
				tokenStatus: token.status,
				expiresAt: token.expires_at,
				realAccountData: null as any,
				match: false,
				error: null as string | null
			};

			try {
				// Test s access tokenem
				const testResponse = await fetch('https://app.fakturoid.cz/api/v3/user.json', {
					headers: {
						'Authorization': `Bearer ${token.access_token}`,
						'User-Agent': 'StastneSrdce-App (support@stastne-srdce.cz)',
						'Content-Type': 'application/json'
					}
				});

				if (testResponse.ok) {
					const accountData = await testResponse.json();
					console.log('✅ Access token works, account:', accountData.email);
					
					result.realAccountData = {
						name: accountData.name,
						email: accountData.email,
						subdomain: accountData.subdomain,
						full_name: accountData.full_name
					};
					result.match = accountData.email === token.account_email;

				} else {
					console.log('❌ Access token expired, trying refresh...');
					
					// Zkusíme refresh token
					const refreshResponse = await fetch('https://app.fakturoid.cz/api/v3/oauth2/token', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/x-www-form-urlencoded',
							'User-Agent': 'StastneSrdce-App (support@stastne-srdce.cz)'
						},
						body: new URLSearchParams({
							grant_type: 'refresh_token',
							refresh_token: token.refresh_token,
							client_id: 'stastnesrdce',
							client_secret: 'nKCGJEGHBFKNFLDCFN'
						})
					});

					if (refreshResponse.ok) {
						const refreshData = await refreshResponse.json();
						console.log('✅ Refresh successful');

						// Test s novým tokenem
						const accountResponse = await fetch('https://app.fakturoid.cz/api/v3/user.json', {
							headers: {
								'Authorization': `Bearer ${refreshData.access_token}`,
								'User-Agent': 'StastneSrdce-App (support@stastne-srdce.cz)',
								'Content-Type': 'application/json'
							}
						});

						if (accountResponse.ok) {
							const accountData = await accountResponse.json();
							console.log('🏢 REAL ACCOUNT:', accountData.email, '(after refresh)');
							
							result.realAccountData = {
								name: accountData.name,
								email: accountData.email,
								subdomain: accountData.subdomain,
								full_name: accountData.full_name,
								refreshed: true
							};
							result.match = accountData.email === token.account_email;
						} else {
							result.error = 'Account check failed after refresh';
						}
					} else {
						const errorText = await refreshResponse.text();
						result.error = `Refresh failed: ${errorText}`;
						console.log('❌ Refresh failed:', errorText);
					}
				}
			} catch (error) {
				result.error = error instanceof Error ? error.message : 'Unknown error';
				console.error('❌ Token test error:', error);
			}

			results.push(result);
		}

		// Shrnutí výsledků
		console.log('\n📋 SUMMARY:');
		results.forEach((result, index) => {
			console.log(`Token ${index + 1}: ${result.tokenEmail}`);
			console.log(`- DB name: ${result.tokenAccountName}`);
			console.log(`- Real account: ${result.realAccountData?.email || 'ERROR'}`);
			console.log(`- Match: ${result.match ? '✅' : '❌'}`);
			console.log(`- Error: ${result.error || 'None'}`);
		});

		return json({
			success: true,
			tokensCount: allTokens.length,
			results: results
		});

	} catch (error) {
		console.error('Test error:', error);
		return json({ 
			error: error instanceof Error ? error.message : 'Unknown error' 
		}, { status: 500 });
	}
}; 