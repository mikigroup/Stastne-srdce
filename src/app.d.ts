import type { TypedSupabaseClient } from "$lib/supabase";
import type { Database } from "$lib/types/database.types";
import type { AllSettings, GeneralSettings, BusinessSettings, ContactSettings, DeliverySettings, EmailSettings, IntegrationsSettings, LoyaltySettings, NotificationSettings, OrdersSettings, ProductsSettings, SeoSettings, SocialSettings } from "$lib/types/siteSettings";

// Přidáváme typy pro $app/stores
declare module "$app/stores" {
	import type { Readable } from "svelte/store";
	
	export interface Page {
		url: URL;
		params: Record<string, string>;
		status: number;
		error: Error | null;
		data: App.PageData;
		form: any;
	}

	export const page: Readable<Page>;
}

declare global {
	namespace App {
		interface Locals {
			supabase: TypedSupabaseClient;
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
		}
	}
}

export {};
