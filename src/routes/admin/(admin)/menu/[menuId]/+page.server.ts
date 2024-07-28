import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals: { supabase }, params }) => { 
  const id = params.menuId;
    // console.log("params.orderId:", params.orderId);
    
    const { data: menus, error } = await supabase
      .from("menus")
      .select("*")
      .eq("id", id)
      .single();    
    if (error) {
      console.error("Error fetching orders:", error);
      throw error;
    }
  return { menus };
};



