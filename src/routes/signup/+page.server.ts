import { redirect, fail } from "@sveltejs/kit";
import type { Actions } from "./$types";

export const actions: Actions = {
  signUp: async ({ request, locals: { supabase } }) => {
    const formData = await request.formData();
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const repassword = formData.get("repassword") as string;

    if (password !== repassword) {
      return fail(400, { message: { success: false, display: "Hesla nejsou stejná" } });
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password });

      if (error) {
        console.error('Chyba při registraci uživatele:', error.message);
        // Zde můžete přidat specifičtější chybové zprávy podle typu chyby
        if (error.message.includes("User already registered")) {
          return fail(400, { message: { success: false, display: "Tento e-mail je již registrován." } });
        }
        return fail(400, { message: { success: false, display: "Chyba při registraci: " + error.message } });
      } else if (data && data.user) {
        console.log('Registrovaný uživatel:', data.user);
        return {
          message: {
            success: true,
            display: "Na Vaši emailovou schránku byla odeslána zpráva. Prosím potvrďte ji a následně se přihlašte."
          }
        };
      } else {
        return fail(500, { message: { success: false, display: "Neočekávaná chyba při registraci." } });
      }
    }
  },
};