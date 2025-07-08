import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { sendAccountReactivationEmail } from '$lib/services/gdprEmailService';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/types/database.types';

export const load: PageServerLoad = async ({ url, locals: { supabase } }) => {
	const token = url.searchParams.get('token');
	const success = url.searchParams.get('success') === 'true';
	
	console.log('🔍 [REACTIVATE LOAD] Starting reactivation load with token:', token ? `${token.substring(0, 8)}...` : 'null');
	console.log('🔍 [REACTIVATE LOAD] Success parameter:', success);
	
	// If success parameter is present, show success message
	if (success && token) {
		console.log('✅ [REACTIVATE LOAD] Showing success message for reactivated account');
		return {
			isValid: true,
			token,
			profile: null,
			daysRemaining: 0,
			alreadyReactivated: true,
			justReactivated: true
		};
	}
	
	if (!token) {
		console.log('❌ [REACTIVATE LOAD] No token provided');
		return {
			isValid: false,
			token: null,
			profile: null,
			daysRemaining: 0
		};
	}

	// Find profile with this reactivation token
	console.log('🔍 [REACTIVATE LOAD] Searching for profile with token...');
	const { data: profile, error } = await supabase
		.from('profiles')
		.select('id, email, first_name, last_name, data_deletion_requested, data_deletion_scheduled, account_suspended, data_deletion_token')
		.eq('data_deletion_token', token)
		.single();

	// If profile not found, it might be already reactivated (token cleared)
	if (error || !profile) {
		console.log('❌ [REACTIVATE LOAD] Profile not found or error:', error);
		
		// Check if this is a valid token format (UUID)
		const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
		if (uuidRegex.test(token)) {
			console.log('✅ [REACTIVATE LOAD] Token format is valid, likely already reactivated');
			return {
				isValid: true,
				token,
				profile: null,
				daysRemaining: 0,
				alreadyReactivated: true
			};
		}
		
		return {
			isValid: false,
			token,
			profile: null,
			daysRemaining: 0
		};
	}

	console.log('✅ [REACTIVATE LOAD] Profile found:', {
		id: profile.id,
		email: profile.email,
		data_deletion_requested: profile.data_deletion_requested,
		account_suspended: profile.account_suspended,
		data_deletion_scheduled: profile.data_deletion_scheduled
	});

	// Check if account is already reactivated (token is null and flags are false)
	if (profile.data_deletion_token === null && 
		profile.data_deletion_requested === false && 
		profile.account_suspended === false) {
		console.log('✅ [REACTIVATE LOAD] Account already reactivated');
		return {
			isValid: true,
			token,
			profile,
			daysRemaining: 0,
			alreadyReactivated: true
		};
	}

	// Check conditions for reactivation (must be pending deletion)
	const isDeletionRequested = profile.data_deletion_requested === true || profile.data_deletion_requested === 'true';
	const isAccountSuspended = profile.account_suspended === true || profile.account_suspended === 'true';

	console.log('🔍 [REACTIVATE LOAD] Checking conditions:', {
		isDeletionRequested,
		isAccountSuspended,
		data_deletion_requested_type: typeof profile.data_deletion_requested,
		account_suspended_type: typeof profile.account_suspended
	});

	if (!isDeletionRequested || !isAccountSuspended) {
		console.log('❌ [REACTIVATE LOAD] Conditions not met:', {
			isDeletionRequested,
			isAccountSuspended
		});
		return {
			isValid: false,
			token,
			profile: null,
			daysRemaining: 0
		};
	}

	// Check if token is still valid (within 30 days)
	const scheduledDate = new Date(profile.data_deletion_scheduled!);
	const now = new Date();
	
	console.log('🔍 [REACTIVATE LOAD] Checking token validity:', {
		scheduledDate: scheduledDate.toISOString(),
		now: now.toISOString(),
		isExpired: now >= scheduledDate
	});
	
	if (now >= scheduledDate) {
		// Token expired
		console.log('❌ [REACTIVATE LOAD] Token expired');
		return {
			isValid: false,
			token,
			profile,
			daysRemaining: 0
		};
	}

	// Calculate remaining days
	const msRemaining = scheduledDate.getTime() - now.getTime();
	const daysRemaining = Math.ceil(msRemaining / (1000 * 60 * 60 * 24));

	console.log('✅ [REACTIVATE LOAD] Token is valid, remaining days:', daysRemaining);

	return {
		isValid: true,
		token,
		profile,
		daysRemaining
	};
};

