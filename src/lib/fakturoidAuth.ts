import {
	FAKTUROID_CLIENT_ID,
	FAKTUROID_CLIENT_SECRET,
	FAKTUROID_REDIRECT_URI
} from "$env/static/private";
import { writable, type Writable } from "svelte/store";
import type { SupabaseClient } from "@supabase/supabase-js";

interface FakturoidToken {
	access_token: string;
	refresh_token: string;
	expires_at: number;
	customer_id: string;
}

interface FakturoidAuthState {
	state: string;
	customer_id: string;
	expires_at: Date;
}

// Store pro ukládání tokenů v paměti
const tokenStore: Writable<Record<string, FakturoidToken>> = writable({});

export async function initializeFakturoid(
	supabase: SupabaseClient,
	customerId: string
) {
	// Načtení tokenů z Supabase do store
	const { data, error } = await supabase
		.from("fakturoid_tokens")
		.select("*")
		.eq("customer_id", customerId)
		.single();

	if (!error && data) {
		tokenStore.update((tokens) => ({
			...tokens,
			[customerId]: {
				access_token: data.access_token,
				refresh_token: data.refresh_token,
				expires_at: new Date(data.expires_at).getTime(),
				customer_id: customerId
			}
		}));
	}
}

export async function getAuthUrl(
	supabase: SupabaseClient,
	customerId: string
): Promise<string> {
	const state = crypto.randomUUID();
	const expiresAt = new Date(Date.now() + 3600000); // 1 hodina platnost

	// Uložení state do Supabase
	const { error } = await supabase.from("fakturoid_auth_states").upsert({
		state,
		customer_id: customerId,
		expires_at: expiresAt.toISOString()
	});

	if (error) throw new Error("Failed to save auth state");

	return `https://app.fakturoid.cz/oauth/authorize?client_id=${FAKTUROID_CLIENT_ID}&redirect_uri=${encodeURIComponent(FAKTUROID_REDIRECT_URI)}&response_type=code&state=${state}`;
}

export async function handleCallback(
	supabase: SupabaseClient,
	code: string,
	state: string
): Promise<FakturoidToken> {
	// Ověření state
	const { data: stateData, error: stateError } = await supabase
		.from("fakturoid_auth_states")
		.select("customer_id")
		.eq("state", state)
		.gt("expires_at", new Date().toISOString())
		.single();

	if (stateError || !stateData) throw new Error("Invalid or expired state");

	// Získání tokenu
	const tokenResponse = await fetch("https://app.fakturoid.cz/oauth/token", {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded"
		},
		body: new URLSearchParams({
			client_id: FAKTUROID_CLIENT_ID,
			client_secret: FAKTUROID_CLIENT_SECRET,
			code,
			redirect_uri: FAKTUROID_REDIRECT_URI,
			grant_type: "authorization_code"
		})
	});

	if (!tokenResponse.ok) throw new Error("Token exchange failed");

	const tokenData = await tokenResponse.json();
	const expiresAt = Date.now() + tokenData.expires_in * 1000;

	// Uložení tokenu do Supabase
	const { error: upsertError } = await supabase
		.from("fakturoid_tokens")
		.upsert({
			customer_id: stateData.customer_id,
			access_token: tokenData.access_token,
			refresh_token: tokenData.refresh_token,
			expires_at: new Date(expiresAt).toISOString()
		});

	if (upsertError) throw new Error("Failed to save token");

	// Aktualizace store
	const token: FakturoidToken = {
		access_token: tokenData.access_token,
		refresh_token: tokenData.refresh_token,
		expires_at: expiresAt,
		customer_id: stateData.customer_id
	};

	tokenStore.update((tokens) => ({
		...tokens,
		[stateData.customer_id]: token
	}));

	return token;
}

export async function getAccessToken(
	supabase: SupabaseClient,
	customerId: string
): Promise<string> {
	let token: FakturoidToken | undefined;

	// Získání tokenu z store
	const unsubscribe = tokenStore.subscribe((tokens) => {
		token = tokens[customerId];
	});
	unsubscribe();

	// Pokud máme platný token, vrátíme ho
	if (token && token.expires_at > Date.now()) {
		return token.access_token;
	}

	// Pokud token expiroval, obnovíme ho
	if (token?.refresh_token) {
		try {
			const refreshedToken = await refreshToken(
				supabase,
				token.refresh_token,
				customerId
			);
			return refreshedToken.access_token;
		} catch (error) {
			console.error("Token refresh failed:", error);
		}
	}

	throw new Error("No valid token available");
}

async function refreshToken(
	supabase: SupabaseClient,
	refreshToken: string,
	customerId: string
): Promise<FakturoidToken> {
	const response = await fetch("https://app.fakturoid.cz/oauth/token", {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded"
		},
		body: new URLSearchParams({
			client_id: FAKTUROID_CLIENT_ID,
			client_secret: FAKTUROID_CLIENT_SECRET,
			refresh_token: refreshToken,
			grant_type: "refresh_token"
		})
	});

	if (!response.ok) throw new Error("Refresh token failed");

	const tokenData = await response.json();
	const expiresAt = Date.now() + tokenData.expires_in * 1000;

	// Uložení nového tokenu
	const { error } = await supabase.from("fakturoid_tokens").upsert({
		customer_id: customerId,
		access_token: tokenData.access_token,
		refresh_token: tokenData.refresh_token,
		expires_at: new Date(expiresAt).toISOString()
	});

	if (error) throw new Error("Failed to save refreshed token");

	// Aktualizace store
	const token: FakturoidToken = {
		access_token: tokenData.access_token,
		refresh_token: tokenData.refresh_token,
		expires_at: expiresAt,
		customer_id: customerId
	};

	tokenStore.update((tokens) => ({
		...tokens,
		[customerId]: token
	}));

	return token;
}

export async function disconnectFakturoid(
	supabase: SupabaseClient,
	customerId: string
): Promise<void> {
	// Smazání tokenu z Supabase
	const { error } = await supabase
		.from("fakturoid_tokens")
		.delete()
		.eq("customer_id", customerId);

	if (error) throw new Error("Failed to disconnect");

	// Aktualizace store
	tokenStore.update((tokens) => {
		const newTokens = { ...tokens };
		delete newTokens[customerId];
		return newTokens;
	});
}

// Pomocná funkce pro získání aktuálního stavu
export function getTokenStatus(customerId: string): {
	connected: boolean;
	expiresSoon: boolean;
} {
	let token: FakturoidToken | undefined;

	const unsubscribe = tokenStore.subscribe((tokens) => {
		token = tokens[customerId];
	});
	unsubscribe();

	if (!token) return { connected: false, expiresSoon: false };

	return {
		connected: true,
		expiresSoon: token.expires_at < Date.now() + 86400000 // 24 hodin
	};
}
