import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getSetting } from '$lib/services/siteSettingsService';
import { getFakturoidConfigFromSettings } from '$lib/services/fakturoidService';
import type { IntegrationsSettings } from '$lib/types/siteSettings';

export const POST: RequestHandler = async ({ locals: { supabase, session } }) => {
	// Kontrola přihlášení
	if (!session) {
		throw error(401, 'Pro obnovu Fakturoid dat musíte být přihlášeni');
	}

	try {
		// 1. Načtení Fakturoid nastavení
		const integrations = await getSetting(supabase, 'integrations') as IntegrationsSettings;
		if (!integrations?.fakturoid?.enabled || !integrations?.fakturoid?.connected) {
			return json({ success: false, message: 'Fakturoid není připojen' }, { status: 400 });
		}

		// 2. Získání Fakturoid konfigurace
		const config = getFakturoidConfigFromSettings({ integrations });
		if (!config) {
			return json({ success: false, message: 'Nepodařilo se načíst Fakturoid konfiguraci' }, { status: 400 });
		}

		// 3. Vytvoření FakturoidService instance
		const { FakturoidService } = await import('$lib/services/fakturoidService');
		const fakturoidService = new FakturoidService(config, supabase);

		// 4. Test připojení pomocí FakturoidService
		console.log('🔍 Testing Fakturoid connection for global restore...');
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

		// 5. Načtení všech objednávek s chybějícími nebo neúplnými fakturoid_data
		const { data: orders, error: ordersError } = await supabase
			.from('orders')
			.select('id, order_number, fakturoid_data')
			.or('fakturoid_data.is.null,fakturoid_data.eq.{}');

		if (ordersError) {
			console.error('Error loading orders:', ordersError);
			return json({ success: false, message: 'Chyba při načítání objednávek' }, { status: 500 });
		}

		if (!orders || orders.length === 0) {
			return json({ 
				success: true, 
				message: 'Žádné objednávky s chybějícími Fakturoid daty nebyly nalezeny',
				updatedOrders: 0,
				totalInvoices: 0
			});
		}

		// 6. Hledání všech faktur pomocí FakturoidService
		console.log('🔍 Fetching all invoices from Fakturoid...');
		const allInvoices = await fakturoidService.getInvoices();
		
		// 7. Procházení objednávek a hledání odpovídajících faktur
		let updatedOrders = 0;
		let totalInvoices = 0;

		for (const order of orders) {
			// Hledání faktur podle čísla objednávky
			const matchingInvoices = allInvoices.filter((invoice: any) => 
				invoice.order_number === order.order_number
			);

			if (matchingInvoices.length > 0) {
				// Aktualizace fakturoid_data
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
					.eq('id', order.id);

				if (!updateError) {
					updatedOrders++;
					totalInvoices += matchingInvoices.length;
					console.log(`Updated order ${order.order_number} with ${matchingInvoices.length} invoices`);
				} else {
					console.error(`Error updating order ${order.order_number}:`, updateError);
				}
			}
		}

		return json({
			success: true,
			message: `Úspěšně obnoveno ${updatedOrders} objednávek s ${totalInvoices} fakturami`,
			updatedOrders,
			totalInvoices,
			processedOrders: orders.length
		});

	} catch (err) {
		console.error('Error restoring all Fakturoid data:', err);
		return json({ 
			success: false, 
			message: `Chyba při obnově dat: ${err instanceof Error ? err.message : 'Neznámá chyba'}` 
		}, { status: 500 });
	}
}; 