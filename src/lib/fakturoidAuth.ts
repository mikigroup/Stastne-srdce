import {
	PRIVATE_FAKTUROID_CLIENT_ID,
	PRIVATE_FAKTUROID_CLIENT_SECRET
} from "$env/static/private";
import { supabase } from "./supabase";
import type { FakturoidToken } from "./types/fakturoid";

let cachedToken: string | null = null;
let tokenExpiry: number | null = null;

export async function getAccessToken(): Promise<string | null> {
	// Debug log
	console.log('Attempting to get access token...');
	
	// Check if we have a cached token that's still valid
	if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
		console.log('Using cached token');
		return cachedToken;
	}
	
	try {
		// Get environment variables
		const clientId = PRIVATE_FAKTUROID_CLIENT_ID;
		const clientSecret = PRIVATE_FAKTUROID_CLIENT_SECRET;
		
		console.log('Making request to Fakturoid OAuth endpoint...');
		
		const response = await fetch('https://app.fakturoid.cz/api/v3/oauth/token', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'User-Agent': 'Stastne-srdce-app (support@stastne-srdce.cz)'
			},
			body: new URLSearchParams({
				grant_type: 'client_credentials',
				client_id: clientId,
				client_secret: clientSecret,
				scope: 'read write'
			})
		});
		
		if (!response.ok) {
			const errorText = await response.text();
			console.error('OAuth request failed:', response.status, errorText);
			return null;
		}
		
		const data = await response.json();
		
		// Cache the token
		cachedToken = data.access_token;
		// Set expiry to 90% of the actual expiry time for safety
		tokenExpiry = Date.now() + (data.expires_in * 1000 * 0.9);
		
		console.log('Successfully received access token');
		return cachedToken;
		
	} catch (error) {
		console.error('Error getting access token:', error);
		return null;
	}
}
