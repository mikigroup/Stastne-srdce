// nutná instalace supabase cli + při úpravě kódu nutné spustit - supabase functions deploy sendOrder
//https://supabase.com/docs/guides/functions/auth

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { sendMail, IRequestBody } from "https://deno.land/x/sendgrid/mod.ts";

console.log(`Function "select-from-table-with-auth-rls" up and running!`);

serve(async (req: Request) => {
	// This is needed if you're planning to invoke your function from a browser.
	if (req.method === "OPTIONS") {
		return new Response("ok", {
			headers: {
				"Access-Control-Allow-Origin": "*",
				"Access-Control-Allow-Headers":
					"authorization, x-client-info, apikey, content-type"
			}
		});
	}

	if (req.method === "POST") {
		try {
			// Create a Supabase client with the Auth context of the logged in user.
			const supabaseClient = createClient(
				// Supabase API URL - env var exported by default.
				Deno.env.get("https://orgshebezwfizhmlmeum.supabase.co") ?? "",
				// Supabase API ANON KEY - env var exported by default.
				Deno.env.get(
					"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9yZ3NoZWJlendmaXpobWxtZXVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NTg2MDMzNjMsImV4cCI6MTk3NDE3OTM2M30.0LA1TPH2v93s10ChjJiX6iTX4LSXMsWOe3MTTxb5_74"
				) ?? "",
				// Create client with Auth context of the user that called the function.
				// This way your row-level-security (RLS) policies are applied.
				{
					global: {
						headers: { Authorization: req.headers.get("Authorization")! }
					}
				}
			);
			// Now we can get the session or user object
			const {
				data: { user }
			} = await supabaseClient.auth.getUser();
			/* const { user } = await req.json() */ // vymazáno txt, cart

			/* const sum = cart.reduce(
				(acc: any, cartItem: any) => {
					acc.price += cartItem.quantity * cartItem.price
					acc.quantity += cartItem.quantity
					return acc
				},
				{ price: 0, quantity: 0 }
			) */

			// And we can run queries in the context of our authenticated user
			const { data, error } = await supabaseClient.from("users").select("*");
			if (error) throw error;

			let mail: IRequestBody = {
				personalizations: [
					{
						subject: "Šťastné srdce - Objednávka",
						to: [{ email: "mikigroup@gmail.com" }]
					}
				],
				from: { email: "objednavky@stastnesrdce.cz" },
				content: [
					{
						type: "text/plain",
						value: `Dobrý den, 
				`
					}
				]
			};
			// ${txt}
			let response = await sendMail(mail, {
				apiKey:
					"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"
			});

			return new Response(JSON.stringify({ user, data }), {
				headers: { "Content-Type": "application/json" },
				status: 200
			});
		} catch (error) {
			return new Response(JSON.stringify({ error: error.message }), {
				headers: { "Content-Type": "application/json" },
				status: 400
			});
		}
	}
	return new Response(undefined, {
		status: 405
	});
});
