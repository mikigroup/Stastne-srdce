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
    }

    // Nejprve zkontrolujeme, zda e-mail již neexistuje
    const { data: existingUser } = await supabase
      .from('profiles')  // nebo jiná tabulka, kde ukládáte uživatelské profily
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return fail(400, { message: { success: false, display: "Tento e-mail je již registrován." } });
    }

    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      console.error('Chyba při registraci uživatele:', error.message);
      return fail(400, { message: { success: false, display: "Chyba při registraci: " + error.message } });
    }

    if (data && data.user) {
      if (data.user.identities && data.user.identities.length === 0) {
        // Toto naznačuje, že uživatel již existuje (další kontrola)
        return fail(400, { message: { success: false, display: "Tento e-mail je již registrován." } });
      }

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
  },
};