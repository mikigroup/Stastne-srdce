import type { Session, SupabaseClient, User } from "@supabase/supabase-js";

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			supabase: SupabaseClient;
			safeGetSession: () => Promise<{
				session: Session | null;
				user: User | null;
			}>;
			session: Session | null;
			user: User | null;
			cartItems: any[];
		}
		interface PageData {
			session: Session | null;
			// interface Error {}
			// interface PageState {}
			// interface Platform {}
		}
		/*interface ImportMetaEnv {
			VITE_BASE_URL: string;
			VITE_APP_NAME: string;
		}*/
	}
}

export {};
