import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { profileSchema, type ProfileData } from "$lib/utils/validationSchemas";

export type LoadData = {
	session: any;
	profiles: ProfileData;
};

export const load: PageServerLoad = async ({
	locals: { supabase, session }
}): Promise<LoadData> => {
	if (!session) {
		throw redirect(303, "/login");
	}

	const { data: profiles, error: profilesError } = await supabase
		.from("profiles")
		.select("*")
		.eq("id", session.user.id)
		.single();

	if (profilesError) {
		console.error("Chyba při načítání profilu:", profilesError);
		throw profilesError;
	}

	if (!profiles) {
		throw new Error("Profil nenalezen.");
	}

	return { session, profiles };
};

export type ActionData = {
	message: {
		success: boolean;
		display: string;
	};
	warnings?: Record<string, string>;
	formData?: Record<string, string>;
};

export const actions: Actions = {
	update: async ({ request, locals: { supabase, session } }) => {
		if (!session) {
			return fail(401, {
				message: {
					success: false,
					display: "Nejste přihlášeni"
				}
			});
		}

		const formData = await request.formData();
		const data = Object.fromEntries(formData);

		// Validace dat pomocí Zod
		const validationResult = profileSchema.safeParse(data);
		
		if (!validationResult.success) {
			const warnings = validationResult.error.errors.reduce((acc, err) => {
				const field = err.path[0] as string;
				if (field) {
					acc[field] = err.message;
				}
				return acc;
			}, {} as Record<string, string>);

			return {
				message: {
					success: true,
					display: "Profil byl aktualizován s upozorněními"
				},
				warnings,
				formData: data as Record<string, string>
			};
		}

		try {
			const { error } = await supabase.from("profiles").upsert({
				id: session.user.id,
				...validationResult.data,
				updated_at: new Date()
			});

			if (error) {
				throw error;
			}

			return {
				message: { success: true, display: "Profil byl úspěšně aktualizován" }
			};
		} catch (error) {

			console.error("Chyba při aktualizaci profilu:", error);
			return fail(500, {
				message: {
					success: false,
					display: "Nastala neočekávaná chyba při ukládání"
				},
				formData: data as Record<string, string>
			});
		}
	}
};
