/**
 * Fakturoid Token Status Constants
 * Definuje všechny možné stavy Fakturoid tokenů v aplikaci
 */

export const FAKTUROID_TOKEN_STATUSES = {
  ACTIVE: 'active',
  EXPIRED: 'expired',
  REFRESHING: 'refreshing',
  REVOKED: 'revoked',
  CLEARED: 'cleared'
} as const;

// TypeScript typ pro všechny možné stavy
export type FakturoidTokenStatus = typeof FAKTUROID_TOKEN_STATUSES[keyof typeof FAKTUROID_TOKEN_STATUSES];

// Validační funkce
export function isValidTokenStatus(status: string): status is FakturoidTokenStatus {
  return Object.values(FAKTUROID_TOKEN_STATUSES).includes(status as FakturoidTokenStatus);
} 