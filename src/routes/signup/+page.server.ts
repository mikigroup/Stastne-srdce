import { fail } from "@sveltejs/kit";
import type { Actions } from "./$types";
import { sendEmail } from "$lib/email";
import * as yup from "yup";

// Yup schéma pro validaci registrace
const signUpSchema = yup.object({
	email: yup
		.string()
		.trim()
		.email("Zadejte platný email")
		.required("Email je povinný"),
	password: yup
		.string()
		.trim()
		.min(8, "Heslo musí mít alespoň 8 znaků")
		.matches(/[A-Z]/, "Heslo musí obsahovat alespoň jedno velké písmeno")
		.matches(/[0-9]/, "Heslo musí obsahovat alespoň jedno číslo")
		.required("Heslo je povinné"),
	repassword: yup
		.string()
		.trim()
		.oneOf([yup.ref("password")], "Hesla se neshodují")
		.required("Potvrzení hesla je povinné")
});

export const actions = {
	signUp: async ({ request, locals: { supabase } }) => {
		try {
			const formData = await request.formData();
			const email = formData.get("email")?.toString() || "";
			const password = formData.get("password")?.toString() || "";
			const repassword = formData.get("repassword")?.toString() || "";

			// Validace pomocí yup
			try {
				await signUpSchema.validate({ email, password, repassword }, { abortEarly: false });
			} catch (validationError) {
				if (validationError instanceof yup.ValidationError) {
					const errors = validationError.inner.reduce((acc, error) => {
						if (error.path) {
							acc[error.path] = error.message;
						}
						return acc;
					}, {} as Record<string, string>);

					return fail(400, {
						error: true,
						message: "Opravte prosím chyby ve formuláři",
						errors,
						email
					});
				}
			}

			// Supabase registrace s očištěnými daty
			const { data: userData, error } = await supabase.auth.signUp({
				email: email.trim(),
				password: password.trim(),
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
			// ZAKOMENTOVÁNO: Supabase automaticky posílá potvrzovací email
			// await sendEmail({
			// 	to: email.trim(),
			// 	subject: "Dokončete svou registraci",
			// 	html: `
			// 		<h1>Vítejte v našem e-shopu!</h1>
			// 		<p>Děkujeme za registraci. Pro plné využití všech funkcí je potřeba dokončit registraci.</p>
			// 		<p>Klikněte na tlačítko níže pro dokončení registrace:</p>
			// 		<a href="${new URL(request.url).origin}/signup/complete" style="
			// 			display: inline-block;
			// 			padding: 12px 24px;
			// 			background-color: #4CAF50;
			// 			color: white;
			// 			text-decoration: none;
			// 			border-radius: 4px;
			// 			margin: 20px 0;
			// 		">
			// 			Dokončit registraci
			// 		</a>
			// 		<p>Pokud tlačítko nefunguje, zkopírujte tento odkaz do prohlížeče:</p>
			// 		<p>${new URL(request.url).origin}/signup/complete</p>
			// 	`
			// });

			// Úspěšná registrace
			return {
				success: true,
				error: false,
				message: `Na emailovou adresu ${email.trim()} byla odeslána zpráva pro potvrzení registrace. Pro dokončení registrace prosím vyplňte všechna pole v profilu.`
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
