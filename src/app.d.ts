import type { Session, SupabaseClient, User } from "@supabase/supabase-js";
import type {
	AllSettings,
	GeneralSettings,
	SeoSettings,
	ContactSettings,
	SocialSettings,
	AppearanceSettings,
	BusinessSettings
} from "$lib/settingsService";

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
			// Multi-tenant support
			tenant: {
				name: string;
				clientId: string;
				domain: string;
				active: boolean;
			} | null;
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
