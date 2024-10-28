import { fail, redirect } from "@sveltejs/kit";
import type { Actions } from "./$types";

export type ActionData = {
	message: {
		success: boolean;
		display: string;
	};
	email?: string;
};

export const actions: Actions = {
	forgotPass: async ({
		request,
		locals: { supabase }
	}): Promise<ActionData> => {
		const formData = await request.formData();
		const email = formData.get("email") as string;

		if (!email) {
			return fail(400, {
				message: {
					success: false,
					display: "Prosím zadejte emailovou adresu"
				},
				email: ""
			});
		}

		const { error } = await supabase.auth.resetPasswordForEmail(email, {
			redirectTo: `${request.url.origin}/reset-password`
		});

		if (error) {
			console.error(error);
			return fail(500, {
				message: {
					success: false,
					display: "Nepodařilo se provést požadavek"
				},
				email
			});
		}

		return {
			message: {
				success: true,
				display: "Do emailové schránky jsme ti poslali instrukce"
			},
			email
		};
	}
};
