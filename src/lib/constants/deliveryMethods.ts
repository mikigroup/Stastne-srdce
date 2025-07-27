/**
 * CENTRALIZED DELIVERY METHODS
 * Single source of truth for all delivery method values and labels across the application
 * Based on actual database values from profiles table
 */

export const DELIVERY_METHODS = {
  OWN: 'own',           // 33.33% - Vlastní nosič
  REBOX: 'reBox',       // 33.33% - REkrabička  
  DELIVERY: 'delivery', // 28.40% - Doručení
  MENUBOX: 'menuBox',   // 3.70% - Menu Box
  PERSONAL: 'personal'  // 1.23% - Osobní odběr
} as const;

export const DELIVERY_METHOD_LABELS = {
  [DELIVERY_METHODS.OWN]: 'Vlastní nosič',
  [DELIVERY_METHODS.REBOX]: 'REkrabička',
  [DELIVERY_METHODS.DELIVERY]: 'Doručení',
  [DELIVERY_METHODS.MENUBOX]: 'Menu Box',
  [DELIVERY_METHODS.PERSONAL]: 'Osobní odběr'
} as const;

export const DELIVERY_METHOD_DESCRIPTIONS = {
  [DELIVERY_METHODS.OWN]: 'Vlastní nosič',
  [DELIVERY_METHODS.REBOX]: 'REkrabička (záloha 160 Kč za set/80 Kč za jednu)',
  [DELIVERY_METHODS.DELIVERY]: 'Doručení',
  [DELIVERY_METHODS.MENUBOX]: 'Menu Box (12 Kč/kus)',
  [DELIVERY_METHODS.PERSONAL]: 'Osobní odběr'
} as const;

// Helper functions
export function getDeliveryMethodLabel(value: string): string {
  return DELIVERY_METHOD_LABELS[value as keyof typeof DELIVERY_METHOD_LABELS] || value;
}

export function getDeliveryMethodDescription(value: string): string {
  return DELIVERY_METHOD_DESCRIPTIONS[value as keyof typeof DELIVERY_METHOD_DESCRIPTIONS] || value;
}

// Get delivery methods for REGISTRATION (only 3 main options)
export function getRegistrationDeliveryMethods(withDescriptions = false) {
  const registrationMethods = [
    DELIVERY_METHODS.OWN,
    DELIVERY_METHODS.REBOX, 
    DELIVERY_METHODS.MENUBOX
  ];
  
  return registrationMethods.map(value => ({
    value,
    label: withDescriptions ? DELIVERY_METHOD_DESCRIPTIONS[value] : DELIVERY_METHOD_LABELS[value]
  }));
}

// Get ALL delivery methods for existing users/admin (all 5 options)
export function getAllDeliveryMethods(withDescriptions = false, includeEmpty = false) {
  const options = Object.entries(DELIVERY_METHOD_LABELS).map(([value, label]) => ({
    value,
    label: withDescriptions ? DELIVERY_METHOD_DESCRIPTIONS[value as keyof typeof DELIVERY_METHOD_DESCRIPTIONS] : label
  }));

  if (includeEmpty) {
    return [
      { value: '', label: 'Vyberte způsob dodání' },
      ...options
    ];
  }

  return options;
}

// Legacy function for backward compatibility
export function getDeliveryMethodOptions(withDescriptions = false) {
  return getAllDeliveryMethods(withDescriptions);
}

export type DeliveryMethodValue = typeof DELIVERY_METHODS[keyof typeof DELIVERY_METHODS]; 