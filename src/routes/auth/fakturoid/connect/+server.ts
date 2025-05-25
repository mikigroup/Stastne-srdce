import { redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { getAccessToken } from "$lib/fakturoidAuth";

export const GET: RequestHandler = async ({ locals: { supabase, safeGetSession } }) => {
	console.log('=== FAKTUROID OAUTH CONNECT START ===');
	
	const { session } = await safeGetSession();
	if (!session) {
		console.log('No session found, redirecting to login');
		throw redirect(303, "/login");
	}
	
	console.log('User ID:', session.user.id);

	// Pro Client Credentials flow nepotřebujeme redirect na Fakturoid
	// Rovnou se pokusíme získat token a ověřit připojení
	console.log('Getting access token...');
	let accessToken;
	try {
		accessToken = await getAccessToken();
	} catch (error) {
		console.error('Failed to get access token:', error);
		throw redirect(303, "/admin/site-setting?error=oauth_failed");
	}
	
	console.log('Access token result:', accessToken ? 'SUCCESS' : 'FAILED');
	
	if (!accessToken) {
		console.log('Failed to get access token');
		throw redirect(303, "/admin/site-setting?error=oauth_failed");
	}

	// Test připojení
	console.log('Testing API connection...');
	let userData;
	try {
		const response = await fetch('https://app.fakturoid.cz/api/v3/user.json', {
			headers: {
				'Authorization': `Bearer ${accessToken}`,
				'User-Agent': 'Stastne-srdce-app (support@stastne-srdce.cz)',
				'Content-Type': 'application/json'
			}
		});

		console.log('API response status:', response.status);
		
		if (!response.ok) {
			const errorText = await response.text();
			console.log('API error response:', errorText);
			throw redirect(303, "/admin/site-setting?error=oauth_test_failed");
		}

		userData = await response.json();
		console.log('User data received:', userData.email);
	} catch (error) {
		if (error && typeof error === 'object' && 'status' in error && 'location' in error) {
			throw error; // Re-throw redirect
		}
		console.error('API connection failed:', error);
		throw redirect(303, "/admin/site-setting?error=oauth_test_failed");
	}

	// Zpracování a uložení nastavení
	try {
		// Nejprve načteme existující integrations nastavení
		console.log('Fetching existing settings...');
		const { data: existingSettings, error: fetchError } = await supabase
			.from('site_settings')
			.select('value')
			.eq('key', 'integrations')
			.maybeSingle();

		if (fetchError) {
			console.error('Error fetching existing settings:', fetchError);
		}

		// Sloučíme existující nastavení s novými Fakturoid údaji
		let integrationsData = {};
		if (existingSettings?.value) {
			try {
				integrationsData = typeof existingSettings.value === 'string' 
					? JSON.parse(existingSettings.value) 
					: existingSettings.value;
			} catch (e) {
				console.error('Error parsing existing integrations:', e);
			}
		}

		// Aktualizujeme pouze Fakturoid části
		const updatedIntegrations = {
			...integrationsData,
			fakturoidEnabled: true,
			fakturoidConnected: true,
			fakturoidAccountName: userData.email || userData.name || 'Připojeno'
		};

		console.log('Updating settings in database...');
		// Uložíme aktualizovaná nastavení
		const { error: updateError } = await supabase
			.from('site_settings')
			.upsert({
				key: 'integrations',
				value: JSON.stringify(updatedIntegrations),
				updated_at: new Date().toISOString(),
				updated_by: session.user.id,
				user_id: session.user.id
			}, {
				onConflict: 'key'
			});

		if (updateError) {
			console.error('Error updating settings:', updateError);
			throw redirect(303, "/admin/site-setting?error=oauth_save_failed");
		}

		console.log('OAuth connect successful, redirecting...');
		// Přesměrovat zpět na nastavení se success zprávou
		throw redirect(303, "/admin/site-setting?success=fakturoid_connected");

	} catch (error) {
		// Re-throw redirects
		if (error && typeof error === 'object' && 'status' in error && 'location' in error) {
			throw error;
		}
		
		// Loguj pouze skutečné chyby
		console.error("Database save error:", {
			error: error instanceof Error ? error.message : String(error),
			stack: error instanceof Error ? error.stack : undefined,
			userId: session?.user?.id,
			timestamp: new Date().toISOString()
		});
		throw redirect(303, "/admin/site-setting?error=oauth_save_failed");
	}
}; 