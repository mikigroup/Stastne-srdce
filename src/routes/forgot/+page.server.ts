import { error, fail, redirect } from "@sveltejs/kit";
import type { Actions } from "./$types";
import nodemailer from "nodemailer";
import { createClient } from "@supabase/supabase-js";

const transporter = nodemailer.createTransport({
	host: "smtp.seznam.cz",
	port: 465,
	secure: true,
	auth: {
		user: "info@stastnesrdce.cz",
		pass: "#QFUtwxDsQW5LEDT"
	}
});

const supabaseAdmin = createClient(
	"https://orgshebezwfizhmlmeum.supabase.co",
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9yZ3NoZWJlendmaXpobWxtZXVtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY1ODYwMzM2MywiZXhwIjoxOTc0MTc5MzYzfQ.EyvC4bM8tO3JtdTBm5AEYXdOQQxn7v6_uKkqxu9xoDk"
);

async function sendCustomEmail(to: string, subject: string, body: string) {
	const options = {
		from: "info@stastnesrdce.cz",
		to: to,
		subject: subject,
		html: body
	};

	try {
		await transporter.sendMail(options);
		console.log("E-mail odeslán na adresu:", to);
	} catch (err: unknown) {
		console.error("Chyba při odesílání e-mailu:", err);
		throw error(500, "Chyba při odesílání e-mailu");
	}
}

export const actions: Actions = {
	resetRequest: async ({ request, locals: { supabase } }) => {
		const formData = await request.formData();
		const email = formData.get("email") as string;

		const { data: customer, error: customerError } = await supabase
			.from("customers")
			.select("id")
			.eq("email", email)
			.single();

		if (customerError && customerError.code !== "PGRST116") {
			console.error(customerError);
			return fail(400, {
				message: {
					success: false,
					display: "Vyskytla se chyba při získávání informací o zákazníkovi."
				}
			});
		}

		let emailOptions = {};

		if (customer) {
			emailOptions = {
				emailSubject: "Reset hesla pro zákazníka",
				emailBody: `
          <p>Dobrý den,</br>
          obdrželi jsme žádost o resetování hesla k Vašemu účtu na stránce stastnesrdce.cz.
          Pokud jste o změnu hesla skutečně požádal(a), klikněte prosím na tlačítko níže.
          Pokud jste o změnu hesla nežádal(a), ignorujte prosím tento e-mail. Vaše stávající heslo zůstane aktivní.</p>
          </br>
          <p>Při vytváření nového hesla mějte prosím na paměti následující doporučení:
          heslo by mělo mít alespoň 8 znaků, použijte kombinaci malých a velkých písmen, číslic a symbolů,
          nepoužívejte snadno odhadnutelná hesla jako "12345678" nebo "heslo".</p>
          </br>
          <p><a href="{{ .RedirectTo }}/auth/callback?token_hash={{ .TokenHash }}&type=recovery">Resetovat heslo</a></p>
          </br>
          <p>Pokud máte jakékoliv dotazy nebo potřebujete další pomoc, neváhejte se na nás obrátit.</p>
          </br>
          <p>S pozdravem,</br>
          Šťastné srdce</p>
        `
			};
		} else {
			const { data: profile, error: profileError } = await supabase
				.from("profiles")
				.select("id")
				.eq("email", email)
				.single();

			if (profileError && profileError.code !== "PGRST116") {
				console.error(profileError);
				return fail(400, {
					message: {
						success: false,
						display: "Vyskytla se chyba při získávání informací o profilu."
					}
				});
			}

			if (profile) {
				emailOptions = {
					emailSubject: "Reset hesla pro profil",
					emailBody: `
            <p>Dobrý den,</br>
            obdrželi jsme žádost o resetování hesla k Vašemu účtu na stránce stastnesrdce.cz.
            Pokud jste o změnu hesla skutečně požádal(a), klikněte prosím na tlačítko níže.
            Pokud jste o změnu hesla nežádal(a), ignorujte prosím tento e-mail. Vaše stávající heslo zůstane aktivní.</p>
            </br>
            <p>Při vytváření nového hesla mějte prosím na paměti následující doporučení:
            heslo by mělo mít alespoň 8 znaků, použijte kombinaci malých a velkých písmen, číslic a symbolů,
            nepoužívejte snadno odhadnutelná hesla jako "12345678" nebo "heslo".</p>
            </br>
            <p><a href="{{ .RedirectTo }}/auth/callback?token_hash={{ .TokenHash }}&type=recovery">Resetovat heslo</a></p>
            </br>
            <p>Pokud máte jakékoliv dotazy nebo potřebujete další pomoc, neváhejte se na nás obrátit.</p>
            </br>
            <p>S pozdravem,</br>
            Šťastné srdce</p>
          `
				};
			}
		}

		if (Object.keys(emailOptions).length === 0) {
			return fail(400, {
				message: {
					success: false,
					display: "E-mail není registrován."
				}
			});
		}

		const { data, error } = await supabaseAdmin.auth.admin.generateLink({
			type: "recovery",
			email: email,
			options: {
				redirectTo: emailOptions.redirectTo
			}
		});

		if (error) {
			console.error(error);
			return fail(400, {
				message: {
					success: false,
					display: "Vyskytla se chyba při generování odkazu pro reset hesla."
				}
			});
		}

		const resetLink = data.properties.action_link;
		const emailBody = emailOptions.emailBody.replace(
			"{{ .RedirectTo }}/auth/callback?token_hash={{ .TokenHash }}&type=recovery",
			resetLink
		);

		await sendCustomEmail(email, emailOptions.emailSubject, emailBody);

		return {
			message: {
				success: true,
				display: "Do emailové schránky jsme ti poslali instrukce."
			}
		};
	}
};
