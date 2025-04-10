import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({
	locals: { supabase },
	params
}) => {
	// Extract customerId from route parameters
	const id = params.customerId;

	const { data: customers, error } = await supabase
		.from("profiles")
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
      id,
      allergies,
      allergies_description,
      delivery_method,
      payment_method
    `
		)
		.eq("id", id)
		.single();

	if (error) {
		console.error("Error fetching customers:", error);
		// Lepší error handling pro případ že zákazník neexistuje
		if (error.code === "PGRST116") {
			throw new Error("Zákazník nebyl nalezen");
		}
		throw error;
	}

	return { customers };
};
