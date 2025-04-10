import { error, fail, redirect } from "@sveltejs/kit";
import type { Actions } from "./$types";
import { createClient } from "@supabase/supabase-js";

// Konfigurace Supabase Admin klienta pro přístup k administrativním funkcím
const supabaseAdmin = createClient(
	"https://orgshebezwfizhmlmeum.supabase.co",
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9yZ3NoZWJlendmaXpobWxtZXVtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY1ODYwMzM2MywiZXhwIjoxOTc0MTc5MzYzfQ.EyvC4bM8tO3JtdTBm5AEYXdOQQxn7v6_uKkqxu9xoDk"
);

// Funkce pro odesílání vlastních e-mailů
async function sendCustomEmail(to: string, subject: string, body: string) {
	try {
		// Konfigurace transporteru pro odesílání e-mailů
		const transporter = await import("nodemailer").then((nodemailer) =>
			nodemailer.createTransport({
				host: "smtp.seznam.cz",
				port: 465,
				secure: true,
				auth: {
					user: "info@stastnesrdce.cz",
					pass: "#QFUtwxDsQW5LEDT"
				}
			})
		);

		// Nastavení e-mailu
		const mailOptions = {
			from: "info@stastnesrdce.cz",
			to: to,
			subject: subject,
			html: body
		};

		// Odeslání e-mailu
		await transporter.sendMail(mailOptions);
		console.log("E-mail odeslán na adresu:", to);
		return true;
	} catch (err) {
		console.error("Chyba při odesílání e-mailu:", err);
		return false;
	}
}

export const actions: Actions = {
	resetRequest: async ({ request, url, locals: { supabase } }) => {
		const formData = await request.formData();
		const email = (formData.get("email") as string).toLowerCase().trim();

		if (!email || !email.includes("@")) {
			return fail(400, {
				message: {
					success: false,
					display: "Prosím zadejte platný email"
				},
				email
			});
		}

		console.log(`Ověřuji existenci emailu: ${email}`);

		// 1. Nejprve ověříme, jestli email existuje v autentizačním systému Supabase
		try {
			// Pokusíme se použít standardní metodu pro reset hesla,
			// která automaticky ověří, zda email existuje
			const { error: resetError } = await supabase.auth.resetPasswordForEmail(
				email,
				{
					redirectTo: `${url.origin}/reset-password`
				}
			);

			// Pokud resetPasswordForEmail vrátí chybu, email pravděpodobně neexistuje
			if (resetError) {
				console.error("Chyba při resetování hesla:", resetError);

				// Nyní zkontrolujeme, zda je email v tabulce profiles
				const { data: profileData, error: profileError } = await supabase
					.from("profiles")
					.select("id, email")
					.eq("email", email)
					.single();

				console.log("Výsledek hledání v profiles:", profileData, profileError);

				if (profileError || !profileData) {
					// Zkusíme ještě hledat v dalších tabulkách, pokud existují
					const { data: customerData, error: customerError } = await supabase
						.from("customers")
						.select("id, email")
						.eq("email", email)
						.single();

					console.log(
						"Výsledek hledání v customers:",
						customerData,
						customerError
					);

					if (customerError || !customerData) {
						// Email nebyl nalezen nikde
						return fail(400, {
							message: {
								success: false,
								display: "Tento email není zaregistrován v našem systému."
							},
							email
						});
					}
				}

				// Pokud jsme se dostali sem, email existuje v některé tabulce,
				// ale ne v auth systému - použijeme admin API
				const { data, error } = await supabaseAdmin.auth.admin.generateLink({
					type: "recovery",
					email: email,
					options: {
						redirectTo: `${url.origin}/reset`
					}
				});

				if (error) {
					console.error("Chyba při generování odkazu pro reset hesla:", error);
					return fail(500, {
						message: {
							success: false,
							display:
								"Vyskytla se chyba při generování odkazu pro reset hesla."
						},
						email
					});
				}

				// Získáme resetovací odkaz z odpovědi
				const resetLink = data.properties.action_link;

				// Vytvoříme vlastní šablonu e-mailu
				const emailBody = `
          <p>Dobrý den,</p>
          <p>obdrželi jsme žádost o resetování hesla k Vašemu účtu na stránce stastnesrdce.cz.
          Pokud jste o změnu hesla skutečně požádal(a), klikněte prosím na tlačítko níže.</p>
          <p>Pokud jste o změnu hesla nežádal(a), ignorujte prosím tento e-mail. Vaše stávající heslo zůstane aktivní.</p>
          <p style="margin: 30px 0; text-align: center;">
            <a href="${resetLink}" style="background-color: #4CAF50; color: white; padding: 15px 32px; text-align: center; text-decoration: none; display: inline-block; font-size: 16px; border-radius: 5px;">
              Resetovat heslo
            </a>
          </p>
          <p>Při vytváření nového hesla doporučujeme:</p>
          <ul>
            <li>heslo by mělo mít alespoň 8 znaků</li>
            <li>použijte kombinaci malých a velkých písmen, číslic a symbolů</li>
            <li>nepoužívejte snadno odhadnutelná hesla</li>
          </ul>
          <p>S pozdravem,<br>Tým Šťastné srdce</p>
        `;

				// Odešleme vlastní e-mail
				const emailSent = await sendCustomEmail(
					email,
					"Reset hesla pro Šťastné srdce",
					emailBody
				);

				if (!emailSent) {
					return fail(500, {
						message: {
							success: false,
							display:
								"Vyskytla se chyba při odesílání e-mailu pro reset hesla."
						},
						email
					});
				}
			}

			// Pokud jsme došli sem, e-mail pro reset hesla byl úspěšně odeslán
			return {
				message: {
					success: true,
					display: 'Do emailové schránky jsme ti poslali instrukce."'
				},
				email
			};
		} catch (error) {
			console.error("Nečekaná chyba při resetu hesla:", error);
			return fail(500, {
				message: {
					success: false,
					display: "Vyskytla se nečekaná chyba. Zkuste to prosím později."
				},
				email
			});
		}
	}
};

/*export const actions: Actions = {
	resetRequest: async ({ request, locals: { supabase } }) => {
		const formData = await request.formData();
		const email = formData.get("email") as string;

		const { data: customer, error: customerError } = await supabase
			.from("profiles")
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
};*/
