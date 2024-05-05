/* import { redirect } from '@sveltejs/kit'
import type { Actions } from '../auth/$types'

export const actions: Actions = {
  signup: async ({ request, locals: { supabase } }) => {
    const formData = await request.formData()
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { error } = await supabase.auth.signUp({ email, password })
    if (error) {
      console.error(error)
      return redirect(303, '/auth/error')
    } else {
      return redirect(303, '/')
    }
  },
  login: async ({ request, locals: { supabase } }) => {
    const formData = await request.formData()
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      console.error(error)
      return redirect(303, '/auth/error')
    } else {
      return redirect(303, '/private')
    }
  },
} */

/* import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
  const { data: profiles } = await supabase.from('profiles')
				.select(
					`username, website, avatar_url, first_name, last_name, telephone, company_name, street, street_number, city, ico, dic, company`
				)
				.eq('id', locals.user.id)
				.single()
  return { profiles: profiles ?? []
   }
} */


// import type { PageServerLoad } from './$types'
/* export const load: PageServerLoad = async ({ locals }) => {
 const { supabase, user } = locals;
 try {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select(
        `username, website, avatar_url, first_name, last_name, telephone, company_name, street, street_number, city, ico, dic, company`
      )
      .eq('id', user.id)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return {
      props: {
        profiles: profiles ?? [],
      },
    };
 } catch (error) {
    return {
        error: error.message,
    };
 }
};
 */


import { error, fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
// import { setError, superValidate } from "sveltekit-superforms/server";
// import { emailSchema, passwordSchema, profileSchema } from "$lib/schemas";
//import { getSubscriptionTier } from "$lib/server/subscriptions";
//import { handleLoginRedirect } from "$lib/helpers";

export const load: PageServerLoad = async (event) => {
	const session = await event.locals.getSession();
	
	async function getUserProfile() {
		const { error: profileError, data: profile } = await event.locals.supabase
			.from("profiles")
			.select("*")
			.limit(1)
			.single();

		if (profileError) {
			throw error(500, "Error retreiving your profile, please try again later.");
		}
		return profile;
	}
};

/* export const actions: Actions = {
	updateProfile: async (event) => {
		const session = await event.locals.getSession();
		if (!session) {
			throw error(401, "Unauthorized");
		}

		const profileForm = await superValidate(event, profileSchema, {
			id: "profile"
		});

		if (!profileForm.valid) {
			return fail(400, {
				profileForm
			});
		}

		const { error: profileError } = await event.locals.supabase
			.from("profiles")
			.update(profileForm.data)
			.eq("id", session.user.id);

		if (profileError) {
			return setError(profileForm, null, "Error updating your profile.");
		}

		return {
			profileForm
		};
	},
	updateEmail: async (event) => {
		const session = await event.locals.getSession();
		if (!session) {
			throw error(401, "Unauthorized");
		}

		const emailForm = await superValidate(event, emailSchema, {
			id: "email"
		});

		if (!emailForm.valid) {
			return fail(400, {
				emailForm
			});
		}

		const { error: emailError } = await event.locals.supabase.auth.updateUser({
			email: emailForm.data.email
		});

		if (emailError) {
			return setError(emailForm, "email", "Error updating your email.");
		}

		return {
			emailForm
		};
	},
	updatePassword: async (event) => {
		const session = await event.locals.getSession();
		if (!session) {
			throw error(401, "Unauthorized");
		}

		const passwordForm = await superValidate(event, passwordSchema, {
			id: "password"
		});

		if (!passwordForm.valid) {
			return fail(400, {
				passwordForm
			});
		}

		if (passwordForm.data.password !== passwordForm.data.passwordConfirm) {
			return setError(passwordForm, "passwordConfirm", "Passwords must match");
		}

		const { error: passwordError } = await event.locals.supabase.auth.updateUser({
			password: passwordForm.data.password
		});

		if (passwordError) {
			return setError(passwordForm, null, "Error updating your password");
		}
		return {
			passwordForm
		};
	}
}; */