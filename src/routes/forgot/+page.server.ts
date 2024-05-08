import { fail, redirect } from "@sveltejs/kit";
import type { Actions } from "./$types";

export const actions: Actions = {
  resetRequest: async ({ request, locals: { supabase } }) => {
    const formData = await request.formData();
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) {
      console.error(error);
      return fail(400, { message: { success: false, display: "Vyskytla se chyba." } });
    } else {
      return { message: { success: true, display: "Do emailové schránky jsme ti poslali instrukce" }};
    }
  }
};
