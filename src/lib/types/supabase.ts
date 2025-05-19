import type { SupabaseClient } from '@supabase/supabase-js';

export interface Database {
    public: {
        Tables: {
            fakturoid_tokens: {
                Row: {
                    id: string;
                    customer_id: string;
                    access_token: string;
                    refresh_token: string;
                    expires_at: string;
                    created_at: string;
                    updated_at: string;
                };
                Insert: Omit<
                    Database['public']['Tables']['fakturoid_tokens']['Row'],
                    'id' | 'created_at' | 'updated_at'
                >;
                Update: Partial<
                    Database['public']['Tables']['fakturoid_tokens']['Insert']
                >;
            };
            fakturoid_auth_states: {
                Row: {
                    id: string;
                    state: string;
                    customer_id: string;
                    expires_at: string;
                    created_at: string;
                };
                Insert: Omit<
                    Database['public']['Tables']['fakturoid_auth_states']['Row'],
                    'id' | 'created_at'
                >;
                Update: Partial<
                    Database['public']['Tables']['fakturoid_auth_states']['Insert']
                >;
            };
        };
    };
}

export type TypedSupabaseClient = SupabaseClient<Database>; 