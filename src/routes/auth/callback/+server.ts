import type { EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { ROUTES } from "$lib/constants/routes";
import { ensurePendingCustomerProfile } from "$lib/services/signupConfirmService";

export const GET: RequestHandler = async ({ url, locals: { supabase } }) => {
	const token_hash = url.searchParams.get("token_hash");
	const type = url.searchParams.get("type") as EmailOtpType | null;
	const next = url.searchParams.get("next") ?? "/";

	const redirectTo = new URL(url);
	redirectTo.pathname = next;
	redirectTo.searchParams.delete("token_hash");
	redirectTo.searchParams.delete("type");
	redirectTo.searchParams.delete("next");

	if (!token_hash || !type) {
		redirectTo.pathname = ROUTES.AUTH.ERROR;
		redirectTo.searchParams.set("error", "missing_token_or_type");
		return redirect(303, redirectTo);
	}

	const { data: verifyData, error } = await supabase.auth.verifyOtp({ type, token_hash });

	if (error) {
		// Token mohl být již spotřebován (např. emailový skener), ale uživatel je potvrzený
		if (type === "signup") {
			const { data: { user } } = await supabase.auth.getUser();
			if (user?.email_confirmed_at) {
				await ensurePendingCustomerProfile(user);
			} else {
				redirectTo.pathname = ROUTES.AUTH.ERROR;
				redirectTo.searchParams.set("error", error.message);
				redirectTo.searchParams.set("error_code", error.status?.toString() || "unknown");
				return redirect(303, redirectTo);
			}
		} else {
			redirectTo.pathname = ROUTES.AUTH.ERROR;
			redirectTo.searchParams.set("error", error.message);
			redirectTo.searchParams.set("error_code", error.status?.toString() || "unknown");
			return redirect(303, redirectTo);
		}
	} else if (type === "signup" && verifyData.user) {
		await ensurePendingCustomerProfile(verifyData.user);
	}

	if (type === "signup") {
		redirectTo.pathname = ROUTES.AUTH.SIGNUP_COMPLETE;
		redirectTo.searchParams.set("success", "signup");
	} else if (type === "recovery") {
		redirectTo.pathname = next;
	} else {
		redirectTo.pathname = ROUTES.AUTH.ERROR;
		redirectTo.searchParams.set("error", "invalid_type");
		return redirect(303, redirectTo);
	}

	return redirect(303, redirectTo);
};
