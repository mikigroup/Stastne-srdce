import type { TypedSupabaseClient } from "$lib/supabase";
import type { Database } from "$lib/types/database.types";
import type { AuthResult, AuthSession, AuthUser } from "$lib/types/auth";
import type { AllSettings, GeneralSettings, BusinessSettings, ContactSettings, DeliverySettings, EmailSettings, IntegrationsSettings, LoyaltySettings, NotificationSettings, OrdersSettings, ProductsSettings, SeoSettings, SocialSettings } from "$lib/types/siteSettings";

declare global {
	namespace App {
		interface Locals {
			supabase: TypedSupabaseClient;
			safeGetSession: () => Promise<AuthResult>;
			session: AuthSession | null;
			user: AuthUser | null;
			accountDeletionPending?: boolean;
			registrationRedirect?: boolean;
			cartItems: Array<{
				id: string;
				product_id: string;
				quantity: number;
			}>;
			tenant?: any; // Tenant info
			tenantId?: string; // Current tenant ID
		}

		interface Window {
			dataLayer: any[];
			fbq: any;
		}

		interface PageData {
			session: AuthSession | null;
			user: AuthUser | null;
		}

		interface ImportMetaEnv {
			VITE_BASE_URL: string;
			VITE_APP_NAME: string;
		}
	}
}

export {};
