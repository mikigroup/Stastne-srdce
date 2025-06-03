import type { SupabaseClient, User, Session } from "@supabase/supabase-js";

export interface Profile {
	id: string;
	email: string;
	first_name: string;
	last_name: string;
	telephone?: string;
	created_at: string;
	orders?: { count: number }[];
	orders_count?: number;
}

export interface PageData {
	session: Session | null;
	supabase: SupabaseClient;
	user: User | null;
	settings: any;
	generalSettings: any;
} 