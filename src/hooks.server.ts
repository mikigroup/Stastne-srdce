import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { type Handle, error, redirect } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";

import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, PUBLIC_TENANT } from "$env/static/public";
import { PRIVATE_SBUrl, PRIVATE_ServiceKey } from "$env/static/private";
import { clearCorruptedSupabaseCookies } from "$lib/utils/supabaseCookies";
import { getRegistrationStatus } from "$lib/services/registrationStatusService";
import { ROUTES } from "$lib/constants/routes";
import type { Database } from "$lib/types/database.types";
import type { AuthResult, AuthUser } from "$lib/types/auth";

const emptyAuth: AuthResult = { session: null, user: null };

function createAdminClient() {
	return createClient<Database>(PRIVATE_SBUrl, PRIVATE_ServiceKey, {
		auth: {
			persistSession: false,
			autoRefreshToken: false
		}
	});
}

function isAuthRoute(routeId: string | null, pathname: string) {
	if (routeId === "/auth" || routeId?.startsWith("/auth/")) return true;
	return pathname === "/auth" || pathname.startsWith("/auth/");
}

async function resolveRequestAuth(event: Parameters<Handle>[0]["event"]): Promise<AuthResult> {
	const { data, error: claimsError } = await event.locals.supabase.auth.getClaims();
	if (claimsError || !data?.claims?.sub) {
		// Nevolat signOut. Paralelní požadavek mohl token právě otočit a odpověď
		// s mazáním cookies by platnou relaci smazala, když dorazí jako poslední.
		if (claimsError) {
			const status = "status" in claimsError ? claimsError.status : undefined;
			console.error("[AUTH] Session check failed:", { status, message: claimsError.message });
		}
		return emptyAuth;
	}

	const user: AuthUser = {
		id: data.claims.sub,
		email: typeof data.claims.email === "string" ? data.claims.email : undefined
	};
	const admin = createAdminClient();

	try {
		const { data: profile, error: profileError } = await admin
			.from("profiles")
			.select("id, account_suspended, data_deletion_requested, tenant_id")
			.eq("id", user.id)
			.single();

		if (profileError && profileError.code !== "PGRST116") {
			console.error("[AUTH] Error fetching user profile:", profileError);
		}

		if (profile) {
			const { data: membership, error: membershipError } = await admin
				.from("tenant_members")
				.select("tenant_id")
				.eq("user_id", user.id)
				.eq("tenant_id", PUBLIC_TENANT)
				.is("deleted_at", null)
				.limit(1)
				.maybeSingle();

			if (membershipError) {
				console.error("[AUTH] Error fetching tenant membership:", membershipError);
			} else {
				const hasAccessToTenant = !!membership || profile.tenant_id === PUBLIC_TENANT;
				if (!hasAccessToTenant) {
					await event.locals.supabase.auth.signOut({ scope: "local" });
					return emptyAuth;
				}
			}

			const isAccountSuspended =
				profile.account_suspended === true || String(profile.account_suspended) === "true";
			const isDeletionRequested =
				profile.data_deletion_requested === true ||
				String(profile.data_deletion_requested) === "true";

			if (isAccountSuspended && isDeletionRequested) {
				await event.locals.supabase.auth.signOut();
				event.locals.accountDeletionPending = true;
				return emptyAuth;
			}
		}
	} catch (authError) {
		console.error("[AUTH] Error while checking account access:", authError);
	}

	try {
		const registrationStatus = await getRegistrationStatus(
			event.locals.supabase,
			user.id,
			user.email
		);
		const waitingForProfile =
			registrationStatus.actualStatus === "pending" &&
			registrationStatus.validationResult.missingFields.includes(
				"Profil nenalezen - dokončete registraci"
			);
		// Účet se stavem completed, kterému chybí nově povinné pole, se upravuje v profilu.
		// Jinak by odkaz z košíku skončil smyčkou dokončení registrace → homepage.
		event.locals.registrationRedirect =
			registrationStatus.actualStatus === "pending" && !waitingForProfile;
	} catch (registrationError) {
		console.error("[AUTH] Error checking registration status:", registrationError);
		event.locals.registrationRedirect = false;
	}

	return { session: { user }, user };
}

const supabase: Handle = async ({ event, resolve }) => {
	clearCorruptedSupabaseCookies(event.cookies);

	event.locals.supabase = createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
		cookies: {
			getAll: () => event.cookies.getAll(),
			setAll: (cookiesToSet, headers) => {
				// Prázdná hodnota má maxAge: 0 a musí jít přes set. delete neshodí
				// stejné atributy a v prohlížeči zůstane starý kus cookie.
				cookiesToSet.forEach(({ name, value, options }) => {
					event.cookies.set(name, value, { ...options, httpOnly: false, path: "/" });
				});

				if (headers && Object.keys(headers).length > 0) {
					try {
						event.setHeaders(headers);
					} catch (headerError) {
						console.error("[AUTH] Failed to set cache headers:", headerError);
					}
				}
			}
		}
	});

	let authPromise: Promise<AuthResult> | undefined;
	event.locals.safeGetSession = () => {
		authPromise ??= resolveRequestAuth(event);
		return authPromise;
	};

	try {
		await event.locals.supabase.rpc("set_tenant_context", {
			tenant_id: PUBLIC_TENANT
		});

		event.locals.tenantId = PUBLIC_TENANT;

		const { data: tenant } = await event.locals.supabase
			.from("tenants")
			.select("*")
			.eq("id", PUBLIC_TENANT)
			.single();

		event.locals.tenant = tenant;
	} catch (tenantError) {
		console.error("[TENANT] Error setting tenant context:", tenantError);
		try {
			await event.locals.supabase.rpc("set_tenant_context", { tenant_id: PUBLIC_TENANT });
			event.locals.tenantId = PUBLIC_TENANT;
		} catch (fallbackError) {
			console.error("Error in fallback tenant context:", fallbackError);
			error(500, "Nepodařilo se nastavit kontext provozu");
		}
	}

	const auth = await event.locals.safeGetSession();
	event.locals.session = auth.session;
	event.locals.user = auth.user;

	return resolve(event, {
		filterSerializedResponseHeaders(name) {
			return name === "content-range" || name === "x-supabase-api-version";
		}
	});
};

const authGuard: Handle = async ({ event, resolve }) => {
	if (event.url.pathname.startsWith("/favi/") || event.url.pathname === "/favicon.ico") {
		return resolve(event);
	}

	const authRoute = isAuthRoute(event.route.id, event.url.pathname);

	if (event.locals.accountDeletionPending && !authRoute) {
		redirect(303, `${ROUTES.AUTH.LOGIN}?message=deletion_pending`);
	}

	const profileRoute =
		event.url.pathname === ROUTES.MAIN.PROFILE ||
		event.url.pathname.startsWith(`${ROUTES.MAIN.PROFILE}/`);

	if (event.locals.registrationRedirect && !authRoute && !profileRoute) {
		redirect(303, ROUTES.AUTH.SIGNUP_COMPLETE);
	}

	return resolve(event);
};

export const handle: Handle = sequence(supabase, authGuard);
