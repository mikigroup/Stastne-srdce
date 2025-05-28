import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { z } from "zod";

// Definice schématu pro validaci
const profileSchema = z.object({
	first_name: z.string().min(2, "Jméno musí mít alespoň 2 znaky"),
	last_name: z.string().min(2, "Příjmení musí mít alespoň 2 znaky"),
	username: z.string().optional(),
	telephone: z.string().optional(),
	company: z.string().optional(),
	ico: z.string().optional(),
	dic: z.string().optional(),
	street: z.string().optional(),
	street_number: z.string().optional(),
	city: z.string().optional(),
	zip_code: z.string().optional(),
	avatar_url: z.string().nullable().optional()
});

export type ProfileData = z.infer<typeof profileSchema>;

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
			// Validace dat
			const validatedData = profileSchema.parse(data);

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
			if (error instanceof z.ZodError) {
				const warnings = error.errors.reduce((acc, err) => {
					const field = err.path[0] as string;
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
