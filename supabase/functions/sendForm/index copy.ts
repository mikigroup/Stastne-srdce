// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.
import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import Mailgun from "https://deno.land/x/mailgun@v1.1.1/index.ts";

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
			region: "eu",
			domain: "stastnesrdce.cz" //zde zmenit na sandbox a melo by slapat
		});

		const { data } = await req.json();

		await mailgun.send({
			to: "stastnesrdcekk@seznam.cz",
			from: "formulak@stastnesrdce.cz",
			text: `Dobrý den,\nbyla Vám poslána zpráva přes formuláka.\nKontaktní osoba: ${data.name}\nEmail: ${data.email}\nTelefon: ${data.phone}\n\nObsah zprávy:\n${data.message}
			`,
			subject: `Šťastné srdce - Zpráva z kontaktního formuláka`
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
