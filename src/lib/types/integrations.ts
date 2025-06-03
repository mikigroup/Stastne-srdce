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
  // Fakturoid
  fakturoidEnabled: boolean;
  fakturoidAccounts: Record<string, FakturoidAccount>;
  fakturoidActiveAccount: string | null;
  
  // Ostatní integrace
  googleAnalyticsEnabled?: boolean;
  googleAnalyticsTrackingId?: string;
  facebookPixelEnabled?: boolean;
  facebookPixelId?: string;
} 