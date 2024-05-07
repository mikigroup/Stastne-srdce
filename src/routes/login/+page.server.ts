import { fail, redirect } from "@sveltejs/kit";
import type { Actions } from "./$types";

type Message = {
  success: boolean;
  display: string;
};

export const actions: Actions = {
  handleLogin: async ({ request, locals: { supabase } }) => {
    const formData = await request.formData();
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      console.error(error);
      return fail(400, { message: { success: false, display: error.message } as Message });
    } else {
      throw redirect(303, "/jidelnicek");
    }
  },
};
