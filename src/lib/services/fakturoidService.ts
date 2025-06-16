import type { IntegrationsSettings } from '$lib/types/siteSettings';
import type { SupabaseClient } from '@supabase/supabase-js';
import { formatOrderItemName } from '$lib/utils/formatting';

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
	due: number;
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
	private supabase: SupabaseClient;

	constructor(config: FakturoidConfig, supabase: SupabaseClient) {
		this.config = config;
		this.supabase = supabase;
	}

	/**
	 * Základní HTTP request wrapper
	 */
	private async request(endpoint: string, options: RequestInit = {}) {
		// Importujeme getAccessToken z fakturoidAuth a předáme mu supabase instanci
		const { getAccessTokenWithSupabase, clearTokenCache } = await import('$lib/fakturoidAuth');
		let accessToken = await getAccessTokenWithSupabase(this.supabase);
		
		// Konstrukce URL s account slug pro všechny endpointy kromě /user.json
		let url: string;
		if (endpoint === '/user.json') {
			// /user.json endpoint nepotřebuje account slug
			url = `https://app.fakturoid.cz/api/v3${endpoint}`;
		} else {
			// Ostatní endpointy vyžadují account slug
			const subdomain = this.config.subdomain;
			if (!subdomain) {
				throw new Error('Subdoména Fakturoid účtu není nakonfigurována');
			}
			url = `https://app.fakturoid.cz/api/v3/accounts/${subdomain}${endpoint}`;
		}
		
		console.log(`Fakturoid API request: ${options.method || 'GET'} ${url}`);
		console.log(`Access token length: ${accessToken?.length || 0}`);
		
		const headers = {
			'Authorization': `Bearer ${accessToken}`,
			'User-Agent': 'Stastne-srdce-app (support@stastne-srdce.cz)',
			'Content-Type': 'application/json',
			...options.headers
		};

		let response = await fetch(url, {
			...options,
			headers
		});

		console.log(`Fakturoid API response: ${response.status} ${response.statusText}`);

		// Pokud dostaneme 401, zkusíme vymazat cache a získat nový token
		if (response.status === 401) {
			console.log('401 Unauthorized - clearing cache and retrying...');
			clearTokenCache();
			accessToken = await getAccessTokenWithSupabase(this.supabase);
			
			if (accessToken) {
				console.log('Retrying with fresh token...');
				const retryHeaders = {
					'Authorization': `Bearer ${accessToken}`,
					'User-Agent': 'Stastne-srdce-app (support@stastne-srdce.cz)',
					'Content-Type': 'application/json',
					...options.headers
				};

				response = await fetch(url, {
					...options,
					headers: retryHeaders
				});

				console.log(`Fakturoid API retry response: ${response.status} ${response.statusText}`);
			}
		}

		if (!response.ok) {
			const errorText = await response.text();
			console.error(`Fakturoid API error response:`, errorText);
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
		console.log('Starting invoice creation process...');
		
		// Preventivní kontrola tokenu před začátkem
		const { getAccessTokenWithSupabase } = await import('$lib/fakturoidAuth');
		const accessToken = await getAccessTokenWithSupabase(this.supabase);
		
		if (!accessToken) {
			console.error('No valid access token available');
			throw new Error('Váš Fakturoid token není dostupný nebo vypršel. Prosím reconnectujte svůj Fakturoid účet.');
		}
		
		console.log('Access token available, proceeding with API calls...');

		// Nejdříve zkusíme testovací spojení
		console.log('Testing Fakturoid connection...');
		try {
			const userInfo = await this.testConnection();
			console.log('Fakturoid connection successful:', userInfo);
		} catch (error) {
			console.error('Fakturoid connection test failed:', error);
			
			// Specifičtější chybové hlášky podle typu chyby
			if (error instanceof Error) {
				if (error.message.includes('401') || error.message.includes('unauthorized')) {
					throw new Error('Váš Fakturoid token vypršel nebo je neplatný. Prosím reconnectujte svůj Fakturoid účet.');
				}
				if (error.message.includes('403') || error.message.includes('forbidden')) {
					throw new Error('Nemáte oprávnění k přístupu k tomuto Fakturoid účtu. Zkontrolujte nastavení účtu.');
				}
			}
			
			throw new Error('Nepodařilo se připojit k Fakturoid API. Zkontrolujte připojení a oprávnění.');
		}

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
			vat_rate: 0 // Nastaveno na 0 pro neplátce DPH
		}));

		// Vypočítáme datum splatnosti
		const issuedDate = new Date();
		const dueDays = Math.min(Math.max(this.config.invoiceDueDays || 14, 1), 365); // Omezíme na 1-365 dní
		const dueDate = new Date(issuedDate);
		dueDate.setDate(dueDate.getDate() + dueDays);

		// Vytvoříme fakturu
		const invoiceData: Partial<FakturoidInvoice> = {
			subject_id: subject.id!,
			currency: orderData.currency || 'CZK',
			language: this.config.defaultLanguage || 'cz',
			due: dueDays,
			issued_on: issuedDate.toISOString().split('T')[0],
			taxable_fulfillment_due: issuedDate.toISOString().split('T')[0],
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
			console.log('Hledám existující kontakt pro email:', subjectData.email);
			const subjects = await this.request(`/subjects.json?email=${encodeURIComponent(subjectData.email)}`);
			console.log(`Nalezeno ${subjects.length} kontaktů s emailem ${subjectData.email}`);
			
			if (subjects.length > 0) {
				// Zkusíme najít kontakt se stejným jménem
				const exactMatch = subjects.find((subject: any) => 
					subject.name === subjectData.name
				);
				
				if (exactMatch) {
					console.log('Nalezen přesně odpovídající kontakt:', exactMatch.name);
					return exactMatch;
				} else {
					console.log('Nenalezen kontakt se stejným jménem. Existující kontakty:', 
						subjects.map((s: any) => s.name).join(', '));
					console.log('Vytváří se nový kontakt pro:', subjectData.name);
					// Pokud nenajdeme přesnou shodu jména, vytvoříme nový kontakt
					// (i když má stejný email)
				}
			}
		}

		// Pokud nenajdeme přesnou shodu nebo email není zadán, vytvoříme nový
		console.log('Vytváří se nový kontakt:', subjectData);
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
export function createFakturoidService(config: FakturoidConfig, supabase: SupabaseClient): FakturoidService {
	return new FakturoidService(config, supabase);
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

export async function createInvoiceFromOrder(order: any, profile: any, integrationsSettings?: any, supabase?: SupabaseClient): Promise<any> {
	// Pokud nejsou settings předány, vrátíme chybu
	if (!integrationsSettings) {
		throw new Error('Fakturoid integrace není nakonfigurována. <a href="/admin/site-setting?tab=integrations" class="underline text-blue-600 hover:text-blue-800">Přejít na nastavení integrace</a>');
	}

	// Kontrola, zda je Fakturoid připojen - správná cesta k vlastnostem
	const fakturoidConfig = integrationsSettings.fakturoid;
	if (!fakturoidConfig?.enabled || !fakturoidConfig?.connected) {
		throw new Error('Fakturoid není připojen. <a href="/admin/site-setting?tab=integrations" class="underline text-blue-600 hover:text-blue-800">Prosím připojte Fakturoid v nastavení integrace</a>');
	}

	const config = getFakturoidConfigFromSettings({ integrations: integrationsSettings });
	if (!config) {
		throw new Error('Nepodařilo se načíst Fakturoid konfiguraci');
	}

	if (!supabase) {
		throw new Error('Supabase instance není dostupná');
	}

	const service = new FakturoidService(config, supabase);

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
		currency: order.currency || 'CZK'
	};

	return await service.createInvoiceFromOrder(orderData);
}

export async function sendInvoiceEmail(invoiceId: number, supabase?: SupabaseClient, config?: FakturoidConfig): Promise<void> {
	let accessToken: string | null;
	
	if (supabase) {
		const { getAccessTokenWithSupabase } = await import('$lib/fakturoidAuth');
		accessToken = await getAccessTokenWithSupabase(supabase);
	} else {
		const { getAccessToken } = await import('$lib/fakturoidAuth');
		accessToken = await getAccessToken();
	}
	
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

export async function markInvoiceAsPaid(invoiceId: number, supabase?: SupabaseClient, config?: FakturoidConfig): Promise<void> {
	let accessToken: string | null;
	
	if (supabase) {
		const { getAccessTokenWithSupabase } = await import('$lib/fakturoidAuth');
		accessToken = await getAccessTokenWithSupabase(supabase);
	} else {
		const { getAccessToken } = await import('$lib/fakturoidAuth');
		accessToken = await getAccessToken();
	}
	
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