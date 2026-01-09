import type { EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { ROUTES } from "$lib/constants/routes";

export const GET: RequestHandler = async ({ url, locals: { supabase } }) => {
	const token_hash = url.searchParams.get("token_hash");
	const type = url.searchParams.get("type") as EmailOtpType | null;
	const next = url.searchParams.get("next") ?? "/";

	console.log('🔍 [AUTH CALLBACK] Processing callback:', { 
		token_hash: token_hash?.substring(0, 10) + '...', 
		type,
		fullUrl: url.toString()
	});

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

	console.log('🔄 [AUTH CALLBACK] Calling verifyOtp with:', { type, token_hash: token_hash.substring(0, 10) + '...' });
	
	// Pro všechny typy použijeme verifyOtp (včetně recovery)
	const { data, error } = await supabase.auth.verifyOtp({ type, token_hash });

	console.log('📊 [AUTH CALLBACK] verifyOtp result:', { 
		success: !error, 
		error: error?.message,
		userId: data?.user?.id,
		session: !!data?.session
	});

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
	} else if (type === "recovery") {
		redirectTo.pathname = "/auth/reset";
		redirectTo.searchParams.append("token", token_hash);
	} else {
		console.error('❌ [AUTH CALLBACK] Invalid type:', type);
		redirectTo.pathname = ROUTES.AUTH.ERROR;
		redirectTo.searchParams.append("error", "invalid_type");
		return redirect(303, redirectTo);
	}

	console.log('🔄 [AUTH CALLBACK] Redirecting to:', redirectTo.pathname);
	return redirect(303, redirectTo);
};
