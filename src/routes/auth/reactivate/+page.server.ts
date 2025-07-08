import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { sendAccountReactivationEmail } from '$lib/services/gdprEmailService';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/types/database.types';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { PRIVATE_SBKey, PRIVATE_SBUrl } from '$env/static/private';

/**
 * Helper function to create admin supabase client that bypasses RLS
 */
function createAdminSupabaseClient(): SupabaseClient<Database> {
	return createClient<Database>(
		PRIVATE_SBUrl,
		PRIVATE_SBKey,
		{
			auth: {
				autoRefreshToken: false,
				persistSession: false
			}
		}
	);
}

export const load: PageServerLoad = async ({ url, locals: { supabase } }) => {
	const token = url.searchParams.get('token');

	if (!token) {
		return {
			isValid: false,
			message: 'Chybí reaktivační token'
		};
	}

	console.log('🔍 [REACTIVATE LOAD] Processing token:', token);

	// Find profile with this reactivation token
	console.log('🔍 [REACTIVATE LOAD] Searching for profile with token...');
	
	// Create admin supabase client to bypass RLS for suspended users
	console.log('🔧 [REACTIVATE LOAD] Creating admin client to bypass RLS...');
	const adminSupabase = createAdminSupabaseClient();
	
	const { data: profile, error } = await adminSupabase
		.from('profiles')
		.select('id, email, first_name, last_name, data_deletion_requested, data_deletion_scheduled, account_suspended, data_deletion_token')
		.eq('data_deletion_token', token)
		.single();

	if (error || !profile) {
		console.log('❌ [REACTIVATE LOAD] Profile not found or error:', error);
		return {
			isValid: false,
			message: 'Neplatný nebo expirovaný reaktivační token'
		};
	}

	console.log('✅ [REACTIVATE LOAD] Profile found:', profile.id);

	// Check conditions for reactivation (must be pending deletion)
	const isDeletionRequested = profile.data_deletion_requested === true || String(profile.data_deletion_requested) === 'true';
	const isAccountSuspended = profile.account_suspended === true || String(profile.account_suspended) === 'true';

	console.log('🔍 [REACTIVATE LOAD] Checking conditions:', {
		isDeletionRequested,
		isAccountSuspended,
		data_deletion_requested_type: typeof profile.data_deletion_requested,
		account_suspended_type: typeof profile.account_suspended
	});

	if (!isDeletionRequested || !isAccountSuspended) {
		console.log('✅ [REACTIVATE LOAD] Account already reactivated');
		return {
			isValid: true,
			alreadyReactivated: true,
			profile: {
				email: profile.email,
				firstName: profile.first_name,
				lastName: profile.last_name
			}
		};
	}

	// Check if still within grace period (30 days)
	const deletionScheduled = profile.data_deletion_scheduled ? new Date(profile.data_deletion_scheduled) : null;
	const now = new Date();

	if (!deletionScheduled || now >= deletionScheduled) {
		console.log('⏰ [REACTIVATE LOAD] Grace period expired');
		return {
			isValid: false,
			message: 'Grace period (30 dní) již vypršela. Kontaktujte zákaznickou podporu.'
		};
	}

	const msRemaining = deletionScheduled.getTime() - now.getTime();
	const daysRemaining = Math.ceil(msRemaining / (1000 * 60 * 60 * 24));

	console.log('⏰ [REACTIVATE LOAD] Days remaining:', daysRemaining);

	// 🚀 AUTOMATICKÁ REAKTIVACE - provést okamžitě při validním tokenu
	console.log('🔄 [REACTIVATE LOAD] Starting automatic reactivation...');
	
	const adminSupabaseForUpdate = createAdminSupabaseClient();
	
	const { data: updateResult, error: updateError } = await adminSupabaseForUpdate
		.from('profiles')
		.update({
			data_deletion_requested: false,
			data_deletion_date: null,
			data_deletion_scheduled: null,
			data_deletion_token: null,
			account_suspended: false,
			updated_at: new Date().toISOString()
		})
		.eq('id', profile.id)
		.select('id, data_deletion_requested, account_suspended, data_deletion_token');

	if (updateError) {
		console.error('❌ [REACTIVATE LOAD] Failed to reactivate account:', updateError);
		return {
			isValid: false,
			message: 'Chyba při reaktivaci účtu. Zkuste to prosím později.'
		};
	}

	console.log('✅ [REACTIVATE LOAD] Account successfully reactivated:', updateResult);

	// Send reactivation confirmation email
	try {
		await sendAccountReactivationEmail({
			email: profile.email || '',
			firstName: profile.first_name || 'Vážený',
			lastName: profile.last_name || 'zákazníku'
		});
		console.log('📧 [REACTIVATE LOAD] Reactivation email sent successfully');
	} catch (emailError) {
		console.error('⚠️ [REACTIVATE LOAD] Failed to send reactivation email:', emailError);
		// Continue even if email fails
	}

	return {
		isValid: true,
		justReactivated: true,
		profile: {
			email: profile.email,
			firstName: profile.first_name,
			lastName: profile.last_name
		},
		message: 'Váš účet byl úspěšně reaktivován!'
	};
};

// Actions are no longer needed - reactivation happens automatically in load function 