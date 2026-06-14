import type { EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { ROUTES } from "$lib/constants/routes";

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

	const { error } = await supabase.auth.verifyOtp({ type, token_hash });

	if (error) {
		redirectTo.pathname = ROUTES.AUTH.ERROR;
		redirectTo.searchParams.set("error", error.message);
		redirectTo.searchParams.set("error_code", error.status?.toString() || "unknown");
		return redirect(303, redirectTo);
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
