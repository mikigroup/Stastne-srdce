import { redirect, type RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ url, locals: { supabase } }) => {
  const code = url.searchParams.get('code') as string;
  const next = url.searchParams.get('next') ?? '/reset';

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {      
      throw redirect(303, next);
    }
  }
  
  throw redirect(303, '/');
};
