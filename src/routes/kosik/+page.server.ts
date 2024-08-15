import { error, redirect } from "@sveltejs/kit";
import type { Actions } from "./$types";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
	host: "smtp.seznam.cz",
	port: 465,
	secure: true,
	auth: {
		user: "info@stastnesrdce.cz",
		pass: "#QFUtwxDsQW5LEDT"
	}
});

interface CartItem {
	id: string;
	date: string;
	soup: string;
	price: number;
	active: boolean;
	notes: string;
	type: string;
	nutri: string;
	alergens: any;
	variants: {
		variantId: string;
		quantity: number;
		value: string;
	}[];
}

export const actions: Actions = {
	sendOrder: async ({ request, locals: { supabase, safeGetSession } }) => {
		const session = await safeGetSession();
		if (!session) {
			throw redirect(303, "/login");
		}

		const email = session.user.email;
		if (!email) {
			throw error(400, "Email uživatele není k dispozici");
		}

		const formData = await request.formData();
		const note = formData.get("note") as string;
		const cartItems = JSON.parse(
			formData.get("cartItems") as string
		) as CartItem[];

		if (cartItems.length === 0) {
			return {
				success: false,
				message: "Košík je prázdný. Nelze vytvořit objednávku."
			};
		}

		let totalPrice = 0;
		let totalPieces = 0;

		const items = cartItems.map((item: CartItem) => {
			const itemTotalPieces = item.variants.reduce(
				(sum, variant) => sum + variant.quantity,
				0
			);
			const itemTotalPrice = item.price * itemTotalPieces;

			totalPrice += itemTotalPrice;
			totalPieces += itemTotalPieces;

			return {
				...item,
				totalPieces: itemTotalPieces,
				totalPrice: itemTotalPrice
			};
		});

		const orderData = {
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
			state: "new",
			date: new Date().toISOString(),
			customer_email: email,
			user_id: session.user.id,
			note,
			total_pieces: totalPieces,
			total_price: totalPrice
		};

		try {
			const { data: order, error: orderError } = await supabase
				.from("orders")
				.insert(orderData)
				.select()
				.single();

			if (orderError) throw orderError;

			// Vložení položek objednávky
			const orderItems = cartItems.flatMap((item) =>
				item.variants.map((variant) => ({
					order_id: order.id,
					menu_id: item.id,
					variant_id: variant.variantId,
					price: item.price,
					quantity: variant.quantity
				}))
			);

			const { error: itemsError } = await supabase
				.from("order_items")
				.insert(orderItems);

			if (itemsError) throw itemsError;

			await sendOrderConfirmationEmail(
				email,
				order.id,
				cartItems,
				totalPrice,
				totalPieces,
				note
			);

			return {
				success: true,
				message: "Objednávka byla úspěšně vytvořena.",
				orderId: order.id
			};
		} catch (error) {
			console.error("Chyba při vytváření objednávky:", error);
			return {
				success: false,
				message: "Při vytváření objednávky došlo k chybě."
			};
		}
	}
};

async function sendOrderConfirmationEmail(
	email: string,
	orderId: string,
	items: CartItem[],
	totalPrice: number,
	totalPieces: number,
	note: string
) {
	const mailOptions = {
		from: '"Šťastné srdce" <info@stastnesrdce.cz>',
		to: email,
		subject: `Šťastné srdce - Potvrzení objednávky`,
		html: `
      <h1>Potvrzení objednávky #${orderId}</h1>
      <p>Děkujeme za Vaši objednávku. Zde jsou detaily:</p>
      <ul>
        ${items
					.map(
						(item) => `
          <li>
            Datum: ${item.date}<br>
            Polévka: ${item.soup}<br>
            ${item.variants
							.map(
								(v) => `
              Varianta: ${v.value} - Množství: ${v.quantity} - Cena: ${item.price * v.quantity} Kč
            `
							)
							.join("<br>")}
          </li>
        `
					)
					.join("")}
      </ul>
      <p>Celkový počet kusů: ${totalPieces}</p>
      <p>Celková cena: ${totalPrice} Kč</p>
      ${note ? `<p>Poznámka: ${note}</p>` : ""}
    `
	};

	try {
		await transporter.sendMail(mailOptions);
		console.log("E-mail s potvrzením objednávky byl odeslán");
	} catch (error) {
		console.error("Chyba při odesílání e-mailu:", error);
	}
}
