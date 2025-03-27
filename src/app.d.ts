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
		// interface Error {}
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
				// další položky košíku
			}>;
		}

		interface PageData {
			session: Session | null;
			user: User | null;
			settings: AllSettings;
			generalSettings?: GeneralSettings;
			seoSettings?: SeoSettings;
			contactSettings?: ContactSettings;
			socialSettings?: SocialSettings;
			appearanceSettings?: AppearanceSettings;
			businessSettings?: BusinessSettings;
			emailSettings?: EmailSettings;
			integrationSettings?: IntegrationSettings;
		}

		// interface PageState {}
		// interface Platform {}

		// Typy pro prostředí (environment variables)
		interface ImportMetaEnv {
			VITE_BASE_URL: string;
			VITE_APP_NAME: string;
			VITE_SUPABASE_URL: string;
			VITE_SUPABASE_ANON_KEY: string;
		}
	}
}

export {};
