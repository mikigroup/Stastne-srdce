import { fail, redirect } from "@sveltejs/kit";
import type { Actions } from "./$types";

export const actions: Actions = {
	handleLogin: async ({ request, locals: { supabase }, url }) => {
		const formData = await request.formData();
		// const provider = url.searchParams.get("provider") as Provider | undefined;
		const email = formData.get("email") as string;
		const password = formData.get("password") as string;
		const userRole = formData.get("user_role") as string;

		const { data, error } = await supabase.auth.signInWithPassword({
			email,
			password
		});

		if (error) {
			console.error(error);
			return fail(400, {
				message: {
					success: false,
					display:
						"Neplatné přihlašovací údaje. Zkontrolujte prosím e-mail a heslo."
				}
			});
		} else {
			// Update user metadata with the user_role
			const { error: updateError } = await supabase.auth.updateUser({
				data: { user_type: userRole }
			});

			if (updateError) {
				console.error("Error updating user role:", updateError);
				return fail(400, {
					message: {
						success: false,
						display: "Chyba při aktualizaci role uživatele."
					}
				});
			}

			throw redirect(303, "/jidelnicek");
		}
	}

	/*   handleGoogleLogin: async ({ request, locals: { supabase }, url }) => {
		const provider = url.searchParams.get("provider") as Provider | undefined;


			console.log('Google tlačítko...');

			const { error } = await supabase.auth.signInWithOAuth({
				 options: {
			queryParams: {
				access_type: "offline",
				prompt: "consent",
			},}
			});
	} */
};

/* if (error) {
        console.error('Error signing in with Google:', error.message);
        return fail(400, { message: { success: false, display: "Chyba při přihlášení k Googlu." } });
      } else {
        throw redirect(303, "/");
      }
    } else {
      return fail(400, { message: { success: false, display: "Neplatný poskytovatel." } });
    } */
