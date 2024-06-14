import { error, redirect } from "@sveltejs/kit";
import type { Actions } from "./$types";
import nodemailer from "nodemailer";
import { createClient } from "@supabase/supabase-js";

const transporter = nodemailer.createTransport({
	host: "smtp.seznam.cz",
	port: 465,
	secure: true,
	auth: {
		user: "info@stastnesrdce.cz",
		pass: "#QFUtwxDsQW5LEDT"
	}
});

const supabaseLeo = createClient(
	"https://palzpgxkjhkksatqkwqf.supabase.co",
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhbHpwZ3hramhra3NhdHFrd3FmIiwicm9sZSI6ImFub24iLCJpYXQiOjE2Njk3MzEzODcsImV4cCI6MTk4NTMwNzM4N30.mTC4NMV-1ljAzNwaZJqGiMx9dbMOCkVWY3oiOOv_sOQ"
);

export const actions: Actions = {
	sendOrder: async ({ request, locals: { supabase } }) => {
		const session = await getSession();
		if (!session) {
			throw redirect(303, "/login");
		}

		const formData = await request.formData();
		const note = formData.get("note") as string;
		const cartItems = JSON.parse(formData.get("cartItems") as string);
		console.log("session.user.id:", session.user.id);

		let first_name = "";
		let last_name = "";
		try {
			const { data: profile, error: profileError } = await supabase
				.from("profiles")
				.select("first_name, last_name")
				.eq("id", session.user.id)
				.single();

			if (profileError) {
				console.warn("Chyba při získávání profilu uživatele:", profileError);
			} else {
				first_name = profile.first_name || "";
				last_name = profile.last_name || "";
			}
		} catch (error) {
			console.warn("Chyba při získávání profilu uživatele:", error);
		}

		const email = session.user.email;

		let totalPrice = 0;
		let totalPieces = 0;

		const items = cartItems.map((item: any) => {
			const variants = item.variants.map((variant: any) => ({
				variantId: variant.variantId,
				quantity: variant.quantity,
				value: variant.value
			}));

			totalPrice +=
				item.price *
				item.variants.reduce(
					(sum: number, variant: any) => sum + variant.quantity,
					0
				);
			totalPieces += item.variants.reduce(
				(sum: number, variant: any) => sum + variant.quantity,
				0
			);

			return {
				id: item.id,
				date: item.date,
				soup: item.soup,
				price: item.price,
				variants
			};
		});

		const doc = {
			created_at: new Date().toISOString(),
			items: JSON.stringify(items),
			note,
			customer_email: email,
			customer_first_name: first_name,
			customer_last_name: last_name,
			total_price: totalPrice,
			total_pieces: totalPieces,
			user_id: session.user.id
		};

		console.log("cartItems:", cartItems);
		console.log("session.user.id:", session.user.id);
		console.log("first_name:", first_name);
		console.log("last_name:", last_name);
		console.log("doc:", doc);

		const { data: order, error: orderError } = await supabaseLeo
			.from("orders")
			.insert([{ customer_first_name: TESTSSSS }])
			.select();

		if (orderError) {
			console.error("Chyba při vytváření objednávky:", orderError);
			throw error(500, "Chyba při vytváření objednávky");
		}

		// console.log(`Objednávka byla vytvořena, ID objednávky je ${order[0].id}`);

		const options = {
			from: "info@stastnesrdce.cz",
			to: email,
			subject: "Šťastné srdce - Objednávka",
			text: `
        Děkujeme za vaši objednávku!
        
        Detail:
        ${cartItems
					.map(
						(item: any, index: number) => `
              Položka ${index + 1}:
                ${item.soup}
                Datum: ${new Date(item.date).toLocaleDateString("cs-CZ", {
									year: "numeric",
									month: "long",
									day: "numeric"
								})}
                Varianty:
                  ${item.variants
										.map(
											(variant: any) => `
                        - ${variant.value}
                          Množství: ${variant.quantity}
                      `
										)
										.join("\n")}
            `
					)
					.join("\n")}
        
        Poznámka: ${note}
      `
		};

		try {
			await transporter.sendMail(options);
			console.log("E-mail odeslán na adresu:", email);

			return {
				success: true,
				clearCart: true
			};
		} catch (err: unknown) {
			console.error("Chyba při odesílání e-mailu:", err);
			throw error(500, "Chyba při odesílání e-mailu");
		}
	}
};
