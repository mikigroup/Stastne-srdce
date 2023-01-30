import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { sendMail, IRequestBody } from "https://deno.land/x/sendgrid/mod.ts";


serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers":
          "authorization, x-client-info, apikey, content-type,x-my-custom-header",
      },
    });
  }

  if (req.method === "POST") {
  /* const cart = "CART";
  const user  = "USER"; */

  const { cart, user } = await req.json();

  console.log("sending order", JSON.stringify(user), JSON.stringify(cart));

    let mail: IRequestBody = {
      personalizations: [
        {
          subject: "Objednávka",
          to: [{ name: "Greg Pasquariello", email: "mikigroup@gmail.com" }],
        },
      ],
      from: { email: "mikigroup@gmail.com" },
      content: [
        // { type: "text/plain", value: "Dobrý den, " },
        { type: "text/html", value: "<h1>Dobrý den,</h1>" },
      ],
    };

    let response = await sendMail(mail, {
      apiKey:
        "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",
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
        done: true,
      }),
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          //'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        },
      }
    );
  }
  return new Response(undefined, {
    status: 405,
  });
});

// nutná instalace supabase cli + při úpravě kódu nutné spustit - supabase functions deploy sendOrder
