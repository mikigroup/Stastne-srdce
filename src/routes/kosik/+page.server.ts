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
    sendOrder: async ({ request, locals: { supabase, safeGetSession, cartItems } }) => {    
    const { session } = await safeGetSession();
    // const user = locals.user;

    if (!session) {
    throw redirect(303, "/");
  }
  
  const formData = await request.formData();
  const txt = formData.get("txt") as string;
  console.log(txt);

  cartItems = JSON.parse(formData.get('cartItems') as string);
  // console.log(cartItems);

   const { data: profile, error } = await supabase
    .from("profiles")
    .select("first_name, last_name")
    .eq("id", session.user.id)
    .single();

     if (error) {
      throw error;
    }

    const latestOrder = await client.fetch(`*[_type == "order"] | order(_createdAt desc) [0]`);
    const orderNumber = latestOrder ? latestOrder.orderNumber + 1 : 1;    
    const email = session.user.email;
    const fullname = `${profile.first_name} ${profile.last_name}`;    
    // console.log(email)
    console.log(orderNumber)
    // console.log(fullname)
    // console.log(session)

      let totalPrice = 0;
      let totalPieces = 0;
      const order = [];

      for (const obj of cartItems) {
            order.push(obj.title);
            const releaseDate = new Date(obj.releaseDate);
            const formattedDate = `${releaseDate.getDate().toString().padStart(2, "0")}-${(releaseDate.getMonth() + 1).toString().padStart(2, "0")}-${releaseDate.getFullYear()}`;
            order.push(formattedDate);
            order.push(obj.description);
            order.push(obj.quantity);
            totalPrice += obj.price * obj.quantity;
            totalPieces += obj.quantity;
        };
    
    const formatCartItems = (cartItems: any[]) => {
    return cartItems.map((item, index) => {
        return `
        Položka ${index + 1}:
            ${item.title}
            Množství: ${item.quantity}
            Cena: ${item.price}
            Datum:\n ${new Date(item.releaseDate).toLocaleDateString('cs-CZ', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })}
            Popis: ${item.description}
        `;
    }).join('\n');
};

const options = {
    from: "info@stastnesrdce.cz",
    to: email,
    subject: "Šťastné srdce - Objednávka",
    text: `
        Děkujeme za vaši objednávku ${orderNumber} !
        
        Detail:                
${formatCartItems(cartItems)}

        Poznámka: ${txt}     
    `,
};

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

    try {
      await transporter.sendMail(options);
      console.log("E-mail odeslán na adresu:", email);
        return {
                success: true,
                clearCart: true
            };
    } catch (error) {
      console.error("Chyba při odesílání e-mailu:", error);
      return fail(500,  { message: { success: false, display: "Chyba při odesílání e-mailu" } });
    }
  },      
};