export const actions: Actions = {
	reactivate: async ({ request, locals: { supabase } }: {
		request: Request;
		locals: {
			supabase: SupabaseClient<Database>;
		};
	}) => {
		console.log('🚀 [REACTIVATE ACTION] Starting reactivation process');
		
		try {
			const formData = await request.formData();
			const token = formData.get('token') as string;
			const confirmed = formData.get('confirmed') === 'on';

			console.log('🔍 [REACTIVATE ACTION] Form data:', {
				token: token ? `${token.substring(0, 8)}...` : 'null',
				confirmed
			});

			if (!token || !confirmed) {
				console.log('❌ [REACTIVATE ACTION] Missing token or confirmation');
				return fail(400, {
					error: 'Musíte potvrdit reaktivaci účtu'
				});
			}

			// Find and validate profile - handle both boolean and string values
			console.log('🔍 [REACTIVATE ACTION] Searching for profile with token...');
			const { data: profile, error: findError } = await supabase
				.from('profiles')
				.select('id, email, first_name, last_name, data_deletion_scheduled')
				.eq('data_deletion_token', token)
				.or('data_deletion_requested.eq.true,data_deletion_requested.eq."true"')
				.or('account_suspended.eq.true,account_suspended.eq."true"')
				.single();

			if (findError || !profile) {
				console.log('❌ [REACTIVATE ACTION] Profile not found or error:', findError);
				return fail(404, {
					error: 'Neplatný nebo expirovaný odkaz pro reaktivaci'
				});
			}

			console.log('✅ [REACTIVATE ACTION] Profile found for reactivation:', {
				id: profile.id,
				email: profile.email,
				data_deletion_scheduled: profile.data_deletion_scheduled
			});

			// Check if still within grace period
			const scheduledDate = new Date(profile.data_deletion_scheduled!);
			const now = new Date();
			
			console.log('🔍 [REACTIVATE ACTION] Checking grace period:', {
				scheduledDate: scheduledDate.toISOString(),
				now: now.toISOString(),
				isExpired: now >= scheduledDate
			});
			
			if (now >= scheduledDate) {
				console.log('❌ [REACTIVATE ACTION] Grace period expired');
				return fail(410, {
					error: 'Lhůta pro reaktivaci účtu již vypršela'
				});
			}

			// Reactivate account - clear deletion flags
			console.log('🔄 [REACTIVATE ACTION] Updating profile to reactivate account...');
			console.log('🔍 [REACTIVATE ACTION] Update data:', {
				data_deletion_requested: false,
				data_deletion_date: null,
				data_deletion_scheduled: null,
				data_deletion_token: null,
				account_suspended: false,
				updated_at: new Date().toISOString()
			});
			console.log('🔍 [REACTIVATE ACTION] Profile ID:', profile.id);
			
			const { data: updateResult, error: updateError } = await supabase
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

			console.log('🔍 [REACTIVATE ACTION] Update result:', updateResult);
			console.log('🔍 [REACTIVATE ACTION] Update error:', updateError);

			if (updateError) {
				console.error('❌ [REACTIVATE ACTION] Error reactivating account:', updateError);
				console.error('❌ [REACTIVATE ACTION] Error details:', {
					code: updateError.code,
					message: updateError.message,
					details: updateError.details,
					hint: updateError.hint
				});
				return fail(500, {
					error: 'Chyba při reaktivaci účtu. Zkuste to znovu nebo kontaktujte podporu.'
				});
			}

			console.log('✅ [REACTIVATE ACTION] Account successfully reactivated');
			console.log('🔍 [REACTIVATE ACTION] Updated profile data:', updateResult);

			// Send confirmation email about successful reactivation
			console.log('📧 [REACTIVATE ACTION] Sending confirmation email...');
			try {
				await sendAccountReactivationEmail({
					email: profile.email!,
					firstName: profile.first_name || 'Vážený zákazníku',
					lastName: profile.last_name || ''
				});
				console.log('✅ [REACTIVATE ACTION] Confirmation email sent successfully');
			} catch (emailError) {
				console.error('❌ [REACTIVATE ACTION] Error sending reactivation confirmation email:', emailError);
				// Don't fail the reactivation if email fails
			}

			// TODO: Log this action for GDPR audit trail
			console.log('✅ [REACTIVATE ACTION] Reactivation process completed successfully');

			// Redirect to success page with token for display
			throw redirect(303, `/auth/reactivate?token=${token}&success=true`);

		} catch (error) {
			// Don't catch redirects - let them pass through
			if (error && typeof error === 'object' && 'status' in error && error.status === 303) {
				throw error;
			}
			
			console.error('❌ [REACTIVATE ACTION] Unexpected error in reactivation process:', error);
			return fail(500, {
				error: 'Došlo k neočekávané chybě'
			});
		}
	}
} satisfies Actions; 