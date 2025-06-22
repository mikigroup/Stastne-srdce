import { supabase } from "./supabase";
import type { FakturoidToken } from "./types/fakturoid";
import type { SupabaseClient } from '@supabase/supabase-js';

let cachedToken: string | null = null;
let tokenExpiry: number | null = null;

/**
 * Získá platný access token pro aktuálního uživatele z databáze
 * Pokud je token expirovaný, pokusí se ho obnovit pomocí refresh tokenu
 */
export async function getAccessToken(): Promise<string | null> {
	return getAccessTokenWithSupabase(supabase);
}

/**
 * Získá platný access token s konkrétní supabase instancí
 * Pro použití na serveru s session-aware supabase
 */
export async function getAccessTokenWithSupabase(supabaseClient: SupabaseClient): Promise<string | null> {
	console.log('=== GET ACCESS TOKEN DEBUG START ===');
	console.log('Attempting to get access token from database...');
	
	// Check if we have a cached token that's still valid
	if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
		console.log('Using cached token');
		return cachedToken;
	}
	
	try {
		// Získáme aktuálního uživatele
		const { data, error: userError } = await supabaseClient.auth.getUser();
		if (userError || !data.user) {
			console.error('No authenticated user found');
			return null;
		}

		console.log('User ID:', data.user.id);

		// Načteme token z databáze - zkusíme active i expired tokeny
		const { data: tokens, error: tokenError } = await supabaseClient
			.from('fakturoid_tokens')
			.select('*')
			.in('status', ['active', 'expired'])
			.order('last_used_at', { ascending: false })
			.limit(1);

		if (tokenError) {
			console.error('Error fetching token from database:', tokenError);
			return null;
		}

		const tokenData = tokens && tokens.length > 0 ? tokens[0] : null;

		if (!tokenData) {
			console.log('No Fakturoid token found for user (neither active nor expired)');
			return null;
		}

		console.log('Found token with status:', tokenData.status);
		console.log('Token expires at:', tokenData.expires_at);
		console.log('Current time:', new Date().toISOString());

		// Zkontrolujeme, zda token není expirovaný
		const expiresAt = new Date(tokenData.expires_at);
		const now = new Date();
		const isExpired = now >= expiresAt;
		
		console.log('Token is expired:', isExpired);

		// Pokud je token už expirovaný
		if (isExpired) {
			console.log('Token expired, attempting to refresh...');
			console.log('Refresh token available:', !!tokenData.refresh_token);
			
			// Pokusíme se obnovit token pomocí refresh tokenu
			const refreshedToken = await refreshAccessTokenWithSupabase(tokenData.refresh_token, tokenData.user_id, supabaseClient);
			if (refreshedToken) {
				cachedToken = refreshedToken;
				tokenExpiry = Date.now() + (2 * 60 * 60 * 1000); // 2 hodiny
				
				// Označíme token jako používaný
				await markTokenAsUsed(tokenData.user_id, supabaseClient);
				
				console.log('=== GET ACCESS TOKEN DEBUG END: SUCCESS ===');
				return cachedToken;
			} else {
				console.error('Failed to refresh token');
				console.log('=== GET ACCESS TOKEN DEBUG END: FAILED REFRESH ===');
				return null;
			}
		}

		// Pokud token expiruje do 30 minut, spustíme proaktivní refresh na pozadí
		const thirtyMinutesFromNow = new Date(Date.now() + 30 * 60 * 1000);
		if (expiresAt <= thirtyMinutesFromNow) {
			console.log('Token expires soon, starting proactive refresh...');
			// Spustíme refresh na pozadí (neblokující)
			refreshUserToken(tokenData.user_id, supabaseClient).catch(error => {
				console.error('Background token refresh failed:', error);
			});
		}

		// Token je stále platný
		cachedToken = tokenData.access_token;
		tokenExpiry = expiresAt.getTime();
		
		// Označíme token jako používaný
		await markTokenAsUsed(tokenData.user_id, supabaseClient);
		
		console.log('Successfully retrieved valid access token from database');
		console.log('=== GET ACCESS TOKEN DEBUG END: VALID TOKEN ===');
		return cachedToken;
		
	} catch (error) {
		console.error('Error getting access token:', error);
		console.log('=== GET ACCESS TOKEN DEBUG END: ERROR ===');
		return null;
	}
}

/**
 * Obnoví access token pomocí refresh tokenu
 */
async function refreshAccessToken(refreshToken: string, userId: string): Promise<string | null> {
	return refreshAccessTokenWithSupabase(refreshToken, userId, supabase);
}

/**
 * Obnoví access token pomocí refresh tokenu s konkrétní supabase instancí
 */
