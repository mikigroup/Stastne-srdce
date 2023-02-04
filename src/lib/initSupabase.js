import { createClient } from "@supabase/supabase-js";

/* const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; */

const supabaseUrl = 'https://orgshebezwfizhmlmeum.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9yZ3NoZWJlendmaXpobWxtZXVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NTg2MDMzNjMsImV4cCI6MTk3NDE3OTM2M30.0LA1TPH2v93s10ChjJiX6iTX4LSXMsWOe3MTTxb5_74'

const options = {
    schema: 'public',
    headers: { 'x-my-custom-header': 'stastne srdce' },
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  };

export const supabase = createClient(supabaseUrl, supabaseAnonKey, options);