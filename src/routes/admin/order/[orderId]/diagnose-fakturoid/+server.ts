import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getSetting } from '$lib/services/siteSettingsService';
import { getFakturoidConfigFromSettings } from '$lib/services/fakturoidService';
import type { IntegrationsSettings } from '$lib/types/siteSettings';

export const POST: RequestHandler = async ({ params, locals: { supabase, session } }) => {
	// Kontrola přihlášení
	if (!session) {
		throw error(401, 'Pro diagnostiku Fakturoid připojení musíte být přihlášeni');
	}

	const { orderId } = params;
	const diagnosis: string[] = [];

	try {
		// 1. Kontrola Fakturoid nastavení
		diagnosis.push('🔍 Kontrola Fakturoid nastavení...');
		const integrations = await getSetting(supabase, 'integrations') as IntegrationsSettings;
		
		if (!integrations?.fakturoid) {
			return json({ 
				success: false, 
				diagnosis: '❌ Fakturoid integrace není nakonfigurována v site settings' 
			});
		}

		if (!integrations.fakturoid.enabled) {
			return json({ 
				success: false, 
				diagnosis: '❌ Fakturoid integrace není povolena' 
			});
		}

		if (!integrations.fakturoid.connected) {
			return json({ 
				success: false, 
				diagnosis: '❌ Fakturoid účet není připojen' 
			});
		}

		diagnosis.push('✅ Fakturoid nastavení je v pořádku');

		// 2. Získání Fakturoid konfigurace
		diagnosis.push('🔍 Kontrola Fakturoid konfigurace...');
		const config = getFakturoidConfigFromSettings({ integrations });
		if (!config) {
			return json({ 
				success: false, 
				diagnosis: '❌ Nepodařilo se načíst Fakturoid konfiguraci' 
			});
		}

		diagnosis.push(`✅ Fakturoid konfigurace načtena (subdomain: ${config.subdomain})`);

		// 3. Kontrola tokenů v databázi
		diagnosis.push('🔍 Kontrola Fakturoid tokenů...');
		const { data: tokens, error: tokenError } = await supabase
			.from('fakturoid_tokens')
			.select('*')
			.order('updated_at', { ascending: false });

		if (tokenError) {
			return json({ 
				success: false, 
				diagnosis: `❌ Chyba při načítání tokenů: ${tokenError.message}` 
			});
		}

		if (!tokens || tokens.length === 0) {
			return json({ 
				success: false, 
				diagnosis: '❌ Žádné Fakturoid tokeny nebyly nalezeny v databázi' 
			});
		}

		diagnosis.push(`✅ Nalezeno ${tokens.length} tokenů v databázi`);

		// 4. Kontrola stavu tokenů
		const activeTokens = tokens.filter(t => t.status === 'active');
		const expiredTokens = tokens.filter(t => t.status === 'expired');
		const revokedTokens = tokens.filter(t => t.status === 'revoked');

		diagnosis.push(`📊 Stav tokenů: ${activeTokens.length} aktivní, ${expiredTokens.length} expirované, ${revokedTokens.length} zrušené`);

		// 5. Test připojení pomocí FakturoidService
		diagnosis.push('🔍 Test Fakturoid API připojení...');
		try {
			const { FakturoidService } = await import('$lib/services/fakturoidService');
			const fakturoidService = new FakturoidService(config, supabase);
			
			const userInfo = await fakturoidService.testConnection();
			diagnosis.push('✅ Fakturoid API připojení funguje');
			diagnosis.push(`📋 Účet: ${userInfo.name} (${userInfo.email})`);
		} catch (error) {
			diagnosis.push('❌ Fakturoid API test selhal');
			
			// Detailní analýza problému
			if (error instanceof Error) {
				if (error.message.includes('401') || error.message.includes('unauthorized')) {
					diagnosis.push('💡 Problém: Token vypršel nebo je neplatný');
				} else if (error.message.includes('403') || error.message.includes('forbidden')) {
					diagnosis.push('💡 Problém: Nedostatečná oprávnění');
				} else {
					diagnosis.push(`💡 Problém: ${error.message}`);
				}
			}
			
			diagnosis.push('💡 Řešení: Zkuste reconnectovat Fakturoid účet v nastavení integrace');
			
			return json({ 
				success: false, 
				diagnosis: diagnosis.join('\n') 
			});
		}

		// 6. Kontrola objednávky
		diagnosis.push('🔍 Kontrola objednávky...');
		const { data: order, error: orderError } = await supabase
			.from('orders')
			.select('order_number, fakturoid_data')
			.eq('id', orderId)
			.single();

		if (orderError || !order) {
			return json({ 
				success: false, 
				diagnosis: diagnosis.join('\n') + '\n❌ Objednávka nenalezena' 
			});
		}

		diagnosis.push(`✅ Objednávka ${order.order_number} nalezena`);
		
		if (order.fakturoid_data) {
			diagnosis.push('✅ Objednávka již má Fakturoid data');
		} else {
			diagnosis.push('ℹ️ Objednávka nemá Fakturoid data - lze obnovit');
		}

		return json({
			success: true,
			diagnosis: diagnosis.join('\n') + '\n🎉 Všechny kontroly prošly úspěšně!'
		});

	} catch (err) {
		console.error('Error during Fakturoid diagnosis:', err);
		return json({ 
			success: false, 
			diagnosis: `❌ Chyba při diagnostice: ${err instanceof Error ? err.message : 'Neznámá chyba'}` 
		}, { status: 500 });
	}
}; 