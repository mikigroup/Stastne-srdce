import { fail, redirect } from "@sveltejs/kit";
import type { Actions } from "./$types";

export const actions: Actions = {
	resetRequest: async ({ request, locals: { supabase } }) => {
		const formData = await request.formData();
		const email = formData.get("email") as string;

		// Získejte informace o uživateli na základě e-mailu
		const { data: user, error: userError } = await supabase
			.from("users")
			.select("role")
			.eq("email", email)
			.single();

		if (userError) {
			console.error(userError);
			return fail(400, {
				message: {
					success: false,
					display: "Vyskytla se chyba při získávání informací o uživateli."
				}
			});
		}

		const userRole = user.role;

		let emailSubject = "";
		let emailBody = "";
		if (userRole === "admin") {
			emailSubject = "Reset hesla pro administrátora";
			emailBody =
				"Vážený administrátore,\n\nObdrželi jsme požadavek na reset vašeho hesla. Klikněte na následující odkaz pro reset hesla:\n\n{{ .ConfirmationURL }}\n\nPokud jste o reset hesla nežádali, můžete tento e-mail ignorovat.\n\nS pozdravem,\nVáš tým";
		} else if (userRole === "customer") {
			emailSubject = "Reset hesla pro zákazníka";
			emailBody =
				"Vážený zákazníku,\n\nObdrželi jsme požadavek na reset vašeho hesla. Klikněte na následující odkaz pro reset hesla:\n\n{{ .ConfirmationURL }}\n\nPokud jste o reset hesla nežádali, můžete tento e-mail ignorovat.\n\nS pozdravem,\nVáš tým";
		}

		const { error } = await supabase.auth.resetPasswordForEmail(email, {
			redirectTo: "https://example.com/reset",
			emailSubject,
			emailBody
		});

		if (error) {
			console.error(error);
			return fail(400, {
				message: {
					success: false,
					display: "Vyskytla se chyba při zasílání e-mailu pro reset hesla."
				}
			});
		} else {
			return {
				message: {
					success: true,
					display: "Do emailové schránky jsme ti poslali instrukce."
				}
			};
		}
	}
};
