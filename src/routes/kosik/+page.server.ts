import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from "./$types";
import client from '$lib/sanityClient';
import nodemailer from 'nodemailer';


const transporter = nodemailer.createTransport({
			host: "smtp.seznam.cz",
			port: 465,
			secure: true,
			auth: {
				user: "info@stastnesrdce.cz",
				pass: "#QFUtwxDsQW5LEDT"
			}
		});

export const actions: Actions = {
  sendOrder: async ({ locals: { supabase, safeGetSession }  }) => {    
    const { session } = await safeGetSession();
    // const user = locals.user;

    if (!session) {
    throw redirect(303, "/");
  }

   const { data: profile, error } = await supabase
    .from("profiles")
    .select("first_name, last_name")
    .eq("id", session.user.id)
    .single();

    const latestOrder = await client.fetch(`*[_type == "order"] | order(_createdAt desc) [0]`);
    const orderNumber = latestOrder ? latestOrder.orderNumber + 1 : 1;


    /* const fullname = `${data.first_name} ${data.last_name}`; */
    const email = session.user.email;

    console.log(email)
    console.log(orderNumber)
 /*    const doc = {
      _type: 'order',
      itemsOrder: locals.cartItems,
      note: txt,
      timestamp: new Date().toISOString(),
      customer: fullname,
      totalPrice: locals.totalPrice,
      totalPieces: locals.totalPieces,
      email: email,
      orderNumber: orderNumber
    };

    const res = await client.create(doc);
    console.log(`Objednávka byla vytvořena, document ID je ${res._id}`);

    await transporter.sendMail({
      from: 'your-email@example.com',
      to: email,
      subject: `Objednávka č. ${orderNumber}`,
      text: `
        Děkujeme za vaši objednávku!
        
        Detaily objednávky:
        Košík: ${JSON.stringify(locals.cartItems)}
        Poznámka: ${txt}
        Číslo objednávky: ${orderNumber}
      `
    }); */

    return { success: true };
  }
};