async function refreshAccessTokenWithSupabase(refreshToken: string, userId: string, supabaseClient: SupabaseClient): Promise<string | null> {
	try {
		console.log('Starting token refresh for user:', userId);
		
		const { PRIVATE_FAKTUROID_CLIENT_ID, PRIVATE_FAKTUROID_CLIENT_SECRET } = await import('$env/static/private');
		
		if (!PRIVATE_FAKTUROID_CLIENT_ID || !PRIVATE_FAKTUROID_CLIENT_SECRET) {
			console.error('Missing Fakturoid client credentials');
			return null;
		}
		
		if (!refreshToken) {
			console.error('No refresh token provided');
			return null;
		}
		
		// Získáme současný počet pokusů o refresh
		const { data: currentToken } = await supabaseClient
			.from('fakturoid_tokens')
			.select('refresh_attempts')
			.eq('user_id', userId)
			.single();
		
		const attemptCount = (currentToken?.refresh_attempts || 0) + 1;
		
		// Označíme token jako refreshing
		await supabaseClient
			.from('fakturoid_tokens')
			.update({
				status: 'refreshing',
				refresh_attempts: attemptCount,
				updated_at: new Date().toISOString()
			})
			.eq('user_id', userId);
		
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
				refresh_token: refreshToken
			}).toString()
		});

		console.log('=== FAKTUROID REFRESH DEBUG ===');
		console.log('Token refresh response status:', response.status);
		console.log('Token refresh response headers:', Object.fromEntries(response.headers.entries()));

		if (!response.ok) {
			const errorText = await response.text();
			console.error('=== FAKTUROID REFRESH ERROR ===');
			console.error('Status:', response.status);
			console.error('Status text:', response.statusText);
			console.error('Error response body:', errorText);
			console.error('Refresh token length:', refreshToken?.length || 0);
			console.error('Client ID present:', !!PRIVATE_FAKTUROID_CLIENT_ID);
			console.error('Client secret present:', !!PRIVATE_FAKTUROID_CLIENT_SECRET);
			console.error('=== END ERROR DEBUG ===');
			
			// Pokud je refresh token neplatný (400, 401), smažeme ho z databáze
			if (response.status === 400 || response.status === 401) {
				console.log('Invalid refresh token, removing from database');
				await supabaseClient
					.from('fakturoid_tokens')
					.delete()
					.eq('user_id', userId);
			} else {
				// Jiné chyby - označíme jako expired
				await supabaseClient
					.from('fakturoid_tokens')
					.update({
						status: 'expired'
					})
					.eq('user_id', userId);
			}
			
			return null;
		}

		const tokenData = await response.json();
		console.log('=== FAKTUROID REFRESH SUCCESS ===');
		console.log('New token received, expires in:', tokenData.expires_in, 'seconds');
		console.log('New access token length:', tokenData.access_token?.length || 0);
		console.log('New refresh token length:', tokenData.refresh_token?.length || 0);
		console.log('=== END SUCCESS DEBUG ===');

		// Uložíme nový token do databáze
		const { error: updateError } = await supabaseClient
			.from('fakturoid_tokens')
			.update({
				access_token: tokenData.access_token,
				refresh_token: tokenData.refresh_token || refreshToken, // Někdy se refresh token nemění
				expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
				status: 'active',
				last_used_at: new Date().toISOString(),
				updated_at: new Date().toISOString()
			})
			.eq('user_id', userId);

		if (updateError) {
			console.error('Failed to update token in database:', updateError);
			return null;
		}

		console.log('Token successfully refreshed and saved');
		return tokenData.access_token;

	} catch (error) {
		console.error('Error refreshing token:', error);
		
		// V případě chyby označíme jako expired
		await supabaseClient
			.from('fakturoid_tokens')
			.update({
				status: 'expired'
			})
			.eq('user_id', userId);
		
		return null;
	}
}

/**
 * Vymaže uložený token (při odpojení účtu)
 */
export async function clearStoredToken(): Promise<void> {
	try {
		const { data: { user } } = await supabase.auth.getUser();
		if (!user) return;

		// Místo smazání označíme token jako revoked pro audit trail
		await supabase
			.from('fakturoid_tokens')
			.update({
				status: 'revoked',
				updated_at: new Date().toISOString()
			})
			.eq('user_id', user.id);

		// Vymažeme cache
		cachedToken = null;
		tokenExpiry = null;

		console.log('Token marked as revoked');

	} catch (error) {
		console.error('Error clearing stored token:', error);
	}
}

/**
 * Vymaže pouze cache (ne databázi) - použije se při 401 chybách
 */
export function clearTokenCache(): void {
	cachedToken = null;
	tokenExpiry = null;
	console.log('Token cache cleared');
}

/**
 * Najde tokeny expirující do zadaného počtu minut
 * @param minutesFromNow Za kolik minut expirují (default: 30)
 * @param supabaseClient Supabase instance
 */
