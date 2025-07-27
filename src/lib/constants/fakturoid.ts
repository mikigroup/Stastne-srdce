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

// Helper funkce pro získání všech platných statusů
export function getAllTokenStatuses(): FakturoidTokenStatus[] {
  return Object.values(FAKTUROID_TOKEN_STATUSES);
}

// Helper funkce pro kontrolu, zda je status "aktivní" (lze použít pro API volání)
export function isActiveStatus(status: FakturoidTokenStatus): boolean {
  return status === FAKTUROID_TOKEN_STATUSES.ACTIVE;
}

// Helper funkce pro kontrolu, zda je status "použitelný" (active nebo expired pro refresh)
export function isUsableStatus(status: FakturoidTokenStatus): boolean {
  return status === FAKTUROID_TOKEN_STATUSES.ACTIVE || status === FAKTUROID_TOKEN_STATUSES.EXPIRED;
}

// Helper funkce pro kontrolu, zda je status "neplatný" (revoked nebo cleared)
export function isInvalidStatus(status: FakturoidTokenStatus): boolean {
  return status === FAKTUROID_TOKEN_STATUSES.REVOKED || status === FAKTUROID_TOKEN_STATUSES.CLEARED;
}

// Helper funkce pro získání popisu statusu
export function getStatusDescription(status: FakturoidTokenStatus): string {
  const descriptions: Record<FakturoidTokenStatus, string> = {
    [FAKTUROID_TOKEN_STATUSES.ACTIVE]: 'Aktivní token - lze použít pro API volání',
    [FAKTUROID_TOKEN_STATUSES.EXPIRED]: 'Expirovaný token - lze obnovit pomocí refresh tokenu',
    [FAKTUROID_TOKEN_STATUSES.REFRESHING]: 'Token v procesu obnovy',
    [FAKTUROID_TOKEN_STATUSES.REVOKED]: 'Odvolaný token - uživatel se odpojil',
    [FAKTUROID_TOKEN_STATUSES.CLEARED]: 'Definitivně neplatný token - nelze obnovit'
  };
  
  return descriptions[status];
}

// Helper funkce pro získání barvy statusu (pro UI)
export function getStatusColor(status: FakturoidTokenStatus): string {
  const colors: Record<FakturoidTokenStatus, string> = {
    [FAKTUROID_TOKEN_STATUSES.ACTIVE]: 'green',
    [FAKTUROID_TOKEN_STATUSES.EXPIRED]: 'yellow',
    [FAKTUROID_TOKEN_STATUSES.REFRESHING]: 'blue',
    [FAKTUROID_TOKEN_STATUSES.REVOKED]: 'red',
    [FAKTUROID_TOKEN_STATUSES.CLEARED]: 'gray'
  };
  
  return colors[status];
} 