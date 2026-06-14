import { isRedirect, redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ROUTES } from '$lib/constants/routes';
import { PUBLIC_TENANT } from '$env/static/public';
import {
	ensurePendingCustomerProfile,
	signupConfirmAdminClient as adminSupabase
} from '$lib/services/signupConfirmService';
import { ProfileService } from '$lib/services/profileService';

export const GET: RequestHandler = async ({ url, locals: { supabase } }) => {
	const token_hash = url.searchParams.get('token_hash');
	const type = url.searchParams.get('type');
	const email = url.searchParams.get('email');

	// Admin signup (vlastní email flow)
	if (type === 'admin_signup' && email) {
		try {
			if (token_hash) {
				const { data: verifyData, error: verifyError } = await adminSupabase.auth.verifyOtp({
					type: 'signup',
					token_hash
				});

				if (verifyError || !verifyData?.user) {
					return redirect(303, '/auth/error?error=invalid_token');
				}

				const user = verifyData.user;
				const { data: existingProfile } = await adminSupabase
					.from('profiles')
					.select('id')
					.eq('id', user.id)
					.single();

				if (!existingProfile) {
					const { error: profileError } = await adminSupabase.from('profiles').insert({
						id: user.id,
						email: user.email,
						user_role: 'admin',
						registration_status: 'completed',
						tenant_id: PUBLIC_TENANT,
						created_at: new Date().toISOString(),
						updated_at: new Date().toISOString()
					});

					if (profileError) {
						console.error('[AUTH CONFIRM] Error creating admin profile:', profileError);
					} else {
						await ProfileService.ensureStaffMembership(adminSupabase, user.id, PUBLIC_TENANT, 'owner');
					}
				}

				return redirect(303, '/admin/signin?message=email_confirmed');
			}

			// Legacy flow bez token_hash
			const { data: users, error: findError } = await adminSupabase.auth.admin.listUsers();
			if (findError) throw findError;

			const user = users.users.find((u) => u.email === email);
			if (!user) throw new Error('User not found');

			const { error: confirmError } = await adminSupabase.auth.admin.updateUserById(user.id, {
				email_confirm: true
			});
			if (confirmError) throw confirmError;

			const { data: existingProfile } = await adminSupabase
				.from('profiles')
				.select('id')
				.eq('id', user.id)
				.single();

			if (!existingProfile) {
				await adminSupabase.from('profiles').insert({
					id: user.id,
					email: user.email,
					user_role: 'admin',
					registration_status: 'completed',
					tenant_id: PUBLIC_TENANT,
					created_at: new Date().toISOString(),
					updated_at: new Date().toISOString()
				});
				await ProfileService.ensureStaffMembership(adminSupabase, user.id, PUBLIC_TENANT, 'owner');
			}

			return redirect(303, '/admin/signin?message=email_confirmed');
		} catch (error) {
			if (isRedirect(error)) throw error;
			console.error('[AUTH CONFIRM] Admin signup confirmation failed:', error);
			return redirect(303, '/auth/error?error=confirmation_failed');
		}
	}

	// Zákaznický signup – zpětná kompatibilita se starými odkazy v emailech
	if (type === 'customer_signup' && email && token_hash) {
		try {
			const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
				type: 'signup',
				token_hash
			});

			if (verifyError) {
				const { data: { user } } = await supabase.auth.getUser();
				const emailMatches = user?.email?.toLowerCase() === email.toLowerCase();

				if (!user?.email_confirmed_at || !emailMatches) {
					return redirect(303, '/auth/error?error=invalid_token');
				}
			} else if (verifyData.user) {
				await ensurePendingCustomerProfile(verifyData.user);
			}

			const { data: { user: sessionUser } } = await supabase.auth.getUser();
			if (sessionUser?.email_confirmed_at) {
				await ensurePendingCustomerProfile(sessionUser);
			}

			return redirect(303, `${ROUTES.AUTH.SIGNUP_COMPLETE}?success=signup`);
		} catch (error) {
			if (isRedirect(error)) throw error;
			console.error('[AUTH CONFIRM] Customer signup confirmation failed:', error);
			return redirect(303, '/auth/error?error=confirmation_failed');
		}
	}

	// Standardní Supabase OTP flow
	if (token_hash && type && ['signup', 'recovery', 'magiclink', 'email'].includes(type)) {
		const { error } = await supabase.auth.verifyOtp({ type: type as 'signup', token_hash });
		if (!error) {
			if (type === 'signup') {
				const { data: { user } } = await supabase.auth.getUser();
				if (user) await ensurePendingCustomerProfile(user);
				return redirect(303, `${ROUTES.AUTH.SIGNUP_COMPLETE}?success=signup`);
			}
			return redirect(303, '/admin/signin?message=email_confirmed');
		}
	}

	return redirect(303, '/auth/error?error=missing_params');
};
