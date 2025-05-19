import { error, redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { supabase } from "$lib/supabaseClient";
import { handleCallback } from "$lib/fakturoidAuth";
import type { TypedSupabaseClient } from "$lib/types/supabase";

export const GET: RequestHandler = async ({ url, locals }) => {
	const code = url.searchParams.get("code");
	const state = url.searchParams.get("state");
	const session = await supabase.auth.getSession();
	const customerId = session.data.session?.user?.id;

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

	try {
		await handleCallback(supabase as TypedSupabaseClient, code, state);

		// Redirect to admin dashboard with success message
		throw redirect(303, "/admin/settings?status=fakturoid_connected");
	} catch (err) {
		console.error("Fakturoid callback failed:", err);
		
		// Handle specific error cases
		if (err instanceof Error) {
			if (err.message.includes("Invalid or expired state")) {
				throw error(400, {
					message: "Invalid or expired authentication state",
				});
			}
			if (err.message.includes("Token exchange failed")) {
				throw error(400, {
					message: "Failed to exchange authorization code for access token",
				});
			}
		}

		// Generic error fallback
		throw error(500, {
			message: "Failed to connect Fakturoid account",
		});
	}
};
