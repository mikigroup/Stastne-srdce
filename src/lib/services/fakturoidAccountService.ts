import type { FakturoidAccount, IntegrationsSettings } from '$lib/types/siteSettings';

/**
 * Service pro správu multi-account Fakturoid integrace
 */
export class FakturoidAccountService {
  
  /**
   * Získá všechny aktivní Fakturoid účty
   */
  static getActiveAccounts(integrations: IntegrationsSettings): Record<string, FakturoidAccount> {
    if (!integrations.fakturoid?.enabled || !integrations.fakturoid?.accounts) {
      return {};
    }
    
    return Object.fromEntries(
      integrations.fakturoid.accounts
        .filter(account => account.isActive)
        .map(account => [account.subdomain, account])
    );
  }
  
  /**
   * Získá aktuálně aktivní účet
   */
  static getActiveAccount(integrations: IntegrationsSettings): FakturoidAccount | null {
    if (!integrations.fakturoid?.accounts) {
      return null;
    }
    
    return integrations.fakturoid.accounts.find(account => account.isActive) || null;
  }
  
  /**
   * Získá ID aktivního účtu
   */
  static getActiveAccountId(integrations: IntegrationsSettings): string | null {
    const activeAccount = this.getActiveAccount(integrations);
    return activeAccount?.subdomain || null;
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
    
    const accounts = [...(integrations.fakturoid?.accounts || [])];
    const existingIndex = accounts.findIndex(acc => acc.subdomain === accountId);
    
    if (existingIndex >= 0) {
      accounts[existingIndex] = newAccount;
    } else {
      accounts.push(newAccount);
    }
    
    return {
      ...integrations,
      fakturoid: {
        ...integrations.fakturoid,
        enabled: true,
        connected: true,
        accounts
      }
    };
  }
  
  /**
   * Odebere účet
   */
  static removeAccount(integrations: IntegrationsSettings, accountId: string): IntegrationsSettings {
    const accounts = (integrations.fakturoid?.accounts || [])
      .filter(account => account.subdomain !== accountId);
    
    return {
      ...integrations,
      fakturoid: {
        ...integrations.fakturoid,
        enabled: accounts.length > 0,
        connected: accounts.length > 0,
        accounts
      }
    };
  }
  
  /**
   * Nastaví aktivní účet
   */
  static setActiveAccount(integrations: IntegrationsSettings, accountId: string): IntegrationsSettings {
    const accounts = (integrations.fakturoid?.accounts || []).map(account => ({
      ...account,
      isActive: account.subdomain === accountId
    }));
    
    if (!accounts.some(acc => acc.subdomain === accountId)) {
      throw new Error(`Účet ${accountId} neexistuje`);
    }
    
    return {
      ...integrations,
      fakturoid: {
        ...integrations.fakturoid,
        accounts
      }
    };
  }
  
  /**
   * Migrace ze starého formátu na nový
   */
  static migrateFromLegacyFormat(integrations: any): IntegrationsSettings {
    // Pokud už máme nový formát, vrátíme ho
    if (integrations.fakturoid?.accounts) {
      return integrations as IntegrationsSettings;
    }
    
    // Migrace ze starého formátu
    const newIntegrations: IntegrationsSettings = {
      fakturoid: {
        enabled: integrations.fakturoidEnabled || false,
        connected: integrations.fakturoidConnected || false,
        accounts: [],
        defaultLanguage: integrations.fakturoidDefaultLanguage || 'cz',
        autoCreateInvoices: integrations.fakturoidAutoCreateInvoices || false,
        invoiceDueDays: integrations.fakturoidInvoiceDueDays || 14,
        defaultPaymentMethod: integrations.fakturoidDefaultPaymentMethod || 'bank',
        sendInvoiceEmail: integrations.fakturoidSendInvoiceEmail || false,
        invoiceNote: integrations.fakturoidInvoiceNote || ''
      }
    };
    
    // Pokud máme starý účet, převedeme ho
    if (integrations.fakturoidConnected && integrations.fakturoidAccountName) {
      const account: FakturoidAccount = {
        name: integrations.fakturoidAccountName,
        email: integrations.fakturoidAccountName,
        subdomain: integrations.fakturoidSubdomain || '',
        isActive: true,
        connectedAt: new Date().toISOString()
      };
      
      newIntegrations.fakturoid.accounts.push(account);
    }
    
    return newIntegrations;
  }
} 