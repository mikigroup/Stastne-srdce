import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals: { supabase, safeGetSession } }) => {
	const { session } = await safeGetSession();
	
	if (!session) {
		return json({ error: 'Nepřihlášený uživatel' }, { status: 401 });
	}

	try {
		const { slug } = await request.json();

		if (!slug) {
			return json({ error: 'Chybí slug parametr' }, { status: 400 });
		}

		// Validace formátu slugu
		const slugPattern = /^[a-z0-9-]+$/;
		if (!slugPattern.test(slug)) {
			return json({ 
				error: 'Neplatný formát slugu. Povoleny jsou pouze malá písmena, čísla a pomlčky.' 
			}, { status: 400 });
		}

		// Získáme OAuth token z databáze
		const { data: tokenData, error: tokenError } = await supabase
			.from('fakturoid_tokens')
			.select('access_token')
			.eq('user_id', session.user.id)
			.eq('status', 'active')
			.single();

		if (tokenError || !tokenData?.access_token) {
			return json({ 
				error: 'Fakturoid token není dostupný. Připojte si účet znovu.' 
			}, { status: 401 });
		}

		// NEJDŘÍVE OTESTUJEME ZÁKLADNÍ PŘÍSTUP
		console.log('=== DEBUGGING FAKTUROID ACCESS ===');
		console.log('Testing token with /user.json endpoint...');

		const userTestResponse = await fetch('https://app.fakturoid.cz/api/v3/user.json', {
			headers: {
				'Authorization': `Bearer ${tokenData.access_token}`,
				'User-Agent': 'StastneSrdce-App (support@stastne-srdce.cz)',
				'Content-Type': 'application/json'
			}
		});

		console.log('User endpoint response status:', userTestResponse.status);

		if (!userTestResponse.ok) {
			const userError = await userTestResponse.text();
			console.error('User endpoint failed:', userError);
			return json({ 
				error: `OAuth token není platný nebo vypršel (${userTestResponse.status}). Připojte si účet znovu.` 
			}, { status: 401 });
		}

		const userData = await userTestResponse.json();
		console.log('User data from API:', {
			email: userData.email,
			name: userData.name,
			accountsCount: userData.accounts?.length || 0
		});

		console.log('Available accounts from API:');
		if (userData.accounts) {
			userData.accounts.forEach((acc: any, index: number) => {
				console.log(`Account ${index}:`, {
					id: acc.id,
					name: acc.name,
					slug: acc.slug,
					subdomain: acc.subdomain,
					email: acc.email
				});
			});
		}

		// Ověříme, zda máme přístup k zadanému slugu
		const hasAccessToSlug = userData.accounts?.some((acc: any) => 
			acc.slug === slug || acc.subdomain === slug
		);

		console.log(`Access check for slug "${slug}":`, hasAccessToSlug);

		if (!hasAccessToSlug) {
			const availableSlugs = userData.accounts?.map((acc: any) => acc.slug || acc.subdomain) || [];
			return json({ 
				error: `Nemáte přístup k účtu "${slug}". Dostupné slugy: ${availableSlugs.join(', ')}`,
				availableSlugs: availableSlugs
			}, { status: 403 });
		}

		// Test API volání na konkrétní slug
		const testUrl = `https://app.fakturoid.cz/api/v3/accounts/${slug}.json`;
		console.log('Testing Fakturoid slug:', testUrl);

		const response = await fetch(testUrl, {
			headers: {
				'Authorization': `Bearer ${tokenData.access_token}`,
				'User-Agent': 'StastneSrdce-App (support@stastne-srdce.cz)',
				'Content-Type': 'application/json'
			}
		});

		console.log('Fakturoid API response status:', response.status);

		if (response.ok) {
			const accountData = await response.json();
			console.log('Account data for slug:', slug, accountData);

			return json({
				success: true,
				slug: slug,
				accountName: accountData.name,
				accountData: {
					id: accountData.id,
					name: accountData.name,
					email: accountData.email,
					subdomain: accountData.subdomain,
					currency: accountData.currency,
					plan: accountData.plan
				}
			});

		} else {
			const errorText = await response.text();
			console.error('Fakturoid API error for slug:', slug, response.status, errorText);

			if (response.status === 404) {
				return json({ 
					error: `Účet se slugem "${slug}" nebyl nalezen nebo nemáte k němu přístup.` 
				}, { status: 404 });
			} else if (response.status === 401) {
				return json({ 
					error: 'OAuth token není platný. Připojte si účet znovu.' 
				}, { status: 401 });
			} else {
				return json({ 
					error: `Chyba Fakturoid API: ${response.status}` 
				}, { status: response.status });
			}
		}

	} catch (error) {
		console.error('Chyba při testování Fakturoid slugu:', error);
		return json({ 
			error: 'Neočekávaná chyba při testování slugu' 
		}, { status: 500 });
	}
};

