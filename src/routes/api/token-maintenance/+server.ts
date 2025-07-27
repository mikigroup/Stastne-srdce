import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { maintainAllTokens } from '$lib/fakturoidAuth';

/**
 * API endpoint pro údržbu všech Fakturoid tokenů v systému
 * Může být volán z cron job nebo manuálně z admin rozhraní
 */
export const POST: RequestHandler = async ({ request, locals: { supabase, safeGetSession } }) => {
	try {
		console.log('🔧 Global token maintenance started');

		// Admin kontrola - pouze přihlášení uživatelé mohou spustit údržbu
		const { session } = await safeGetSession();
		if (!session) {
			return json({ error: 'Nepřihlášený uživatel' }, { status: 401 });
		}

		console.log('🌐 Token maintenance triggered by admin user:', session.user.id);
		
		// Volitelný API klíč pro bezpečnost (z headers) - pro cron jobs
		const apiKey = request.headers.get('authorization');
		const expectedKey = process.env.PRIVATE_TOKEN_MAINTENANCE_KEY;
		
		// Pokud je API klíč nastaven, musí se shodovat (pro cron)
		// Pokud není nastaven, stačí být přihlášený (pro admin UI)
		if (expectedKey && apiKey && apiKey !== `Bearer ${expectedKey}`) {
			console.warn('Invalid API key for token maintenance');
			return json({ error: 'Unauthorized' }, { status: 401 });
		}

		// Spustíme údržbu všech tokenů v systému
		const result = await maintainAllTokens(supabase);

		console.log('✅ Token maintenance completed:', {
			refreshed: result.refreshed,
			failed: result.failed,
			total: result.refreshed + result.failed
		});

		return json({
			success: true,
			message: `Údržba dokončena. Obnoveno: ${result.refreshed}, selhalo: ${result.failed}`,
			refreshed: result.refreshed,
			failed: result.failed
		});

	} catch (error) {
		console.error('❌ Token maintenance error:', error);
		return json({
			success: false,
			error: `Chyba při údržbě tokenů: ${error instanceof Error ? error.message : 'Unknown error'}`,
			refreshed: 0,
			failed: 0
		}, { status: 500 });
	}
};

/**
 * GET endpoint pro kontrolu stavu údržby
 */
export const GET: RequestHandler = async ({ locals: { supabase, safeGetSession } }) => {
	try {
		const { session } = await safeGetSession();
		if (!session) {
			return json({ error: 'Nepřihlášený uživatel' }, { status: 401 });
		}

		// Získáme informace o všech tokenech v systému
		const { data: tokens, error } = await supabase
			.from('fakturoid_tokens')
			.select('user_id, account_email, status, expires_at, refresh_attempts, last_used_at, updated_at')
			.order('last_used_at', { ascending: false });

		if (error) {
			throw error;
		}

		const now = new Date();
		const tokenStats = {
			total: tokens.length,
			active: 0,
			expired: 0,
			refreshing: 0,
			failed: 0,
			expiringSoon: 0
		};

		const tokenDetails = tokens.map(token => {
			const expiresAt = new Date(token.expires_at);
			const isExpired = now >= expiresAt;
			const minutesToExpiry = Math.floor((expiresAt.getTime() - now.getTime()) / (1000 * 60));
			const expiringSoon = minutesToExpiry < 60 && !isExpired;

			// Statistiky
			if (token.status === 'active') tokenStats.active++;
			else if (token.status === 'expired') tokenStats.expired++;
			else if (token.status === 'refreshing') tokenStats.refreshing++;
			else tokenStats.failed++;

			if (expiringSoon) tokenStats.expiringSoon++;

			return {
				account_email: token.account_email,
				status: token.status,
				isExpired,
				minutesToExpiry,
				expiringSoon,
				refresh_attempts: token.refresh_attempts,
				last_used_at: token.last_used_at,
				updated_at: token.updated_at
			};
		});

		return json({
			success: true,
			stats: tokenStats,
			tokens: tokenDetails
		});

	} catch (error) {
		console.error('Error getting token maintenance status:', error);
		return json({
			success: false,
			error: `Chyba při načítání stavu tokenů: ${error instanceof Error ? error.message : 'Unknown error'}`
		}, { status: 500 });
	}
}; 