import { redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import {
	FAKTUROID_CLIENT_ID,
	FAKTUROID_CLIENT_SECRET
} from "$env/static/private";

export const GET: RequestHandler = async ({ url, cookies }) => {
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
					Authorization: `Basic ${Buffer.from(`${FAKTUROID_CLIENT_ID}:${FAKTUROID_CLIENT_SECRET}`).toString("base64")}`
				},
				body: JSON.stringify({
					grant_type: "authorization_code",
					code,
					redirect_uri: import.meta.env.VITE_FAKTUROID_REDIRECT_URI // Ujisti se, že tato proměnná je správná
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
};
