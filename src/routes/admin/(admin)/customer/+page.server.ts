import { fail, redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals: { supabase, session } }) => {
  const { data: customers, error } = await supabase
    .from("customers")
    .select("first_name, last_name, telephone, street, city, street_number, zip_code, email, id")    
    ;  
  if (error) {
    console.error("Error fetching customers:", error);
    throw error;
  }

  const { data: profileTableSettings } = await supabase
    .from("profiles")
    .select("table_settings_customers")
    .eq("id", session?.user.id)
    .single();
  if (error) {
    console.error("Error fetching profile:", error);
    throw error;
  }
  return { customers, profileTableSettings };
};
