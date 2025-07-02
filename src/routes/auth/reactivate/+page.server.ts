import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { sendAccountReactivationEmail } from '$lib/services/gdprEmailService';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/types/database.types';

export const load: PageServerLoad = async ({ url, locals: { supabase } }) => {
	const token = url.searchParams.get('token');
	
	if (!token) {
		return {
			isValid: false,
			token: null,
			profile: null,
			daysRemaining: 0
		};
	}

	// Find profile with this reactivation token
	const { data: profile, error } = await supabase
		.from('profiles')
		.select('id, email, first_name, last_name, data_deletion_requested, data_deletion_scheduled, account_suspended')
		.eq('data_deletion_token', token)
		.eq('data_deletion_requested', true)
		.eq('account_suspended', true)
		.single();

	if (error || !profile) {
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
	
	if (now >= scheduledDate) {
		// Token expired
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
		try {
			const formData = await request.formData();
			const token = formData.get('token') as string;
			const confirmed = formData.get('confirmed') === 'on';

			if (!token || !confirmed) {
				return fail(400, {
					error: 'Musíte potvrdit reaktivaci účtu'
				});
			}

			// Find and validate profile
			const { data: profile, error: findError } = await supabase
				.from('profiles')
				.select('id, email, first_name, last_name, data_deletion_scheduled')
				.eq('data_deletion_token', token)
				.eq('data_deletion_requested', true)
				.eq('account_suspended', true)
				.single();

			if (findError || !profile) {
				return fail(404, {
					error: 'Neplatný nebo expirovaný odkaz pro reaktivaci'
				});
			}

			// Check if still within grace period
			const scheduledDate = new Date(profile.data_deletion_scheduled!);
			const now = new Date();
			
			if (now >= scheduledDate) {
				return fail(410, {
					error: 'Lhůta pro reaktivaci účtu již vypršela'
				});
			}

			// Reactivate account - clear deletion flags
			const { error: updateError } = await supabase
				.from('profiles')
				.update({
					data_deletion_requested: false,
					data_deletion_date: null,
					data_deletion_scheduled: null,
					data_deletion_token: null,
					account_suspended: false,
					updated_at: new Date().toISOString()
				})
				.eq('id', profile.id);

			if (updateError) {
				console.error('Error reactivating account:', updateError);
				return fail(500, {
					error: 'Chyba při reaktivaci účtu. Zkuste to znovu nebo kontaktujte podporu.'
				});
			}

			// Send confirmation email about successful reactivation
			try {
				await sendAccountReactivationEmail({
					email: profile.email!,
					firstName: profile.first_name || 'Vážený zákazníku',
					lastName: profile.last_name || ''
				});
			} catch (emailError) {
				console.error('Error sending reactivation confirmation email:', emailError);
				// Don't fail the reactivation if email fails
			}

			// TODO: Log this action for GDPR audit trail

			return {
				success: true
			};

		} catch (error) {
			console.error('Error in reactivation process:', error);
			return fail(500, {
				error: 'Došlo k neočekávané chybě'
			});
		}
	}
} satisfies Actions; 