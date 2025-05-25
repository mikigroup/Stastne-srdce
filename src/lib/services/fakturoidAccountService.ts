import type { FakturoidAccount, IntegrationsSettings } from '$lib/types/integrations';

/**
 * Service pro správu multi-account Fakturoid integrace
 */
export class FakturoidAccountService {
  
  /**
   * Získá všechny aktivní Fakturoid účty
   */
  static getActiveAccounts(integrations: IntegrationsSettings): Record<string, FakturoidAccount> {
    if (!integrations.fakturoidEnabled || !integrations.fakturoidAccounts) {
      return {};
    }
    
    return Object.fromEntries(
      Object.entries(integrations.fakturoidAccounts)
        .filter(([_, account]) => account.isActive)
    );
  }
  
  /**
   * Získá aktuálně aktivní účet
   */
  static getActiveAccount(integrations: IntegrationsSettings): FakturoidAccount | null {
    const activeAccountId = integrations.fakturoidActiveAccount;
    if (!activeAccountId || !integrations.fakturoidAccounts) {
      return null;
    }
    
    const account = integrations.fakturoidAccounts[activeAccountId];
    return account?.isActive ? account : null;
  }
  
  /**
   * Získá ID aktivního účtu
   */
  static getActiveAccountId(integrations: IntegrationsSettings): string | null {
    return integrations.fakturoidActiveAccount;
  }
  
  /**
   * Přidá nový účet
   */
  static addAccount(
    integrations: IntegrationsSettings, 
    accountId: string, 
    accountData: Omit<FakturoidAccount, 'connectedAt'>
  ): IntegrationsSettings {
    const newAccount: FakturoidAccount = {
      ...accountData,
      connectedAt: new Date().toISOString()
    };
    
    return {
      ...integrations,
      fakturoidEnabled: true,
      fakturoidAccounts: {
        ...integrations.fakturoidAccounts,
        [accountId]: newAccount
      },
      // Pokud je to první účet, nastavíme ho jako aktivní
      fakturoidActiveAccount: integrations.fakturoidActiveAccount || accountId
    };
  }
  
  /**
   * Odebere účet
   */
  static removeAccount(integrations: IntegrationsSettings, accountId: string): IntegrationsSettings {
    const { [accountId]: removed, ...remainingAccounts } = integrations.fakturoidAccounts || {};
    
    const newActiveAccount = integrations.fakturoidActiveAccount === accountId 
      ? Object.keys(remainingAccounts)[0] || null
      : integrations.fakturoidActiveAccount;
    
    return {
      ...integrations,
      fakturoidAccounts: remainingAccounts,
      fakturoidActiveAccount: newActiveAccount,
      fakturoidEnabled: Object.keys(remainingAccounts).length > 0
    };
  }
  
  /**
   * Nastaví aktivní účet
   */
  static setActiveAccount(integrations: IntegrationsSettings, accountId: string): IntegrationsSettings {
    if (!integrations.fakturoidAccounts?.[accountId]) {
      throw new Error(`Účet ${accountId} neexistuje`);
    }
    
    return {
      ...integrations,
      fakturoidActiveAccount: accountId
    };
  }
  
  /**
   * Migrace ze starého formátu na nový
   */
  static migrateFromLegacyFormat(integrations: any): IntegrationsSettings {
    // Pokud už máme nový formát, vrátíme ho
    if (integrations.fakturoidAccounts) {
      return integrations as IntegrationsSettings;
    }
    
    // Migrace ze starého formátu
    const newIntegrations: IntegrationsSettings = {
      fakturoidEnabled: integrations.fakturoidEnabled || false,
      fakturoidAccounts: {},
      fakturoidActiveAccount: null
    };
    
    // Pokud máme starý účet, převedeme ho
    if (integrations.fakturoidConnected && integrations.fakturoidAccountName) {
      const accountId = integrations.fakturoidSubdomain || integrations.fakturoidAccountName;
      const account: FakturoidAccount = {
        name: integrations.fakturoidAccountName,
        email: integrations.fakturoidAccountName,
        subdomain: integrations.fakturoidSubdomain || '',
        isActive: true,
        connectedAt: new Date().toISOString()
      };
      
      newIntegrations.fakturoidAccounts[accountId] = account;
      newIntegrations.fakturoidActiveAccount = accountId;
    }
    
    return newIntegrations;
  }
} 