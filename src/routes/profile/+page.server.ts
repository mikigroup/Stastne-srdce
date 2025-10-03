import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { validateProfileForInvoicing } from '$lib/utils/profileValidation';
import { checkAndUpdateRegistrationStatus } from '$lib/services/registrationStatusService';
import { sendDataDeletionRequestEmail } from '$lib/services/gdprEmailService';
import { ProfileService } from '$lib/services/profileService';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/types/database.types';
import type { Session, User } from '@supabase/supabase-js';

export const prerender = false;

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
	registration_status?: string; // Přidáno pro zachování statusu
}

export const load: PageServerLoad = async ({
	locals: { supabase, safeGetSession, tenantId }
}) => {
	const { session } = await safeGetSession();
	if (!session) {
		throw redirect(303, "/");
	}

	// Načtení profilu včetně nových polí s tenant filtrací
	const { data: profile, error: profileError } = await ProfileService.getUserProfile(
		supabase,
		session.user.id,
		{
			selectFields: `
				*,
				allergies,
				allergies_description,
				delivery_method,
				payment_method
			`
		}
	);

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
         ),
         menu_version_id: menu_versions (
           id,
           date,
           soup
         )
       )
     )
   `
		)
		.eq("user_id", session.user.id)
		.eq("tenant_id", tenantId)  // ← Přidáno
		.order("created_at", { ascending: false });

	if (ordersError) {
		console.error("Error fetching orders:", ordersError);
	} else if (orders) {
		// Group order items by menu date - používáme pouze původní data z objednávky
		orders.forEach((order: Order) => {
			const groupedItems: GroupedItems = {};

			order.order_items.forEach((item) => {
				// Používáme datum z verze menu pokud existuje, jinak z základního menu
				const date = item.variant.menu_version_id?.date || item.variant.menu.date;
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

			// Uložení do databáze s tenant filtrací (bez registration_status - nechme ho na globální službě)
			const { error } = await ProfileService.upsertProfile(supabase, profileData);

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

			// Po úspěšném uložení použijeme globální službu pro kontrolu a aktualizaci statusu
			const registrationCheck = await checkAndUpdateRegistrationStatus(
				supabase, 
				session.user.id, 
				session.user.email
			);

			// Úspěšná aktualizace
			return {
				message: {
					success: true,
					display: registrationCheck.wasUpdated 
						? "Profil byl úspěšně aktualizován a registrace dokončena"
						: "Profil byl úspěšně aktualizován"
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
	},

	requestDataDeletion: async ({ request, url, locals: { supabase, safeGetSession } }: {
		request: Request;
		url: URL;
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
			// Get user profile for email personalization with tenant filtering
			const { data: profile, error: profileError } = await ProfileService.getUserProfile(
				supabase,
				session.user.id,
				{
					selectFields: "first_name, last_name, email"
				}
			);

			if (profileError || !profile) {
				console.error("Error fetching user profile:", profileError);
				return fail(500, {
					message: {
						success: false,
						display: "Chyba při načítání uživatelských dat"
					}
				});
			}

			// Generate secure token for account reactivation
			const reactivationToken = crypto.randomUUID();
			const deletionDate = new Date();
			const scheduledDate = new Date(deletionDate.getTime() + 30 * 24 * 60 * 60 * 1000); // +30 days

			// Mark user's request for data deletion with 30-day grace period
			const updateData = {
				data_deletion_requested: true, // Boolean value
				data_deletion_date: deletionDate.toISOString(),
				data_deletion_scheduled: scheduledDate.toISOString(),
				data_deletion_token: reactivationToken,
				account_suspended: true, // Boolean value - Suspend account during grace period
				updated_at: new Date().toISOString()
			};

			const { error } = await ProfileService.updateUserProfile(
				supabase,
				session.user.id,
				updateData
			);

			if (error) {
				console.error("Error requesting data deletion:", error);
				return fail(500, {
					message: {
						success: false,
						display: "Chyba při podávání žádosti o smazání dat"
					}
				});
			}

			// Send notification email with reactivation link
			try {
				const baseUrl = `${url.protocol}//${url.host}`;
				await sendDataDeletionRequestEmail({
					email: session.user.email!,
					firstName: profile.first_name || 'Vážený zákazníku',
					lastName: profile.last_name || '',
					deletionDate: deletionDate.toISOString(),
					scheduledDate: scheduledDate.toISOString(),
					reactivationToken,
					baseUrl
				});
			} catch (emailError) {
				console.error("Error sending deletion request email:", emailError);
				// Don't fail the deletion request if email fails - log it for admin
			}

			// TODO: Log this request for GDPR compliance audit
			// TODO: Schedule deletion process (cron job)

			return {
				message: {
					success: true,
					display: `Žádost o smazání dat byla podána. Máte 30 dní na rozmyšlenou do ${scheduledDate.toLocaleDateString('cs-CZ')}. Poslali jsme vám email s instrukcemi pro případné zrušení žádosti.`
				}
			};
		} catch (error) {
			console.error("Error in data deletion request:", error);
			return fail(500, {
				message: {
					success: false,
					display: "Došlo k neočekávané chybě při podávání žádosti"
				}
			});
		}
	}
} satisfies Actions;
