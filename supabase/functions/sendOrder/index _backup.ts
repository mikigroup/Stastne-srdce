import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import Mailgun from "https://deno.land/x/mailgun@v1.1.0/index.ts";

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
		const mailgun = new Mailgun({
			key: "key-826025acce21b0c8a7aae4b4ae1f75c3",
			domain: "sandbox685719843ca14f44a3e8c30b814e3639.mailgun.org"
		});

		const { cart, user } = await req.json();

		await mailgun.send({
			to: user.user_metadata.email,
			/* cc: user.user_metadata.email, */
			from: "mikigroup@gmail.com",
			text: `Dobrý den, ${user.user_metadata.full_name},\npoložky v objednávce:\n${cart.title}\n ${cart.map((item: any) => `${item.description} \ns počtem kusů: ${item.quantity}\n`)}`,
			subject: "Objednávka stravníka"
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

// nutná isntalace supabase cli + při úpravě kódu nutné spustit - supabase functions deploy sendOrder
