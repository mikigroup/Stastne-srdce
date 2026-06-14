import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js';
import type { Database } from '$lib/types/database.types';
import { PRIVATE_SBUrl, PRIVATE_ServiceKey } from '$env/static/private';
import { PUBLIC_TENANT } from '$env/static/public';
import { ProfileService } from '$lib/services/profileService';

const adminSupabase = createClient<Database>(PRIVATE_SBUrl, PRIVATE_ServiceKey, {
	auth: { autoRefreshToken: false, persistSession: false }
});

/** Vytvoří základní profil zákazníka po potvrzení emailu, pokud ještě neexistuje. */
export async function ensurePendingCustomerProfile(
	user: Pick<User, 'id' | 'email'>,
	client: SupabaseClient<Database> = adminSupabase
) {
	const { data: existingProfile } = await client
		.from('profiles')
		.select('id')
		.eq('id', user.id)
		.single();

	if (existingProfile) {
		return { created: false };
	}

	const { error: profileError } = await client.from('profiles').insert({
		id: user.id,
		email: user.email,
		user_role: 'customer',
		registration_status: 'pending',
		tenant_id: PUBLIC_TENANT,
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString()
	});

	if (profileError) {
		console.error('[SIGNUP CONFIRM] Error creating profile:', profileError);
		return { created: false, error: profileError };
	}

	await ProfileService.ensureCustomerMembership(client, user.id);
	return { created: true };
}

export { adminSupabase as signupConfirmAdminClient };
