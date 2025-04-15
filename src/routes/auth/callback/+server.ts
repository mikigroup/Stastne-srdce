import type { EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ url, locals: { supabase } }) => {
	const token_hash = url.searchParams.get("token_hash");
	const type = url.searchParams.get("type") as EmailOtpType | null;
	const next = url.searchParams.get("next") ?? "/";

	const redirectTo = new URL(url);
	redirectTo.pathname = next;
	redirectTo.searchParams.delete("token_hash");
	redirectTo.searchParams.delete("type");

	if (!token_hash || !type) {
		redirectTo.pathname = "/auth/error";
		redirectTo.searchParams.append("error", "missing_token_or_type");
		return redirect(303, redirectTo);
	}

	const { data, error } = await supabase.auth.verifyOtp({ type, token_hash });

	if (error) {
		redirectTo.pathname = "/auth/error";
		redirectTo.searchParams.append("error", error.message);
		return redirect(303, redirectTo);
	}

	redirectTo.searchParams.delete("next");

	if (type === "signup") {
		redirectTo.pathname = "/signup/complete";
		redirectTo.searchParams.append("success", "signup");
	} else if (type === "recovery") {
		redirectTo.pathname = "/reset";
		redirectTo.searchParams.append("token", token_hash);
	} else {
		redirectTo.pathname = "/auth/error";
		redirectTo.searchParams.append("error", "invalid_type");
		return redirect(303, redirectTo);
	}

	return redirect(303, redirectTo);
};
