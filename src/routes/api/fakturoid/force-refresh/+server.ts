import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';
import { refreshGlobalToken } from '$lib/fakturoidAuth';

export const POST: RequestHandler = async ({ locals: { supabase, safeGetSession } }) => {
	const { session } = await safeGetSession();
	
	if (!session) {
		return json({ error: 'Nepřihlášený uživatel' }, { status: 401 });
	}

	try {
		console.log('🔄 Force refresh Fakturoid token...');

		// Najdeme aktivní token v systému
		const { data: tokens, error: tokenError } = await supabase
			.from('fakturoid_tokens')
			.select('*')
			.in('status', ['active', 'expired'])
			.neq('status', 'revoked')
			.order('last_used_at', { ascending: false })
			.limit(1);

		if (tokenError) {
			console.error('Error fetching tokens:', tokenError);
			return json({ 
				error: 'Chyba při načítání tokenů',
				success: false 
			}, { status: 500 });
		}

		if (!tokens || tokens.length === 0) {
			return json({ 
				error: 'Žádný Fakturoid token nebyl nalezen v systému. Připojte účet.',
				success: false,
				requiresReauth: true
			}, { status: 404 });
		}

		const token = tokens[0];
		console.log('🔍 Force refreshing token for:', token.account_email);

		// Zkusíme refresh tokenu
		const refreshSuccess = await refreshGlobalToken(token.account_email, supabase);

		if (refreshSuccess) {
			console.log('✅ Token successfully force refreshed');
			return json({
				success: true,
				message: 'Token úspěšně obnoven',
				accountEmail: token.account_email
			});
		} else {
			console.log('❌ Failed to force refresh token');
			
			// Zkontrolujeme, zda je token revoked
			const { data: currentToken } = await supabase
				.from('fakturoid_tokens')
				.select('status')
				.eq('account_email', token.account_email)
				.single();

			if (currentToken?.status === 'revoked') {
				return json({
					success: false,
					error: 'Token je neplatný a nelze ho obnovit',
					requiresReauth: true
				}, { status: 400 });
			}

			return json({
				success: false,
				error: 'Nepodařilo se obnovit token'
			}, { status: 500 });
		}

	} catch (error) {
		console.error('Error during force refresh:', error);
		return json({ 
			error: `Neočekávaná chyba: ${error instanceof Error ? error.message : 'Unknown error'}`,
			success: false 
		}, { status: 500 });
	}
}; 