import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ locals: { supabase, safeGetSession } }) => {
	const { session } = await safeGetSession();
	
	if (!session) {
		return json({ error: 'Nepřihlášený uživatel' }, { status: 401 });
	}

	try {
		console.log('🗑️ Clearing revoked Fakturoid tokens...');

		// Nejdřív zobrazíme revoked tokeny včetně refresh_token
		const { data: revokedTokens, error: selectError } = await supabase
			.from('fakturoid_tokens')
			.select('account_email, status, expires_at, last_used_at, refresh_token')
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

		// Nejdříve se pokusíme obnovit revoked tokeny před jejich označením jako cleared
		let restoredCount = 0;
		for (const token of revokedTokens) {
			try {
				console.log(`🔄 Attempting to restore revoked token for: ${token.account_email}`);
				
				// Importujeme refresh funkci
				const { refreshTokenDirect } = await import('$lib/fakturoidAuth');
				
				// Pokusíme se obnovit token
				const restoredToken = await refreshTokenDirect(token.refresh_token, supabase);
				
				if (restoredToken) {
					console.log(`✅ Successfully restored token for: ${token.account_email}`);
					restoredCount++;
					// Token byl obnoven, přeskočíme jeho označení jako cleared
					continue;
				} else {
					console.log(`❌ Failed to restore token for: ${token.account_email}`);
				}
			} catch (error) {
				console.error(`Error restoring token for ${token.account_email}:`, error);
			}
		}

		// ZMĚNA: Místo mazání označíme pouze neobnovené tokeny jako 'cleared' pro audit trail
		// ale zachováme refresh tokeny pro případné obnovení
		const { error: updateError } = await supabase
			.from('fakturoid_tokens')
			.update({
				status: 'cleared',
				updated_at: new Date().toISOString()
			})
			.eq('status', 'revoked');

		if (updateError) {
			console.error('Error updating revoked tokens:', updateError);
			return json({ 
				error: 'Chyba při označování revoked tokenů',
				success: false 
			}, { status: 500 });
		}

		const clearedCount = revokedTokens.length - restoredCount;
		console.log(`✅ Successfully restored ${restoredCount} tokens and marked ${clearedCount} as cleared`);

		return json({
			success: true,
			message: `Úspěšně obnoveno ${restoredCount} tokenů a označeno ${clearedCount} jako cleared`,
			restoredCount,
			clearedCount,
			totalCount: revokedTokens.length,
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