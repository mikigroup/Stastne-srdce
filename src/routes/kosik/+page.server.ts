import { error, redirect } from "@sveltejs/kit";
import type { Actions, RequestEvent } from "./$types";
import nodemailer from "nodemailer";
import { PRIVATE_seznam_key } from "$env/static/private";
import { validateProfileForInvoicing } from "$lib/utils/profileValidation";
import type { Profile } from "$lib/types/profile";

const transporter = nodemailer.createTransport({
	host: "smtp.seznam.cz",
	port: 465,
	secure: true,
	auth: {
		user: "info@stastnesrdce.cz",
		pass: PRIVATE_seznam_key
	}
});

export const actions: Actions = {
	sendOrder: async ({ request, locals: { supabase, safeGetSession } }: RequestEvent) => {
		const { session, user } = await safeGetSession();

		if (!session || !user) {
			return {
				success: false,
				type: 'failure',
				message: "Pro vytvoření objednávky se musíte přihlásit.",
				redirectUrl: "/prihlaseni?redirect=/kosik"
			};
		}

		// Kontrola dokončené registrace
		const { data: profile } = await supabase
			.from("profiles")
			.select("registration_status")
			.eq("id", user.id)
			.single();

		if (!profile?.registration_status) {
			return {
				success: false,
				type: 'failure',
				message: "Pro vytvoření objednávky je potřeba dokončit registraci.",
				redirectUrl: "/signup/complete"
			};
		}

		const email = user.email;
		if (!email) {
			return {
				success: false,
				type: 'failure',
				message: "Email uživatele není k dispozici"
			};
		}

		try {
			const formData = await request.formData();
			const note = formData.get("note") as string;
			const cartItemsStr = formData.get("cartItems");

			if (!cartItemsStr) {
				return {
					success: false,
					type: 'failure',
					message: "Košík je prázdný."
				};
			}

			const cartItems = JSON.parse(cartItemsStr as string);
			const totalPieces = cartItems.reduce(
				(sum: number, item: any) =>
					sum +
					item.variants.reduce(
						(variantSum: number, variant: any) =>
							variantSum + (variant.quantity || 0),
						0
					),
				0
			);

			const totalPrice = cartItems.reduce(
				(sum: number, item: any) =>
					sum +
					item.variants.reduce(
						(variantSum: number, variant: any) =>
							variantSum + (variant.price || 0) * (variant.quantity || 0),
						0
					),
				0
			);

			// Get customer data
			const { data: customer, error: customerError } = await supabase
				.from("profiles")
				.select("first_name, last_name, street, street_number, city, zip_code, telephone, delivery_method, payment_method")
				.eq("id", user.id)
				.single();

			if (customerError) {
				console.error("Chyba při načítání dat zákazníka:", customerError);
				return {
					success: false,
					type: 'failure',
					message: "Nepodařilo se načíst data zákazníka."
				};
			}

			// Validate customer data - add email to validation
			const validationResult = validateProfileForInvoicing({
				...customer,
				email: email
			});
			
			if (!validationResult.isComplete) {
				return {
					success: false,
					type: 'failure',
					message: `Pro vytvoření objednávky musíte mít vyplněné všechny povinné údaje v <a href="/profile" class="text-blue-600 underline">profilu</a>. Chybí: ${validationResult.missingFields.join(', ')}.`
				};
			}

			// Create order using the stored procedure
			const { data: orderArray, error: orderError } = await supabase.rpc('create_order_with_items', {
				p_user_id: user.id,
				p_created_at: new Date().toISOString(),
				p_date: new Date().toISOString(),
				p_customer_first_name: customer.first_name || '',
				p_customer_last_name: customer.last_name || '',
				p_customer_street: customer.street || '',
				p_customer_street_number: customer.street_number || '',
				p_customer_city: customer.city || '',
				p_customer_zip_code: customer.zip_code || '',
				p_customer_telephone: customer.telephone || '',
				p_customer_email: email,
				p_note: note,
				p_total_pieces: totalPieces,
				p_total_price: totalPrice,
				p_currency: "CZK",
				p_pay_state: false,
				p_shipping_method: "Rozvoz",
				p_order_items: cartItems.flatMap((item: any) =>
					item.variants.map((variant: any) => ({
						variant_id: variant.id,
						price: variant.price,
						quantity: variant.quantity
					}))
				)
			});

			if (orderError) {
				console.error("Chyba při vytváření objednávky:", orderError);
				return {
					success: false,
					type: 'failure',
					message: "Chyba při vytváření objednávky.",
					error: orderError.message
				};
			}

			if (!orderArray || !Array.isArray(orderArray) || orderArray.length === 0) {
				console.error("Objednávka nebyla vytvořena - žádná data nebyla vrácena");
				return {
					success: false,
					type: 'failure',
					message: "Objednávku se nepodařilo vytvořit - zkuste to prosím znovu"
				};
			}

			const order = orderArray[0]; // Bereme první (a jediný) prvek pole

			// Only send email after successful order creation
			try {
				await sendOrderConfirmationEmail(
					email,
					order.order_number?.toString() || order.id,
					cartItems,
					totalPrice,
					totalPieces,
					note
				);
			} catch (emailError) {
				console.error("Chyba při odesílání potvrzovacího emailu:", emailError);
				// Don't fail the order if just email fails
			}

			// Get the order details
			const orderId = order.order_number || order.id;
			console.log('Created order:', orderArray);

			if (!orderId) {
				console.error("Missing order ID:", orderArray);
				return {
					success: false,
					type: 'failure',
					message: "Chyba při vytváření objednávky - chybí číslo objednávky."
				};
			}

			// Return a properly structured response with the actual order number
			return {
				success: true,
				type: 'success',
				message: "Objednávka byla úspěšně vytvořena.",
				orderId: orderId,
				redirectUrl: `/thankyou?order=${orderId}`
			};
		} catch (error) {
			console.error("Chyba při zpracování objednávky:", error);
			return {
				success: false,
				type: 'failure',
				message: "Při zpracování objednávky došlo k chybě.",
				error: error instanceof Error ? error.message : "Neznámá chyba"
			};
		}
	}
};

// Definice funkce odesílání
async function sendOrderConfirmationEmail(
	email: string,
	orderId: string,
	items: any[],
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
										(variant: any) => `
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
