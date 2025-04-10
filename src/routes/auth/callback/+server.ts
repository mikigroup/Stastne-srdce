import { redirect } from "@sveltejs/kit";

export const GET = async ({ url, locals: { supabase } }) => {
	const token_hash = url.searchParams.get("token_hash");
	const type = url.searchParams.get("type");

	if (!token_hash || !type) {
		return redirect(303, "/auth/error?code=missing_params");
	}

	try {
		const { error } = await supabase.auth.verifyOtp({
			type,
			token_hash,
			options: {
				redirectTo: "https://stastnesrdce.cz/auth/callback"
			}
		});

		if (error) throw error;

		// Explicitní získání session po ověření
		const {
			data: { session },
			error: sessionError
		} = await supabase.auth.getSession();

		if (sessionError || !session) {
			throw new Error("Session not created after verification");
		}

		// Přesměrování s dodatečnou cookie pro klienta
		const redirectTo = type === "signup" ? "/signup/complete" : "/";
		const response = new Response(null, {
			status: 302,
			headers: {
				Location: redirectTo,
				"Set-Cookie": `sb-auth-redirect=${redirectTo}; Path=/; HttpOnly; SameSite=Lax`
			}
		});

		return response;
	} catch (error) {
		console.error("Verification failed:", error);
		return redirect(303, `/auth/error?code=verification_failed&type=${type}`);
	}
};
