import type { IntegrationsSettings } from '$lib/types/siteSettings';

export interface FakturoidConfig {
	enabled: boolean;
	connected: boolean;
	accountName?: string;
	subdomain?: string;
	defaultLanguage?: string;
	autoCreateInvoices?: boolean;
	invoiceDueDays?: number;
	defaultPaymentMethod?: string;
	sendInvoiceEmail?: boolean;
	invoiceNote?: string;
}

export interface FakturoidAccount {
	id: number;
	name: string;
	email: string;
	subdomain: string;
	phone?: string;
	web?: string;
	currency: string;
}

export interface FakturoidInvoice {
	id?: number;
	number?: string;
	subject_id: number;
	currency: string;
	language: string;
	due: string;
	issued_on: string;
	taxable_fulfillment_due?: string;
	note?: string;
	footer_note?: string;
	payment_method: string;
	order_number?: string;
	lines: FakturoidInvoiceLine[];
}

export interface FakturoidInvoiceLine {
	name: string;
	quantity: number;
	unit_price: number;
	unit_name?: string;
	vat_rate?: number;
}

export interface FakturoidSubject {
	id?: number;
	name: string;
	email?: string;
	phone?: string;
	street?: string;
	city?: string;
	zip?: string;
	country?: string;
	registration_no?: string;
	vat_no?: string;
	bank_account?: string;
}

export class FakturoidService {
	private config: FakturoidConfig;

	constructor(config: FakturoidConfig) {
		this.config = config;
	}

	/**
	 * Základní HTTP request wrapper
	 */
	private async request(endpoint: string, options: RequestInit = {}) {
		// Importujeme getAccessToken z fakturoidAuth
		const { getAccessToken } = await import('$lib/fakturoidAuth');
		const accessToken = await getAccessToken();
		
		const url = `https://app.fakturoid.cz/api/v3${endpoint}`;
		
		const headers = {
			'Authorization': `Bearer ${accessToken}`,
			'User-Agent': 'Stastne-srdce-app (support@stastne-srdce.cz)',
			'Content-Type': 'application/json',
			...options.headers
		};

		const response = await fetch(url, {
			...options,
			headers
		});

		if (!response.ok) {
			const errorText = await response.text();
			throw new Error(`Fakturoid API error ${response.status}: ${errorText}`);
		}

		return response.json();
	}

	/**
	 * Test připojení k Fakturoid API
	 */
	async testConnection(): Promise<FakturoidAccount> {
		return await this.request('/user.json');
	}

