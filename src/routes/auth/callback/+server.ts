import { redirect, type RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ url, locals: { supabase } }) => {
  const code = url.searchParams.get('code') as string;
  const next = url.searchParams.get('next') ?? '/reset';

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Přesměrujte na stránku pro resetování hesla po úspěšném vyměnění kódu za session
      throw redirect(303, next);
    }
  }

  // Pokud není kód poskytnut nebo dojde k chybě, přesměrujte na domovskou stránku
  throw redirect(303, '/');
};

/* import { redirect, type RequestHandler } from '@sveltejs/kit'

export const GET: RequestHandler = async ({ url, locals: { supabase } }) => {
  const code = url.searchParams.get('code')

  if (code) {
    await supabase.auth.exchangeCodeForSession(code)
  }

  throw redirect(303, '/')
}
 */