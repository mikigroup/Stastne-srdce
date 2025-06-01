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
	console.log('Attempting to get access token from database...');
	
	// Check if we have a cached token that's still valid
	if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
		console.log('Using cached token');
		return cachedToken;
	}
	
	try {
		// Získáme aktuálního uživatele
		const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
		if (userError || !user) {
			console.error('No authenticated user found');
			return null;
		}

		// Načteme token z databáze
		const { data: tokenData, error: tokenError } = await supabaseClient
			.from('fakturoid_tokens')
			.select('*')
			.eq('user_id', user.id)
			.maybeSingle();

		if (tokenError) {
			console.error('Error fetching token from database:', tokenError);
			return null;
		}

		if (!tokenData) {
			console.log('No Fakturoid token found for user');
			return null;
		}

		// Zkontrolujeme, zda token není expirovaný
		const expiresAt = new Date(tokenData.expires_at);
		const now = new Date();
		
		if (now >= expiresAt) {
			console.log('Token expired, attempting to refresh...');
			
			// Pokusíme se obnovit token pomocí refresh tokenu
			const refreshedToken = await refreshAccessTokenWithSupabase(tokenData.refresh_token, user.id, supabaseClient);
			if (refreshedToken) {
				cachedToken = refreshedToken;
				tokenExpiry = Date.now() + (2 * 60 * 60 * 1000); // 2 hodiny
				return cachedToken;
			} else {
				console.error('Failed to refresh token');
				return null;
			}
		}

		// Token je stále platný
		cachedToken = tokenData.access_token;
		tokenExpiry = expiresAt.getTime();
		
		console.log('Successfully retrieved access token from database');
		return cachedToken;
		
	} catch (error) {
		console.error('Error getting access token:', error);
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
		const { PRIVATE_FAKTUROID_CLIENT_ID, PRIVATE_FAKTUROID_CLIENT_SECRET } = await import('$env/static/private');
		
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

		if (!response.ok) {
			const errorText = await response.text();
			console.error('Token refresh failed:', response.status, errorText);
			return null;
		}

		const tokenData = await response.json();

		// Uložíme nový token do databáze
		const { error: updateError } = await supabaseClient
			.from('fakturoid_tokens')
			.update({
				access_token: tokenData.access_token,
				refresh_token: tokenData.refresh_token || refreshToken, // Někdy se refresh token nemění
				expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
				updated_at: new Date().toISOString()
			})
			.eq('user_id', userId);

		if (updateError) {
			console.error('Failed to update token in database:', updateError);
			return null;
		}

		console.log('Token successfully refreshed');
		return tokenData.access_token;

	} catch (error) {
		console.error('Error refreshing token:', error);
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

		await supabase
			.from('fakturoid_tokens')
			.delete()
			.eq('user_id', user.id);

		// Vymažeme cache
		cachedToken = null;
		tokenExpiry = null;

	} catch (error) {
		console.error('Error clearing stored token:', error);
	}
}
