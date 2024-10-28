import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { sendMail, IRequestBody } from "https://deno.land/x/sendgrid/mod.ts";

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
		/* const cart = "CART";
  const user  = "USER"; */

		const { data } = await req.json();

		let mail: IRequestBody = {
			personalizations: [
				{
					subject: "Šťastné srdce - Formulář",
					to: [{ email: "stastnesrdcekk@seznam.cz" }]
					// cc: [{ email: "stastnesrdceKK@seznam.cz" }],
				}
			],
			from: { email: "formulak@stastnesrdce.cz" },
			content: [
				{
					type: "text/plain",
					value: `Dobrý den,\nbyla Vám poslána zpráva přes formuláka.\nKontaktní osoba: ${data.name}\nEmail: ${data.email}\nTelefon: ${data.phone}\n\nObsah zprávy:\n${data.message}`
				}
			]
		};

		let response = await sendMail(mail, {
			apiKey:
				"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"
		});

		//stare
		/*  if (req.method === "POST") {
    const mailgun = new Mailgun({
      key: "key-826025acce21b0c8a7aae4b4ae1f75c3",
      region: "eu",
      domain: "stastnesrdce.cz", //zde zmenit na sandbox a melo by slapat
    });

    const { data } = await req.json();

    await mailgun.send({
      to: "stastnesrdcekk@seznam.cz",
      from: "formulak@stastnesrdce.cz",
      text: `Dobrý den,\nbyla Vám poslána zpráva přes formuláka.\nKontaktní osoba: ${data.name}\nEmail: ${data.email}\nTelefon: ${data.phone}\n\nObsah zprávy:\n${data.message}
			`,
      subject: `Šťastné srdce - Zpráva z kontaktního formuláka`,
    }); */

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
