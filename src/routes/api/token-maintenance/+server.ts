import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { maintainAllTokens } from '$lib/fakturoidAuth';
import { supabase } from '$lib/supabase';

/**
 * API endpoint pro proaktivní údržbu Fakturoid tokenů
 * Volá se z cron job nebo manuálně
 */
export const POST: RequestHandler = async ({ request }) => {
	try {
		console.log('Token maintenance endpoint called');
		
		// Volitelný API klíč pro bezpečnost (z headers)
		const apiKey = request.headers.get('authorization');
		const expectedKey = process.env.PRIVATE_TOKEN_MAINTENANCE_KEY;
		
		if (expectedKey && apiKey !== `Bearer ${expectedKey}`) {
			console.warn('Invalid API key for token maintenance');
			return json({ error: 'Unauthorized' }, { status: 401 });
		}

		// Spustíme údržbu tokenů
		const result = await maintainAllTokens(supabase);
		
		const response = {
			success: true,
			message: 'Token maintenance completed',
			timestamp: new Date().toISOString(),
			...result
		};

		console.log('Token maintenance result:', response);
		return json(response);

	} catch (error) {
		console.error('Error in token maintenance endpoint:', error);
		
		return json({
			success: false,
			error: 'Internal server error',
			message: error instanceof Error ? error.message : 'Unknown error',
			timestamp: new Date().toISOString()
		}, { status: 500 });
	}
};

/**
 * GET endpoint pro kontrolu stavu tokenů (debugging)
 */
export const GET: RequestHandler = async ({ url }) => {
	try {
		const minutesParam = url.searchParams.get('minutes');
		const minutes = minutesParam ? parseInt(minutesParam) : 30;
		
		// Import funkce
		const { getTokensExpiringSoon } = await import('$lib/fakturoidAuth');
		
		// Najdeme tokeny expirující brzo
		const expiringTokens = await getTokensExpiringSoon(minutes, supabase);
		
		return json({
			success: true,
			expiringTokens: expiringTokens.map(token => ({
				user_id: token.user_id,
				account_email: token.account_email,
				expires_at: token.expires_at,
				status: token.status,
				refresh_attempts: token.refresh_attempts,
				last_used_at: token.last_used_at
			})),
			count: expiringTokens.length,
			minutesFromNow: minutes,
			timestamp: new Date().toISOString()
		});

	} catch (error) {
		console.error('Error in token status endpoint:', error);
		
		return json({
			success: false,
			error: 'Internal server error',
			message: error instanceof Error ? error.message : 'Unknown error'
		}, { status: 500 });
	}
}; 