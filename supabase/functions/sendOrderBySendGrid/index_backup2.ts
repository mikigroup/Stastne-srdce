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

		const { cart, user } = await req.json(); //, txt

		// console.log("sending order", JSON.stringify(user), JSON.stringify(cart));

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
					subject: "Šťastné srdce - Objednávka",
					to: [{ email: user.email }],
					cc: [{ email: "stastnesrdceKK@seznam.cz" }]
				}
			],
			from: { email: "objednavky@stastnesrdce.cz" },
			content: [
				{
					type: "text/plain",
					value: `Dobrý den, 
				\nděkujeme za objednávku.\n\nCelková suma objednávky: ${
					sum.price
				} CZK\nCelkový počet meníček: ${
					sum.quantity
				}\n\nSouhrn položek:\n----\n${cart.map(
					(item: any) =>
						`${new Date(item.releaseDate).toLocaleDateString("cs-CZ", {
							month: "long",
							day: "numeric"
						})}\n${item.title}\n${item.description}\n\n${
							item.quantity
						} Ks\n----\n`
				)}\nKonec`
				}
			]
		};
		//Poznámka:${txt}\n----\n
		let response = await sendMail(mail, {
			apiKey:
				"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"
		});

		/* await sendSimpleMail(
    {
      subject: "Hello world",
      to: [{ email: "mikigroup@gmail.com" }],
      from: { email: "mikigroup@gmail.com" },
      content: [
        { type: "text/plain", value: "Hello world" },
        { type: "text/html", value: "<h1>Hello world</h1>" },
      ],
    },
    {
      apiKey:
        "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",
    }
  ); */

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
