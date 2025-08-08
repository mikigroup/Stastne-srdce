// Tenant types for multi-tenant architecture

export interface Tenant {
  id: string;
  slug: string;
  name: string;
  domain: string;
  created_at: string;
  updated_at: string;
  settings: Record<string, any>;
  features: {
    fakturoid?: boolean;
    loyalty?: boolean;
    allergens?: boolean;
    notifications?: boolean;
    analytics?: boolean;
  };
  status: 'active' | 'suspended' | 'deleted';
}

export interface TenantConfig {
  id: string;
  slug: string;
  name: string;
  domain: string;
  features: Tenant['features'];
  settings: Record<string, any>;
}

export interface CreateTenantData {
  slug: string;
  name: string;
  domain: string;
  features?: Partial<Tenant['features']>;
  settings?: Record<string, any>;
}

export interface UpdateTenantData {
  name?: string;
  domain?: string;
  features?: Partial<Tenant['features']>;
  settings?: Record<string, any>;
  status?: Tenant['status'];
}

// Tenant-specific settings types
export interface TenantSettings {
  theme: {
    primary_color?: string;
    secondary_color?: string;
    logo_url?: string;
  };
  business: {
    name: string;
    address?: string;
    phone?: string;
    email?: string;
    ico?: string;
    dic?: string;
  };
  delivery: {
    methods: string[];
    free_delivery_threshold?: number;
    delivery_fee?: number;
  };
  payment: {
    methods: string[];
    currency: string;
    vat_rate?: number;
  };
  notifications: {
    email_enabled: boolean;
    sms_enabled: boolean;
    push_enabled: boolean;
  };
}

// Feature flags
export type TenantFeature = keyof Tenant['features'];

// Tenant context for request handling
export interface TenantContext {
  tenant: Tenant;
  isAdmin: boolean;
  hasFeature: (feature: TenantFeature) => boolean;
  getSetting: <T = any>(key: string, defaultValue?: T) => T;
}

// Database types for tenant-related operations
export interface TenantDatabase {
  tenants: {
    Row: Tenant;
    Insert: Omit<Tenant, 'id' | 'created_at' | 'updated_at'>;
    Update: Partial<Omit<Tenant, 'id' | 'created_at' | 'updated_at'>>;
  };
  tenant_audit_log: {
    Row: {
      id: string;
      tenant_id: string;
      action: string;
      details: Record<string, any> | null;
      created_at: string;
      created_by: string | null;
    };
    Insert: {
      id?: string;
      tenant_id: string;
      action: string;
      details?: Record<string, any> | null;
      created_at?: string;
      created_by?: string | null;
    };
    Update: {
      id?: string;
      tenant_id?: string;
      action?: string;
      details?: Record<string, any> | null;
      created_at?: string;
      created_by?: string | null;
    };
  };
}

// Tenant statistics
export interface TenantStats {
  tenant_id: string;
  tenant_name: string;
  tenant_slug: string;
  total_profiles: number;
  total_menus: number;
  total_orders: number;
  total_customers: number;
  tenant_created_at: string;
  tenant_status: string;
}

// Tenant audit log entry
export interface TenantAuditLogEntry {
  id: string;
  tenant_id: string;
  action: string;
  details: Record<string, any> | null;
  created_at: string;
  created_by: string | null;
}

// Utility types
export type TenantStatus = Tenant['status'];
export type TenantFeatures = Tenant['features']; 