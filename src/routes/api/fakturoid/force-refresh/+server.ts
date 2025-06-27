import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { refreshUserToken } from '$lib/fakturoidAuth';

export const POST: RequestHandler = async ({ locals: { supabase, safeGetSession } }) => {
	const { session } = await safeGetSession();
	
	if (!session) {
		return json({ error: 'Nepřihlášený uživatel' }, { status: 401 });
	}

	try {
		console.log('Force refresh token request for user:', session.user.id);

		// Zkontrolujeme, že token existuje
		const { data: tokenData, error: tokenError } = await supabase
			.from('fakturoid_tokens')
			.select('*')
			.eq('user_id', session.user.id)
			.maybeSingle();

		if (tokenError) {
			console.error('Database error:', tokenError);
			return json({ 
				error: 'Chyba při načítání token informací',
				success: false 
			}, { status: 500 });
		}

		if (!tokenData) {
			return json({ 
				error: 'Fakturoid token nebyl nalezen. Připojte si účet znovu.',
				success: false,
				requiresReauth: true
			}, { status: 404 });
		}

		// Pokusíme se o force refresh
		const refreshSuccess = await refreshUserToken(session.user.id, supabase);

		if (refreshSuccess) {
			// Načteme aktualizovaný token
			const { data: updatedToken, error: fetchError } = await supabase
				.from('fakturoid_tokens')
				.select('expires_at, status, refresh_attempts')
				.eq('user_id', session.user.id)
				.single();

			if (fetchError) {
				console.error('Error fetching updated token:', fetchError);
				return json({ 
					error: 'Token byl obnoven, ale nepodařilo se načíst nové údaje',
					success: true
				});
			}

			return json({
				success: true,
				message: 'Token byl úspěšně obnoven',
				newExpiry: updatedToken.expires_at,
				tokenStatus: updatedToken.status,
				refreshAttempts: updatedToken.refresh_attempts
			});

		} else {
			// Refresh selhal - zjistíme proč
			const { data: failedToken } = await supabase
				.from('fakturoid_tokens')
				.select('status, refresh_attempts')
				.eq('user_id', session.user.id)
				.single();

			const attempts = failedToken?.refresh_attempts || 0;
			const requiresReauth = attempts > 3;

			return json({ 
				error: `Nepodařilo se obnovit token (pokus ${attempts}/3)`,
				success: false,
				requiresReauth,
				refreshAttempts: attempts
			}, { status: 500 });
		}

	} catch (error) {
		console.error('Chyba při force refresh tokenu:', error);
		return json({ 
			error: `Neočekávaná chyba: ${error instanceof Error ? error.message : 'Unknown error'}`,
			success: false 
		}, { status: 500 });
	}
}; 