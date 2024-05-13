/* import client from "../../lib/sanityClient"

export async function load() {
	try {		
	const data = await client.fetch("*[_type == "order"] | order(_createdAt desc) [0]")
	console.log(data);
		if (data) {			
			return {
				orders: data
				
			}
		}
		throw new Error("No order data found.")
	} catch (error) {
		console.error("Error:", error.message)
		return {
			status: 500,
			body: new Error("Internal Server Error")
		}
	}
}
 */

// import { redirect } from "@sveltejs/kit";

// /** @type {import("./$types").LayoutServerLoad} */

/*
export function load({ locals }) {
	if (!locals.user) {
		redirect(307, "/login");
	}
} */

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


  /*   export const actions = {
  default: async ({ request, locals }) => {
    const formData = await request.formData();
    const inputValue = formData.get("inputValue");
    console.log("Vstupní hodnota:", inputValue);

    locals.inputValue = inputValue;

    return {
      status: 200,
      body: {
        success: true
      }
    };
  }
}; */

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


    const fullname = `${data.first_name} ${data.last_name}`;
    const email = session.user.email;

    const doc = {
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