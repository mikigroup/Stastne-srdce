import { supabase } from "./supabase";
import type { FakturoidToken } from "./types/fakturoid";
import type { SupabaseClient } from '@supabase/supabase-js';
import { fakturoidCircuitBreaker } from './fakturoidCircuitBreaker';

let cachedToken: string | null = null;
let tokenExpiry: number | null = null;

/**
 * Exponential backoff konfigurace
 */
interface RetryConfig {
	maxAttempts: number;
	baseDelayMs: number;
	maxDelayMs: number;
	backoffMultiplier: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
	maxAttempts: 3,
	baseDelayMs: 1000, // 1 sekunda
	maxDelayMs: 30000, // 30 sekund
	backoffMultiplier: 2
};

/**
 * Implementuje exponential backoff delay
 */
async function delay(ms: number): Promise<void> {
	return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Vypočítá delay pro exponential backoff
 */
function calculateBackoffDelay(attempt: number, config: RetryConfig): number {
	const exponentialDelay = config.baseDelayMs * Math.pow(config.backoffMultiplier, attempt - 1);
	const jitteredDelay = exponentialDelay * (0.5 + Math.random() * 0.5); // Přidá jitter
	return Math.min(jitteredDelay, config.maxDelayMs);
}

/**
 * Generická retry funkce s exponential backoff
 */
async function retryWithBackoff<T>(
	operation: () => Promise<T>,
	config: RetryConfig = DEFAULT_RETRY_CONFIG,
	operationName = 'unknown'
): Promise<T> {
	let lastError: any;

	for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
		try {
			console.log(`🔄 Attempt ${attempt}/${config.maxAttempts}: ${operationName}`);
			return await operation();
		} catch (error: any) {
			lastError = error;
			console.error(`❌ Attempt ${attempt} failed for ${operationName}:`, error?.message || error);

			// Pokud je to poslední pokus, nebo se jedná o non-retryable error, nevyčkáváme
			if (attempt === config.maxAttempts || isNonRetryableError(error)) {
				break;
			}

			const delayMs = calculateBackoffDelay(attempt, config);
			console.log(`⏳ Waiting ${delayMs}ms before next attempt...`);
			await delay(delayMs);
		}
	}

	console.error(`🚫 All attempts failed for ${operationName}`);
	throw lastError;
}

/**
 * Určuje, zda je chyba non-retryable (např. 401, 403)
 */
function isNonRetryableError(error: any): boolean {
	// HTTP status codes které neměníme opakováním
	const nonRetryableStatuses = [400, 401, 403, 404, 422];
	
	if (error?.status && nonRetryableStatuses.includes(error.status)) {
		return true;
	}
	
	// Response objekt s non-retryable statusem
	if (error?.response?.status && nonRetryableStatuses.includes(error.response.status)) {
		return true;
	}
	
	return false;
}

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
 * ZMĚNA: Globální přístup - hledá jakýkoliv aktivní token v systému
 */
