import { error, redirect } from "@sveltejs/kit";
import type { Actions } from "./$types";
import nodemailer from "nodemailer";
import { PRIVATE_seznam_key } from "$env/static/private";
import type { RequestEvent } from "@sveltejs/kit";
import type { SupabaseClient } from "@supabase/supabase-js";
import { validateProfileForInvoicing } from '$lib/utils/profileValidation';

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
	variants: {
		id: string;
		variant_number: string;
		description: string;
		price: number;
		quantity: number;
	}[];
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

		try {
			// Získání údajů zákazníka
			const { data: customer, error: customerError } = await supabase
				.from("profiles")
				.select("first_name, last_name, street, street_number, city, zip_code, telephone")
				.eq("id", session.user.id)
				.single();

			if (customerError) {
				console.error("Chyba při získávání údajů zákazníka:", customerError);
				throw customerError;
			}

			// Validate customer profile
			const validationResult = validateProfileForInvoicing({
				first_name: customer.first_name,
				last_name: customer.last_name,
				street: customer.street,
				street_number: customer.street_number,
				city: customer.city,
				zip_code: customer.zip_code,
				email: email
			});

			if (!validationResult.isComplete) {
				return {
					success: false,
					message: `${validationResult.missingFields.join(', ')}. Prosím doplňte je v <a href="/profile" class="underline hover:!underline">nastavení profilu</a>.`
				};
			}

			const formData = await request.formData();
			const note = formData.get("note") as string;
			const cartItemsStr = formData.get("cartItems");

			if (!cartItemsStr) {
				return {
					success: false,
					message: "Nebyla poskytnuta žádná data košíku."
				};
			}

			let cartItems: CartItem[];
			try {
				cartItems = JSON.parse(cartItemsStr as string) as CartItem[];
			} catch (e) {
				console.error("Chyba při parsování dat košíku:", e);
				return {
					success: false,
					message: "Neplatná data košíku."
				};
			}

			if (!Array.isArray(cartItems) || cartItems.length === 0) {
				return {
					success: false,
					message: "Košík je prázdný. Nelze vytvořit objednávku."
				};
			}

			// Výpočet celkové ceny a kusů
			let totalPrice = 0;
			let totalPieces = 0;

			cartItems.forEach((item) => {
				if (!item.variants || !Array.isArray(item.variants)) {
					throw new Error("Neplatná data položky košíku");
				}

				item.variants.forEach((variant) => {
					totalPrice += (variant.price || 0) * (variant.quantity || 0);
					totalPieces += variant.quantity || 0;
				});
			});

			// Create order
			const { data: order, error: orderError } = await supabase
				.from("orders")
				.insert([
					{
						user_id: session.user.id,
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
						note: note,
						total_pieces: totalPieces,
						total_price: totalPrice,
						currency: "CZK",
						pay_state: false,
						shipping_method: "Rozvoz"
					}
				])
				.select()
				.single();

			if (orderError) {
				console.error("Chyba při vytváření objednávky:", orderError);
				throw orderError;
			}

			// Insert order items
			const orderItems = cartItems.flatMap((item) =>
				item.variants.map((variant) => ({
					order_id: order.id,
					variant_id: variant.id,
					price: variant.price,
					quantity: variant.quantity,
					created_at: new Date().toISOString(),
					updated_at: new Date().toISOString()
				}))
			);

			const { error: itemsError } = await supabase
				.from("order_items")
				.insert(orderItems);

			if (itemsError) {
				console.error("Chyba při vytváření položek objednávky:", itemsError);
				// Try to delete the order if items insertion fails
				await supabase.from("orders").delete().eq("id", order.id);
				throw itemsError;
			}

			try {
				// Odeslání emailu
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
				// Continue even if email fails - the order was created successfully
			}

			return {
				success: true,
				message: "Objednávka byla úspěšně vytvořena.",
				orderId: order.order_number || order.id,
				redirectUrl: `/thankyou?order=${order.order_number || order.id}`
			};
		} catch (error) {
			console.error("Chyba při zpracování objednávky:", error);
			return {
				success: false,
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
