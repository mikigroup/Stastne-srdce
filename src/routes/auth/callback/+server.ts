import type { EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ url, locals: { supabase } }) => {
	const token_hash = url.searchParams.get("token_hash");
	const type = url.searchParams.get("type") as EmailOtpType | null;
	const next = url.searchParams.get("next") ?? "/";

	const redirectTo = new URL(url);
	redirectTo.pathname = next;
	redirectTo.searchParams.delete("token");
	redirectTo.searchParams.delete("type");

	if (token_hash && type) {
		const { error } = await supabase.auth.verifyOtp({ type, token_hash });
		if (!error) {
			redirectTo.searchParams.delete("next");
			redirect(303, redirectTo);
		}
	}

	if (type === "signup") {
		redirectTo.pathname = "/";
		redirectTo.searchParams.append("success", "signup");
	} else if (type === "recovery") {
		redirectTo.pathname = "/reset";
		redirectTo.searchParams.append("token", "token_hash");
	} else {
		redirectTo.pathname = "/auth/error";
		redirectTo.searchParams.append("error", "invalid_type");
		return redirect(303, redirectTo);
	}

	redirectTo.pathname = "/auth/error";
	return redirect(303, redirectTo);
};
