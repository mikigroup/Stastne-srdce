import { fail, redirect } from "@sveltejs/kit";
import type { Actions } from "./$types";

export const actions: Actions = {
  resetPass: async ({ request, locals: { supabase } }) => {
    const formData = await request.formData();    
    const password = formData.get("password") as string;
    const new_password = formData.get("newpassword") as string;
    console.log(password, new_password)

    if (password !== new_password) {
      return fail(400, { message: { success: false, display: "Hesla nejsou stejná" } });
    } else {
      const { error } = await supabase.auth.updateUser({ password: new_password });
      if (error) {
      console.error(error);
      return fail(400, { message: { success: false, display: "Email není evidován." } });
    } else {
        return { message: { success: true, display: "Heslo změněno" }};
    }
    }    
  },
};
