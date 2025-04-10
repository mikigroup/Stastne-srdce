import type { EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

// Povolené typy OTP
const ALLOWED_OTP_TYPES: EmailOtpType[] = [
	"signup",
	"recovery",
	"invite",
	"magiclink",
	"email_change"
];

export const GET: RequestHandler = async ({
	url,
	request,
	locals: { supabase }
}) => {
	// Získání parametrů
	const token_hash = url.searchParams.get("token_hash");
	const type = url.searchParams.get("type");

	// 1. Základní kontrola existence parametrů
	if (!token_hash || !type) {
		console.error("Missing required parameters", { token_hash, type });
		return redirect(303, "/auth/error?code=missing_params");
	}

	// 2. Validace typu
	if (!ALLOWED_OTP_TYPES.includes(type as EmailOtpType)) {
		console.error("Invalid OTP type", { type });
		return redirect(303, "/auth/error?code=invalid_type");
	}

	// 3. Validace tokenu (základní formát)
	if (token_hash.length < 16 || token_hash.length > 512) {
		console.error("Invalid token length", { length: token_hash.length });
		return redirect(303, "/auth/error?code=invalid_token_format");
	}

	// 4. Specifická kontrola pro PKCE tokeny
	const isPkceToken = token_hash.startsWith("pkce_");
	if (isPkceToken && token_hash.length < 32) {
		console.error("Invalid PKCE token format");
		return redirect(303, "/auth/error?code=invalid_pkce_token");
	}

	// Přetypování typu (už je ověřeno)
	const otpType = type as EmailOtpType;

	try {
		// 5. Pokus o ověření tokenu
		const { error } = await supabase.auth.verifyOtp({
			type: otpType,
			token_hash,
			options: {
				redirectTo: "https://stastnesrdce.cz/auth/callback"
			}
		});

		if (error) {
			console.error("OTP verification failed", {
				error: error.message,
				type: otpType,
				isPkceToken
			});
			throw error;
		}

		// 6. Přesměrování podle typu
		const redirectPaths = {
			signup: "/signup/confirm",
			recovery: "/reset-password",
			invite: "/accept-invite",
			magiclink: "/dashboard",
			email_change: "/profile"
		};

		const redirectPath = redirectPaths[otpType] || "/";
		console.log(
			`Successful ${otpType} verification, redirecting to ${redirectPath}`
		);

		return redirect(303, redirectPath);
	} catch (error) {
		console.error("Verification process failed", {
			error: error instanceof Error ? error.message : error,
			type: otpType
		});
		return redirect(
			303,
			`/auth/error?code=verification_failed&type=${otpType}`
		);
	}
};
