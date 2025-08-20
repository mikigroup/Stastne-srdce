import { createServerClient } from "@supabase/ssr";
import { type Handle, redirect } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";

import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, PUBLIC_TENANT } from "$env/static/public";
import { PRIVATE_SBUrl, PRIVATE_SBKey } from "$env/static/private";
import { TenantService } from "$lib/services/tenantService";
import { ROUTES } from "$lib/constants/routes";

// Admin client pro obejití RLS politik
const adminSupabase = createServerClient(
	PRIVATE_SBUrl,
	PRIVATE_SBKey,
	{
		cookies: {
			get: () => '',
			set: () => {},
			remove: () => {}
		}
	}
)

const supabase: Handle = async ({ event, resolve }) => {
	/**
	 * Creates a Supabase client specific to this request.
	 *
	 * Unlike `supabase` from `$lib/supabase.ts`, this client is
	 * safe to use throughout the request since it reads fresh
	 * cookies for each request and its configuration is not shared
	 * between requests.
	 */
	event.locals.supabase = createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
		cookies: {
			get: (key) => event.cookies.get(key),
			/**
			 * SvelteKit's cookies.set defaults to `httpOnly: true`, `secure: true`, and `sameSite: 'lax'`.
			 * This is good for security, but we need to set `httpOnly: false` for the Supabase client to be able to read the cookies.
			 * Safe to set `httpOnly: false` since we're only using cookies to store the session.
			 */
			set: (key, value, options) => {
				event.cookies.set(key, value, { ...options, httpOnly: false, path: '/' });
			},
			remove: (key, options) => {
				event.cookies.delete(key, { ...options, httpOnly: false, path: '/' });
			}
		}
	});

	/**
	 * Unlike `supabase.auth.getSession()`, which returns the session _without_
	 * validating the JWT, this function also calls `getUser()` to validate the JWT.
	 */
	event.locals.safeGetSession = async () => {
		const {
			data: { session },
			error
		} = await event.locals.supabase.auth.getSession();
		if (!session) {
			return { session: null, user: null };
		}

		const {
			data: { user },
			error: userError
		} = await event.locals.supabase.auth.getUser();
		if (userError) {
			// JWT validation has failed
			return { session: null, user: null };
		}

		// 🔧 NOVÁ LOGIKA: Auto-reaktivace suspended uživatelů s deletion request
		if (user && session) {
			try {
				// Zkontrolovat, jestli má uživatel suspended účet s deletion request
				const { data: profile, error: profileError } = await adminSupabase
					.from('profiles')
					.select('id, account_suspended, data_deletion_requested, data_deletion_token, data_deletion_scheduled, first_name, last_name')
					.eq('id', user.id)
					.single();

				if (!profileError && profile) {
					const isAccountSuspended = profile.account_suspended === true || String(profile.account_suspended) === 'true';
					const isDeletionRequested = profile.data_deletion_requested === true || String(profile.data_deletion_requested) === 'true';

					// Pokud je účet suspended kvůli deletion request, automaticky reaktivovat
					if (isAccountSuspended && isDeletionRequested) {
						console.log('🔄 [AUTH] Auto-reactivating suspended account with deletion request:', user.id);

						// Zkontrolovat, jestli je stále v grace period (30 dní)
						const deletionScheduled = profile.data_deletion_scheduled ? new Date(profile.data_deletion_scheduled) : null;
						const now = new Date();

						if (deletionScheduled && now < deletionScheduled) {
							// Stále v grace period - reaktivovat účet
							const { error: updateError } = await adminSupabase
								.from('profiles')
								.update({
									account_suspended: false,
									data_deletion_requested: false,
									data_deletion_date: null,
									data_deletion_scheduled: null,
									data_deletion_token: null,
									updated_at: new Date().toISOString()
								})
								.eq('id', user.id);

							if (!updateError) {
								console.log('✅ [AUTH] Account successfully reactivated via login:', user.id);

								// Poslat potvrzovací email o reaktivaci
								try {
									const { sendAccountReactivationEmail } = await import('$lib/services/gdprEmailService');
									await sendAccountReactivationEmail({
										email: user.email!,
										firstName: profile.first_name || 'Vážený zákazníku',
										lastName: profile.last_name || ''
									});
								} catch (emailError) {
									console.error('⚠️ [AUTH] Failed to send reactivation email:', emailError);
									// Pokračovat i když email selže
								}
							} else {
								console.error('❌ [AUTH] Failed to reactivate account:', updateError);
							}
						} else {
							console.log('⏰ [AUTH] Grace period expired, cannot auto-reactivate:', user.id);
						}
					}
				}
			} catch (autoReactivationError) {
				console.error('❌ [AUTH] Error in auto-reactivation process:', autoReactivationError);
				// Pokračovat v normálním flow i když auto-reaktivace selže
			}
		}

		return { session, user };
	};

	// 🔧 NOVÁ LOGIKA: Nastavit tenant context podle PUBLIC_TENANT (jediný tenant pro tuto doménu)
	try {
		// Nastavit tenant context pro hlavní client
		await TenantService.setTenantContext(PUBLIC_TENANT);
		
		// Nastavit tenant context i pro admin client (pro auto-reaktivaci)
		await adminSupabase.rpc('set_tenant_context', { tenant_id: PUBLIC_TENANT });
		
		// Uložit tenant info do locals pro použití v aplikaci
		event.locals.tenantId = PUBLIC_TENANT;
		
		// Získat tenant data pro locals
		const tenant = await TenantService.getTenantById(PUBLIC_TENANT);
		event.locals.tenant = tenant;
		
	} catch (error) {
		console.error('Error setting tenant context:', error);
		// Fallback na default tenant při chybě
		try {
			await TenantService.setTenantContext(PUBLIC_TENANT);
			await adminSupabase.rpc('set_tenant_context', { tenant_id: PUBLIC_TENANT });
			event.locals.tenantId = PUBLIC_TENANT;
		} catch (fallbackError) {
			console.error('Error in fallback tenant context:', fallbackError);
		}
	}

	return resolve(event, {
		filterSerializedResponseHeaders(name) {
			/**
			 * Supabase libraries use the `content-range` and `x-supabase-api-version`
			 * headers, so we need to tell SvelteKit to pass it through.
			 */
			return name === 'content-range' || name === 'x-supabase-api-version';
		}
	});
};

const authGuard: Handle = async ({ event, resolve }) => {
	// Ignorovat požadavky na statické soubory
	if (event.url.pathname.startsWith('/favi/') || event.url.pathname === '/favicon.ico') {
		return resolve(event);
	}

	const { session, user } = await event.locals.safeGetSession();
	event.locals.session = session;
	event.locals.user = user;

	return resolve(event);
};

export const handle: Handle = sequence(supabase, authGuard);
