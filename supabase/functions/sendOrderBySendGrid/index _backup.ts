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
			domain: "stastnesrdce.cz"
		});

		const { cart, user } = await req.json();

		console.log("sending order", JSON.stringify(user), JSON.stringify(cart));

		const sum = cart.reduce(
			(acc: any, cartItem: any) => {
				acc.price += cartItem.quantity * cartItem.price;
				acc.quantity += cartItem.quantity;
				return acc;
			},
			{ price: 0, quantity: 0 }
		);

		const mailResponse = await mailgun.send({
			to: user.email,
			cc: "stastnesrdceKK@seznam.cz",
			/* bcc: "mikigroup@gmail.com", */
			from: "objednavky@stastnesrdce.cz",
			text: `Dobrý den, 
				\nděkujeme za objednávku.\n\nCelková suma objednávky: ${
					sum.price
				} CZK\nCelkový počet meníček: ${
					sum.quantity
				}\n\nSouhrn položek:\n----\n${cart.map(
					(item: any) =>
						`${new Date(item.releaseDate).toLocaleDateString("cs-CZ", {
							month: "long",
							day: "numeric"
						})}\n ${item.title}\n ${item.description} \n\n${
							item.quantity
						} Ks\n----\n`
				)}Konec`,
			subject: `Šťastné srdce - Objednávka`
		});

		/* await mailgun.send({
			to: user.user_metadata.email,
			cc: 'stastnesrdceKK@seznam.cz',
			bcc:'mikigroup@gmail.com',
			from: 'objednavky@stastnesrdce.cz',
			text: `Dobrý den, ${
				user.user_metadata.full_name
			},\nděkujeme za objednávku.\n\nCelková suma objednávky: ${
				sum.price
			} CZK\nCelkový počet meníček: ${sum.quantity}\n\nSouhrn položek:\n----\n${cart.map(
				(item: any) =>
					`${new Date(item.releaseDate).toLocaleDateString('cs-CZ', {
						month: 'long',
						day: 'numeric'
					})}\n ${item.title}\n ${item.description} \n\n${item.quantity} Ks\n----\n`
			)}Konec`,
			subject: `Šťastné srdce - Objednávka ${user.user_metadata.full_name}`
		}); */

		console.log("mailResponse", mailResponse);
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
