import type { TypedSupabaseClient } from "$lib/supabase";
import { getSetting, saveSetting } from "./siteSettingsService";
import { getDefaultSettings } from "$lib/constants/defaultSettings";

export interface LoyaltyTier {
  id?: number;
  name: string;
  label?: string;
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
    const tiers = await getLoyaltyTiers(supabase);
    
    if (settings?.loyalty) {
      return {
        ...settings.loyalty,
        tiers: tiers
      } as LoyaltySettings;
    }
    
    const defaultSettings = getDefaultSettings('customer').loyalty as unknown as LoyaltySettings;
    return {
      ...defaultSettings,
      tiers: tiers
    };
  } catch (error) {
    console.error('Error loading loyalty settings:', error);
    const defaultSettings = getDefaultSettings('customer').loyalty as unknown as LoyaltySettings;
    return {
      ...defaultSettings,
      tiers: []
    };
  }
}

/**
 * Načte úrovně věrnosti z tabulky loyalty_tiers
 */
export async function getLoyaltyTiers(supabase: TypedSupabaseClient): Promise<LoyaltyTier[]> {
  try {
    const { data, error } = await supabase
      .from('loyalty_tiers')
      .select('*')
      .order('min_orders', { ascending: true });

    if (error) {
      console.error('Error loading loyalty tiers:', error);
      return [];
    }

    return data?.map(tier => ({
      id: tier.id,
      name: tier.name,
      label: tier.name, // Použijeme name jako label
      minOrders: tier.min_orders,
      discount: tier.discount_percent,
      bonus: tier.bonus_percent,
      color: tier.color,
      icon: tier.icon,
      description: tier.description || ''
    })) || [];
  } catch (error) {
    console.error('Error loading loyalty tiers:', error);
    return [];
  }
}

/**
 * Uloží úroveň věrnosti do tabulky loyalty_tiers
 */
export async function saveLoyaltyTier(supabase: TypedSupabaseClient, tier: LoyaltyTier): Promise<void> {
  try {
    if (tier.id) {
      // Update existing tier
      const { error } = await supabase
        .from('loyalty_tiers')
        .update({
          name: tier.name,
          min_orders: tier.minOrders,
          discount_percent: tier.discount,
          bonus_percent: tier.bonus,
          color: tier.color,
          icon: tier.icon,
          description: tier.description,
          updated_at: new Date().toISOString()
        })
        .eq('id', tier.id);

      if (error) throw error;
    } else {
      // Insert new tier
      const { error } = await supabase
        .from('loyalty_tiers')
        .insert({
          name: tier.name,
          min_orders: tier.minOrders,
          discount_percent: tier.discount,
          bonus_percent: tier.bonus,
          color: tier.color,
          icon: tier.icon,
          description: tier.description
        });

      if (error) throw error;
    }
  } catch (error) {
    console.error('Error saving loyalty tier:', error);
    throw error;
  }
}

/**
 * Smaže úroveň věrnosti z tabulky loyalty_tiers
 */
export async function deleteLoyaltyTier(supabase: TypedSupabaseClient, tierId: number): Promise<void> {
  try {
    const { error } = await supabase
      .from('loyalty_tiers')
      .delete()
      .eq('id', tierId);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting loyalty tier:', error);
    throw error;
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
      (new Date().getTime() - new Date(lastOrderDate as string).getTime()) / (1000 * 60 * 60 * 24) < loyaltySettings.inactivityThreshold : 
      false;

    // Výpočet časových údajů
    const customerSince = firstOrderDate ? 
      Math.floor((new Date().getTime() - new Date(firstOrderDate as string).getTime()) / (1000 * 60 * 60 * 24)) : 
      0;
    
    const daysSinceLastOrder = lastOrderDate ? 
      Math.floor((new Date().getTime() - new Date(lastOrderDate as string).getTime()) / (1000 * 60 * 60 * 24)) : 
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