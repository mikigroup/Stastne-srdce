import { redirect } from "@sveltejs/kit";
import type { Actions } from "./$types";

export const actions: Actions = {
  handleLogin: async ({ request, locals: { supabase } }) => {
    const formData = await request.formData()
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    // message = { success: true, display: 'Úspěšně zalogován' };   jak to dodělat do serverové funkce
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      console.error(error)
      return redirect(303, "/")
    } else {
      return redirect(303, "/jidelnicek")
    }
  },
}

