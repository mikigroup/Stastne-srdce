import { error, redirect } from "@sveltejs/kit";
import type { Actions } from "./$types";
import nodemailer from "nodemailer";
import { PRIVATE_seznam_key } from "$env/static/private";

const transporter = nodemailer.createTransport({
	host: "smtp.seznam.cz",
	port: 465,
	secure: true,
	auth: {
		user: "info@stastnesrdce.cz",
		pass: PRIVATE_seznam_key
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

// Funkce pro získání aktuální verze menu pro variantu
async function getCurrentMenuVersionId(variantId: string, supabase: any) {
	try {
		// Nejprve zjistíme, ke kterému menu patří varianta
		const { data: variant, error: variantError } = await supabase
			.from("menu_variants")
			.select("menu_id, menu_version_id")
			.eq("id", variantId)
			.single();

		if (variantError) {
			console.error("Chyba při získávání informací o variantě:", variantError);
			return null;
		}

		// Pokud má varianta již přiřazenou verzi menu, vrátíme ji
		if (variant.menu_version_id) {
			return variant.menu_version_id;
		}

		// Jinak získáme aktuální verzi menu pomocí RPC funkce
		const { data: versionId, error: versionError } = await supabase.rpc(
			"get_current_menu_version",
			{ p_menu_id: variant.menu_id }
		);

		if (versionError) {
			console.error("Chyba při získávání aktuální verze menu:", versionError);
			return null;
		}

		return versionId;
	} catch (error) {
		console.error("Nečekaná chyba při získávání verze menu:", error);
		return null;
	}
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

			// Start a transaction
			const { data: insertedOrder, error: insertError } = await supabase.rpc('create_order', {
				p_user_id: session?.user?.id,
				p_created_at: new Date().toISOString(),
				p_date: new Date().toISOString(),
				p_customer_first_name: customer.first_name,
				p_customer_last_name: customer.last_name,
				p_customer_street: customer.street,
				p_customer_street_number: customer.street_number,
				p_customer_city: customer.city,
				p_customer_zip_code: customer.zip_code,
				p_customer_telephone: customer.telephone,
				p_customer_email: email,
				p_note: note,
				p_total_pieces: totalPieces,
				p_total_price: totalPrice,
				p_currency: "CZK",
				p_pay_state: false,
				p_shipping_method: "Rozvoz",
				p_order_items: cartItems.flatMap(item => 
					item.variants.map(variant => ({
						variant_id: variant.id,
						price: variant.price,
						quantity: variant.quantity
					}))
				)
			});

			if (insertError) {
				console.error("Chyba při vytváření objednávky:", insertError);
				
				// Check if this is a duplicate order error
				if (insertError.message?.includes('duplicate key value violates unique constraint "prevent_duplicate_orders"')) {
					return {
						success: false,
						message: "Tato objednávka již byla vytvořena. Prosím obnovte stránku a zkontrolujte své objednávky."
					};
				}
				
				throw insertError;
			}

			if (!insertedOrder) {
				console.error("Objednávka byla vytvořena, ale nebyla vrácena data");
				throw new Error("Objednávka nebyla vytvořena");
			}

			console.log("Úspěšně vytvořena objednávka:", insertedOrder);

			try {
				// Odeslání emailu
				await sendOrderConfirmationEmail(
					email,
					insertedOrder.order_number.toString(),
					cartItems,
					totalPrice,
					totalPieces,
					note
				);
			} catch (emailError) {
				console.error("Chyba při odesílání potvrzovacího emailu:", emailError);
				// Continue even if email fails - the order was created successfully
			}

			console.log("Proces vytvoření objednávky dokončen");

			return {
				success: true,
				message: "Objednávka byla úspěšně vytvořena.",
				orderId: insertedOrder.order_number,
				redirectUrl: `/thankyou?order=${insertedOrder.order_number}`
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
