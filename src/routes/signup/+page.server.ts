import { fail } from "@sveltejs/kit";
import type { Actions } from "./$types";
import { sendEmail } from "$lib/email";

export const actions = {
	signUp: async ({ request, locals: { supabase } }) => {
		try {
			const formData = await request.formData();
			const email = formData.get("email")?.toString();
			const password = formData.get("password")?.toString();
			const repassword = formData.get("repassword")?.toString();

			// Validace vstupů
			if (!email || !password || !repassword) {
				return fail(400, {
					error: true,
					message: "Vyplňte prosím všechna pole",
					email
				});
			}

			if (password !== repassword) {
				return fail(400, {
					error: true,
					message: "Hesla se neshodují",
					email
				});
			}

			// Supabase registrace
			const { data: userData, error } = await supabase.auth.signUp({
				email,
				password,
				options: {
					emailRedirectTo: `${new URL(request.url).origin}/auth/callback`
				}
			});

			if (error) {
				return fail(400, {
					error: true,
					message:
						error.message === "User already registered"
							? "Tento email je již registrován"
							: "Chyba při registraci",
					email
				});
			}

			// Odeslání follow-up emailu pro dokončení registrace
			await sendEmail({
				to: email,
				subject: "Dokončete svou registraci",
				html: `
					<h1>Vítejte v našem e-shopu!</h1>
					<p>Děkujeme za registraci. Pro plné využití všech funkcí je potřeba dokončit registraci.</p>
					<p>Klikněte na tlačítko níže pro dokončení registrace:</p>
					<a href="${new URL(request.url).origin}/signup/complete" style="
						display: inline-block;
						padding: 12px 24px;
						background-color: #4CAF50;
						color: white;
						text-decoration: none;
						border-radius: 4px;
						margin: 20px 0;
					">
						Dokončit registraci
					</a>
					<p>Pokud tlačítko nefunguje, zkopírujte tento odkaz do prohlížeče:</p>
					<p>${new URL(request.url).origin}/signup/complete</p>
				`
			});

			// Úspěšná registrace
			return {
				success: true,
				error: false,
				message: `Na emailovou adresu ${email} byla odeslána zpráva pro potvrzení registrace. Pro dokončení registrace prosím potvrďte odkaz ve zprávě.`
			};
		} catch (error) {
			console.error("Unexpected error:", error);
			return fail(500, {
				error: true,
				message: "Došlo k neočekávané chybě"
			});
		}
	}
} satisfies Actions;
