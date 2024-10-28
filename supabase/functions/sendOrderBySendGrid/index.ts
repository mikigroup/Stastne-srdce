import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { sendMail, IRequestBody } from "https://deno.land/x/sendgrid/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
	if (req.method === "OPTIONS") {
		return new Response("ok", {
			headers: {
				"Access-Control-Allow-Origin": "*",
				"Access-Control-Allow-Headers":
					"authorization, x-client-info, apikey, content-type,x-my-custom-header"
			}
		});
	}

	if (req.method === "POST") {
		const supabaseClient = createClient(
			"https://orgshebezwfizhmlmeum.supabase.co" ?? "",
			"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9yZ3NoZWJlendmaXpobWxtZXVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NTg2MDMzNjMsImV4cCI6MTk3NDE3OTM2M30.0LA1TPH2v93s10ChjJiX6iTX4LSXMsWOe3MTTxb5_74" ??
				"",
			{
				global: {
					headers: { Authorization: req.headers.get("Authorization")! }
				}
			} // This way your row-level-security (RLS) policies are applied.
		);

		const { data: { user } = {} } = await supabaseClient.auth.getUser();
		const email = user?.email;
		const { cart, txt, orderNumber } = await req.json();
		console.log(
			"sending order",
			// JSON.stringify(user),
			JSON.stringify(cart),
			JSON.stringify(txt),
			JSON.stringify(email),
			JSON.stringify(orderNumber)
		);

		const sum = cart.reduce(
			(acc: any, cartItem: any) => {
				acc.price += cartItem.quantity * cartItem.price;
				acc.quantity += cartItem.quantity;
				return acc;
			},
			{ price: 0, quantity: 0 }
		);

		let mail: IRequestBody = {
			personalizations: [
				{
					subject: "Šťastné srdce - Objednávka " + orderNumber,
					to: email ? [{ email }] : [],
					cc: [{ email: "stastnesrdceKK@seznam.cz" }]
				}
			],
			from: { email: "objednavky@stastnesrdce.cz" },
			content: [
				{
					type: "text/plain",
					value: `Dobrý den, 
              \nděkujeme za objednávku ${orderNumber}.\n\nCelková suma objednávky: ${
								sum.price
							} CZK\nCelkový počet meníček: ${sum.quantity}\n\nSouhrn položek:\n----\n${cart.map(
								(item: any) =>
									`${new Date(item.releaseDate).toLocaleDateString("cs-CZ", {
										month: "long",
										day: "numeric"
									})}\n${item.title}\n${item.description}\n\n${item.quantity} Ks\n----\n`
							)}\nPoznámka:${txt}\n----\nKonec`
				}
			]
		};

		let response = await sendMail(mail, {
			apiKey:
				"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"
		});

		return new Response(
			JSON.stringify({
				done: true
			}),
			{
				headers: {
					"Access-Control-Allow-Origin": "*"
					//'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
				}
			}
		);
	}
	return new Response(undefined, {
		status: 405
	});
});

// nutná instalace supabase cli + při úpravě kódu nutné spustit - supabase functions deploy sendOrder
