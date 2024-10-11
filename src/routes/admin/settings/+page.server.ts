import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

export type ProfileData = {
	username: string;
	first_name: string;
	last_name: string;
	avatar_url: string;
	telephone: string;
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
	const { data: profiles, error: profilesError } = await supabase
		.from("profiles")
		.select(`username, first_name, last_name, avatar_url, telephone`)
		.eq("id", session?.user.id)
		.single();

	/*  const { data: rezcalendar, error: rezcalendarError } = await supabase
    .from("rezcalendar")
    .select(`id, note, date, time, user_id`);

  if (profilesError || rezcalendarError) {
    console.error("Error fetching profiles or rezcalendar:", profilesError || rezcalendarError);
    throw profilesError || rezcalendarError;
  }*/
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
	lastName?: string;
	username?: string;
	firstName?: string;
	avatarUrl?: string;
	telephone?: string;
};

export const actions: Actions = {
	update: async ({ request, locals: { supabase, session } }) => {
		const formData = await request.formData();
		const first_name = formData.get("first_name") as string;
		const last_name = formData.get("last_name") as string;
		const username = formData.get("username") as string;
		const avatarUrl = formData.get("avatarUrl") as string;
		const telephone = formData.get("telephone") as string;

		try {
			const { error } = await supabase.from("profiles").upsert({
				id: session?.user.id,
				first_name,
				last_name,
				username,
				telephone,
				avatar_url: avatarUrl,
				updated_at: new Date()
			});

			if (error) {
				throw error;
			}
			return { message: { success: true, display: "Profil aktualizován" } };
		} catch (error) {
			console.error("Chyba při aktualizaci profilu:", error);
			return fail(500, {
				message: {
					success: false,
					display: "Chyba při aktualizaci profilu"
				},
				lastName: last_name,
				username,
				firstName: first_name,
				avatarUrl,
				telephone
			});
		}
	}
};
