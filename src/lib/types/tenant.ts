export interface TenantConfig {
	supabaseUrl: string;
	supabaseAnonKey: string;
	supabaseServiceKey: string; // Pro server-side operace
	name: string;
	clientId: string;
	domain: string;
	active: boolean;
}

export interface TenantMapping {
	[domain: string]: TenantConfig;
}

export type TenantInfo = Pick<TenantConfig, 'name' | 'clientId' | 'domain' | 'active'>; 