import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';

// Helper funkce pro získání správných Fakturoid credentials podle prostředí
// Standardní SvelteKit přístup s $env/dynamic/private
function getFakturoidCredentials() {
	// Pro lokální vývoj použijeme dev credentials
	if (env.NODE_ENV === 'development' || env.DEV === 'true') {
		return {
			clientId: env.PRIVATE_FAKTUROID_DEV_CLIENT_ID || '',
			clientSecret: env.PRIVATE_FAKTUROID_DEV_CLIENT_SECRET || ''
		};
	}
	
	// Pro produkci použijeme produkční credentials
	return {
		clientId: env.PRIVATE_FAKTUROID_CLIENT_ID || '',
		clientSecret: env.PRIVATE_FAKTUROID_CLIENT_SECRET || ''
	};
}

export const GET: RequestHandler = async ({ url }) => {
	const refreshToken = url.searchParams.get('refresh_token');
	if (!refreshToken) {
		return json({ error: 'Chybí refresh_token v query parametru.' }, { status: 400 });
	}

	const credentials = getFakturoidCredentials();
	if (!credentials.clientId || !credentials.clientSecret) {
		return json({ error: 'Chybí Fakturoid credentials' }, { status: 500 });
	}

	const response = await fetch('https://app.fakturoid.cz/api/v3/oauth/token', {
		method: 'POST',
		headers: {
			'Authorization': `Basic ${Buffer.from(`${credentials.clientId}:${credentials.clientSecret}`).toString('base64')}`,
			'Content-Type': 'application/x-www-form-urlencoded',
			'Accept': 'application/json',
			'User-Agent': 'StastneSrdce-App (support@stastne-srdce.cz)'
		},
		body: new URLSearchParams({
			grant_type: 'refresh_token',
			refresh_token: refreshToken
		}).toString()
	});

	const text = await response.text();
	return new Response(text, {
		status: response.status,
		headers: { 'Content-Type': 'application/json' }
	});
};

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json();
	const refreshToken = body.refresh_token;
	if (!refreshToken) {
		return json({ error: 'Chybí refresh_token v těle požadavku.' }, { status: 400 });
	}

	const credentials = getFakturoidCredentials();
	if (!credentials.clientId || !credentials.clientSecret) {
		return json({ error: 'Chybí Fakturoid credentials' }, { status: 500 });
	}

	const response = await fetch('https://app.fakturoid.cz/api/v3/oauth/token', {
		method: 'POST',
		headers: {
			'Authorization': `Basic ${Buffer.from(`${credentials.clientId}:${credentials.clientSecret}`).toString('base64')}`,
			'Content-Type': 'application/x-www-form-urlencoded',
			'Accept': 'application/json',
			'User-Agent': 'StastneSrdce-App (support@stastne-srdce.cz)'
		},
		body: new URLSearchParams({
			grant_type: 'refresh_token',
			refresh_token: refreshToken
		}).toString()
	});

	const text = await response.text();
	return new Response(text, {
		status: response.status,
		headers: { 'Content-Type': 'application/json' }
	});
}; 