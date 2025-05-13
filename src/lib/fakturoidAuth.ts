import {
	FAKTUROID_CLIENT_ID,
	FAKTUROID_CLIENT_SECRET
} from "$env/static/private";

let cachedToken: { access_token: string; expires_at: number } | null = null;

export async function getAccessToken() {
	// Pokud máme platný token v cache, vrátíme ho
	if (cachedToken && cachedToken.expires_at > Date.now()) {
		return cachedToken.access_token;
	}

	const response = await fetch("https://app.fakturoid.cz/api/v3/oauth/token", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Basic ${Buffer.from(`${FAKTUROID_CLIENT_ID}:${FAKTUROID_CLIENT_SECRET}`).toString("base64")}`
		},
		body: JSON.stringify({
			grant_type: "client_credentials"
		})
	});

	const data = await response.json();

	// Uložíme token do cache s 5min rezervou před expirací
	cachedToken = {
		access_token: data.access_token,
		expires_at: Date.now() + data.expires_in * 1000 - 300000
	};

	return data.access_token;
}
