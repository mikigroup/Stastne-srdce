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
	sendOrder: async ({ request, locals: { safeGetSession } }) => {
		const session = await safeGetSession();
		if (!session) {
			throw redirect(303, "/login");
		}

		const formData = await request.formData();
		const note = formData.get("note") as string;
		const cartItems = JSON.parse(formData.get("cartItems") as string);

		let fullname = "";
		try {
			const { data: profile, error: profileError } = await supabaseLeo
				.from("profiles")
				.select("first_name, last_name")
				.eq("id", session.user.id)
				.single();

			if (profileError) {
				console.warn("Chyba při získávání profilu uživatele:", profileError);
			} else {
				fullname =
					`${profile.first_name || ""} ${profile.last_name || ""}`.trim();
			}
		} catch (error) {
			console.warn("Chyba při získávání profilu uživatele:", error);
		}

		const email = session.user.email;

		let totalPrice = 0;
		let totalPieces = 0;

		const itemsOrder = [];
		for (const obj of cartItems) {
			itemsOrder.push(obj.soup);
			const releaseDate = new Date(obj.date);
			const formattedDate = `${releaseDate.getDate().toString().padStart(2, "0")}-${(
				releaseDate.getMonth() + 1
			)
				.toString()
				.padStart(2, "0")}-${releaseDate.getFullYear()}`;
			itemsOrder.push(formattedDate);

			for (const variant of obj.variants) {
				itemsOrder.push(variant.value);
				itemsOrder.push(variant.quantity);
				totalPrice += obj.price * variant.quantity;
				totalPieces += variant.quantity;
			}
		}

		const doc = {
			created_at: new Date().toISOString(),
			customer_email: email,
			items: JSON.stringify(itemsOrder),
			user_id: session.user.id
			// Další relevantní sloupce podle vašich požadavků
			// například:
			// customer_first_name: ...,
			// customer_last_name: ...,
			// delivery_street: ...,
			// atd.
		};

		const { data: order, error: orderError } = await supabaseLeo
			.from("orders")
			.insert([doc])
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
