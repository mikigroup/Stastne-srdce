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

/*const supabase = createClient(
	"https://orgshebezwfizhmlmeum.supabase.co",
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9yZ3NoZWJlendmaXpobWxtZXVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NTg2MDMzNjMsImV4cCI6MTk3NDE3OTM2M30.0LA1TPH2v93s10ChjJiX6iTX4LSXMsWOe3MTTxb5_74"
);*/

export const actions: Actions = {
	sendOrder: async ({ request, locals: { supabase, getSession } }) => {
		const session = await getSession();
		if (!session) {
			throw redirect(303, "/login");
		}

		const formData = await request.formData();
		const note = formData.get("note") as string;
		const cartItems = JSON.parse(formData.get("cartItems") as string);

		if (cartItems.length === 0) {
			return {
				success: false,
				message: "Košík je prázdný. Nelze vytvořit objednávku."
			};
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

		const orderData = {
			created_at: new Date().toISOString(),
			customer_email: email,
			total_price: totalPrice,
			total_pieces: totalPieces,
			note
		};

		try {
			// Začátek transakce
			const { data: order, error: orderError } = await supabase
				.from("orders")
				.insert(orderData)
				.select();

			if (orderError) {
				throw orderError;
			}

			const orderId = order[0].id;

			const orderItems = items.map((item: any) => ({
				order_id: orderId,
				menu_id: item.id,
				quantity: item.variants.reduce(
					(sum: number, variant: any) => sum + variant.quantity,
					0
				),
				price: item.price
			}));

			const { data: createdOrderItems, error: orderItemsError } = await supabase
				.from("order_items")
				.insert(orderItems);

			if (orderItemsError) {
				// Pokud došlo k chybě při vkládání položek objednávky, smazat vytvořenou objednávku
				await supabase.from("orders").delete().eq("id", orderId);
				throw orderItemsError;
			}

			// Konec transakce

			// Odeslání e-mailu a další akce

			return {
				success: true,
				message: "Objednávka byla úspěšně vytvořena.",
				orderId: orderId
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
