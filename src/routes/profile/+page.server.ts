/* import { redirect } from "@sveltejs/kit"
import type { Actions } from "../auth/$types"

export const actions: Actions = {
  signup: async ({ request, locals: { supabase } }) => {
    const formData = await request.formData()
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    const { error } = await supabase.auth.signUp({ email, password })
    if (error) {
      console.error(error)
      return redirect(303, "/auth/error")
    } else {
      return redirect(303, "/")
    }
  },
  login: async ({ request, locals: { supabase } }) => {
    const formData = await request.formData()
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      console.error(error)
      return redirect(303, "/auth/error")
    } else {
      return redirect(303, "/private")
    }
  },
} */




/* import type { PageServerLoad } from "./$types"

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
  const { data: profiles } = await supabase.from("profiles")
				.select(
					`username, website, avatar_url, first_name, last_name, telephone, company_name, street, street_number, city, ico, dic, company`
				)
				.eq("id", locals.user.id)
				.single()
  return { profiles: profiles ?? []
   }
} */


// import type { PageServerLoad } from "./$types"
/* export const load: PageServerLoad = async ({ locals }) => {
 const { supabase, user } = locals;
 try {
    const { data: profiles, error } = await supabase
      .from("profiles")
      .select(
        `username, website, avatar_url, first_name, last_name, telephone, company_name, street, street_number, city, ico, dic, company`
      )
      .eq("id", user.id)
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

import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals: { supabase, safeGetSession } }) => {
  const { session } = await safeGetSession();

  if (!session) {
    throw redirect(303, "/");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("username, first_name, last_name, telephone, street, street_number, city, ico, dic, company")
    .eq("id", session.user.id)
    .single();

  if (error) {
    console.error("Error fetching profile:", error);
  } else {
    console.log("TEST:", profile);
  }

  return { session, profile };
};

export const actions: Actions = {
  update: async ({ request, locals: { supabase, safeGetSession } }) => {
  const formData = await request.formData()
	let first_name = formData.get("first_name") as string
	let last_name = formData.get("last_name") as string
	let telephone = formData.get("telephone") as string
	let street = formData.get("street") as string
	let street_number =formData.get("street_number") as string 
	let city = formData.get("city") as string
	let ico = formData.get("ico") as string
	let dic = formData.get("dic") as string
  let company = formData.get("company") as string  
	let username = formData.get("username") as string
  const { session } = await safeGetSession()

/* 	    console.log('Form data in action:', {
      first_name,
      last_name,
      telephone,
      street,
      street_number,
      city,
      ico,
      dic,
      company,
      username
    });
 */
    const { error } = await supabase.from("profiles").upsert({
      id: session?.user.id,
      first_name,
			last_name,
			telephone,
			street,
			street_number,
			city,
			ico,
			dic,
			company,
      username,   
      updated_at: new Date(),
    })

    if (error) {
      return fail(500, {
      first_name,
			last_name,
			telephone,
			street,
			street_number,
			city,
			ico,
			dic,
			company,
      username,                 
      })    }

    return {
      first_name,
			last_name,
			telephone,
			street,
			street_number,
			city,
			ico,
			dic,
			company,
      username,      
    }
  },
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