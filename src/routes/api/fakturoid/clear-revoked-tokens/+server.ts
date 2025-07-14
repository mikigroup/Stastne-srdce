import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ locals: { supabase, safeGetSession } }) => {
	const { session } = await safeGetSession();
	
	if (!session) {
		return json({ error: 'Nepřihlášený uživatel' }, { status: 401 });
	}

	try {
		console.log('🗑️ Clearing revoked Fakturoid tokens...');

		// Nejdřív zobrazíme revoked tokeny
		const { data: revokedTokens, error: selectError } = await supabase
			.from('fakturoid_tokens')
			.select('account_email, status, expires_at, last_used_at')
			.eq('status', 'revoked');

		if (selectError) {
			console.error('Error fetching revoked tokens:', selectError);
			return json({ 
				error: 'Chyba při načítání revoked tokenů',
				success: false 
			}, { status: 500 });
		}

		if (!revokedTokens || revokedTokens.length === 0) {
			return json({
				success: true,
				message: 'Žádné revoked tokeny k smazání',
				deletedCount: 0
			});
		}

		console.log('Found revoked tokens:', revokedTokens);

		// Smažeme revoked tokeny
		const { error: deleteError } = await supabase
			.from('fakturoid_tokens')
			.delete()
			.eq('status', 'revoked');

		if (deleteError) {
			console.error('Error deleting revoked tokens:', deleteError);
			return json({ 
				error: 'Chyba při mazání revoked tokenů',
				success: false 
			}, { status: 500 });
		}

		console.log(`✅ Successfully deleted ${revokedTokens.length} revoked tokens`);

		return json({
			success: true,
			message: `Úspěšně smazáno ${revokedTokens.length} revoked tokenů`,
			deletedCount: revokedTokens.length,
			deletedTokens: revokedTokens.map(t => t.account_email)
		});

	} catch (error) {
		console.error('Error clearing revoked tokens:', error);
		return json({ 
			error: `Neočekávaná chyba: ${error instanceof Error ? error.message : 'Unknown error'}`,
			success: false 
		}, { status: 500 });
	}
}; 