import { error, redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { supabase, ensureEnvironmentVariables } from "$lib/supabase";
import { getAccessToken } from "$lib/fakturoidAuth";

export const GET: RequestHandler = async ({ url, locals }) => {
	try {
		// Kontrola proměnných prostředí až za běhu
		ensureEnvironmentVariables();
		
		const code = url.searchParams.get("code");
		const state = url.searchParams.get("state");
		const session = await supabase.auth.getUser();
		const customerId = session.data.user?.id;

		if (!code || !state) {
			throw error(400, {
				message: "Missing required OAuth parameters",
			});
		}

		if (!customerId) {
			throw error(401, {
				message: "Unauthorized - User not logged in",
			});
		}

		// Pro Fakturoid používáme client credentials flow, proto nepotřebujeme kód
		// Jednoduše získáme token a uložíme informaci o úspěšném připojení
		await getAccessToken();
		
		// Redirect to admin dashboard with success message
		throw redirect(303, "/admin/settings?status=fakturoid_connected");
	} catch (err) {
		console.error("Fakturoid callback failed:", err);
		
		// Generic error fallback
		throw error(500, {
			message: "Failed to connect Fakturoid account: " + (err instanceof Error ? err.message : String(err)),
		});
	}
};
