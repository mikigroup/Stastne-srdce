import { getServerSession } from '@supabase/auth-helpers-sveltekit';
import { redirect } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';
import { PRIVAT_SUPABASE_URL } from "$env/static/private";

export const load = async (event) => {
  // Získání session informací
  const session = await getServerSession(event);

  // Kontrola cookies pro přesměrování
  if (event.cookies.get('allowed')) {
    throw redirect(307, '/');
  }

  return { session };
};

export const actions = {
  default: async ({ request, cookies }) => {
    const data = await request.formData();

    if (data.get('passphrase') === PASSPHRASE) {
      cookies.set('allowed', 'true', {
        path: '/',
      });

      throw redirect(303, '/welcome');
    }

    return fail(403, {
      incorrect: true,
    });
  },
};