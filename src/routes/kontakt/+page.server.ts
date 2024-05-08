import { fail } from "@sveltejs/kit";
import type { Actions } from "./$types";
import { render } from "svelte-email";
import Hello from "./Hello.svelte";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.seznam.cz",
  port: 465,
  secure: true,
  auth: {
    user: "your_email@seznam.cz",
    pass: "your_password"
  }
});

export const actions: Actions = {
  sendForm: async ({ request }) => {
    const formData = await request.formData();
    const email = formData.get("email") as string;
    const name = formData.get("name") as string;
    const message = formData.get("message") as string;

    const emailHtml = render({
      template: Hello,
      props: {
        name: name
      }
    });

    const options = {
      from: "your_email@seznam.cz",
      to: email,
      subject: "Nová zpráva z formuláře",
      html: emailHtml
    };

    try {
      await transporter.sendMail(options);
      console.log("E-mail odeslán na adresu:", email);
      return { success: true };
    } catch (error) {
      console.error("Chyba při odesílání e-mailu:", error);
      return fail(500, { message: "Chyba při odesílání e-mailu" });
    }
  },
};
