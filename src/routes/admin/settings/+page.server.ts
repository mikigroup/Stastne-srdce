import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import * as yup from "yup";

// Definice schématu pro validaci pomocí yup
const profileSchema = yup.object({
	first_name: yup.string().min(2, "Jméno musí mít alespoň 2 znaky").required("Jméno je povinné"),
	last_name: yup.string().min(2, "Příjmení musí mít alespoň 2 znaky").required("Příjmení je povinné"),
	username: yup.string().optional(),
	telephone: yup.string().optional(),
	company: yup.string().optional(),
	ico: yup.string().optional(),
	dic: yup.string().optional(),
	street: yup.string().optional(),
	street_number: yup.string().optional(),
	city: yup.string().optional(),
	zip_code: yup.string().optional(),
	avatar_url: yup.string().nullable().optional()
});

export type ProfileData = {
	first_name: string;
	last_name: string;
	username?: string;
	telephone?: string;
	company?: string;
	ico?: string;
	dic?: string;
	street?: string;
	street_number?: string;
	city?: string;
	zip_code?: string;
	avatar_url?: string | null;
};

/*export type RezcalendarData = {
	id: number;
	note: string;
	date: string;
	time: string;
	user_id: string;
};*/

export type LoadData = {
	session: any;
	profiles: ProfileData;
	// rezcalendar: RezcalendarData[];
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

	/*  const { data: rezcalendar, error: rezcalendarError } = await supabase
    .from("rezcalendar")
    .select(`id, note, date, time, user_id`);

  if (profilesError || rezcalendarError) {
    console.error("Error fetching profiles or rezcalendar:", profilesError || rezcalendarError);
    throw profilesError || rezcalendarError;
  }*/
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

		try {
			// Validace dat pomocí yup
			const validatedData = await profileSchema.validate(data, { abortEarly: false });

			const { error } = await supabase.from("profiles").upsert({
				id: session.user.id,
				...validatedData,
				updated_at: new Date()
			});

			if (error) {
				throw error;
			}

			return {
				message: { success: true, display: "Profil byl úspěšně aktualizován" }
			};
		} catch (error) {
			if (error instanceof yup.ValidationError) {
				const warnings = error.inner.reduce((acc, err) => {
					const field = err.path as string;
					acc[field] = err.message;
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
