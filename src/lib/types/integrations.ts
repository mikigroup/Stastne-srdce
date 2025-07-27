// Multi-account Fakturoid integrace
export interface FakturoidAccount {
  name: string;
  email: string;
  subdomain: string;
  isActive: boolean;
  connectedAt: string;
}

export interface FakturoidIntegration {
  fakturoidEnabled: boolean;
  fakturoidAccounts: Record<string, FakturoidAccount>; // key = account ID
  fakturoidActiveAccount: string | null; // ID aktivního účtu
  
  // Zachováváme pro zpětnou kompatibilitu
  fakturoidConnected?: boolean;
  fakturoidAccountName?: string;
  fakturoidSubdomain?: string;
  
  // Ostatní nastavení
  fakturoidDefaultLanguage?: string;
  fakturoidAutoCreateInvoices?: boolean;
  fakturoidInvoiceDueDays?: number;
  fakturoidDefaultPaymentMethod?: string;
  fakturoidSendInvoiceEmail?: boolean;
  fakturoidInvoiceNote?: string;
}

export interface IntegrationsSettings {
  fakturoid: {
    enabled: boolean;
    connected: boolean;
    subdomain?: string; // Ruční zadání slugu - PRIORITA
    accounts: Array<{
      name: string;
      email: string;
      subdomain: string;
      isActive: boolean;
      connectedAt: string;
      accountId?: string;
      currency?: string;
      plan?: string;
    }>;
    defaultLanguage?: string;
    autoCreateInvoices?: boolean;
    invoiceDueDays?: number;
    defaultPaymentMethod?: string;
    sendInvoiceEmail?: boolean;
    invoiceNote?: string;
  };
  
  // Ostatní integrace
  googleAnalyticsEnabled?: boolean;
  googleAnalyticsTrackingId?: string;
  facebookPixelEnabled?: boolean;
  facebookPixelId?: string;
} 