export const GET: RequestHandler = async ({ locals: { supabase } }) => {
	try {
		console.log('🔍 TESTING: Which account does stastnesrdce refresh token belong to?');

		// Načteme stastnesrdce token
		const { data: tokenData, error: tokenError } = await supabase
			.from('fakturoid_tokens')
			.select('*')
			.eq('account_email', 'stastnesrdcekk@seznam.cz')
			.limit(1);

		if (tokenError || !tokenData || tokenData.length === 0) {
			return json({ error: 'Token not found' }, { status: 404 });
		}

		const token = tokenData[0];
		console.log('📧 Token found for email:', token.account_email);
		console.log('🏢 Account name in DB:', token.account_name || 'EMPTY');

		// Otestujeme s access tokenem
		const testResponse = await fetch('https://app.fakturoid.cz/api/v3/user.json', {
			headers: {
				'Authorization': `Bearer ${token.access_token}`,
				'User-Agent': 'StastneSrdce-App (support@stastne-srdce.cz)',
				'Content-Type': 'application/json'
			}
		});

		if (!testResponse.ok) {
			console.log('❌ Access token failed, trying refresh...');
			
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

			if (!refreshResponse.ok) {
				const errorText = await refreshResponse.text();
				return json({ 
					error: 'Refresh failed', 
					details: errorText,
					status: refreshResponse.status 
				}, { status: 400 });
			}

			const refreshData = await refreshResponse.json();
			console.log('✅ Refresh successful');

			// Teď se zeptáme na účet s novým tokenem
			const accountResponse = await fetch('https://app.fakturoid.cz/api/v3/user.json', {
				headers: {
					'Authorization': `Bearer ${refreshData.access_token}`,
					'User-Agent': 'StastneSrdce-App (support@stastne-srdce.cz)',
					'Content-Type': 'application/json'
				}
			});

			if (!accountResponse.ok) {
				return json({ error: 'Account check failed' }, { status: 400 });
			}

			const accountData = await accountResponse.json();
			console.log('🏢 REAL ACCOUNT DATA:', accountData);

			return json({
				success: true,
				tokenEmail: token.account_email,
				tokenAccountName: token.account_name || 'EMPTY',
				realAccountData: {
					name: accountData.name,
					email: accountData.email,
					subdomain: accountData.subdomain,
					full_name: accountData.full_name
				},
				match: accountData.email === token.account_email
			});
		}

		// Access token funguje
		const accountData = await testResponse.json();
		console.log('🏢 ACCOUNT DATA:', accountData);

		return json({
			success: true,
			tokenEmail: token.account_email,
			tokenAccountName: token.account_name || 'EMPTY',
			realAccountData: {
				name: accountData.name,
				email: accountData.email,
				subdomain: accountData.subdomain,
				full_name: accountData.full_name
			},
			match: accountData.email === token.account_email
		});

	} catch (error) {
		console.error('Test error:', error);
		return json({ 
			error: error instanceof Error ? error.message : 'Unknown error' 
		}, { status: 500 });
	}
}; 