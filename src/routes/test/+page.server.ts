import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { FAKTUROID_CLIENT_ID, FAKTUROID_CLIENT_SECRET, FAKTUROID_ACCOUNT_SLUG } from "$env/static/private";

// Funkce pro získání přístupového tokenu pomocí Client Credentials Flow
async function getAccessToken() {
	const tokenUrl = "https://app.fakturoid.cz/api/v3/oauth/token";

	const response = await fetch(tokenUrl, {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
			"User-Agent": "StastneSrdce App (info@stastnesrdce.cz)"
		},
		body: new URLSearchParams({
			"grant_type": "client_credentials",
			"client_id": FAKTUROID_CLIENT_ID,
			"client_secret": FAKTUROID_CLIENT_SECRET
		})
	});

	if (!response.ok) {
		const errorData = await response.json();
		throw new Error(`Autorizace selhala: ${errorData.error_description || response.statusText}`);
	}

	const data = await response.json();
	return data.access_token;
}

export const load: PageServerLoad = async ({ fetch, url }) => {
	// Získání stránky z URL parametru, výchozí je 1
	const page = parseInt(url.searchParams.get("page") || "1");

	try {
		// Získání přístupového tokenu
		const accessToken = await getAccessToken();

		// Sestavení URL pro Fakturoid API
		const apiUrl = `https://app.fakturoid.cz/api/v3/accounts/${FAKTUROID_ACCOUNT_SLUG}/invoices.json?page=${page}`;

		// Provedení požadavku na Fakturoid API s OAuth 2.0 autorizací
		const response = await fetch(apiUrl, {
			headers: {
				"Authorization": `Bearer ${accessToken}`,
				"User-Agent": "StastneSrdce App (info@stastnesrdce.cz)",
				"Content-Type": "application/json"
			}
		});

		// Kontrola odpovědi
		if (!response.ok) {
			// Zpracování specifických chybových kódů
			if (response.status === 402) {
				throw error(402, "Fakturoid účet je blokován kvůli neuhrazené faktuře.");
			} else if (response.status === 429) {
				throw error(429, "Překročen limit počtu požadavků na Fakturoid API. Zkuste to později.");
			} else {
				const errorData = await response.json();
				throw error(response.status, errorData.error_description || "Chyba při komunikaci s Fakturoid API");
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
			throw error(500, "Neočekávaná chyba při komunikaci s Fakturoid API: " + err.message);
		}
	}
};