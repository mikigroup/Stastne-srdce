/**
 * CENTRALIZED PAYMENT METHODS
 * Načítá možnosti platby z databáze (site_settings.business.paymentMethods)
 * Fallback na výchozí hodnoty, pokud DB není dostupná
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/types/database.types';

// Mapování názvů z DB na kódy (pro zpětnou kompatibilitu)
const NAME_TO_CODE_MAP: Record<string, string> = {
  'Hotově': 'cash',
  'Hotovost': 'cash',
  'Převodem': 'bankNoInvoice',
  'Na účet bez faktury': 'bankNoInvoice',
  'Bankovní převod bez faktury': 'bankNoInvoice',
  'Na účet s fakturou': 'bankWithInvoice',
  'Bankovní převod s fakturou': 'bankWithInvoice',
  'Faktura': 'bankWithInvoice',
  'Kartou': 'card'
};

// Opačné mapování (kódy na názvy)
const CODE_TO_NAME_MAP: Record<string, string> = {
  'cash': 'Hotově',
  'bankNoInvoice': 'Na účet bez faktury',
  'bankWithInvoice': 'Na účet s fakturou',
  'card': 'Kartou'
};

// Výchozí možnosti (fallback) - pouze pokud DB není dostupná
// Pokud DB není dostupná, vrátíme prázdné pole (ne hardcoded hodnoty)
const DEFAULT_PAYMENT_METHODS: Array<{ value: string; label: string }> = [];

/**
 * Načte nastavení business z databáze
 */
async function loadBusinessSettingsFromDB(supabase: SupabaseClient<Database>) {
  try {
    const { data: businessData, error } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'business')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !businessData?.value) {
      return null;
    }

    const settings = typeof businessData.value === 'string' 
      ? JSON.parse(businessData.value) 
      : businessData.value;

    return settings;
  } catch (error) {
    console.error('Error loading business settings from DB:', error);
    return null;
  }
}

/**
 * Převede paymentMethods z DB na formát pro UI
 */
function convertPaymentMethodsToOptions(
  paymentMethods: string[] | undefined
): Array<{ value: string; label: string }> {
  if (!paymentMethods || !Array.isArray(paymentMethods)) {
    return [];
  }

  return paymentMethods
    .map(name => {
      const trimmedName = (name || '').trim();
      if (!trimmedName) return null;
      
      // Mapujeme název na kód, pokud existuje v mapování
      const code = NAME_TO_CODE_MAP[trimmedName] || trimmedName.toLowerCase().replace(/\s+/g, '');
      // Použijeme původní název jako label
      const label = trimmedName;
      
      return {
        value: code,
        label: label
      };
    })
    .filter((option): option is { value: string; label: string } => option !== null);
}

/**
 * Načte možnosti platby z databáze
 */
export async function getPaymentMethods(
  supabase: SupabaseClient<Database> | null
): Promise<Array<{ value: string; label: string }>> {
  let options: Array<{ value: string; label: string }> = [];

  if (supabase) {
    const settings = await loadBusinessSettingsFromDB(supabase);
    const paymentMethods = settings?.paymentMethods;

    if (paymentMethods && Array.isArray(paymentMethods) && paymentMethods.length > 0) {
      options = convertPaymentMethodsToOptions(paymentMethods);
    }
  }

  // Fallback na výchozí hodnoty, pokud DB nevrátila žádné možnosti
  if (options.length === 0) {
    options = DEFAULT_PAYMENT_METHODS;
  }

  return options;
}

// Helper functions pro zpětnou kompatibilitu
export function getPaymentMethodLabel(value: string): string {
  // Zkusíme najít v mapování kódů
  if (CODE_TO_NAME_MAP[value]) {
    return CODE_TO_NAME_MAP[value];
  }
  // Pokud to není kód, předpokládáme, že je to už název
  return value;
}

export type PaymentMethodValue = string;