export async function getAccessTokenWithSupabase(supabaseClient: SupabaseClient): Promise<string | null> {
	console.log('=== GLOBAL ACCESS TOKEN DEBUG START ===');
	console.log('Attempting to get global access token from database...');
	
	// Check if we have a cached token that's still valid
	if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
		console.log('Using cached token');
		return cachedToken;
	}
	
	try {
		console.log('🌐 Searching for any active Fakturoid token in the system...');

		// GLOBÁLNÍ PŘÍSTUP: Najdeme JAKÝKOLIV aktivní token v systému
		// V globálním systému máme pouze jeden token na Fakturoid účet
		const { data: tokens, error: tokenError } = await supabaseClient
			.from('fakturoid_tokens')
			.select('*')
			.eq('status', 'active')
			.order('last_used_at', { ascending: false })
			.limit(1);

		if (tokenError) {
			console.error('Error fetching global token from database:', tokenError);
			return null;
		}

		if (!tokens || tokens.length === 0) {
			console.log('No Fakturoid token found in the system');
			return null;
		}

		const tokenData = tokens[0];
		console.log('Found global token for:', tokenData.account_email, 'owned by user:', tokenData.user_id);
		console.log('Token expires at:', tokenData.expires_at);
		console.log('Current time:', new Date().toISOString());

		// Zkontrolujeme, zda token není expirovaný
		const expiresAt = new Date(tokenData.expires_at);
		const now = new Date();
		const isExpired = now >= expiresAt;
		const minutesToExpiry = Math.floor((expiresAt.getTime() - now.getTime()) / (1000 * 60));
		
		console.log('Token is expired:', isExpired);
		console.log('Minutes to expiry:', minutesToExpiry);

		// Pokud je token už expirovaný NEBO má status 'expired'
		if (isExpired || tokenData.status === 'expired') {
			console.log('Token expired, attempting to refresh...');
			console.log('Refresh token available:', !!tokenData.refresh_token);
			
			// Pokusíme se obnovit token pomocí refresh tokenu
			const refreshedToken = await refreshAccessTokenWithSupabase(tokenData.refresh_token, tokenData.user_id, supabaseClient);
			if (refreshedToken) {
				cachedToken = refreshedToken;
				tokenExpiry = Date.now() + (2 * 60 * 60 * 1000); // 2 hodiny
				
				// Označíme token jako používaný
				await markTokenAsUsed(tokenData.user_id, supabaseClient);
				
				console.log('=== GLOBAL ACCESS TOKEN DEBUG END: SUCCESS ===');
				return cachedToken;
			} else {
				console.error('Failed to refresh global token');
				console.log('=== GLOBAL ACCESS TOKEN DEBUG END: FAILED REFRESH ===');
				return null;
			}
		}

		// Pokud token expiruje do 60 minut (zvětšeno z 30), spustíme proaktivní refresh na pozadí
		const sixtyMinutesFromNow = new Date(Date.now() + 60 * 60 * 1000);
		if (expiresAt <= sixtyMinutesFromNow && tokenData.status === 'active') {
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
		
		console.log('Successfully retrieved valid global access token');
		console.log('=== GLOBAL ACCESS TOKEN DEBUG END: VALID TOKEN ===');
		return cachedToken;
		
	} catch (error) {
		console.error('Error getting global access token:', error);
		console.log('=== GLOBAL ACCESS TOKEN DEBUG END: ERROR ===');
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
		
		// GLOBÁLNÍ SYSTÉM: Najdeme token podle account_email místo user_id
		const { data: currentToken } = await supabaseClient
			.from('fakturoid_tokens')
			.select('refresh_attempts, account_email')
			.eq('user_id', userId)
			.single();
		
		if (!currentToken) {
			console.error('No token found for user:', userId);
			return null;
		}
		
		const attemptCount = (currentToken?.refresh_attempts || 0) + 1;
		
		// Označíme token jako refreshing (podle account_email pro globální systém)
		await supabaseClient
			.from('fakturoid_tokens')
			.update({
				status: 'refreshing',
				refresh_attempts: attemptCount,
				updated_at: new Date().toISOString()
			})
			.eq('account_email', currentToken.account_email);

		// **NOVÉ: Definujeme Fakturoid API operaci s circuit breaker a retry**
		const fakturoidOperation = async () => {
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
				
				// Vytvoří chybu s status kódem pro non-retryable logic
				const error = new Error(`Fakturoid API returned ${response.status}: ${response.statusText}`);
				(error as any).status = response.status;
				(error as any).response = { status: response.status };
				throw error;
			}

			return response.json();
		};

		// **NOVÉ: Volání s circuit breaker a exponential backoff**
		const tokenData = await fakturoidCircuitBreaker.execute(
			async () => {
				return await retryWithBackoff(
					fakturoidOperation,
					{
						maxAttempts: 3,
						baseDelayMs: 2000, // 2 sekundy pro token refresh
						maxDelayMs: 20000, // Maximum 20 sekund
						backoffMultiplier: 2
					},
					`refresh-token-user-${userId}`
				);
			},
			`refresh-token-circuit-breaker-user-${userId}`
		);
		
		console.log('=== FAKTUROID REFRESH SUCCESS ===');
		console.log('New token received, expires in:', tokenData.expires_in, 'seconds');
		console.log('New access token length:', tokenData.access_token?.length || 0);
		console.log('New refresh token length:', tokenData.refresh_token?.length || 0);
		console.log('=== END SUCCESS DEBUG ===');

		// GLOBÁLNÍ SYSTÉM: Uložíme nový token podle account_email
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
			.eq('account_email', currentToken.account_email);

		if (updateError) {
			console.error('Failed to update token in database:', updateError);
			return null;
		}

		console.log('Token successfully refreshed and saved');
		return tokenData.access_token;

	} catch (error: any) {
		console.error('Error refreshing token:', error);
		
		// GLOBÁLNÍ SYSTÉM: Error handling - najdeme token podle user_id
		try {
			const { data: errorToken } = await supabaseClient
				.from('fakturoid_tokens')
				.select('account_email')
				.eq('user_id', userId)
				.single();
			
			if (errorToken?.account_email) {
				if (error?.status === 400 || error?.status === 401 || error?.response?.status === 400 || error?.response?.status === 401) {
					console.log('Invalid refresh token, removing from database');
					await supabaseClient
						.from('fakturoid_tokens')
						.delete()
						.eq('account_email', errorToken.account_email);
				} else if (error?.message?.includes('Circuit breaker is open')) {
					console.log('Circuit breaker is open, marking token for later retry');
					await supabaseClient
						.from('fakturoid_tokens')
						.update({
							status: 'expired', // Označíme jako expired pro pozdější retry
							updated_at: new Date().toISOString()
						})
						.eq('account_email', errorToken.account_email);
				} else {
					// Jiné chyby - označíme jako expired
					await supabaseClient
						.from('fakturoid_tokens')
						.update({
							status: 'expired'
						})
						.eq('account_email', errorToken.account_email);
				}
			}
		} catch (dbError) {
			console.error('Error handling token error:', dbError);
		}
		
		return null;
	}
}

