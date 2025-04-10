import type { EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ url, locals: { supabase } }) => {
	console.log("Auth Callback Handler - Zpracovávám:", url.toString());

	// Získání parametrů z URL
	const token_hash = url.searchParams.get("token_hash");
	const type = url.searchParams.get("type") as EmailOtpType | null;

	// Pokud máme token_hash a typ, pokusíme se ověřit OTP
	if (token_hash && type) {
		try {
			console.log(`Ověřuji token typu "${type}" s hash: ${token_hash}`);
			const { data, error } = await supabase.auth.verifyOtp({
				token_hash,
				type
			});

			if (error) {
				console.error("Chyba při ověření:", error);
				return redirect(303, `/auth/error?error=${error.message}`);
			}

			console.log("Ověření proběhlo úspěšně:", data);

			// Přesměrování podle typu ověření
			if (type === "signup") {
				return redirect(303, "/signup/complete");
			} else if (type === "recovery") {
				return redirect(303, "/reset");
			} else {
				// Výchozí přesměrování při úspěchu
				return redirect(303, "/");
			}
		} catch (error) {
			console.error("Neočekávaná chyba při ověření:", error);
			return redirect(303, "/auth/error?error=neocekavana_chyba");
		}
	}

	// Pokud se dostaneme až sem, nebyly nalezeny žádné platné parametry
	return redirect(303, "/auth/error?error=neplatny_pozadavek");
};
