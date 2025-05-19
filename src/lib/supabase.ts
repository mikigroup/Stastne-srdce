import { createClient } from '@supabase/supabase-js';
import type { Database } from './types/database.types';
import type { FakturoidTables } from './types/fakturoid';

// Rozšíření typu Database o Fakturoid tabulky
export type TypedSupabaseClient = ReturnType<typeof createClient<Database & { public: FakturoidTables }>>;

// Použití process.env umožňuje přístup v Node.js i v prohlížeči
const supabaseUrl = process.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;

// Vytvoříme klienta i bez proměnných (budou kontrolovány při volání)
export const supabase = createClient<Database & { public: FakturoidTables }>(
    supabaseUrl || 'https://placeholder-url.supabase.co',
    supabaseAnonKey || 'placeholder-key',
    {
        auth: {
            autoRefreshToken: true,
            persistSession: true
        }
    }
);

// Export funkce pro kontrolu proměnných za běhu (ne při buildu)
export function ensureEnvironmentVariables() {
    if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Missing Supabase environment variables');
    }
} 

