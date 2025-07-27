import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';

export const GET: RequestHandler = async ({ locals: { supabase, safeGetSession } }) => {
	const { session } = await safeGetSession();
	
	if (!session) {
		return json({ error: 'Nepřihlášený uživatel' }, { status: 401 });
	}

	try {
		console.log('🧪 Testing Fakturoid credentials...');

		// Helper funkce pro získání správných Fakturoid credentials podle prostředí
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

		const credentials = getFakturoidCredentials();
		
		console.log('🔧 Environment:', env.NODE_ENV);
		console.log('🔧 DEV flag:', env.DEV);
		console.log('🔧 Client ID length:', credentials.clientId?.length || 0);
		console.log('🔧 Client Secret length:', credentials.clientSecret?.length || 0);

		if (!credentials.clientId || !credentials.clientSecret) {
			return json({ 
				error: 'Chybí Fakturoid credentials',
				success: false,
				environment: env.NODE_ENV,
				devFlag: env.DEV
			}, { status: 500 });
		}

		// Zkusíme jednoduchý test na Fakturoid API
		const testResponse = await fetch('https://app.fakturoid.cz/api/v3/user.json', {
			headers: {
				'Authorization': `Basic ${Buffer.from(`${credentials.clientId}:${credentials.clientSecret}`).toString('base64')}`,
				'User-Agent': 'StastneSrdce-App (support@stastne-srdce.cz)',
				'Content-Type': 'application/json'
			}
		});

		console.log('📡 Test response status:', testResponse.status);

		if (testResponse.ok) {
			const userData = await testResponse.json();
			return json({
				success: true,
				message: 'Credentials jsou platné',
				environment: env.NODE_ENV,
				devFlag: env.DEV,
				userEmail: userData.email,
				userName: userData.name,
				accountsCount: userData.accounts?.length || 0
			});
		} else {
			const errorText = await testResponse.text();
			return json({
				success: false,
				error: `Credentials nejsou platné: ${testResponse.status}`,
				details: errorText,
				environment: env.NODE_ENV,
				devFlag: env.DEV
			}, { status: 400 });
		}

	} catch (error) {
		console.error('❌ Error testing credentials:', error);
		return json({ 
			error: `Chyba při testování credentials: ${error instanceof Error ? error.message : 'Unknown error'}`,
			success: false,
			environment: env.NODE_ENV,
			devFlag: env.DEV
		}, { status: 500 });
	}
}; 