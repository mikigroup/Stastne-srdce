import type { Session, SupabaseClient, User } from "@supabase/supabase-js";
import type {
	AllSettings,
	GeneralSettings,
	SeoSettings,
	ContactSettings,
	SocialSettings,
	AppearanceSettings,
	BusinessSettings,
	EmailSettings,
	IntegrationSettings
} from "$lib/services/settingsService";

declare global {
	namespace App {
		interface Locals {
			supabase: SupabaseClient;
			safeGetSession: () => Promise<{
				session: Session | null;
				user: User | null;
			}>;
			session: Session | null;
			user: User | null;
			cartItems: Array<{
				id: string;
				product_id: string;
				quantity: number;
			}>;
		}

		interface Window {
			dataLayer: any[];
			fbq: any;
		}

		interface PageData {
			session: Session | null;
			user: User | null;
		}

		interface ImportMetaEnv {
			VITE_BASE_URL: string;
			VITE_APP_NAME: string;
			VITE_SUPABASE_URL: string;
			VITE_SUPABASE_ANON_KEY: string;
		}
	}
}

export {};
