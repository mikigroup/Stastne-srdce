import { isRedirect, redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ROUTES } from '$lib/constants/routes';
import {
	ensurePendingCustomerProfile,
} from '$lib/services/signupConfirmService';

export const GET: RequestHandler = async ({ url, locals: { supabase } }) => {
	const token_hash = url.searchParams.get('token_hash');
	const type = url.searchParams.get('type');
	const email = url.searchParams.get('email');

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
			if (type === 'recovery') {
				return redirect(303, ROUTES.AUTH.RESET);
			}
			return redirect(303, ROUTES.AUTH.LOGIN);
		}
	}

	return redirect(303, '/auth/error?error=missing_params');
};
