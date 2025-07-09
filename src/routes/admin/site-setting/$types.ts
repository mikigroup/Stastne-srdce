import type { SiteSettings, CustomerSettings } from '$lib/constants/defaultSettings';
import type { Database } from '$lib/types/database.types';

// Typy pro site_settings tabulku
export type SiteSettingsRow = Database['public']['Tables']['site_settings']['Row'];
export type SiteSettingsInsert = Database['public']['Tables']['site_settings']['Insert'];
export type SiteSettingsUpdate = Database['public']['Tables']['site_settings']['Update'];

// Typy pro PageServerLoad
export type PageServerLoad = {
  settings: SiteSettingsRow[];
  activeTab: string;
  pages: string[];
};

// Typy pro PageData
export interface PageData {
  settings: SiteSettingsRow[];
  activeTab: string;
  pages: string[];
}

// Typy pro Actions
export interface Actions {
  update: {
    success?: boolean;
    error?: string;
  };
  testFakturoidOAuth: {
    success?: boolean;
    error?: string;
    message?: string;
    userInfo?: {
      email: string;
      name: string;
    };
  };
  disconnectFakturoid: {
    success?: boolean;
    error?: string;
  };
}

// Typy pro FormData
export interface FormData {
  message?: {
    success: boolean;
    display: string;
  };
}

// Typy pro loyalty nastavení
export interface LoyaltyTier {
  name: string;
  label: string;
  minOrders: number;
  discount: number;
  bonus: number;
  color: string;
  icon: string;
  description: string;
}

export interface LoyaltySettings {
  enabled: boolean;
  pointsPerCzk: number;
  pointsValue: number;
  welcomeBonus: number;
  birthdayBonus: number;
  enableTiers: boolean;
  tiers: LoyaltyTier[];
  inactivityThreshold: number;
  pointsExpiryMonths: number;
  maxPointsPerOrder: number;
  enableAutoTierUpgrade: boolean;
  enableTierDowngrade: boolean;
  campaigns: any[];
}

// Typy pro editable settings
export interface EditableSettings extends SiteSettings {
  customer: CustomerSettings & {
    loyalty: LoyaltySettings;
  };
} 