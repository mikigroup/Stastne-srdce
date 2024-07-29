import { fail, redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals: { supabase, session } }) => {
  const { data: menus, error } = await supabase
    .from("menus")
    .select("id, date, soup, price, variants, active, notes, type, nutri");

  if (error) {
    console.error("Error fetching daily menus:", error);
    throw error;
  }

  const { data: profileTableSettings } = await supabase
    .from("profiles")
    .select("table_settings_menus")
    .eq("id", session?.user.id)
    .single();

  if (error) {
    console.error("Error fetching profile:", error);
    throw error;
  }

  return { menus, profileTableSettings };
};