import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({
	locals: { supabase, safeGetSession }
}) => {
	const { session } = await safeGetSession();

	if (!session) {
		throw redirect(303, "/");
	}

	const { data: profile, error } = await supabase
		.from("customers")
		.select("*")
		.eq("id", session.user.id)
		.single();

	if (error) {
		console.error("Error fetching profile:", error);
	} else {
		// console.log("TEST:", profile);
	}

	return { session, profile };
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
		const { error } = await supabase.from("customers").upsert({
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
			username,
			updated_at: new Date()
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