	/**
	 * Vytvořit fakturu z objednávky (hlavní metoda)
	 */
	async createInvoiceFromOrder(orderData: {
		customer: {
			name: string;
			email: string;
			phone?: string;
			address?: {
				street?: string;
				city?: string;
				zip?: string;
				country?: string;
			};
		};
		orderNumber: string;
		items: Array<{
			name: string;
			quantity: number;
			price: number;
			vat?: number;
		}>;
		currency?: string;
		note?: string;
	}): Promise<FakturoidInvoice> {
		// Vytvoříme nebo najdeme kontakt
		const subject = await this.createOrFindSubject({
			name: orderData.customer.name,
			email: orderData.customer.email,
			phone: orderData.customer.phone,
			street: orderData.customer.address?.street,
			city: orderData.customer.address?.city,
			zip: orderData.customer.address?.zip,
			country: orderData.customer.address?.country || 'CZ'
		});

		// Připravíme položky faktury
		const lines: FakturoidInvoiceLine[] = orderData.items.map(item => ({
			name: item.name,
			quantity: item.quantity,
			unit_price: item.price,
			unit_name: 'ks',
			vat_rate: item.vat || 21
		}));

		// Vytvoříme fakturu
		const invoiceData: Partial<FakturoidInvoice> = {
			subject_id: subject.id!,
			currency: orderData.currency || 'CZK',
			language: this.config.defaultLanguage || 'cz',
			due: new Date(Date.now() + (this.config.invoiceDueDays || 14) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
			issued_on: new Date().toISOString().split('T')[0],
			payment_method: this.config.defaultPaymentMethod || 'bank',
			order_number: orderData.orderNumber,
			note: orderData.note || this.config.invoiceNote || '',
			lines
		};

		return await this.createInvoice(invoiceData as FakturoidInvoice);
	}

	/**
	 * Vytvořit nebo najít kontakt (subjekt)
	 */
	private async createOrFindSubject(subjectData: FakturoidSubject): Promise<FakturoidSubject> {
		// Nejdříve zkusíme najít existující kontakt podle emailu
		if (subjectData.email) {
			const subjects = await this.request(`/subjects.json?email=${encodeURIComponent(subjectData.email)}`);
			if (subjects.length > 0) {
				return subjects[0];
			}
		}

		// Pokud nenajdeme, vytvoříme nový
		return await this.request('/subjects.json', {
			method: 'POST',
			body: JSON.stringify({ subject: subjectData })
		});
	}

	/**
	 * Vytvořit fakturu
	 */
	private async createInvoice(invoiceData: FakturoidInvoice): Promise<FakturoidInvoice> {
		const response = await this.request('/invoices.json', {
			method: 'POST',
			body: JSON.stringify({ invoice: invoiceData })
		});

		// Pokud je povoleno automatické odeslání emailu
		if (this.config.sendInvoiceEmail && response.id) {
			await this.sendInvoiceEmail(response.id);
		}

		return response;
	}

	/**
	 * Poslat fakturu emailem
	 */
	private async sendInvoiceEmail(invoiceId: number): Promise<void> {
		await this.request(`/invoices/${invoiceId}/message.json`, {
			method: 'POST',
			body: JSON.stringify({ 
				message: {
					email: true
				}
			})
		});
	}
}

/**
 * Factory funkce pro vytvoření Fakturoid service instance
 */
export function createFakturoidService(config: FakturoidConfig): FakturoidService {
	return new FakturoidService(config);
}

/**
 * Helper pro získání Fakturoid konfigurace ze site settings
 */
export function getFakturoidConfigFromSettings(settings: { integrations: IntegrationsSettings }): FakturoidConfig | null {
	const integrations = settings?.integrations;
	
	if (!integrations?.fakturoid?.enabled || !integrations?.fakturoid?.connected) {
		return null;
	}

	const activeAccount = integrations.fakturoid.accounts.find(acc => acc.isActive);
	if (!activeAccount) {
		return null;
	}

	return {
		enabled: integrations.fakturoid.enabled,
		connected: integrations.fakturoid.connected,
		accountName: activeAccount.name,
		subdomain: activeAccount.subdomain,
		defaultLanguage: integrations.fakturoid.defaultLanguage || 'cz',
		autoCreateInvoices: integrations.fakturoid.autoCreateInvoices || false,
		invoiceDueDays: integrations.fakturoid.invoiceDueDays || 14,
		defaultPaymentMethod: integrations.fakturoid.defaultPaymentMethod || 'bank',
		sendInvoiceEmail: integrations.fakturoid.sendInvoiceEmail || false,
		invoiceNote: integrations.fakturoid.invoiceNote || ''
	};
}

/**
 * Export funkce pro použití mimo třídu
 */

export async function createInvoiceFromOrder(order: any, profile: any, integrationsSettings?: any): Promise<any> {
	// Pokud nejsou settings předány, vrátíme chybu
	if (!integrationsSettings) {
		throw new Error('Fakturoid integrace není nakonfigurována. <a href="/admin/site-setting?tab=integrations" class="underline text-blue-600 hover:text-blue-800">Přejít na nastavení integrace</a>');
	}

	if (!integrationsSettings.fakturoidEnabled || !integrationsSettings.fakturoidConnected) {
		throw new Error('Fakturoid není připojen. <a href="/admin/site-setting?tab=integrations" class="underline text-blue-600 hover:text-blue-800">Prosím připojte Fakturoid v nastavení integrace</a>');
	}

	const config = getFakturoidConfigFromSettings({ integrations: integrationsSettings });
	if (!config) {
		throw new Error('Nepodařilo se načíst Fakturoid konfiguraci');
	}

	const service = new FakturoidService(config);

	// Převedeme data do požadovaného formátu
	const orderData = {
		customer: {
			name: `${profile.first_name} ${profile.last_name}`,
			email: profile.email,
			phone: profile.telephone,
			address: {
				street: `${profile.street} ${profile.street_number}`,
				city: profile.city,
				zip: profile.zip_code,
				country: 'CZ'
			}
		},
		orderNumber: order.order_number,
		items: order.order_items.map((item: any) => ({
			name: formatOrderItemName(item),
			quantity: item.quantity,
			price: item.price,
			vat: 21
		})),
		currency: order.currency || 'CZK',
		note: order.note
	};

	return await service.createInvoiceFromOrder(orderData);
}

export async function sendInvoiceEmail(invoiceId: number): Promise<void> {
	const { getAccessToken } = await import('$lib/fakturoidAuth');
	const accessToken = await getAccessToken();
	
	const response = await fetch(`https://app.fakturoid.cz/api/v3/invoices/${invoiceId}/message.json`, {
		method: 'POST',
		headers: {
			'Authorization': `Bearer ${accessToken}`,
			'User-Agent': 'Stastne-srdce-app (support@stastne-srdce.cz)',
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ 
			message: {
				email: true
			}
		})
	});

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(`Chyba při odesílání faktury emailem: ${errorText}`);
	}
}

export async function markInvoiceAsPaid(invoiceId: number): Promise<void> {
	const { getAccessToken } = await import('$lib/fakturoidAuth');
	const accessToken = await getAccessToken();
	
	const response = await fetch(`https://app.fakturoid.cz/api/v3/invoices/${invoiceId}/fire.json`, {
		method: 'POST',
		headers: {
			'Authorization': `Bearer ${accessToken}`,
			'User-Agent': 'Stastne-srdce-app (support@stastne-srdce.cz)',
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ 
			event: 'pay'
		})
	});

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(`Chyba při označení faktury jako uhrazené: ${errorText}`);
	}
}

// Pomocná funkce pro formátování názvu položky objednávky
function formatOrderItemName(item: any): string {
	// Zkusíme získat datum z různých možných míst ve struktuře
	let menuDate = null;
	
	if (item.variant_id?.menu_id?.date) {
		menuDate = item.variant_id.menu_id.date;
	} else if (item.variant_id?.menu_version_id?.date) {
		menuDate = item.variant_id.menu_version_id.date;
	}
	
	// Získání čísla varianty
	const variantNumber = item.variant_id?.variant_number;
	
	// Formátování data do českého formátu
	let formattedDate = '';
	if (menuDate) {
		try {
			const date = new Date(menuDate);
			if (!isNaN(date.getTime())) {
				formattedDate = date.toLocaleDateString('cs-CZ', {
					day: 'numeric',
					month: 'numeric', 
					year: 'numeric'
				});
			}
		} catch (e) {
			console.warn('Chyba při formátování data:', e);
		}
	}
	
	// Sestavení názvu
	let itemName = '';
	
	if (formattedDate) {
		itemName += `${formattedDate} `;
	}
	
	if (variantNumber) {
		itemName += `Menu ${variantNumber}`;
	} else {
		itemName += 'Menu';
	}
	
	return itemName || 'Položka menu';
} 