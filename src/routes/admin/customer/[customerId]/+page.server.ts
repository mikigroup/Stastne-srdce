import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({
	locals: { supabase },
	params
}) => {
	// Extract customerId from route parameters
	const id = params.customerId;
	const { data: customers, error } = await supabase
		.from("customers")
		.select(
			`
      first_name,
      last_name,
      telephone,
      street,
      city,
      street_number,
      zip_code,
      email,
      ico,
      dic,
      company,
      website,
      username,      
      id      
    `
		)
		.eq("id", id)
		.single();
	if (error) {
		console.error("Error fetching customers:", error);
		throw error;
	}
	return { customers };
};
