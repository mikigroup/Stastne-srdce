import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({
	locals: { supabase, safeGetSession }
}) => {
	const { session } = await safeGetSession();

	if (!session) {
		throw redirect(303, "/");
	}

	const { data: profile, error: profileError } = await supabase
		.from("profiles")
		.select("*")
		.eq("id", session.user.id)
		.single();

	if (profileError) {
		console.error("Error fetching profile:", profileError);
	}

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
		let first_name = formData.get("first_name") as string;
		let last_name = formData.get("last_name") as string;
		let telephone = formData.get("telephone") as string;
		let street = formData.get("street") as string;
		let street_number = formData.get("street_number") as string;
		let city = formData.get("city") as string;
		let ico = formData.get("ico") as string;
		let dic = formData.get("dic") as string;
		let company = formData.get("company") as string;
		let username = formData.get("username") as string;
		const { session } = await safeGetSession();

		/* 	    console.log('Form data in action:', {
      first_name,
      last_name,
      telephone,
      street,
      street_number,
      city,
      ico,
      dic,
      company,
      username
    });
 */
		const { error } = await supabase.from("profiles").upsert({
			id: session?.user.id,
			first_name,
			last_name,
			telephone,
			street,
			street_number,
			city,
			ico,
			dic,
			company,
			username
		});

		if (error) {
			return fail(500, {
				first_name,
				last_name,
				telephone,
				street,
				street_number,
				city,
				ico,
				dic,
				company,
				username
			});
		}

		return {
			first_name,
			last_name,
			telephone,
			street,
			street_number,
			city,
			ico,
			dic,
			company,
			username
		};
	}
};
