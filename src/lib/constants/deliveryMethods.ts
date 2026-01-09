/**
 * CENTRALIZED DELIVERY METHODS
 * Načítá možnosti dopravy z databáze (site_settings.delivery.shippingMethods)
 * Fallback na výchozí hodnoty, pokud DB není dostupná
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/types/database.types';

// Mapování názvů z DB na kódy (pro zpětnou kompatibilitu)
const NAME_TO_CODE_MAP: Record<string, string> = {
  'Vlastní nosič': 'own',
  'REkrabička': 'reBox',
  'Doručení': 'delivery',
  'Menu Box': 'menuBox',
  'Osobní odběr': 'personal'
};

// Opačné mapování (kódy na názvy)
const CODE_TO_NAME_MAP: Record<string, string> = {
  'own': 'Vlastní nosič',
  'reBox': 'REkrabička',
  'delivery': 'Doručení',
  'menuBox': 'Menu Box',
  'personal': 'Osobní odběr'
};

// Výchozí možnosti (fallback)
const DEFAULT_DELIVERY_METHODS = [
  { value: 'own', label: 'Vlastní nosič' },
  { value: 'reBox', label: 'REkrabička' },
  { value: 'delivery', label: 'Doručení' },
  { value: 'menuBox', label: 'Menu Box' },
  { value: 'personal', label: 'Osobní odběr' }
];

const DEFAULT_REGISTRATION_METHODS = [
  { value: 'own', label: 'Vlastní nosič' },
  { value: 'reBox', label: 'REkrabička' },
  { value: 'menuBox', label: 'Menu Box' }
];

/**
 * Načte nastavení dopravy z databáze
 */
async function loadDeliverySettingsFromDB(supabase: SupabaseClient<Database>) {
  try {
    const { data: deliveryData, error } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'delivery')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !deliveryData?.value) {
      return null;
    }

    const settings = typeof deliveryData.value === 'string' 
      ? JSON.parse(deliveryData.value) 
      : deliveryData.value;

    return settings;
  } catch (error) {
    console.error('Error loading delivery settings from DB:', error);
    return null;
  }
}

/**
 * Převede shippingMethods z DB na formát pro UI
 */
function convertShippingMethodsToOptions(
  shippingMethods: Array<{ name: string; price?: number; enabled?: boolean }> | undefined,
  useNamesAsValues = false
): Array<{ value: string; label: string }> {
  if (!shippingMethods || !Array.isArray(shippingMethods)) {
    return [];
  }

  return shippingMethods
    .filter(method => method.enabled !== false) // Filtrujeme pouze povolené metody
    .map(method => {
      const name = method.name || '';
      // Pokud useNamesAsValues je true, použijeme název jako hodnotu, jinak mapujeme na kód
      const value = useNamesAsValues ? name : (NAME_TO_CODE_MAP[name] || name.toLowerCase().replace(/\s+/g, ''));
      return {
        value,
        label: name
      };
    });
}

/**
 * Načte možnosti dopravy z databáze pro registraci (pouze hlavní možnosti)
 */
export async function getRegistrationDeliveryMethods(
  supabase: SupabaseClient<Database> | null,
  withDescriptions = false
): Promise<Array<{ value: string; label: string }>> {
  if (!supabase) {
    return DEFAULT_REGISTRATION_METHODS;
  }

  const settings = await loadDeliverySettingsFromDB(supabase);
  const shippingMethods = settings?.shippingMethods;

  if (shippingMethods && Array.isArray(shippingMethods) && shippingMethods.length > 0) {
    // Použijeme první 3 metody z DB, nebo všechny pokud je jich méně
    const methods = convertShippingMethodsToOptions(shippingMethods.slice(0, 3), false);
    if (methods.length > 0) {
      return methods;
    }
  }

  // Fallback na výchozí hodnoty
  return DEFAULT_REGISTRATION_METHODS;
}

/**
 * Načte všechny možnosti dopravy z databáze
 */
export async function getAllDeliveryMethods(
  supabase: SupabaseClient<Database> | null,
  withDescriptions = false,
  includeEmpty = false
): Promise<Array<{ value: string; label: string }>> {
  let options: Array<{ value: string; label: string }> = [];

  if (supabase) {
    const settings = await loadDeliverySettingsFromDB(supabase);
    const shippingMethods = settings?.shippingMethods;

    if (shippingMethods && Array.isArray(shippingMethods) && shippingMethods.length > 0) {
      options = convertShippingMethodsToOptions(shippingMethods, false);
    }
  }

  // Fallback na výchozí hodnoty, pokud DB nevrátila žádné možnosti
  if (options.length === 0) {
    options = DEFAULT_DELIVERY_METHODS;
  }

  if (includeEmpty) {
    return [
      { value: '', label: 'Vyberte způsob dodání' },
      ...options
    ];
  }

  return options;
}

// Helper functions pro zpětnou kompatibilitu
export function getDeliveryMethodLabel(value: string): string {
  // Zkusíme najít v mapování kódů
  if (CODE_TO_NAME_MAP[value]) {
    return CODE_TO_NAME_MAP[value];
  }
  // Pokud to není kód, předpokládáme, že je to už název
  return value;
}

export function getDeliveryMethodDescription(value: string): string {
  const label = getDeliveryMethodLabel(value);
  // Můžeme přidat další popisky podle potřeby
  if (value === 'reBox') {
    return `${label} (záloha 160 Kč za set/80 Kč za jednu)`;
  }
  if (value === 'menuBox') {
    return `${label} (12 Kč/kus)`;
  }
  return label;
}

// Legacy function for backward compatibility
export function getDeliveryMethodOptions(withDescriptions = false) {
  // Tato funkce už není použita, ale zachováváme ji pro kompatibilitu
  return DEFAULT_DELIVERY_METHODS;
}

export type DeliveryMethodValue = string; 