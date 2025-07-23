import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals: { supabase, safeGetSession } }) => {
	const { session } = await safeGetSession();
	
	if (!session) {
		return json({ error: 'Nepřihlášený uživatel' }, { status: 401 });
	}

	try {
		console.log('🔍 DEBUG: Analýza všech Fakturoid tokenů v systému');

		// Načteme všechny tokeny
		const { data: allTokens, error: tokenError } = await supabase
			.from('fakturoid_tokens')
			.select('*')
			.order('updated_at', { ascending: false });

		if (tokenError) {
			return json({ 
				error: 'Chyba při načítání tokenů',
				success: false,
				details: tokenError.message
			}, { status: 500 });
		}

		const now = new Date();
		const debugInfo = {
			totalTokens: allTokens?.length || 0,
			tokens: allTokens?.map(token => {
				const expiresAt = new Date(token.expires_at);
				const isExpired = now >= expiresAt;
				const minutesToExpiry = Math.floor((expiresAt.getTime() - now.getTime()) / (1000 * 60));
				
				return {
					id: token.id,
					user_id: token.user_id,
					account_email: token.account_email,
					account_name: token.account_name,
					status: token.status,
					expires_at: token.expires_at,
					isExpired,
					minutesToExpiry,
					refresh_attempts: token.refresh_attempts,
					last_used_at: token.last_used_at,
					updated_at: token.updated_at,
					hasRefreshToken: !!token.refresh_token,
					refreshTokenLength: token.refresh_token?.length || 0,
					accessTokenLength: token.access_token?.length || 0
				};
			}) || [],
			currentTime: now.toISOString(),
			analysis: {
				activeTokens: allTokens?.filter(t => t.status === 'active').length || 0,
				expiredTokens: allTokens?.filter(t => t.status === 'expired').length || 0,
				refreshingTokens: allTokens?.filter(t => t.status === 'refreshing').length || 0,
				revokedTokens: allTokens?.filter(t => t.status === 'revoked').length || 0,
				tokensWithValidExpiry: allTokens?.filter(t => {
					const expiresAt = new Date(t.expires_at);
					return now < expiresAt;
				}).length || 0,
				tokensWithInvalidExpiry: allTokens?.filter(t => {
					const expiresAt = new Date(t.expires_at);
					return now >= expiresAt;
				}).length || 0
			}
		};

		console.log('🔍 DEBUG INFO:', debugInfo);

		return json({
			success: true,
			debugInfo
		});

	} catch (error) {
		console.error('❌ Error in debug token endpoint:', error);
		return json({ 
			error: `Chyba při debugování: ${error instanceof Error ? error.message : 'Unknown error'}`,
			success: false 
		}, { status: 500 });
	}
}; 