import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals: { supabase, safeGetSession } }) => {
	const { session } = await safeGetSession();
	
	if (!session) {
		return json({ error: 'Nepřihlášený uživatel' }, { status: 401 });
	}

	try {
		console.log('🗑️ Clearing all Fakturoid tokens from database...');

		// Smažeme všechny tokeny
		const { data: deletedTokens, error } = await supabase
			.from('fakturoid_tokens')
			.delete()
			.neq('id', '00000000-0000-0000-0000-000000000000') // Smažeme všechny
			.select('account_email, user_id');

		if (error) {
			console.error('Error clearing tokens:', error);
			return json({ 
				error: 'Chyba při mazání tokenů',
				success: false,
				details: error.message
			}, { status: 500 });
		}

		const deletedCount = deletedTokens?.length || 0;
		console.log(`✅ Deleted ${deletedCount} Fakturoid tokens`);
		
		if (deletedTokens && deletedTokens.length > 0) {
			console.log('Deleted tokens:', deletedTokens.map(t => t.account_email).join(', '));
		}

		return json({
			success: true,
			message: `Úspěšně smazáno ${deletedCount} Fakturoid tokenů`,
			deletedCount,
			deletedTokens: deletedTokens?.map(t => t.account_email) || []
		});

	} catch (error) {
		console.error('❌ Error clearing tokens:', error);
		return json({
			success: false,
			error: `Chyba při mazání tokenů: ${error instanceof Error ? error.message : 'Unknown error'}`
		}, { status: 500 });
	}
}; 