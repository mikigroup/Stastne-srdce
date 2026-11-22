import { createServerClient } from "@supabase/ssr";
import { type Handle, error, redirect } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";

import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, PUBLIC_TENANT } from "$env/static/public";
import { PRIVATE_SBUrl, PRIVATE_ServiceKey } from "$env/static/private";
import { clearCorruptedSupabaseCookies } from "$lib/utils/supabaseCookies";

// Admin client pro obejití RLS politik
const adminSupabase = createServerClient(
	PRIVATE_SBUrl,
	PRIVATE_ServiceKey,
	{
		cookies: {
			getAll: () => [],
			setAll: () => {}
		}
	}
)

const supabase: Handle = async ({ event, resolve }) => {
	clearCorruptedSupabaseCookies(event.cookies);

	event.locals.supabase = createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
		cookies: {
			getAll: () => event.cookies.getAll(),
			setAll: (cookiesToSet) => {
				cookiesToSet.forEach(({ name, value, options }) => {
					if (value) {
						event.cookies.set(name, value, { ...options, httpOnly: false, path: "/" });
					} else {
						event.cookies.delete(name, { ...options, path: "/" });
					}
				});
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
			const status = "status" in userError ? userError.status : undefined;
			if (status === 401 || status === 403) {
				await event.locals.supabase.auth.signOut({ scope: "local" });
			}
			return { session: null, user: null };
		}

		// Kontrola členství v tenantovi a pozastavení účtu při žádosti o výmaz
		if (user && session) {
			try {
				// Zkontrolovat, jestli má uživatel suspended účet s deletion request
				const { data: profile, error: profileError } = await adminSupabase
					.from('profiles')
					.select('id, account_suspended, data_deletion_requested, tenant_id')
					.eq('id', user.id)
					.single();

				if (profileError && profileError.code === 'PGRST116') {
					// Uživatel nemá vytvořený profil - přesměrovat na dokončení registrace
					console.log('ℹ️ [AUTH] User profile not found, redirecting to registration completion:', user.id);
					// Necháme uživatele pokračovat - bude přesměrován na dokončení registrace
				} else if (profileError) {
					// Jiná chyba při načítání profilu
					console.error('❌ [AUTH] Error fetching user profile:', profileError);
					// Pokračovat v normálním flow i při chybě
				} else if (!profileError && profile) {
					// Zdroj pravdy je tabulka tenant_members; profile.tenant_id je domovský tenant.
					let isActiveMember = false;
					const { data: membership, error: membershipError } = await adminSupabase
						.from('tenant_members')
						.select('tenant_id')
						.eq('user_id', user.id)
						.eq('tenant_id', PUBLIC_TENANT)
						.is('deleted_at', null)
						.limit(1)
						.maybeSingle();

					if (membershipError) {
						console.error('❌ [AUTH] Error fetching tenant membership:', membershipError);
						// Při chybě dotazu na členství raději nevyhazovat uživatele ven
						isActiveMember = true;
					} else {
						isActiveMember = !!membership;
					}

					const hasAccessToTenant =
						isActiveMember ||
						profile.tenant_id === PUBLIC_TENANT;

					if (!hasAccessToTenant) {
						console.log('❌ [AUTH] User does not have access to current tenant:', {
							userId: user.id,
							currentTenant: PUBLIC_TENANT,
							userTenantId: profile.tenant_id,
							isActiveMember
						});
						
						// Odhlásit uživatele - nemá přístup k tomuto tenantovi
						await event.locals.supabase.auth.signOut();
						return { session: null, user: null };
					}
					
					console.log('✅ [AUTH] User has access to current tenant:', {
						userId: user.id,
						currentTenant: PUBLIC_TENANT,
						userTenantId: profile.tenant_id,
						isActiveMember
					});
					
					const isAccountSuspended = profile.account_suspended === true || String(profile.account_suspended) === 'true';
					const isDeletionRequested = profile.data_deletion_requested === true || String(profile.data_deletion_requested) === 'true';

					// Žádost o výmaz ruší jen přihlášení heslem nebo odkaz z e-mailu.
					// Tady se token nemaže, jen se ukončí zbylá session.
					if (isAccountSuspended && isDeletionRequested) {
						console.log('🔒 [AUTH] Signing out session with pending data deletion:', user.id);
						await event.locals.supabase.auth.signOut();
						event.locals.accountDeletionPending = true;
						return { session: null, user: null };
					}
				}
			} catch (autoReactivationError) {
				console.error('❌ [AUTH] Error in auto-reactivation process:', autoReactivationError);
				// Pokračovat v normálním flow i když auto-reaktivace selže
			}
		}

		return { session, user };
	};

	// 🔧 NOVÁ LOGIKA: Nastavit tenant context podle PUBLIC_TENANT
	try {
		// Nastavit tenant context na hlavní client (důležité pro menu!)
		await event.locals.supabase.rpc('set_tenant_context', { 
			tenant_id: PUBLIC_TENANT 
		});
		
		// Nastavit tenant context i pro admin client (kontrola členství a žádosti o výmaz)
		await adminSupabase.rpc('set_tenant_context', { 
			tenant_id: PUBLIC_TENANT 
		});
		
		// Uložit tenant info do locals
		event.locals.tenantId = PUBLIC_TENANT;
		
		// Získat tenant data pro locals
		const { data: tenant } = await event.locals.supabase
			.from('tenants')
			.select('*')
			.eq('id', PUBLIC_TENANT)
			.single();
		
		event.locals.tenant = tenant;
		
		console.log('✅ [TENANT] Tenant context set for PUBLIC_TENANT:', PUBLIC_TENANT);
		
	} catch (tenantError) {
		console.error('❌ [TENANT] Error setting tenant context:', tenantError);
		// Fallback na default tenant při chybě
		try {
			await event.locals.supabase.rpc('set_tenant_context', { tenant_id: PUBLIC_TENANT });
			await adminSupabase.rpc('set_tenant_context', { tenant_id: PUBLIC_TENANT });
			event.locals.tenantId = PUBLIC_TENANT;
		} catch (fallbackError) {
			console.error('Error in fallback tenant context:', fallbackError);
			error(500, 'Nepodařilo se nastavit kontext provozu');
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

	if (event.locals.accountDeletionPending && !event.url.pathname.startsWith('/auth')) {
		throw redirect(303, '/auth/login?message=deletion_pending');
	}

	return resolve(event);
};

export const handle: Handle = sequence(supabase, authGuard);
