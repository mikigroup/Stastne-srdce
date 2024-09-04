import type { EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { dev } from "$app/environment";

export const GET: RequestHandler = async ({
	url,
	request,
	locals: { supabase }
}) => {
	console.log("Auth Callback Handler Triggered");
	console.log("Full URL:", url.toString());

	const cookies = request.headers.get("cookie");
	console.log("Cookies:", cookies);

	// Extract the code verifier from cookies
	const codeVerifierMatch = cookies?.match(
		/sb-\w+-auth-token-code-verifier=([^;]+)/
	);
	const codeVerifier = codeVerifierMatch
		? decodeURIComponent(codeVerifierMatch[1])
		: null;
	console.log("Code Verifier:", codeVerifier);

	if (codeVerifier) {
		// Extract the actual code from the code verifier (assuming it's in the format "code/PURPOSE")
		const [code, purpose] = codeVerifier.split("/");
		console.log("Extracted Code:", code);
		console.log("Purpose:", purpose);

		if (code) {
			try {
				// Use the exchangeCodeForSession method to verify the code and get a session
				const { data, error } =
					await supabase.auth.exchangeCodeForSession(code);

				if (error) {
					console.error("Error exchanging code for session:", error);
					return redirect(303, "/auth/error?error=verification_failed");
				}

				console.log("Session exchange successful");
				return redirect(303, "/reset");
			} catch (error) {
				console.error("Error during code exchange:", error);
				return redirect(303, "/auth/error?error=verification_failed");
			}
		}
	}

	// Existing code remains unchanged
	const token_hash = url.searchParams.get("token_hash");
	const type = url.searchParams.get("type") as EmailOtpType | null;
	const next = url.searchParams.get("next") ?? "/";

	const redirectTo = new URL(url);
	redirectTo.pathname = next;
	redirectTo.searchParams.delete("token_hash");
	redirectTo.searchParams.delete("type");

	if (token_hash && type) {
		const { error } = await supabase.auth.verifyOtp({ type, token_hash });
		if (!error) {
			redirectTo.searchParams.delete("next");
			return redirect(303, redirectTo.toString());
		}
		// Zde by mělo být zpracování chyby
		redirectTo.pathname = "/auth/error";
		redirectTo.searchParams.append("error", "verification_failed");
		return redirect(303, redirectTo.toString());
	}

	if (type === "signup") {
		redirectTo.pathname = "/";
		redirectTo.searchParams.append("success", "signup");
	} else if (type === "recovery") {
		redirectTo.pathname = "/reset";
		redirectTo.searchParams.append("token", token_hash || "");
	} else {
		redirectTo.pathname = "/auth/error";
		redirectTo.searchParams.append("error", "invalid_type");
		return redirect(303, redirectTo.toString());
	}

	return redirect(303, redirectTo.toString());
};
