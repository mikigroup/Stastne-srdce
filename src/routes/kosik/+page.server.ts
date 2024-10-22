import { error, redirect } from "@sveltejs/kit";
import type { Actions } from "./$types";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
	host: "smtp.seznam.cz",
	port: 465,
	secure: true,
	auth: {
		user: "info@stastnesrdce.cz",
		pass: "Z95%VQtCFAh8ajxt*ycX"
	}
});

interface MenuVariant {
	id: string;
	variant_number: string;
	description: string;
	price: number;
	quantity: number;
}

interface CartItem {
	id: string;
	date: string;
	soup: string;
	variants: MenuVariant[];
}

export const actions: Actions = {
	sendOrder: async ({ request, locals: { supabase, safeGetSession } }) => {
		const session = await safeGetSession();
		if (!session) {
			throw redirect(303, "/login");
		}

		const email = session?.user?.email;
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

		// Výpočet celkové ceny a kusů
		let totalPrice = 0;
		let totalPieces = 0;

		const items = cartItems.map((item: CartItem) => {
			const itemTotalPieces = item.variants.reduce(
				(sum, variant) => sum + variant.quantity,
				0
			);
			const itemTotalPrice = item.variants.reduce(
				(sum, variant) => sum + variant.price * variant.quantity,
				0
			);

			totalPrice += itemTotalPrice;
			totalPieces += itemTotalPieces;

			return {
				...item,
				totalPieces: itemTotalPieces,
				totalPrice: itemTotalPrice
			};
		});

		try {
			console.log("Začátek procesu vytváření objednávky");

			// Získání údajů zákazníka
			const { data: customer, error: customerError } = await supabase
				.from("profiles")
				.select(
					"first_name, last_name, street, street_number, city, zip_code, telephone"
				)
				.eq("id", session?.user?.id)
				.single();

			if (customerError) {
				console.error("Chyba při získávání údajů zákazníka:", customerError);
				throw customerError;
			}

			console.log("Získány údaje zákazníka:", customer);

			// Vytvoření objednávky
			const orderData = {
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString(),
				state: "Nová",
				date: new Date().toISOString(),
				customer_first_name: customer.first_name,
				customer_last_name: customer.last_name,
				customer_street: customer.street,
				customer_street_number: customer.street_number,
				customer_city: customer.city,
				customer_zip_code: customer.zip_code,
				customer_telephone: customer.telephone,
				customer_email: email,
				user_id: session?.user?.id,
				note,
				total_pieces: totalPieces,
				total_price: totalPrice,
				currency: "CZK",
				pay_state: false,
				pay_method: "Hotově",
				shipping_method: "Rozvoz"
			};

			console.log("Pokus o vytvoření objednávky s daty:", orderData);

			const { data: insertedOrder, error: insertError } = await supabase
				.from("orders")
				.insert(orderData)
				.select("*")
				.single();

			if (insertError) {
				console.error("Chyba při vytváření objednávky:", insertError);
				throw insertError;
			}

			if (!insertedOrder) {
				console.error("Objednávka byla vytvořena, ale nebyla vrácena data");
				throw new Error("Objednávka nebyla vytvořena");
			}

			console.log("Úspěšně vytvořena objednávka:", insertedOrder);

			// Vytvoření položek objednávky
			const orderItems = cartItems.flatMap((item) =>
				item.variants.map((variant) => ({
					order_id: insertedOrder.id,
					variant_id: variant.id,
					price: variant.price,
					quantity: variant.quantity,
					created_at: new Date().toISOString(),
					updated_at: new Date().toISOString()
				}))
			);

			console.log("Pokus o vytvoření položek objednávky:", orderItems);

			const { error: itemsError } = await supabase
				.from("order_items")
				.insert(orderItems);

			if (itemsError) {
				console.error("Chyba při vytváření položek objednávky:", itemsError);
				throw itemsError;
			}

			console.log("Úspěšně vytvořeny položky objednávky");

			// Odeslání emailu
			await sendOrderConfirmationEmail(
				email,
				insertedOrder.order_number.toString(),
				cartItems,
				totalPrice,
				totalPieces,
				note
			);

			console.log("Proces vytvoření objednávky dokončen");

			return {
				success: true,
				message: "Objednávka byla úspěšně vytvořena.",
				orderId: insertedOrder.order_number
			};
		} catch (error) {
			console.error("Chyba při vytváření objednávky:", error);
			return {
				success: false,
				message: "Při vytváření objednávky došlo k chybě.",
				error: error instanceof Error ? error.message : "Neznámá chyba"
			};
		}
	}
};

// Definice funkce odesílání
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
<!DOCTYPE html>
<html lang="cs">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            text-align: center;
            padding: 20px;
            background-color: #4A5568;
            color: white;
            border-radius: 8px 8px 0 0;
        }
        .content {
            padding: 20px;
            background-color: #ffffff;
            border: 1px solid #e2e8f0;
        }
        .order-item {
            background-color: #f8fafc;
            padding: 15px;
            margin: 10px 0;
            border-radius: 4px;
        }
        .variant {
            padding-left: 20px;
            border-left: 3px solid #4A5568;
            margin: 10px 0;
        }
        .total {
            background-color: #4A5568;
            color: white;
            padding: 15px;
            margin-top: 20px;
            border-radius: 4px;
        }
        .note {
            background-color: #FEF3C7;
            padding: 15px;
            margin-top: 20px;
            border-radius: 4px;
        }
        .footer {
            text-align: center;
            padding: 20px;
            color: #666666;
            font-size: 0.9em;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Potvrzení objednávky #${orderId}</h1>
    </div>
    
    <div class="content">
        <p>Vážený zákazníku,</p>
        <p>děkujeme za Vaši objednávku. Níže najdete detaily své objednávky:</p>
        
        ${items
					.map(
						(item) => `
            <div class="order-item">
                <h3>📅 ${new Date(item.date).toLocaleDateString("cs-CZ", {
									weekday: "long",
									year: "numeric",
									month: "long",
									day: "numeric"
								})}</h3>
                <p>🥣 <strong>Polévka:</strong> ${item.soup}</p>
                ${item.variants
									.map(
										(variant) => `
                    <div class="variant">
                        <p><strong>${variant.variant_number}.</strong> ${variant.description}</p>
                        <p>Množství: ${variant.quantity} ks</p>
                        <p>Cena: ${variant.price * variant.quantity} Kč</p>
                    </div>
                `
									)
									.join("")}
            </div>
        `
					)
					.join("")}

        <div class="total">
            <p><strong>Celkový počet kusů:</strong> ${totalPieces}</p>
            <p><strong>Celková cena:</strong> ${totalPrice} Kč</p>
        </div>

        ${
					note
						? `
            <div class="note">
                <p><strong>Poznámka k objednávce:</strong></p>
                <p>${note}</p>
            </div>
        `
						: ""
				}
    </div>

    <div class="footer">
        <p>Šťastné srdce<br>
        info@stastnesrdce.cz<br>
        www.stastnesrdce.cz</p>
        <p>Děkujeme za Vaši důvěru!</p>
    </div>
</body>
</html>
    `
	};

	try {
		await transporter.sendMail(mailOptions);
		console.log("E-mail s potvrzením objednávky byl odeslán");
	} catch (error) {
		console.error("Chyba při odesílání e-mailu:", error);
	}
}
