import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { validateProfileForInvoicing } from '$lib/utils/profileValidation';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/types/database.types';
import type { Session, User } from '@supabase/supabase-js';

interface OrderItem {
	id: string;
	price: number;
	quantity: number;
	variant: {
		id: string;
		variant_number: string;
		description: string;
		menu: {
			id: string;
			date: string;
			soup: string;
		};
	};
}

interface Order {
	id: string;
	created_at: string;
	// Další vlastnosti objednávky
	order_items: OrderItem[];
	grouped_items?: Array<{ date: string; items: OrderItem[] }>;
}

interface GroupedItems {
	[date: string]: OrderItem[];
}

interface ProfileData {
	id: string;
	first_name: string;
	last_name: string;
	telephone: string;
	street: string;
	street_number: string;
	city: string;
	zip_code: string;
	ico: string;
	dic: string;
	company: string;
	username: string;
	allergies: boolean;
	allergies_description: string | null;
	delivery_method: string;
	payment_method: string;
	updated_at: string;
}

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
	} else if (orders) {
		// Group order items by menu date
		orders.forEach((order: Order) => {
			const groupedItems: GroupedItems = {};

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
		orders: orders || []
	};
};

export const actions: Actions = {
	update: async ({ request, locals: { supabase, safeGetSession } }: {
		request: Request;
		locals: {
			supabase: SupabaseClient<Database>;
			safeGetSession: () => Promise<{
				session: Session | null;
				user: User | null;
			}>;
		};
	}) => {
		const { session } = await safeGetSession();
		if (!session) {
			throw redirect(303, "/login");
		}

		try {
			const formData = await request.formData();

			// Získání dat z formuláře
			const profileData: ProfileData = {
				id: session.user.id,
				first_name: (formData.get("first_name") as string) || "",
				last_name: (formData.get("last_name") as string) || "",
				telephone: (formData.get("telephone") as string) || "",
				street: (formData.get("street") as string) || "",
				street_number: (formData.get("street_number") as string) || "",
				city: (formData.get("city") as string) || "",
				zip_code: (formData.get("zip_code") as string) || "",
				ico: (formData.get("ico") as string) || "",
				dic: (formData.get("dic") as string) || "",
				company: (formData.get("company") as string) || "",
				username: (formData.get("username") as string) || "",
				allergies: formData.get("allergies") === "yes",
				allergies_description:
					formData.get("allergies") === "yes"
						? (formData.get("allergies_description") as string) || null
						: null,
				delivery_method: (formData.get("delivery_method") as string) || "",
				payment_method: (formData.get("payment_method") as string) || "",
				updated_at: new Date().toISOString()
			};

			// Validate profile data
			const validationResult = validateProfileForInvoicing({
				...profileData,
				email: session.user.email
			});

			if (!validationResult.isComplete) {
				return fail(400, {
					message: {
						success: false,
						display: `Některá povinná pole nejsou vyplněna: ${validationResult.missingFields.join(', ')}`
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
		} catch (error) {
			console.error("Error:", error);
			return fail(500, {
				message: {
					success: false,
					display: "Došlo k neočekávané chybě"
				}
			});
		}
	}
} satisfies Actions;
