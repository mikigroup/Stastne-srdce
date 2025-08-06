import type { PageServerLoad } from './$types';
import { TenantService } from '$lib/services/tenantService';

export const load: PageServerLoad = async ({ locals: { supabase, safeGetSession } }) => {
	const { session } = await safeGetSession();

	if (!session) {
		return {
			tenants: [],
			error: 'Unauthorized'
		};
	}

	try {
		// Získat všechny aktivní tenanty
		const { data: tenants, error } = await supabase
			.from('tenants')
			.select('*')
			.eq('status', 'active')
			.order('name');

		if (error) {
			console.error('Error fetching tenants:', error);
			return {
				tenants: [],
				error: 'Failed to load tenants'
			};
		}

		// Získat statistiky pro každý tenant
		const tenantsWithStats = await Promise.all(
			(tenants || []).map(async (tenant) => {
				try {
					// Nastavit tenant context pro získání statistik
					await TenantService.setTenantContext(tenant.id);
					
					const [profiles, menus, orders, customers] = await Promise.all([
						supabase.from('profiles').select('id', { count: 'exact' }),
						supabase.from('menus').select('id', { count: 'exact' }),
						supabase.from('orders').select('id', { count: 'exact' }),
						supabase.from('customers').select('id', { count: 'exact' })
					]);

					return {
						...tenant,
						stats: {
							profiles: profiles.count || 0,
							menus: menus.count || 0,
							orders: orders.count || 0,
							customers: customers.count || 0
						}
					};
				} catch (error) {
					console.error(`Error getting stats for tenant ${tenant.id}:`, error);
					return {
						...tenant,
						stats: {
							profiles: 0,
							menus: 0,
							orders: 0,
							customers: 0
						}
					};
				}
			})
		);

		return {
			tenants: tenantsWithStats,
			error: null
		};
	} catch (error) {
		console.error('Error in tenants load function:', error);
		return {
			tenants: [],
			error: 'Internal server error'
		};
	}
}; 