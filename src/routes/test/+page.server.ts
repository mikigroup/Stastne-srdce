import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import {
	FAKTUROID_CLIENT_ID,
	FAKTUROID_CLIENT_SECRET,
	FAKTUROID_ACCOUNT_SLUG
} from "$env/static/private";

// Funkce pro získání přístupového tokenu pomocí Client Credentials Flow
async function getAccessToken() {
	const tokenUrl = "https://app.fakturoid.cz/api/v3/oauth/token";

	try {
		// Vytvoření Basic auth hlavičky: Base64(client_id:client_secret)
		const basicAuth = Buffer.from(
			`${FAKTUROID_CLIENT_ID}:${FAKTUROID_CLIENT_SECRET}`
		).toString("base64");

		const response = await fetch(tokenUrl, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
				"User-Agent": "StastneSrdce App (info@stastnesrdce.cz)",
				Authorization: `Basic ${basicAuth}`
			},
			body: JSON.stringify({
				grant_type: "client_credentials"
			})
		});

		if (!response.ok) {
			let errorMessage;
			try {
				const errorData = await response.json();
				errorMessage =
					errorData.error_description || errorData.error || response.statusText;
			} catch (e) {
				errorMessage = `HTTP chyba ${response.status}: ${response.statusText}`;
			}
			throw new Error(`Autorizace selhala: ${errorMessage}`);
		}

		const data = await response.json();
		console.log("Token získán úspěšně");
		return data;
	} catch (err) {
		console.error("Chyba při získávání tokenu:", err);
		throw err;
	}
}

export const load: PageServerLoad = async ({ fetch: fetchWithCookie, url }) => {
	// Získání stránky z URL parametru, výchozí je 1
	const page = parseInt(url.searchParams.get("page") || "1");

	try {
		// Získání přístupového tokenu včetně typu tokenu
		const tokenData = await getAccessToken();
		const { access_token, token_type } = tokenData;

		// Sestavení URL pro Fakturoid API
		const apiUrl = `https://app.fakturoid.cz/api/v3/accounts/${FAKTUROID_ACCOUNT_SLUG}/invoices.json?page=${page}`;

		// Vlastní funkce fetch, abychom mohli lépe zachytit a logovat chyby
		const customFetch = async (url, options) => {
			const response = await fetchWithCookie(url, options);

			if (!response.ok) {
				console.error(`API chyba: ${response.status} ${response.statusText}`);
				try {
					const errorText = await response.text();
					console.error("Odpověď API:", errorText);
				} catch (e) {
					// Ignorujeme chyby při čtení textu odpovědi
				}
			}

			return response;
		};

		// Provedení požadavku na Fakturoid API s OAuth 2.0 autorizací
		const response = await customFetch(apiUrl, {
			headers: {
				Authorization: `${token_type} ${access_token}`,
				"User-Agent": "StastneSrdce App (info@stastnesrdce.cz)",
				"Content-Type": "application/json"
			}
		});

		// Kontrola odpovědi
		if (!response.ok) {
			// Podrobnější informace o chybě
			let errorMessage;
			try {
				const errorData = await response.json();
				errorMessage =
					errorData.error_description || errorData.error || "Neznámá chyba";
			} catch (e) {
				errorMessage =
					"Chyba při komunikaci s Fakturoid API: " + response.statusText;
			}

			if (response.status === 402) {
				throw error(
					402,
					"Fakturoid účet je blokován kvůli neuhrazené faktuře."
				);
			} else if (response.status === 429) {
				throw error(
					429,
					"Překročen limit počtu požadavků na Fakturoid API. Zkuste to později."
				);
			} else {
				throw error(response.status, errorMessage);
			}
		}

		// Zpracování dat z odpovědi
		const invoices = await response.json();

		// Získání informací o stránkování z hlaviček
		const policyHeader = response.headers.get("X-RateLimit-Policy") || "";
		const rateLimitHeader = response.headers.get("X-RateLimit") || "";

		// Analýza hlaviček o rate limit
		let maxRequests = 0;
		let timeWindow = 0;
		let remainingRequests = 0;
		let resetTime = 0;

		const policyMatch = policyHeader.match(/default;q=(\d+);w=(\d+)/);
		if (policyMatch) {
			maxRequests = parseInt(policyMatch[1]);
			timeWindow = parseInt(policyMatch[2]);
		}

		const rateLimitMatch = rateLimitHeader.match(/default;r=(\d+);t=(\d+)/);
		if (rateLimitMatch) {
			remainingRequests = parseInt(rateLimitMatch[1]);
			resetTime = parseInt(rateLimitMatch[2]);
		}

		return {
			invoices,
			pagination: {
				currentPage: page,
				totalPages: Math.ceil(invoices.length / 40) // 40 záznamů na stránku dle dokumentace
			},
			rateLimit: {
				maxRequests,
				timeWindow,
				remainingRequests,
				resetTime
			}
		};
	} catch (err) {
		// Zpracování chyb
		console.error("Chyba při načítání faktur z Fakturoid:", err);

		if (err.status) {
			throw error(err.status, err.message);
		} else {
			throw error(
				500,
				"Chyba při komunikaci s Fakturoid API: " +
					(err.message || "Neznámá chyba")
			);
		}
	}
};
