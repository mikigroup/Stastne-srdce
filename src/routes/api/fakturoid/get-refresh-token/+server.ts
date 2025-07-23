import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals: { supabase, safeGetSession } }) => {
	const { session } = await safeGetSession();
	
	if (!session) {
		return json({ error: 'Nepřihlášený uživatel' }, { status: 401 });
	}

	try {
		console.log('🔍 Getting refresh token for user:', session.user.id);

		// Najdeme token v DB
		const { data: tokens, error: tokenError } = await supabase
			.from('fakturoid_tokens')
			.select('refresh_token, account_email, status')
			.in('status', ['active', 'expired'])
			.order('last_used_at', { ascending: false })
			.limit(1);

		if (tokenError) {
			console.error('❌ Error fetching token:', tokenError);
			return json({ 
				error: 'Chyba při načítání tokenu',
				success: false
			}, { status: 500 });
		}

		if (!tokens || tokens.length === 0) {
			return json({ 
				error: 'Žádný Fakturoid token nebyl nalezen',
				success: false
			}, { status: 404 });
		}

		const token = tokens[0];
		console.log('✅ Found refresh token for:', token.account_email);

		return json({
			success: true,
			refresh_token: token.refresh_token,
			account_email: token.account_email,
			status: token.status
		});

	} catch (error) {
		console.error('❌ Error getting refresh token:', error);
		return json({ 
			error: `Neočekávaná chyba: ${error instanceof Error ? error.message : 'Unknown error'}`,
			success: false 
		}, { status: 500 });
	}
}; 