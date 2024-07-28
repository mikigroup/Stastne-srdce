import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals: { supabase }, params }) => { 
    const id = params.orderId;
    // console.log("params.orderId:", params.orderId);
    
    const { data: orders, error } = await supabase
      .from("orders")
      .select(
        "*"
      )
      .eq("id", id)
      .single();    
    if (error) {
      console.error("Error fetching orders:", error);
      throw error;
    }
    return { orders };
};



