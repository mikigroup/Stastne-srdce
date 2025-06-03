import { createClient } from '@supabase/supabase-js';
import type { Database } from './types/database.types';
import type { FakturoidTables } from './types/fakturoid';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

// Rozšíření typu Database o Fakturoid tabulky
export type TypedSupabaseClient = ReturnType<typeof createClient<Database & { public: FakturoidTables }>>;

// Vytvoření Supabase klienta pomocí veřejných proměnných
function getSupabaseCredentials() {
    const url = PUBLIC_SUPABASE_URL;
    const key = PUBLIC_SUPABASE_ANON_KEY;
    
    if (!url || !key) {
        console.error('Supabase credentials not found in environment variables');
        throw new Error('Missing Supabase environment variables (PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY)');
    }
    
    return { url, key };
}

// Vytvoříme klienta s kontrolou proměnných
const { url: supabaseUrl, key: supabaseAnonKey } = getSupabaseCredentials();

export const supabase = createClient<Database & { public: FakturoidTables }>(
    supabaseUrl,
    supabaseAnonKey,
    {
        auth: {
            autoRefreshToken: true,
            persistSession: true
        }
    }
);

// Export funkce pro kontrolu proměnných za běhu (ne při buildu)
export function ensureEnvironmentVariables() {
    const { url, key } = getSupabaseCredentials();
    if (!url || !key) {
        throw new Error('Missing Supabase environment variables');
    }
} 

