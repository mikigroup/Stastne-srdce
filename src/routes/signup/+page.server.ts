import { redirect, fail } from "@sveltejs/kit";
import type { Actions } from "./$types";

export const actions: Actions = {
signUp: async ({ request, locals: { supabase } }) => {
    const formData = await request.formData()
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const repassword = formData.get("repassword") as string

   if (password !== repassword) {
      return fail(400, { message: { success: false, display: "Hesla nejsou stejná" } });
    } else {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) {
      console.error(error);
      return fail(400, { message: { success: false, display: "Chyba" } });
    } else {
        redirect(303, "/jidelnicek");
    }
     }
      }
};



