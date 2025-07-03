import type { TypedSupabaseClient } from "$lib/supabase";
import { getSetting, saveSetting } from "./siteSettingsService";
import { getDefaultSettings } from "$lib/constants/defaultSettings";

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

export interface CustomerLoyaltyData {
  customerId: string;
  currentPoints: number;
  totalPointsEarned: number;
  totalPointsSpent: number;
  currentTier: string;
  lastOrderDate: string | null;
  isActive: boolean;
  customerSince: number; // dny
  daysSinceLastOrder: number | null;
}

/**
 * Načte nastavení věrnostního systému
 */
export async function getLoyaltySettings(supabase: TypedSupabaseClient): Promise<LoyaltySettings> {
  try {
    const settings = await getSetting(supabase, 'customer');
    if (settings?.loyalty) {
      return settings.loyalty as LoyaltySettings;
    }
    return getDefaultSettings('customer').loyalty as unknown as LoyaltySettings;
  } catch (error) {
    console.error('Error loading loyalty settings:', error);
    return getDefaultSettings('customer').loyalty as unknown as LoyaltySettings;
  }
}

/**
 * Uloží nastavení věrnostního systému
 */
export async function saveLoyaltySettings(
  supabase: TypedSupabaseClient, 
  loyaltySettings: Partial<LoyaltySettings>, 
  userId: string
): Promise<boolean> {
  try {
    const currentSettings = await getSetting(supabase, 'customer') || getDefaultSettings('customer');
    const updatedSettings = {
      ...currentSettings,
      loyalty: {
        ...currentSettings.loyalty,
        ...loyaltySettings
      }
    };
    
    return await saveSetting(supabase, 'customer', updatedSettings, userId);
  } catch (error) {
    console.error('Error saving loyalty settings:', error);
    return false;
  }
}

/**
 * Vypočítá věrnostní data zákazníka
 */
export async function calculateCustomerLoyalty(
  supabase: TypedSupabaseClient,
  customerId: string
): Promise<CustomerLoyaltyData> {
  try {
    // Načtení objednávek zákazníka
    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select("id, created_at, total_price")
      .eq("user_id", customerId)
      .order('created_at', { ascending: false });

    if (ordersError) {
      console.error("Error fetching customer orders:", ordersError);
      throw ordersError;
    }

    const loyaltySettings = await getLoyaltySettings(supabase);
    
    // Výpočet základních statistik
    const totalOrders = orders?.length || 0;
    const totalSpent = orders?.reduce((sum, order) => sum + (order.total_price || 0), 0) || 0;
    const firstOrderDate = orders?.length ? 
      orders.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())[0]?.created_at : null;
    const lastOrderDate = orders?.length ? 
      orders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]?.created_at : null;

    // Výpočet bodů
    const totalPointsEarned = Math.floor(totalSpent * loyaltySettings.pointsPerCzk);
    const currentPoints = totalPointsEarned; // Zjednodušeně, bez odečítání utracených bodů

    // Určení úrovně věrnosti
    const currentTier = determineLoyaltyTier(totalOrders, loyaltySettings.tiers);

    // Výpočet aktivity
    const isActive = lastOrderDate ? 
      (new Date().getTime() - new Date(lastOrderDate!).getTime()) / (1000 * 60 * 60 * 24) < loyaltySettings.inactivityThreshold : 
      false;

    // Výpočet časových údajů
    const customerSince = firstOrderDate ? 
      Math.floor((new Date().getTime() - new Date(firstOrderDate!).getTime()) / (1000 * 60 * 60 * 24)) : 
      0;
    
    const daysSinceLastOrder = lastOrderDate ? 
      Math.floor((new Date().getTime() - new Date(lastOrderDate!).getTime()) / (1000 * 60 * 60 * 24)) : 
      null;

    return {
      customerId,
      currentPoints,
      totalPointsEarned,
      totalPointsSpent: 0, // Zjednodušeně
      currentTier,
      lastOrderDate,
      isActive,
      customerSince,
      daysSinceLastOrder
    };
  } catch (error) {
    console.error('Error calculating customer loyalty:', error);
    throw error;
  }
}

/**
 * Určí úroveň věrnosti na základě počtu objednávek
 */
function determineLoyaltyTier(orderCount: number, tiers: LoyaltyTier[]): string {
  // Seřadit úrovně podle minOrders sestupně
  const sortedTiers = [...tiers].sort((a, b) => b.minOrders - a.minOrders);
  
  // Najít první úroveň, která splňuje podmínky
  for (const tier of sortedTiers) {
    if (orderCount >= tier.minOrders) {
      return tier.name;
    }
  }
  
  // Fallback na první úroveň
  return tiers[0]?.name || 'NEW';
}

/**
 * Získá informace o úrovni věrnosti
 */
export function getLoyaltyTierInfo(tierName: string, tiers: LoyaltyTier[]): LoyaltyTier | null {
  return tiers.find(tier => tier.name === tierName) || null;
}

/**
 * Vypočítá body za objednávku
 */
export function calculateOrderPoints(
  orderAmount: number, 
  customerTier: string, 
  loyaltySettings: LoyaltySettings
): number {
  const basePoints = Math.floor(orderAmount * loyaltySettings.pointsPerCzk);
  const tierInfo = getLoyaltyTierInfo(customerTier, loyaltySettings.tiers);
  
  if (!tierInfo) {
    return basePoints;
  }

  const bonusMultiplier = 1 + (tierInfo.bonus / 100);
  const totalPoints = Math.floor(basePoints * bonusMultiplier);
  
  // Omezení maximálního počtu bodů
  return Math.min(totalPoints, loyaltySettings.maxPointsPerOrder);
}

/**
 * Vypočítá slevu podle úrovně věrnosti
 */
export function calculateLoyaltyDiscount(
  orderAmount: number, 
  customerTier: string, 
  loyaltySettings: LoyaltySettings
): number {
  const tierInfo = getLoyaltyTierInfo(customerTier, loyaltySettings.tiers);
  
  if (!tierInfo) {
    return 0;
  }

  return Math.floor(orderAmount * (tierInfo.discount / 100));
} 