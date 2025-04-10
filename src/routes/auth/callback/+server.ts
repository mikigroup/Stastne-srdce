import type { EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ url, locals: { supabase } }) => {
	console.log("Auth Callback - začátek zpracování");
	console.log("URL:", url.toString());
	console.log("Parametry:", Object.fromEntries(url.searchParams));

	const token_hash = url.searchParams.get("token_hash");
	const type = url.searchParams.get("type") as EmailOtpType | null;
	const next = url.searchParams.get("next") ?? "/";

	console.log("Token Hash:", token_hash);
	console.log("Type:", type);
	console.log("Next:", next);

	/**
	 * Clean up the redirect URL by deleting the Auth flow parameters.
	 *
	 * `next` is preserved for now, because it's needed in the error case.
	 */
	const redirectTo = new URL(url);
	redirectTo.pathname = next;
	redirectTo.searchParams.delete("token_hash");
	redirectTo.searchParams.delete("type");

	console.log("Redirect URL upravena na:", redirectTo.toString());

	if (token_hash && type) {
		console.log("Zahajuji verifikaci OTP...");
		try {
			const { data, error } = await supabase.auth.verifyOtp({
				type,
				token_hash
			});

			if (error) {
				console.error("Chyba při verifikaci:", {
					status: error.status,
					name: error.name,
					code: error.code,
					message: error.message
				});

				// Přidáme chybové informace do URL
				redirectTo.pathname = "/auth/error";
				redirectTo.searchParams.set("error_code", error.code || "");
				redirectTo.searchParams.set(
					"error_message",
					error.message || "Neznámá chyba"
				);
				return redirect(303, redirectTo);
			}

			console.log("Verifikace úspěšná:", data);
			redirectTo.searchParams.delete("next");
			return redirect(303, redirectTo);
		} catch (e) {
			console.error("Neošetřená výjimka při verifikaci:", e);

			// Přidáme chybové informace do URL
			redirectTo.pathname = "/auth/error";
			redirectTo.searchParams.set(
				"error_message",
				e.message || "Neočekávaná chyba"
			);
			redirectTo.searchParams.set("error_type", "exception");
			return redirect(303, redirectTo);
		}
	} else {
		console.error("Chybí token_hash nebo type parametr");
	}

	console.log(
		"Přesměrovávám na chybovou stránku (žádné parametry nebo neúspěšná verifikace)"
	);
	redirectTo.pathname = "/auth/error";
	return redirect(303, redirectTo);
};
