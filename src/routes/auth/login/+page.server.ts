import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { createClient } from '@supabase/supabase-js';
import type { Database } from '$lib/types/database.types';
import { PRIVATE_SBUrl, PRIVATE_SBKey } from '$env/static/private';
import { sendAccountReactivationEmail } from '$lib/services/gdprEmailService';
import { ROUTES } from "$lib/constants/routes";

/**
 * Helper function to create admin supabase client that bypasses RLS
 */
function createAdminSupabaseClient() {
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

export const load: PageServerLoad = async ({ url }) => {
	const message = url.searchParams.get("message");
	
	return {
		message
	};
};

export const actions: Actions = {
	handleLogin: async ({ request, locals: { supabase } }) => {
		const formData = await request.formData();
		const email = formData.get("email") as string;
		const password = formData.get("password") as string;

		// 🔧 KROK 1: Nejdříve normální login
		const { data, error } = await supabase.auth.signInWithPassword({
			email,
			password
		});

		if (error) {
			console.error(error);
			return fail(400, {
				message: {
					success: false,
					display:
						"Neplatné přihlašovací údaje. Zkontrolujte prosím e-mail a heslo."
				}
			});
		}

		if (data.user) {
			// 🔧 KROK 2: Po úspěšném loginem reaktivovat suspended účet
			try {
				console.log('🔍 [LOGIN] Post-login checking for suspended account:', data.user.id);
				
				const { data: profile, error: profileError } = await supabase
					.from('profiles')
					.select('id, email, account_suspended, data_deletion_requested, data_deletion_token, data_deletion_scheduled, first_name, last_name, registration_status')
					.eq('id', data.user.id)
					.single();

				if (!profileError && profile) {
					const isAccountSuspended = profile.account_suspended === true || String(profile.account_suspended) === 'true';
					const isDeletionRequested = profile.data_deletion_requested === true || String(profile.data_deletion_requested) === 'true';

					// Pokud je účet suspended kvůli deletion request, reaktivovat PO loginem
					if (isAccountSuspended && isDeletionRequested) {
						console.log('🔄 [LOGIN] Post-login reactivating suspended account:', profile.id);

						// Zkontrolovat, jestli je stále v grace period (30 dní)
						const deletionScheduled = profile.data_deletion_scheduled ? new Date(profile.data_deletion_scheduled) : null;
						const now = new Date();

						if (deletionScheduled && now < deletionScheduled) {
							// Stále v grace period - reaktivovat účet PO loginem
							const { error: updateError } = await supabase
								.from('profiles')
								.update({
									account_suspended: false,
									data_deletion_requested: false,
									data_deletion_date: null,
									data_deletion_scheduled: null,
									data_deletion_token: null,
									updated_at: new Date().toISOString()
								})
								.eq('id', profile.id);

							if (!updateError) {
								console.log('✅ [LOGIN] Account post-reactivated successfully:', profile.id);

								// Poslat potvrzovací email o reaktivaci
								try {
									await sendAccountReactivationEmail({
										email: profile.email || data.user.email!,
										firstName: profile.first_name || 'Vážený',
										lastName: profile.last_name || 'zákazníku'
									});
									console.log('📧 [LOGIN] Reactivation email sent successfully');
								} catch (emailError) {
									console.error('⚠️ [LOGIN] Failed to send reactivation email:', emailError);
									// Pokračovat i když email selže
								}
							} else {
								console.error('❌ [LOGIN] Failed to post-reactivate account:', updateError);
							}
						} else {
							console.log('⏰ [LOGIN] Grace period expired, cannot post-reactivate:', profile.id);
						}
					}
				}
			} catch (postReactivationError) {
				console.error('❌ [LOGIN] Error in post-reactivation process:', postReactivationError);
				// Pokračovat v normálním flow i když post-reaktivace selže
			}

			// 🔧 KROK 3: Zkontrolovat registration_status a přesměrovat podle potřeby
			try {
				const { data: profile, error: profileError } = await supabase
					.from('profiles')
					.select('registration_status')
					.eq('id', data.user.id)
					.single();

				if (!profileError && profile) {
					// Pokud je registrace nedokončená, přesměrovat na complete stránku
					if (profile.registration_status !== 'completed') {
						console.log('📝 [LOGIN] Registration not completed, redirecting to complete page');
						throw redirect(303, ROUTES.AUTH.SIGNUP_COMPLETE);
					}
				}
			} catch (redirectError) {
				// Pokud je to redirect, nechat ho projít
				if (redirectError instanceof Response) {
					throw redirectError;
				}
				console.error('❌ [LOGIN] Error checking registration status:', redirectError);
			}

			throw redirect(303, ROUTES.MAIN.OBEDY);
		}

		return fail(500, {
			message: {
				success: false,
				display: "Nastala neočekávaná chyba při přihlašování."
			}
		});
	}
};
