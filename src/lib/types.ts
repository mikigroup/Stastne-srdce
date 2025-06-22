import type { SupabaseClient, User, Session } from "@supabase/supabase-js";

export interface PageData {
	session: Session | null;
	supabase: SupabaseClient;
	user: User | null;
	settings: {
		general: {
			shopName: string;
			shortName: string;
			slogan: string;
			legalName: string;
		};
		[key: string]: any;
	};
	generalSettings: {
		shopName: string;
		shortName: string;
		slogan: string;
		legalName: string;
	};
} 