export async function getTokensExpiringSoon(minutesFromNow: number = 30, supabaseClient: SupabaseClient): Promise<any[]> {
	try {
		const expiryThreshold = new Date(Date.now() + minutesFromNow * 60 * 1000);
		
		const { data: tokens, error } = await supabaseClient
			.from('fakturoid_tokens')
			.select('*')
			.eq('status', 'active')
			.lt('expires_at', expiryThreshold.toISOString());

		if (error) {
			console.error('Error fetching expiring tokens:', error);
			return [];
		}

		console.log(`Found ${tokens?.length || 0} tokens expiring within ${minutesFromNow} minutes`);
		return tokens || [];
	} catch (error) {
		console.error('Error in getTokensExpiringSoon:', error);
		return [];
	}
}

/**
 * Proaktivně obnoví konkrétní token podle user_id
 * @param userId ID uživatele
 * @param supabaseClient Supabase instance
 */
export async function refreshUserToken(userId: string, supabaseClient: SupabaseClient): Promise<boolean> {
	try {
		console.log(`Proactively refreshing token for user: ${userId}`);

		// Načteme token uživatele
		const { data: tokenData, error: tokenError } = await supabaseClient
			.from('fakturoid_tokens')
			.select('*')
			.eq('user_id', userId)
			.eq('status', 'active')
			.maybeSingle();

		if (tokenError || !tokenData) {
			console.error(`No active token found for user ${userId}:`, tokenError);
			return false;
		}

		// Označíme token jako refresh v procesu
		await supabaseClient
			.from('fakturoid_tokens')
			.update({
				status: 'refreshing',
				refresh_attempts: (tokenData.refresh_attempts || 0) + 1,
				updated_at: new Date().toISOString()
			})
			.eq('user_id', userId);

		// Pokusíme se refresh
		const refreshedToken = await refreshAccessTokenWithSupabase(
			tokenData.refresh_token, 
			userId, 
			supabaseClient
		);

		if (refreshedToken) {
			// Úspěšný refresh - označíme jako active
			await supabaseClient
				.from('fakturoid_tokens')
				.update({
					status: 'active',
					last_used_at: new Date().toISOString()
				})
				.eq('user_id', userId);

			console.log(`Token for user ${userId} successfully refreshed proactively`);
			return true;
		} else {
			// Neúspěšný refresh - označíme jako expired
			await supabaseClient
				.from('fakturoid_tokens')
				.update({
					status: 'expired'
				})
				.eq('user_id', userId);

			console.error(`Failed to refresh token for user ${userId}`);
			return false;
		}
	} catch (error) {
		console.error(`Error refreshing token for user ${userId}:`, error);
		
		// V případě chyby označíme jako expired
		await supabaseClient
			.from('fakturoid_tokens')
			.update({
				status: 'expired'
			})
			.eq('user_id', userId);

		return false;
	}
}

/**
 * Hlavní funkce pro proaktivní údržbu všech tokenů
 * Volá se ze scheduled job nebo manuálně
 * @param supabaseClient Supabase instance
 */
export async function maintainAllTokens(supabaseClient: SupabaseClient): Promise<{ refreshed: number; failed: number }> {
	try {
		console.log('Starting proactive token maintenance...');

		// Najdeme tokeny expirující do 30 minut
		const expiringTokens = await getTokensExpiringSoon(30, supabaseClient);
		
		if (expiringTokens.length === 0) {
			console.log('No tokens need maintenance');
			return { refreshed: 0, failed: 0 };
		}

		let refreshed = 0;
		let failed = 0;

		// Refresh každý token postupně (ne paralelně kvůli rate limiting)
		for (const token of expiringTokens) {
			const success = await refreshUserToken(token.user_id, supabaseClient);
			if (success) {
				refreshed++;
			} else {
				failed++;
			}
			
			// Malá pauza mezi requesty
			await new Promise(resolve => setTimeout(resolve, 1000));
		}

		console.log(`Token maintenance completed: ${refreshed} refreshed, ${failed} failed`);
		return { refreshed, failed };
	} catch (error) {
		console.error('Error in maintainAllTokens:', error);
		return { refreshed: 0, failed: 0 };
	}
}

/**
 * Označí token jako používaný (pro tracking posledního použití)
 * @param userId ID uživatele
 * @param supabaseClient Supabase instance
 */
export async function markTokenAsUsed(userId: string, supabaseClient: SupabaseClient): Promise<void> {
	try {
		await supabaseClient
			.from('fakturoid_tokens')
			.update({
				last_used_at: new Date().toISOString()
			})
			.eq('user_id', userId);
	} catch (error) {
		console.error('Error marking token as used:', error);
	}
}
