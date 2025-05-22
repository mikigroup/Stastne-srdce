import { createClient } from '@supabase/supabase-js';
import type { Database } from './types/database.types';
import type { FakturoidTables } from './types/fakturoid';

// Rozšíření typu Database o Fakturoid tabulky
export type TypedSupabaseClient = ReturnType<typeof createClient<Database & { public: FakturoidTables }>>;

// Získání URL a klíče ze správných zdrojů na základě prostředí
function getSupabaseCredentials() {
    // V prohlížeči použijeme import.meta.env, v Node.js process.env
    const url = typeof window !== 'undefined' 
        ? import.meta.env.VITE_SUPABASE_URL 
        : process.env.VITE_SUPABASE_URL;
    
    const key = typeof window !== 'undefined'
        ? import.meta.env.VITE_SUPABASE_ANON_KEY
        : process.env.VITE_SUPABASE_ANON_KEY;
    
    if (!url || !key) {
        console.error('Supabase credentials not found in environment variables');
        // V produkčním prostředí použít alternativní strategii nebo vyhodit chybu
        // V vývojovém prostředí můžeme použít dummy hodnoty pro inicializaci
        if (process.env.NODE_ENV === 'development') {
            return { 
                url: 'https://example.supabase.co', 
                key: 'dummy-key-for-development-only'
            };
        }
        throw new Error('Missing Supabase environment variables');
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

