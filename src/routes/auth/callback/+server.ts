import type { EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import {
	PRIVATE_FAKTUROID_CLIENT_ID,
	PRIVATE_FAKTUROID_CLIENT_SECRET,
	PRIVATE_FAKTUROID_REDIRECT_URI
} from "$env/static/private";

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

/*export const GET = async ({ url, cookies }) => {
	const code = url.searchParams.get("code");
	const state = url.searchParams.get("state");
	const savedState = cookies.get("oauth_state");

	// Ověření state parametru
	if (!code || !state || state !== savedState) {
		throw redirect(303, "/?error=invalid_auth");
	}

	try {
		// Získání access tokenu
		const tokenResponse = await fetch(
			"https://app.fakturoid.cz/api/v3/oauth/token",
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Basic ${Buffer.from(`${PRIVATE_FAKTUROID_CLIENT_ID}:${PRIVATE_FAKTUROID_CLIENT_SECRET}`).toString("base64")}`
				},
				body: JSON.stringify({
					grant_type: "authorization_code",
					code,
					redirect_uri: PRIVATE_FAKTUROID_REDIRECT_URI
				})
			}
		);

		const tokenData = await tokenResponse.json();

		// Uložení tokenů do secure cookies
		cookies.set("fakturoid_access_token", tokenData.access_token, {
			path: "/",
			secure: process.env.NODE_ENV === "production",
			httpOnly: true,
			maxAge: tokenData.expires_in
		});

		cookies.set("fakturoid_refresh_token", tokenData.refresh_token, {
			path: "/",
			secure: process.env.NODE_ENV === "production",
			httpOnly: true
		});

		throw redirect(303, "/?auth=success");
	} catch (error) {
		console.error("Token exchange failed:", error);
		throw redirect(303, "/?error=auth_failed");
	}
};*/
