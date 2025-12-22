import { redirect, fail } from "@sveltejs/kit";
import type { PageServerLoad, Actions } from "./$types";
import { ROUTES } from "$lib/constants/routes";
import { getTenantId } from "$lib/utils/tenantUtils";
import { createClient } from '@supabase/supabase-js';
import type { Database } from '$lib/types/database.types';
import { PRIVATE_SBUrl, PRIVATE_ServiceKey } from '$env/static/private';
import { detectBotRegistration, isTemporaryEmail } from "$lib/utils/botDetection";

// Admin Supabase klient pro načtení emailu z auth.users
const adminSupabase = createClient<Database>(
	PRIVATE_SBUrl,
	PRIVATE_ServiceKey,
	{
		auth: {
			autoRefreshToken: false,
			persistSession: false
		}
	}
);

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

			// Získat email - pokud není v session, načíst z auth.users přes Admin API
			let emailToUse = session.user.email;

			console.log('📧 [SIGNUP COMPLETE] Email check:', {
				sessionEmail: session.user.email,
				userId: session.user.id
			});

			// Pokud email není v session, načíst ho z auth.users
			if (!emailToUse) {
				console.warn('⚠️ [SIGNUP COMPLETE] Email missing in session, fetching from auth.users');

				try {
					const { data: authUser, error: authError } = await adminSupabase.auth.admin.getUserById(session.user.id);

					if (authError) {
						console.error('❌ [SIGNUP COMPLETE] Error fetching user from auth:', authError);
						throw authError;
					}

					if (authUser?.user?.email) {
						emailToUse = authUser.user.email;
						console.log('✅ [SIGNUP COMPLETE] Email loaded from auth.users:', emailToUse);
					} else {
						console.error('❌ [SIGNUP COMPLETE] No email found in auth.users for user:', session.user.id);
					}
				} catch (adminError) {
					console.error('❌ [SIGNUP COMPLETE] Admin API error:', adminError);
				}
			}

			// Pokud stále nemáme email nebo je prázdný, vrátit chybu
			if (!emailToUse || emailToUse.trim() === '') {
				console.error('❌ [SIGNUP COMPLETE] No email available from any source!', {
					emailToUse,
					userId: session.user.id
				});
				return fail(400, {
					message: {
						success: false,
						display: "Chyba: Email nebyl nalezen. Prosím zkuste se odhlásit a znovu přihlásit, nebo kontaktujte podporu."
					}
				});
			}

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
				email: emailToUse,
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

			// Bot detection - kontrola podezřelých dat
			const botDetection = detectBotRegistration({
				first_name: profileData.first_name,
				last_name: profileData.last_name,
				street: profileData.street,
				street_number: profileData.street_number,
				city: profileData.city,
				zip_code: profileData.zip_code,
				telephone: profileData.telephone,
				ico: profileData.ico,
				dic: profileData.dic,
				company: profileData.company,
				allergies_description: profileData.allergies_description
			});

			if (botDetection.isBot) {
				console.warn('⚠️ [SIGNUP COMPLETE] Bot detection triggered:', {
					userId: session.user.id,
					email: emailToUse,
					confidence: botDetection.confidence,
					reasons: botDetection.reasons
				});

				// Blokovat registraci - vrátit obecnou chybu (neodhalit detekci)
				return fail(400, {
					message: {
						success: false,
						display: "Zadané údaje nejsou platné. Zkontrolujte prosím správnost vyplněných údajů."
					},
					data: profileData
				});
			}

			// Kontrola dočasného emailu
			if (emailToUse && isTemporaryEmail(emailToUse)) {
				console.warn('⚠️ [SIGNUP COMPLETE] Temporary email detected:', {
					userId: session.user.id,
					email: emailToUse
				});

				return fail(400, {
					message: {
						success: false,
						display: "Dočasné emailové adresy nejsou povoleny. Použijte prosím trvalou emailovou adresu."
					},
					data: profileData
				});
			}

			// Zkontrolovat, jestli profil už existuje
			const { data: existingProfile, error: fetchError } = await supabase
				.from("profiles")
				.select("email, id, registration_status")
				.eq("id", session.user.id)
				.single();

			if (fetchError && fetchError.code !== 'PGRST116') {
				// PGRST116 = not found, což je OK
				console.error("Chyba při načítání profilu:", fetchError);
				return fail(500, {
					message: {
						success: false,
						display: "Chyba při načítání profilu"
					},
					data: profileData
				});
			}

			let error;
			const tenantId = getTenantId(locals);

			if (existingProfile) {
				// Profil existuje - použít UPDATE
				const updateData: any = {
					first_name: profileData.first_name,
					last_name: profileData.last_name,
					street: profileData.street,
					street_number: profileData.street_number,
					city: profileData.city,
					zip_code: profileData.zip_code,
					telephone: profileData.telephone,
					allergies: profileData.allergies,
					allergies_description: profileData.allergies_description,
					delivery_method: profileData.delivery_method,
					payment_method: profileData.payment_method,
					user_role: profileData.user_role,
					registration_status: "completed",
					tenant_id: tenantId,
					updated_at: new Date().toISOString()
				};

				// Email vždy aktualizovat, pokud je k dispozici a existující email je null nebo prázdný
				// Pokud existující email existuje, zachovat ho (může být jiný než v auth.users)
				if (emailToUse && emailToUse.trim() !== '') {
					if (!existingProfile.email || existingProfile.email.trim() === '') {
						// Pokud v profilu není email, přidat ho
						updateData.email = emailToUse;
						console.log('📧 [SIGNUP COMPLETE] Adding email to existing profile:', emailToUse);
					} else {
						// Pokud v profilu už email je, zachovat ho (může být jiný než v auth.users)
						console.log('📧 [SIGNUP COMPLETE] Preserving existing email in profile:', existingProfile.email);
					}
				} else {
					console.warn('⚠️ [SIGNUP COMPLETE] Email not available for update, keeping existing:', existingProfile.email);
				}

				const result = await supabase
					.from("profiles")
					.update(updateData)
					.eq("id", session.user.id);

				error = result.error;
			} else {
				// Profil neexistuje - použít INSERT (vytvořit nový)
				console.log('📝 [SIGNUP COMPLETE] Creating new profile for user:', session.user.id);
				const insertData = {
					...profileData,
					registration_status: "completed",
					tenant_id: tenantId
				};

				const result = await supabase
					.from("profiles")
					.insert(insertData);

				error = result.error;
			}

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

			// Načíst aktualizovaný profil pro vrácení
			const { data: updatedProfile } = await supabase
				.from("profiles")
				.select("*")
				.eq("id", session.user.id)
				.single();

			return {
				message: {
					success: true,
					display: "Registrace úspěšně dokončena"
				},
				...(updatedProfile || profileData)
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
