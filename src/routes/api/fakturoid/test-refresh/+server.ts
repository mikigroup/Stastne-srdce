import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	const refreshToken = url.searchParams.get('refresh_token');
	if (!refreshToken) {
		return json({ error: 'Chybí refresh_token v query parametru.' }, { status: 400 });
	}

	const { PRIVATE_FAKTUROID_CLIENT_ID, PRIVATE_FAKTUROID_CLIENT_SECRET } = await import('$env/static/private');
	if (!PRIVATE_FAKTUROID_CLIENT_ID || !PRIVATE_FAKTUROID_CLIENT_SECRET) {
		return json({ error: 'Chybí Fakturoid credentials' }, { status: 500 });
	}

	const response = await fetch('https://app.fakturoid.cz/api/v3/oauth/token', {
		method: 'POST',
		headers: {
			'Authorization': `Basic ${Buffer.from(`${PRIVATE_FAKTUROID_CLIENT_ID}:${PRIVATE_FAKTUROID_CLIENT_SECRET}`).toString('base64')}`,
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

	const { PRIVATE_FAKTUROID_CLIENT_ID, PRIVATE_FAKTUROID_CLIENT_SECRET } = await import('$env/static/private');
	if (!PRIVATE_FAKTUROID_CLIENT_ID || !PRIVATE_FAKTUROID_CLIENT_SECRET) {
		return json({ error: 'Chybí Fakturoid credentials' }, { status: 500 });
	}

	const response = await fetch('https://app.fakturoid.cz/api/v3/oauth/token', {
		method: 'POST',
		headers: {
			'Authorization': `Basic ${Buffer.from(`${PRIVATE_FAKTUROID_CLIENT_ID}:${PRIVATE_FAKTUROID_CLIENT_SECRET}`).toString('base64')}`,
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