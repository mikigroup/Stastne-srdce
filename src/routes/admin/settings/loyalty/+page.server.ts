import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
  const session = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error("Unauthorized");
  }

  return {
    supabase,
    session
  };
}; 