import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/types/database.types';
import { PUBLIC_TENANT } from '$env/static/public';

export interface ProfileQueryOptions {
	useAdminClient?: boolean;
	includeTenantFilter?: boolean;
	selectFields?: string;
}

export class ProfileService {
	/** Zajistí řádek v tenant_members pro zákazníka (zdroj pravdy pro RLS). */
	static async ensureCustomerMembership(
		supabase: SupabaseClient<Database>,
		userId: string,
		tenantId: string = PUBLIC_TENANT
	) {
		return await (supabase as SupabaseClient).from('tenant_members').upsert(
			{ user_id: userId, tenant_id: tenantId, role: 'customer' },
			{ onConflict: 'user_id,tenant_id,role' }
		);
	}

	/**
	 * Získat profil uživatele s tenant filtrací
	 */
	static async getUserProfile(
		supabase: SupabaseClient<Database>,
		userId: string,
		options: ProfileQueryOptions = {}
	) {
		const { includeTenantFilter = true } = options;

		let query = supabase
			.from('profiles')
			.select('*')
			.eq('id', userId);

		// Tenant filtrace přes tenant_id (RLS profiles_self chrání přístup).
		if (includeTenantFilter) {
			query = query.eq('tenant_id', PUBLIC_TENANT);
		}

		return await query.single();
	}

	/**
	 * Získat profil podle emailu s tenant filtrací
	 */
	static async getProfileByEmail(
		supabase: SupabaseClient<Database>,
		email: string,
		options: ProfileQueryOptions = {}
	) {
		const {
			useAdminClient = false,
			includeTenantFilter = true,
			selectFields = 'id, email'
		} = options;

		let query = supabase
			.from('profiles')
			.select(selectFields)
			.eq('email', email);

		// Tenant filtrace přes tenant_id (RLS profiles_self chrání přístup).
		if (includeTenantFilter) {
			query = query.eq('tenant_id', PUBLIC_TENANT);
		}

		return await query.single();
	}

	/**
	 * Aktualizovat profil uživatele s tenant filtrací
	 */
	static async updateUserProfile(
		supabase: SupabaseClient<Database>,
		userId: string,
		profileData: any,
		options: ProfileQueryOptions = {}
	) {
		const { includeTenantFilter = true } = options;

		let query = supabase
			.from('profiles')
			.update(profileData)
			.eq('id', userId);

		// Tenant filtrace přes tenant_id (RLS profiles_self chrání přístup).
		if (includeTenantFilter) {
			query = query.eq('tenant_id', PUBLIC_TENANT);
		}

		return await query.select();
	}

	/**
	 * Vytvořit nový profil s tenant nastavením
	 */
	static async createProfile(
		supabase: SupabaseClient<Database>,
		profileData: any
	) {
		// Automaticky přidat tenant nastavení
		const profileWithTenant = {
			...profileData,
			tenant_id: PUBLIC_TENANT
		};

		const { data: profile, error } = await supabase
			.from('profiles')
			.insert(profileWithTenant)
			.select()
			.single();

		if (error) return { data: profile, error };

		await ProfileService.ensureCustomerMembership(supabase, profileData.id, PUBLIC_TENANT);

		return { data: profile, error: null };
	}

	/**
	 * Upsert profil s tenant nastavením
	 */
	static async upsertProfile(
		supabase: SupabaseClient<Database>,
		profileData: any
	) {
		// Automaticky přidat tenant nastavení pokud není specifikováno
		const profileWithTenant = {
			...profileData,
			tenant_id: profileData.tenant_id || PUBLIC_TENANT
		};

		const { data: profile, error } = await supabase
			.from('profiles')
			.upsert(profileWithTenant)
			.select()
			.single();

		if (error) return { data: profile, error };

		await ProfileService.ensureCustomerMembership(supabase, profileData.id, profileWithTenant.tenant_id);

		return { data: profile, error: null };
	}
}
