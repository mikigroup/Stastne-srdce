import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from "./$types";
import client from '$lib/sanityClient';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  // nastavení pro nodemailer
});

export const actions: Actions = {
  sendOrder: async ({ request, locals: { supabase, safeGetSession } }) => {
    const { session } = await safeGetSession();

    if (!session) {
      throw redirect(303, "/");
    }

    const formData = await request.formData();
    const note = formData.get("note") as string;
    const cartItems = JSON.parse(formData.get('cartItems') as string);

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("first_name, last_name")
      .eq("id", session.user.id)
      .single();

    if (error) {
      throw fail(500, { message: { success: false, display: "Chyba při získávání profilu uživatele" } });
    }

    const latestOrder = await client.fetch(`*[_type == "order"] | order(_createdAt desc) [0]`);
    const orderNumber = latestOrder ? latestOrder.orderNumber + 1 : 1;
    const email = session.user.email;
    const fullname = `${profile.first_name} ${profile.last_name}`;

    let totalPrice = 0;
    let totalPieces = 0;

    const itemsOrder = cartItems.map((item: any) => ({
      title: item.title,
      description: item.description,
      price: item.price,
      quantity: item.quantity,
      releaseDate: item.releaseDate
    }));

    cartItems.forEach((item: any) => {
      totalPrice += item.price * item.quantity;
      totalPieces += item.quantity;
    });

    const doc = {
      _type: 'order',
      itemsOrder,
      note,
      timestamp: new Date().toISOString(),
      customer: fullname,
      totalPrice,
      totalPieces,
      email,
      orderNumber
    };

    const res = await client.create(doc);
    console.log(`Objednávka byla vytvořena, document ID je ${res._id}`);

    const options = {
      from: "info@stastnesrdce.cz",
      to: email,
      subject: "Šťastné srdce - Objednávka",
      text: `
        Děkujeme za vaši objednávku ${orderNumber}!
        
        Detail:
        ${cartItems.map((item: any, index: number) => `
          Položka ${index + 1}:
            ${item.title}
            Množství: ${item.quantity}
            Cena: ${item.price}
            Datum: ${new Date(item.releaseDate).toLocaleDateString('cs-CZ', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })}
            Popis: ${item.description}
        `).join('\n')}
        
        Poznámka: ${note}
      `
    };

    try {
      await transporter.sendMail(options);
      console.log("E-mail odeslán na adresu:", email);
      return {
        success: true,
        clearCart: true,
        redirect: "/thankyou"
      };
    } catch (error) {
      console.error("Chyba při odesílání e-mailu:", error);
      return fail(500, { message: { success: false, display: "Chyba při odesílání e-mailu" } });
    }
  },
};