/**
 * Vymaže všechny uložené Fakturoid tokeny v systému (při odpojení účtu)
 * ZMĚNA: Globální mazání všech tokenů
 */
export async function clearStoredToken(): Promise<void> {
	try {
		console.log('🗑️ Clearing all Fakturoid tokens in the system...');

		// ZMĚNA: Označíme všechny tokeny jako revoked místo mazání pro audit trail
		const { data: updatedTokens, error } = await supabase
			.from('fakturoid_tokens')
			.update({
				status: 'revoked',
				updated_at: new Date().toISOString()
			})
			.neq('status', 'revoked') // Pouze ty, které ještě nejsou revoked
			.select('account_email, user_id');

		if (error) {
			console.error('Error revoking global tokens:', error);
			throw error;
		}

		// Vymažeme cache
		cachedToken = null;
		tokenExpiry = null;

		const revokedCount = updatedTokens?.length || 0;
		console.log(`✅ Marked ${revokedCount} Fakturoid tokens as revoked globally`);
		
		if (updatedTokens && updatedTokens.length > 0) {
			console.log('Revoked tokens:', updatedTokens.map(t => t.account_email).join(', '));
		}

	} catch (error) {
		console.error('Error clearing global stored tokens:', error);
		throw error;
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

		// GLOBÁLNÍ SYSTÉM: Najdeme token podle user_id (pro refresh)
		const { data: tokenData, error: tokenError } = await supabaseClient
			.from('fakturoid_tokens')
			.select('*')
			.eq('user_id', userId)
			.in('status', ['active', 'expired'])
			.order('updated_at', { ascending: false })
			.limit(1);

		if (tokenError || !tokenData || tokenData.length === 0) {
			console.error(`No refreshable token found for user ${userId}:`, tokenError);
			return false;
		}

		const token = tokenData[0];

		// Zkontrolujeme, zda máme refresh token
		if (!token.refresh_token) {
			console.error(`No refresh token available for user ${userId}`);
			await supabaseClient
				.from('fakturoid_tokens')
				.update({ status: 'expired' })
				.eq('account_email', token.account_email);
			return false;
		}

		// Zkontrolujeme, zda už není v procesu refresh
		if (token.status === 'refreshing') {
			console.log(`Token refresh already in progress for user ${userId}`);
			return false;
		}

		// Zkontrolujeme počet pokusů
		if ((token.refresh_attempts || 0) >= 3) {
			console.error(`Too many refresh attempts for user ${userId}`);
			await supabaseClient
				.from('fakturoid_tokens')
				.update({ status: 'expired' })
				.eq('account_email', token.account_email);
			return false;
		}

		// GLOBÁLNÍ SYSTÉM: Označíme token jako refresh v procesu (podle account_email)
		await supabaseClient
			.from('fakturoid_tokens')
			.update({
				status: 'refreshing',
				refresh_attempts: (token.refresh_attempts || 0) + 1,
				updated_at: new Date().toISOString()
			})
			.eq('account_email', token.account_email);

		// Pokusíme se refresh
		const refreshedToken = await refreshAccessTokenWithSupabase(
			token.refresh_token, 
			userId, 
			supabaseClient
		);

		if (refreshedToken) {
			// GLOBÁLNÍ SYSTÉM: Úspěšný refresh - označíme jako active (podle account_email)
			await supabaseClient
				.from('fakturoid_tokens')
				.update({
					status: 'active',
					refresh_attempts: 0, // Reset počtu pokusů
					last_used_at: new Date().toISOString()
				})
				.eq('account_email', token.account_email);

			// Vyčistíme cache, aby se použil nový token
			clearTokenCache();

			console.log(`Token for user ${userId} successfully refreshed proactively`);
			return true;
		} else {
			// GLOBÁLNÍ SYSTÉM: Neúspěšný refresh - označíme jako expired (podle account_email)
			await supabaseClient
				.from('fakturoid_tokens')
				.update({
					status: 'expired'
				})
				.eq('account_email', token.account_email);

			console.error(`Failed to refresh token for user ${userId}`);
			return false;
		}
	} catch (error) {
		console.error(`Error refreshing token for user ${userId}:`, error);
		
		// GLOBÁLNÍ SYSTÉM: V případě chyby označíme jako expired (podle account_email)
		try {
			const { data: errorToken } = await supabaseClient
				.from('fakturoid_tokens')
				.select('account_email')
				.eq('user_id', userId)
				.single();
			
			if (errorToken?.account_email) {
				await supabaseClient
					.from('fakturoid_tokens')
					.update({
						status: 'expired'
					})
					.eq('account_email', errorToken.account_email);
			}
		} catch (dbError) {
			console.error('Error handling refresh error:', dbError);
		}

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
 * @param userId ID uživatele (pro nalezení tokenu)
 * @param supabaseClient Supabase instance
 */
export async function markTokenAsUsed(userId: string, supabaseClient: SupabaseClient): Promise<void> {
	try {
		// GLOBÁLNÍ SYSTÉM: Najdeme token podle user_id a aktualizujeme podle account_email
		const { data: token } = await supabaseClient
			.from('fakturoid_tokens')
			.select('account_email')
			.eq('user_id', userId)
			.single();
		
		if (token?.account_email) {
			await supabaseClient
				.from('fakturoid_tokens')
				.update({
					last_used_at: new Date().toISOString()
				})
				.eq('account_email', token.account_email);
		}
	} catch (error) {
		console.error('Error marking token as used:', error);
	}
}
