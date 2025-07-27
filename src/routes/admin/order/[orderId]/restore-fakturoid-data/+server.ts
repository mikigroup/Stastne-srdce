import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getSetting } from '$lib/services/siteSettingsService';
import { getFakturoidConfigFromSettings } from '$lib/services/fakturoidService';
import type { IntegrationsSettings } from '$lib/types/siteSettings';

export const POST: RequestHandler = async ({ params, locals: { supabase, session } }) => {
	// Kontrola přihlášení
	if (!session) {
		throw error(401, 'Pro obnovu Fakturoid dat musíte být přihlášeni');
	}

	const { orderId } = params;

	try {
		// 1. Načtení objednávky
		const { data: order, error: orderError } = await supabase
			.from('orders')
			.select('*')
			.eq('id', orderId)
			.single();

		if (orderError || !order) {
			return json({ success: false, message: 'Objednávka nenalezena' }, { status: 404 });
		}

		// 2. Načtení Fakturoid nastavení
		const integrations = await getSetting(supabase, 'integrations') as IntegrationsSettings;
		if (!integrations?.fakturoid?.enabled || !integrations?.fakturoid?.connected) {
			return json({ success: false, message: 'Fakturoid není připojen' }, { status: 400 });
		}

		// 3. Získání Fakturoid konfigurace
		const config = getFakturoidConfigFromSettings({ integrations });
		if (!config) {
			return json({ success: false, message: 'Nepodařilo se načíst Fakturoid konfiguraci' }, { status: 400 });
		}

		// 4. Vytvoření FakturoidService instance
		const { FakturoidService } = await import('$lib/services/fakturoidService');
		const fakturoidService = new FakturoidService(config, supabase);

		// 5. Test připojení pomocí FakturoidService
		console.log('🔍 Testing Fakturoid connection...');
		try {
			const userInfo = await fakturoidService.testConnection();
			console.log('✅ Fakturoid connection successful:', userInfo);
		} catch (error) {
			console.error('❌ Fakturoid connection test failed:', error);
			
			// Specifické zpracování chyb
			if (error instanceof Error) {
				if (error.message.includes('401') || error.message.includes('unauthorized')) {
					return json({ 
						success: false, 
						message: 'Váš Fakturoid token vypršel nebo je neplatný. Zkuste reconnectovat svůj Fakturoid účet.' 
					}, { status: 401 });
				}
				if (error.message.includes('403') || error.message.includes('forbidden')) {
					return json({ 
						success: false, 
						message: 'Nemáte oprávnění k přístupu k tomuto Fakturoid účtu. Zkontrolujte nastavení účtu.' 
					}, { status: 403 });
				}
			}
			
			return json({ 
				success: false, 
				message: 'Nepodařilo se připojit k Fakturoid API. Zkuste to prosím znovu nebo zkontrolujte připojení.' 
			}, { status: 500 });
		}

		// 6. Hledání faktur pomocí FakturoidService
		console.log('🔍 Searching for invoices...');
		const invoices = await fakturoidService.getInvoices();
		
		// 7. Hledání faktur podle čísla objednávky
		const matchingInvoices = invoices.filter((invoice: any) => 
			invoice.order_number === order.order_number
		);

		if (matchingInvoices.length === 0) {
			return json({ 
				success: false, 
				message: `Pro objednávku ${order.order_number} nebyla nalezena žádná faktura v Fakturoid` 
			}, { status: 404 });
		}

		// 8. Aktualizace fakturoid_data v databázi
		const updatedFakturoidData = {
			invoices: matchingInvoices.map((invoice: any) => ({
				invoice_id: invoice.id.toString(),
				invoice_number: invoice.number,
				invoice_url: invoice.html_url,
				account_id: config.subdomain,
				created_at: invoice.issued_on || new Date().toISOString()
			}))
		};

		const { error: updateError } = await supabase
			.from('orders')
			.update({ fakturoid_data: updatedFakturoidData })
			.eq('id', orderId);

		if (updateError) {
			console.error('Error updating order:', updateError);
			return json({ 
				success: false, 
				message: 'Faktury byly nalezeny, ale nepodařilo se aktualizovat objednávku' 
			}, { status: 500 });
		}

		return json({
			success: true,
			message: `Úspěšně obnoveno ${matchingInvoices.length} faktur pro objednávku ${order.order_number}`,
			invoices: matchingInvoices
		});

	} catch (err) {
		console.error('Error restoring Fakturoid data:', err);
		return json({ 
			success: false, 
			message: `Chyba při obnově dat: ${err instanceof Error ? err.message : 'Neznámá chyba'}` 
		}, { status: 500 });
	}
}; 