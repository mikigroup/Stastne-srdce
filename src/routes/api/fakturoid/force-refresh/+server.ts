import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { refreshUserToken } from '$lib/fakturoidAuth';

export const POST: RequestHandler = async ({ request, locals: { supabase, safeGetSession } }) => {
	const { session } = await safeGetSession();
	
	if (!session) {
		return json({ error: 'Nepřihlášený uživatel' }, { status: 401 });
	}

	// Získáme volitelný parametr pro výběr konkrétního účtu
	let targetAccountEmail = null;
	try {
		const body = await request.json();
		targetAccountEmail = body?.account_email;
	} catch (e) {
		// Pokud není JSON tělo, pokračujeme bez parametru
	}

	try {
		console.log('🌐 Global force refresh token request from admin user:', session.user.id);
		if (targetAccountEmail) {
			console.log('🎯 Target account specified:', targetAccountEmail);
		}

		// ZMĚNA: Najdeme token podle specifikace nebo fallback na globální přístup
		let tokenQuery = supabase
			.from('fakturoid_tokens')
			.select('*')
			.in('status', ['active', 'expired']);

		if (targetAccountEmail) {
			// Pokud je specifikován email, hledáme konkrétní účet
			tokenQuery = tokenQuery.eq('account_email', targetAccountEmail);
		} else {
			// NOVÉ: Priorita pro stastnesrdce účet místo last_used_at
			console.log('🎯 Looking for priority account: stastnesrdcekk@seznam.cz');
			tokenQuery = tokenQuery.eq('account_email', 'stastnesrdcekk@seznam.cz');
		}

		let { data: tokenData, error: tokenError } = await tokenQuery.limit(1);

		// Pokud nenajdeme preferovaný účet, zkusíme fallback na jakýkoliv
		if (tokenError || !tokenData || tokenData.length === 0) {
			console.log('⚠️ Priority account not found, trying fallback to any active token...');
			
			const { data: fallbackData, error: fallbackError } = await supabase
				.from('fakturoid_tokens')
				.select('*')
				.in('status', ['active', 'expired'])
				.order('last_used_at', { ascending: false })
				.limit(1);

			if (fallbackError || !fallbackData || fallbackData.length === 0) {
				const errorMsg = targetAccountEmail 
					? `Token pro účet ${targetAccountEmail} nebyl nalezen`
					: 'Žádný Fakturoid token nebyl nalezen v systému';
				
				return json({ 
					error: `${errorMsg}. Připojte účet znovu.`,
					success: false,
					requiresReauth: true
				}, { status: 404 });
			}

			// Použijeme fallback token
			tokenData = fallbackData;
			console.log('🔄 Using fallback token for:', fallbackData[0].account_email);
		} else {
			console.log('✅ Using priority token for:', tokenData[0].account_email);
		}

		const token = tokenData[0];
		console.log('🔧 Found token for user:', token.user_id, 'email:', token.account_email);

		// Pokusíme se o force refresh s globálním tokenem
		const refreshSuccess = await refreshUserToken(token.user_id, supabase);

		if (refreshSuccess) {
			// NOVÉ: Po úspěšném refreshu aktualizujeme také údaje o účtech
			console.log('🔄 Token refreshed successfully, now updating account info...');
			
			// Načteme čerstvý token z databáze
			const { data: freshToken, error: freshTokenError } = await supabase
				.from('fakturoid_tokens')
				.select('access_token, account_slug')
				.eq('user_id', token.user_id)
				.single();

			if (freshTokenError || !freshToken) {
				console.error('Error fetching fresh token:', freshTokenError);
				return json({
					success: true,
					message: `Token byl obnoven pro účet ${token.account_email}, ale nepodařilo se aktualizovat údaje o účtech`,
					newExpiry: null,
					tokenStatus: 'active',
					refreshAttempts: 0,
					tokenOwner: token.account_email
				});
			}

			// Zavoláme Fakturoid API pro aktuální údaje o účtech
			let userResponse;
			try {
				userResponse = await fetch('https://app.fakturoid.cz/api/v3/user.json', {
					headers: {
						'Authorization': `Bearer ${freshToken.access_token}`,
						'User-Agent': 'StastneSrdce-App (support@stastne-srdce.cz)',
						'Content-Type': 'application/json'
					}
				});

				if (!userResponse.ok) {
					throw new Error(`API responded with ${userResponse.status}`);
				}

				const userData = await userResponse.json();
				console.log('📊 Fresh account data received:', {
					userEmail: userData.email,
					accountsCount: userData.accounts?.length || 0,
					accountNames: userData.accounts?.map((acc: any) => acc.name) || []
				});

				// Najdeme aktivní účet - priorita: současný account_slug nebo první účet
				let activeAccount = null;
				if (freshToken.account_slug && userData.accounts) {
					activeAccount = userData.accounts.find((acc: any) => 
						acc.slug === freshToken.account_slug || acc.subdomain === freshToken.account_slug
					);
				}
				
				// Pokud nenajdeme současný účet, použijeme první dostupný
				if (!activeAccount && userData.accounts?.length > 0) {
					activeAccount = userData.accounts[0];
					console.log('⚠️ Previous account not found, switching to first available account');
				}

				// Aktualizujeme údaje o účtu v databázi
				if (activeAccount) {
					const { error: updateError } = await supabase
						.from('fakturoid_tokens')
						.update({
							account_name: activeAccount.name || userData.name || userData.email,
							account_id: activeAccount.id?.toString() || null,
							account_slug: activeAccount.slug || activeAccount.subdomain || null,
							account_subdomain: activeAccount.slug || activeAccount.subdomain || null,
							account_currency: activeAccount.currency || null,
							account_plan: activeAccount.plan || null,
							updated_at: new Date().toISOString()
						})
						.eq('user_id', token.user_id);

					if (updateError) {
						console.error('Error updating account info:', updateError);
					} else {
						console.log('✅ Account info updated successfully:', {
							accountName: activeAccount.name,
							accountSlug: activeAccount.slug || activeAccount.subdomain,
							accountCurrency: activeAccount.currency
						});
					}
				}

			} catch (apiError) {
				console.error('Error fetching account info from Fakturoid:', apiError);
				// Pokračujeme i když se nezdaří aktualizace účtů - token je refreshnutý
			}

			// Načteme finální aktualizovaný token
			const { data: updatedToken, error: fetchError } = await supabase
				.from('fakturoid_tokens')
				.select('expires_at, status, refresh_attempts, account_name, account_slug')
				.eq('user_id', token.user_id)
				.single();

			if (fetchError) {
				console.error('Error fetching updated token:', fetchError);
				return json({ 
					error: 'Token byl obnoven, ale nepodařilo se načíst nové údaje',
					success: true
				});
			}

			return json({
				success: true,
				message: `Token i údaje o účtu byly úspěšně obnoveny pro ${updatedToken.account_name || token.account_email}`,
				newExpiry: updatedToken.expires_at,
				tokenStatus: updatedToken.status,
				refreshAttempts: updatedToken.refresh_attempts,
				tokenOwner: token.account_email,
				accountName: updatedToken.account_name,
				accountSlug: updatedToken.account_slug
			});

		} else {
			// Refresh selhal - zjistíme proč
			const { data: failedToken } = await supabase
				.from('fakturoid_tokens')
				.select('status, refresh_attempts')
				.eq('user_id', token.user_id)
				.single();

			const attempts = failedToken?.refresh_attempts || 0;
			const requiresReauth = attempts > 3;

			return json({ 
				error: `Nepodařilo se obnovit token pro ${token.account_email} (pokus ${attempts}/3)`,
				success: false,
				requiresReauth,
				refreshAttempts: attempts,
				tokenOwner: token.account_email
			}, { status: 500 });
		}

	} catch (error) {
		console.error('Chyba při force refresh tokenu:', error);
		return json({ 
			error: `Neočekávaná chyba: ${error instanceof Error ? error.message : 'Unknown error'}`,
			success: false 
		}, { status: 500 });
	}
}; 