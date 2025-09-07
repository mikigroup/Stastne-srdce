import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ locals: { supabase, safeGetSession } }) => {
	// Kontrola přihlášení
	const { session } = await safeGetSession();
	if (!session) {
		return json({ success: false, error: 'Neautorizovaný přístup' }, { status: 401 });
	}

	try {
		// Získáme default tenant ID
		const { data: tenantData } = await supabase
			.from('tenants')
			.select('id')
			.eq('slug', 'stastnesrdce')
			.single();

		if (!tenantData?.id) {
			return json({ success: false, error: 'Default tenant nenalezen' }, { status: 500 });
		}

		// Najdeme token pro tenant
		const { data: tokens, error: tokenError } = await supabase
			.from('fakturoid_tokens')
			.select('*')
			.eq('tenant_id', tenantData.id)
			.order('last_used_at', { ascending: false })
			.limit(1);

		if (tokenError) {
			console.error('Error fetching token:', tokenError);
			return json({ success: false, error: 'Chyba při načítání tokenu z databáze' }, { status: 500 });
		}

		if (!tokens || tokens.length === 0) {
			return json({ success: false, error: 'Žádný Fakturoid token nenalezen' }, { status: 404 });
		}

		const token = tokens[0];
		
		// Zkontrolujeme expiraci
		const expiresAt = new Date(token.expires_at);
		const now = new Date();
		const isExpired = now >= expiresAt;
		const minutesToExpiry = Math.floor((expiresAt.getTime() - now.getTime()) / (1000 * 60));

		// Vrátíme stav tokenu
		return json({
			success: true,
			tokenStatus: {
				status: token.status,
				expires_at: token.expires_at,
				account_email: token.account_email,
				last_used_at: token.last_used_at,
				refresh_attempts: token.refresh_attempts || 0,
				isExpired,
				minutesToExpiry
			}
		});

	} catch (error) {
		console.error('Error checking Fakturoid token status:', error);
		return json({ 
			success: false, 
			error: 'Chyba při kontrole stavu tokenu' 
		}, { status: 500 });
	}
};
