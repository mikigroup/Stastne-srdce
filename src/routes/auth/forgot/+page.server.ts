import { fail } from "@sveltejs/kit";
import type { Actions } from "./$types";
import { createClient } from "@supabase/supabase-js";
import { PRIVATE_seznam_key, PRIVATE_SBUrl, PRIVATE_ServiceKey } from "$env/static/private";
import nodemailer from "nodemailer";

const supabaseAdmin = createClient(PRIVATE_SBUrl, PRIVATE_ServiceKey, {
	auth: {
		autoRefreshToken: false,
		persistSession: false
	}
});

async function sendCustomEmail(to: string, subject: string, body: string) {
	try {
		const transporter = nodemailer.createTransport({
			host: "smtp.seznam.cz",
			port: 465,
			secure: true,
			auth: {
				user: "info@stastnesrdce.cz",
				pass: PRIVATE_seznam_key
			}
		});

		await transporter.sendMail({
			from: "info@stastnesrdce.cz",
			to,
			subject,
			html: body
		});

		return true;
	} catch (err) {
		console.error("Chyba při odesílání e-mailu:", err);
		return false;
	}
}

export const actions: Actions = {
	resetRequest: async ({ request, url }) => {
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

		try {
			const { data: profileData, error: profileError } = await supabaseAdmin
				.from("profiles")
				.select("id, email")
				.eq("email", email)
				.single();

			if (profileError || !profileData) {
				return fail(400, {
					message: {
						success: false,
						display: "Tento email není zaregistrován v našem systému."
					},
					email
				});
			}

			const { data, error } = await supabaseAdmin.auth.admin.generateLink({
				type: "recovery",
				email
			});

			if (error) {
				console.error("Chyba při generování odkazu pro reset hesla:", error);
				return fail(500, {
					message: {
						success: false,
						display: "Vyskytla se chyba při generování odkazu pro reset hesla."
					},
					email
				});
			}

			const originalLink = data.properties.action_link;
			const urlParams = new URL(originalLink).searchParams;
			const token_hash = urlParams.get("token_hash") || urlParams.get("token");

			if (!token_hash) {
				console.error("[FORGOT] Token not found in URL:", originalLink);
				return fail(500, {
					message: {
						success: false,
						display: "Vyskytla se chyba při generování odkazu pro reset hesla."
					},
					email
				});
			}

			const resetLink = `${url.origin}/auth/callback?token_hash=${token_hash}&type=recovery&next=/auth/reset`;

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

			const emailSent = await sendCustomEmail(
				email,
				"Reset hesla pro Šťastné srdce",
				emailBody
			);

			if (!emailSent) {
				return fail(500, {
					message: {
						success: false,
						display: "Vyskytla se chyba při odesílání e-mailu pro reset hesla."
					},
					email
				});
			}

			return {
				message: {
					success: true,
					display: "Do emailové schránky jsme ti poslali instrukce."
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
