import type { EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ url, locals: { supabase } }) => {
	try {
		// Podrobné logování všech parametrů
		console.log("Auth Callback - začátek zpracování");
		console.log("URL:", url.toString());
		console.log("Parametry:", Object.fromEntries(url.searchParams));

		const token_hash = url.searchParams.get("token_hash");
		const type = url.searchParams.get("type") as EmailOtpType | null;

		if (!token_hash || !type) {
			console.error("Chybí povinné parametry");
			return redirect(303, "/auth/error?error=chybejici_parametry");
		}

		// Zkusme odstranit prefix pkce_, pokud existuje
		let cleanToken = token_hash;
		if (token_hash.startsWith("pkce_")) {
			cleanToken = token_hash.substring(5);
			console.log("Odstraněn prefix 'pkce_', čistý token:", cleanToken);
		}

		try {
			console.log("Volám supabase.auth.verifyOtp s parametry:", {
				token_hash: cleanToken,
				type
			});

			const { data, error } = await supabase.auth.verifyOtp({
				token_hash: cleanToken, // zkusíme použít očištěný token
				type
			});

			if (error) {
				console.error("Chyba při verifikaci:", {
					status: error.status,
					code: error.code,
					message: error.message
				});

				return redirect(
					303,
					`/auth/error?error=verification_error&message=${encodeURIComponent(error.message)}`
				);
			}

			console.log("Verifikace úspěšná, data:", data);

			// Úspěšné přesměrování
			if (type === "signup") {
				return redirect(303, "/signup/complete");
			} else if (type === "recovery") {
				return redirect(303, "/reset");
			}

			return redirect(303, "/");
		} catch (verifyError) {
			console.error("Chyba při volání verifyOtp:", verifyError);
			return redirect(
				303,
				`/auth/error?error=verify_exception&message=${encodeURIComponent(verifyError.message)}`
			);
		}
	} catch (outerError) {
		console.error("Globální výjimka:", outerError);
		return redirect(
			303,
			`/auth/error?error=global_exception&message=${encodeURIComponent(outerError.message)}`
		);
	}
};
