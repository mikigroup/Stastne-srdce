import { redirect, fail } from "@sveltejs/kit";
import type { PageServerLoad, Actions } from "../$types";

export const load: PageServerLoad = async ({
	locals: { supabase, session }
}) => {
	if (!session) {
		throw redirect(303, "/login");
	}

	// Kontrola existence profilu a jeho stavu
	const { data: profile } = await supabase
		.from("profiles")
		.select("*")
		.eq("id", session.user.id)
		.single();
	/*
	if (profile?.registration_status === "completed") {
		throw redirect(303, "/");
	}*/

	return { profile };
};

export const actions: Actions = {
	complete: async ({ request, locals: { supabase, session } }) => {
		if (!session) {
			throw redirect(303, "/login");
		}

		try {
			const formData = await request.formData();

			// Data z formuláře
			const profileData = {
				id: session.user.id,
				first_name: formData.get("name") as string,
				last_name: formData.get("surname") as string,
				street: formData.get("street") as string,
				street_number: formData.get("street_number") as string,
				city: formData.get("city") as string,
				zip_code: formData.get("zip") as string,
				telephone: formData.get("telephone") as string,
				allergies: formData.get("allergies") === "yes",
				allergies_description:
					formData.get("allergies") === "yes"
						? formData.get("allergiesDescription")
						: null,
				delivery_method: formData.get("deliveryMethod") as string,
				payment_method: formData.get("paymentMethod") as string,
				registration_status: "completed",
				user_role: "customer",
				email: session.user.email,
				updated_at: new Date().toISOString()
			};

			// Validace
			if (
				!profileData.first_name ||
				!profileData.last_name ||
				!profileData.street ||
				!profileData.city ||
				!profileData.zip_code ||
				!profileData.telephone
			) {
				return fail(400, {
					message: {
						success: false,
						display: "Vyplňte prosím všechna povinná pole"
					},
					data: profileData
				});
			}

			// Uložení profilu
			const { error } = await supabase.from("profiles").upsert(profileData);

			if (error) {
				console.error("Chyba při ukládání profilu:", error);
				return fail(500, {
					message: {
						success: false,
						display: "Chyba při ukládání údajů"
					},
					data: profileData
				});
			}

			// Přesměrování po úspěšném dokončení
			throw redirect(303, "/?registration=completed");
		} catch (error) {
			console.error("Neočekávaná chyba:", error);
			return fail(500, {
				message: {
					success: false,
					display: "Došlo k neočekávané chybě"
				}
			});
		}
	}
};
