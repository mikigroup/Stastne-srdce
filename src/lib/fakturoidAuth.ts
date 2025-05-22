import {
	PRIVATE_FAKTUROID_CLIENT_ID,
	PRIVATE_FAKTUROID_CLIENT_SECRET
} from "$env/static/private";
import { supabase } from "./supabase";
import type { FakturoidToken } from "./types/fakturoid";

let cachedToken: { access_token: string; expires_at: number } | null = null;

export async function getAccessToken() {
	// Debug log
	console.log('Attempting to get access token...');
	
	// Pokud máme platný token v cache, vrátíme ho
	if (cachedToken && cachedToken.expires_at > Date.now()) {
		console.log('Using cached token');
		return cachedToken.access_token;
	}

	try {
		const authString = `${PRIVATE_FAKTUROID_CLIENT_ID}:${PRIVATE_FAKTUROID_CLIENT_SECRET}`;
		const base64Auth = Buffer.from(authString).toString("base64");
		
		console.log('Making request to Fakturoid OAuth endpoint...');
		
		const response = await fetch("https://app.fakturoid.cz/api/v3/oauth/token", {
			method: "POST",
			headers: {
				"Accept": "application/json",
				"Content-Type": "application/x-www-form-urlencoded",
				"Authorization": `Basic ${base64Auth}`,
				"User-Agent": "StastneSrdce (info@stastnesrdce.cz)"
			},
			body: new URLSearchParams({
				grant_type: "client_credentials"
			}).toString()
		});

		if (!response.ok) {
			const errorText = await response.text();
			console.error('Fakturoid API Error:', {
				status: response.status,
				statusText: response.statusText,
				error: errorText
			});
			throw new Error(`Fakturoid API error: ${response.status} - ${errorText}`);
		}

		const data = await response.json() as FakturoidToken;
		console.log('Successfully received access token');

		// Token expiruje za 2 hodiny (7200 sekund)
		cachedToken = {
			access_token: data.access_token,
			expires_at: Date.now() + (data.expires_in * 1000) - 300000 // 5 minut rezerva
		};

		return data.access_token;
	} catch (error) {
		console.error('Error getting Fakturoid access token:', error);
		throw error;
	}
}
