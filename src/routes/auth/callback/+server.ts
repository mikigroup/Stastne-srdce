import type { EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { ROUTES } from "$lib/constants/routes";
import {
	PRIVATE_FAKTUROID_CLIENT_ID,
	PRIVATE_FAKTUROID_CLIENT_SECRET
} from "$env/static/private";

export const GET: RequestHandler = async ({ url, locals: { supabase } }) => {
	const token_hash = url.searchParams.get("token_hash");
	const type = url.searchParams.get("type") as EmailOtpType | null;
	const next = url.searchParams.get("next") ?? "/";

	console.log('🔍 [AUTH CALLBACK] Processing callback:', { token_hash: token_hash?.substring(0, 10) + '...', type });

	const redirectTo = new URL(url);
	redirectTo.pathname = next;
	redirectTo.searchParams.delete("token_hash");
	redirectTo.searchParams.delete("type");

	if (!token_hash || !type) {
		console.error('❌ [AUTH CALLBACK] Missing token_hash or type:', { token_hash: !!token_hash, type });
		redirectTo.pathname = ROUTES.AUTH.ERROR;
		redirectTo.searchParams.append("error", "missing_token_or_type");
		return redirect(303, redirectTo);
	}

	try {
		// Pro recovery typ použijeme exchangeCodeForSession (pro vlastní emailovou šablonu)
		if (type === "recovery") {
			const { data, error } = await supabase.auth.exchangeCodeForSession(token_hash);
			
			if (error) {
				console.error('❌ [AUTH CALLBACK] exchangeCodeForSession recovery failed:', error);
				redirectTo.pathname = ROUTES.AUTH.ERROR;
				redirectTo.searchParams.append("error", error.message);
				redirectTo.searchParams.append("error_code", error.status?.toString() || "unknown");
				return redirect(303, redirectTo);
			}

			console.log('✅ [AUTH CALLBACK] exchangeCodeForSession recovery successful:', { type, userId: data.user?.id });
			
			// Pro recovery přesměrujeme na reset stránku (uživatel je přihlášen)
			redirectTo.pathname = "/auth/reset";
			console.log('🔄 [AUTH CALLBACK] Redirecting to reset page:', redirectTo.pathname);
			return redirect(303, redirectTo);
		} else {
			// Pro ostatní typy použijeme verifyOtp
			const { data, error } = await supabase.auth.verifyOtp({ type, token_hash });

			if (error) {
				console.error('❌ [AUTH CALLBACK] verifyOtp failed:', error);
				redirectTo.pathname = ROUTES.AUTH.ERROR;
				redirectTo.searchParams.append("error", error.message);
				redirectTo.searchParams.append("error_code", error.status?.toString() || "unknown");
				return redirect(303, redirectTo);
			}

			console.log('✅ [AUTH CALLBACK] verifyOtp successful:', { type, userId: data.user?.id });

			redirectTo.searchParams.delete("next");

			if (type === "signup") {
				redirectTo.pathname = ROUTES.AUTH.SIGNUP_COMPLETE;
				redirectTo.searchParams.append("success", "signup");
			} else {
				console.error('❌ [AUTH CALLBACK] Invalid type:', type);
				redirectTo.pathname = ROUTES.AUTH.ERROR;
				redirectTo.searchParams.append("error", "invalid_type");
				return redirect(303, redirectTo);
			}

			console.log('🔄 [AUTH CALLBACK] Redirecting to:', redirectTo.pathname);
			return redirect(303, redirectTo);
		}
	} catch (unexpectedError) {
		console.error('❌ [AUTH CALLBACK] Unexpected error:', unexpectedError);
		redirectTo.pathname = ROUTES.AUTH.ERROR;
		redirectTo.searchParams.append("error", "unexpected_error");
		redirectTo.searchParams.append("error_message", unexpectedError instanceof Error ? unexpectedError.message : "Unknown error");
		return redirect(303, redirectTo);
	}
};

/*export const GET = async ({ url, cookies }) => {
	const code = url.searchParams.get("code");
	const state = url.searchParams.get("state");
	const savedState = cookies.get("oauth_state");

	// Ověření state parametru
	if (!code || !state || state !== savedState) {
		throw redirect(303, "/?error=invalid_auth");
	}

	try {
		// Získání access tokenu
		const tokenResponse = await fetch(
			"https://app.fakturoid.cz/api/v3/oauth/token",
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Basic ${Buffer.from(`${PRIVATE_FAKTUROID_CLIENT_ID}:${PRIVATE_FAKTUROID_CLIENT_SECRET}`).toString("base64")}`
				},
				body: JSON.stringify({
					grant_type: "authorization_code",
					code,
					redirect_uri: PRIVATE_FAKTUROID_REDIRECT_URI
				})
			}
		);

		const tokenData = await tokenResponse.json();

		// Uložení tokenů do secure cookies
		cookies.set("fakturoid_access_token", tokenData.access_token, {
			path: "/",
			secure: process.env.NODE_ENV === "production",
			httpOnly: true,
			maxAge: tokenData.expires_in
		});

		cookies.set("fakturoid_refresh_token", tokenData.refresh_token, {
			path: "/",
			secure: process.env.NODE_ENV === "production",
			httpOnly: true
		});

		throw redirect(303, "/?auth=success");
	} catch (error) {
		console.error("Token exchange failed:", error);
		throw redirect(303, "/?error=auth_failed");
	}
};*/
