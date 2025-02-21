import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({
	locals: { supabase, safeGetSession }
}) => {
	const { session } = await safeGetSession();
	if (!session) {
		throw redirect(303, "/");
	}

	// Načtení profilu včetně nových polí
	const { data: profile, error: profileError } = await supabase
		.from("profiles")
		.select(
			`
     *,
     allergies,
     allergies_description,
     delivery_method,
     payment_method
   `
		)
		.eq("id", session.user.id)
		.single();

	if (profileError) {
		console.error("Error fetching profile:", profileError);
	}

	// Načtení objednávek s detaily
	const { data: orders, error: ordersError } = await supabase
		.from("orders")
		.select(
			`
     *,
     order_items: order_items (
       id,
       price,
       quantity,
       variant: menu_variants (
         id,
         variant_number,
         description,
         menu: menus (
           id,
           date,
           soup
         )
       )
     )
   `
		)
		.eq("user_id", session.user.id)
		.order("created_at", { ascending: false });

	if (ordersError) {
		console.error("Error fetching orders:", ordersError);
	} else {
		// Group order items by menu date
		orders.forEach((order) => {
			const groupedItems = {};
			order.order_items.forEach((item) => {
				const date = item.variant.menu.date;
				if (!groupedItems[date]) {
					groupedItems[date] = [];
				}
				groupedItems[date].push(item);
			});
			order.grouped_items = Object.entries(groupedItems).map(
				([date, items]) => ({ date, items })
			);
		});
	}

	return {
		session,
		profile,
		orders
	};
};

export const actions: Actions = {
	update: async ({ request, locals: { supabase, safeGetSession } }) => {
		const formData = await request.formData();
		const { session } = await safeGetSession();

		if (!session) {
			return fail(401, {
				message: {
					success: false,
					display: "Pro aktualizaci profilu se musíte přihlásit"
				}
			});
		}

		// Získání dat z formuláře
		const profileData = {
			id: session.user.id,
			first_name: formData.get("first_name") as string,
			last_name: formData.get("last_name") as string,
			telephone: formData.get("telephone") as string,
			street: formData.get("street") as string,
			street_number: formData.get("street_number") as string,
			city: formData.get("city") as string,
			zip_code: formData.get("zip_code") as string,
			ico: formData.get("ico") as string,
			dic: formData.get("dic") as string,
			company: formData.get("company") as string,
			username: formData.get("username") as string,
			// Nová pole
			allergies: formData.get("allergies") === "yes",
			allergies_description:
				formData.get("allergies") === "yes"
					? formData.get("allergiesDescription")
					: null,
			delivery_method: formData.get("deliveryMethod") as string,
			payment_method: formData.get("paymentMethod") as string,
			updated_at: new Date().toISOString()
		};

		// Validace povinných polí
		if (!profileData.first_name || !profileData.last_name) {
			return fail(400, {
				message: {
					success: false,
					display: "Jméno a příjmení jsou povinná pole"
				},
				...profileData
			});
		}

		// Uložení do databáze
		const { error } = await supabase.from("profiles").upsert(profileData);

		if (error) {
			console.error("Error updating profile:", error);
			return fail(500, {
				message: {
					success: false,
					display: "Chyba při ukládání profilu"
				},
				...profileData
			});
		}

		// Úspěšná aktualizace
		return {
			message: {
				success: true,
				display: "Profil byl úspěšně aktualizován"
			},
			...profileData
		};
	}
} satisfies Actions;
