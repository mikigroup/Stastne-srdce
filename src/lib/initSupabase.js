//V2
// import { createClient } from "@supabase/supabase-js";
// import { env } from '$env/dynamic/public'
// import { NEXT_PUBLIC_SUPABASE_URL } from '$env/static/public';

/* const supabaseUrl = import.meta.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; */

/* const supabaseUrl = 'https://orgshebezwfizhmlmeum.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9yZ3NoZWJlendmaXpobWxtZXVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NTg2MDMzNjMsImV4cCI6MTk3NDE3OTM2M30.0LA1TPH2v93s10ChjJiX6iTX4LSXMsWOe3MTTxb5_74'

const options = {
    db: {
      schema: 'public',
    },
    auth: {      
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  };


export const supabase = createClient(supabaseUrl, supabaseAnonKey, options); */


// test
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public';
import { dev } from '$app/environment';
import { page } from '$app/stores';

/* v2 supabase-js */
export const supabaseClient = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);

export let supabaseServerClient;
export const createSupabaseServerClient = (access_token) => {
  supabaseServerClient = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
    global: {
      headers: { 'Authorization': `Bearer ${access_token}` }
    }
  })
};

export const signIn = async () => {
  try {
    /*
    ** if logging in on a page other than `/`:
    ** to prevent a flash of content after login,
    ** set redirectTo equal to your app's login page
    */

    /* v2 supabase-js */


    const { error } = await supabaseClient.auth.signInWithOAuth(
      { provider: 'google', 
        options: { redirectTo: `{$page.path}:${dev ? 5173 : 4173}/` }
      }
    )
    /* v1 supabase-js */
    // const { error } = await supabaseClient.auth.signIn(
    //   { provider }, 
    //   { redirectTo: `${PUBLIC_BASE_URL}:${dev ? 5173 : 4173}/login` }
    // )
    if (error) console.error(error)
  } catch (err) {
    console.error(err)
  }
}

export const signOut = async () => {
  try {
    const { error } = await supabaseClient.auth.signOut()
    if (error) console.error(error)
  } catch (err) {
    console.error(err)
  }
}

let loading = false;
export const updateProfile = async () =>{
    try {
      loading = true;
      /* const user = supabaseClient.auth.user(); */

      const updates = {
        id: $session.id,
        first_name,
        last_name,
        telephone,
        company_name,
        street,
        street_number,
        city,
        avatar_url,
        ico,
        dic,
        company,
        updated_at: new Date(),
      };

      let { error } = await supabaseClient.from("profile").upsert(updates, {
        returning: "minimal", // Don't return the value after inserting
      });

      if (error) throw error;
    } catch (error) {
      alert(error.message);
    } finally {
      loading = false;
    }
  }