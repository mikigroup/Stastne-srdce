import type { TenantMapping, TenantConfig } from './types/tenant';

/**
 * Mapování domén na Supabase projekty
 * Pro produkci: každý klient má vlastní Supabase projekt
 */
export const TENANT_MAPPING: TenantMapping = {
	// Hlavní produkční doména
	'stastnesrdce.cz': {
		supabaseUrl: 'https://your-main-project.supabase.co',
		supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
		supabaseServiceKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
		name: 'Šťastné srdce',
		clientId: 'stastnesrdce',
		domain: 'stastnesrdce.cz',
		active: true
	},
	
	'www.stastnesrdce.cz': {
		supabaseUrl: 'https://your-main-project.supabase.co',
		supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
		supabaseServiceKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ5...',
		name: 'Šťastné srdce (www)',
		clientId: 'stastnesrdce',
		domain: 'www.stastnesrdce.cz',
		active: true
	},

	// Development a testing
	'localhost': {
		supabaseUrl: 'https://your-test-project.supabase.co',
		supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ8...',
		supabaseServiceKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
		name: 'Development (localhost)',
		clientId: 'development',
		domain: 'localhost',
		active: true
	},

	'leo-dev.local': {
		supabaseUrl: 'https://your-dev-project.supabase.co',
		supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
		supabaseServiceKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
		name: 'Leo Development',
		clientId: 'leo-dev',
		domain: 'leo-dev.local',
		active: true
	},

	// Budoucí klienti - přidat podle potřeby
	// 'klient1.cz': {
	//   supabaseUrl: 'https://klient1-project.supabase.co',
	//   supabaseAnonKey: 'eyJ...',
	//   supabaseServiceKey: 'eyJ...',
	//   name: 'Klient 1',
	//   clientId: 'klient1',
	//   domain: 'klient1.cz',
	//   active: true
	// }
};

/**
 * Získá tenant konfiguraci podle domény
 */
export function getTenantByDomain(domain: string): TenantConfig | null {
	// Normalizace domény - odstranit port pro localhost
	const cleanDomain = domain.replace(/:\d+$/, '');
	
	const tenant = TENANT_MAPPING[cleanDomain];
	
	if (!tenant || !tenant.active) {
		console.warn(`No active tenant found for domain: ${cleanDomain}`);
		return null;
	}
	
	return tenant;
}

/**
 * Získá seznam všech aktivních tenantů
 */
export function getActiveTenants(): TenantConfig[] {
	return Object.values(TENANT_MAPPING).filter(tenant => tenant.active);
}

/**
 * Validace tenant konfigurace
 */
export function validateTenantConfig(tenant: TenantConfig): boolean {
	return !!(
		tenant.supabaseUrl &&
		tenant.supabaseAnonKey &&
		tenant.supabaseServiceKey &&
		tenant.name &&
		tenant.clientId &&
		tenant.domain
	);
} 