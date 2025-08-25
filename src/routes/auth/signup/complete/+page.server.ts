import { redirect, fail } from "@sveltejs/kit";
import type { PageServerLoad, Actions } from "./$types";
import { ROUTES } from "$lib/constants/routes";
import { getTenantId } from "$lib/utils/tenantUtils";

export const load: PageServerLoad = async ({
	locals: { supabase, session },
	url
}) => {
	// Pokud nemá session, ale má parametr success=signup, umožníme přístup
	const successParam = url.searchParams.get("success");
	
	if (!session && successParam !== "signup") {
		throw redirect(303, ROUTES.AUTH.LOGIN);
	}

	// Pokud má session, načteme profil
	if (session) {
		// Kontrola existence profilu a načtení všech polí
		const { data: profile } = await supabase
			.from("profiles")
			.select(`
				*,
				allergies,
				allergies_description,
				delivery_method,
				payment_method
			`)
			.eq("id", session.user.id)
			.single();

		if (profile?.registration_status === "completed") {
			throw redirect(303, ROUTES.MAIN.HOME);
		}

		return { profile };
	}

	// Pokud nemá session ale má success parametr, vrátíme prázdný profil
	return { profile: null };
};

export const actions: Actions = {
	complete: async ({ request, locals, url }) => {
		const { supabase, session } = locals;
		// Pokud nemá session, ale má parametr success=signup, umožníme pokračování
		const successParam = url.searchParams.get("success");
		
		if (!session && successParam !== "signup") {
			throw redirect(303, ROUTES.AUTH.LOGIN);
		}

		// Pokud nemá session, nemůžeme pokračovat s dokončením registrace
		if (!session) {
			return fail(400, {
				message: {
					success: false,
					display: "Pro dokončení registrace je nutné se přihlásit"
				}
			});
		}

		try {
			const formData = await request.formData();

			// Data z formuláře (bez statusu)
			const profileData = {
				id: session.user.id,
				first_name: (formData.get("first_name") as string)?.trim(),
				last_name: (formData.get("last_name") as string)?.trim(),
				street: (formData.get("street") as string)?.trim(),
				street_number: (formData.get("street_number") as string)?.trim(),
				city: (formData.get("city") as string)?.trim(),
				zip_code: (formData.get("zip_code") as string)?.trim(),
				telephone: (formData.get("telephone") as string)?.trim(),
				allergies: formData.get("allergies") === "yes",
				allergies_description:
					formData.get("allergies") === "yes"
						? (formData.get("allergies_description") as string)?.trim()
						: null,
				delivery_method: formData.get("delivery_method") as string,
				payment_method: formData.get("payment_method") as string,
				user_role: "customer",
				email: session.user.email,
				updated_at: new Date().toISOString()
			};

			// Důkladnější validace povinných polí
			const requiredFields = [
				{ field: profileData.first_name, name: "Jméno" },
				{ field: profileData.last_name, name: "Příjmení" },
				{ field: profileData.street, name: "Ulice" },
				{ field: profileData.street_number, name: "Číslo popisné" },
				{ field: profileData.city, name: "Město" },
				{ field: profileData.zip_code, name: "PSČ" },
				{ field: profileData.telephone, name: "Telefon" },
				{ field: profileData.delivery_method, name: "Způsob dodání" },
				{ field: profileData.payment_method, name: "Způsob platby" }
			];

			const missingFields = requiredFields.filter((f) => !f.field);

			// NOVÉ: Kontrola alergií jako povinného pole
			if (formData.get("allergies") === null || formData.get("allergies") === undefined || formData.get("allergies") === "") {
				missingFields.push({ field: "", name: "Alergie (musí být vybrána odpověď ano/ne)" });
			}

			// Pokud má alergie, musí být vyplněn popis
			if (profileData.allergies === true && !profileData.allergies_description) {
				missingFields.push({ field: "", name: "Popis alergií" });
			}

			if (missingFields.length > 0) {
				return fail(400, {
					message: {
						success: false,
						display: `Vyplňte prosím všechna povinná pole: ${missingFields.map((f) => f.name).join(", ")}`
					},
					data: profileData
				});
			}

			// Teprve nyní nastavíme status jako completed
			const dataToSave = {
				...profileData,
				registration_status: "completed",
				tenant_id: getTenantId(locals) // Přidáno tenant_id
			};

			// Uložení profilu
			const { error } = await supabase.from("profiles").upsert(dataToSave);

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

			return {
				message: {
					success: true,
					display: "Registrace úspěšně dokončena"
				},
				...dataToSave
			};
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
