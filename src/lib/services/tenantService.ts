import { supabase } from '$lib/supabase';
import type { TypedSupabaseClient } from '$lib/types/database.types';

export interface Tenant {
  id: string;
  slug: string;
  name: string;
  domain?: string;
  created_at: string;
  updated_at: string;
  settings: Record<string, any>;
  features: Record<string, boolean>;
  status: 'active' | 'inactive' | 'suspended';
}

export interface TenantContext {
  tenant: Tenant | null;
  tenantId: string | null;
}

export class TenantService {
  // Nastavit tenant context pro aktuální session
  static async setTenantContext(tenantId: string): Promise<void> {
    await supabase.rpc('set_tenant_context', { tenant_id: tenantId });
  }

  // Získat aktuální tenant ID z session
  static async getCurrentTenantId(): Promise<string | null> {
    const { data, error } = await supabase.rpc('get_current_tenant_id');
    if (error) {
      console.error('Error getting current tenant ID:', error);
      return null;
    }
    return data;
  }

  // Získat tenant podle domény
  static async getTenantByDomain(domain: string): Promise<Tenant | null> {
    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .eq('domain', domain)
      .eq('status', 'active')
      .single();

    if (error) {
      console.error('Error getting tenant by domain:', error);
      return null;
    }

    return data;
  }

  // Získat tenant podle slug
  static async getTenantBySlug(slug: string): Promise<Tenant | null> {
    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'active')
      .single();

    if (error) {
      console.error('Error getting tenant by slug:', error);
      return null;
    }

    return data;
  }

  // Získat tenant podle tenant_id (pro přihlášené uživatele)
  static async getTenantById(tenantId: string): Promise<Tenant | null> {
    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .eq('id', tenantId)
      .eq('status', 'active')
      .single();

    if (error) {
      console.error('Error getting tenant by ID:', error);
      return null;
    }

    return data;
  }

  // Získat default tenant (stastnesrdce)
  static async getDefaultTenant(): Promise<Tenant | null> {
    return this.getTenantBySlug('stastnesrdce');
  }

  // Získat tenant ID podle domény nebo slug
  static async resolveTenantId(domain?: string, slug?: string): Promise<string | null> {
    if (domain) {
      const tenant = await this.getTenantByDomain(domain);
      return tenant?.id || null;
    }
    
    if (slug) {
      const tenant = await this.getTenantBySlug(slug);
      return tenant?.id || null;
    }

    // Fallback na default tenant
    const defaultTenant = await this.getDefaultTenant();
    return defaultTenant?.id || null;
  }

  // Inicializovat tenant context pro request
  static async initializeTenantContext(domain?: string, slug?: string): Promise<TenantContext> {
    const tenantId = await this.resolveTenantId(domain, slug);
    
    if (tenantId) {
      await this.setTenantContext(tenantId);
      
      // Získat tenant data
      const { data: tenant } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', tenantId)
        .single();

      return {
        tenant: tenant || null,
        tenantId
      };
    }

    return {
      tenant: null,
      tenantId: null
    };
  }

  // Inicializovat tenant context podle tenant_id (pro přihlášené uživatele)
  static async initializeTenantContextByUserId(tenantId: string): Promise<TenantContext> {
    const tenant = await this.getTenantById(tenantId);
    
    if (tenant) {
      await this.setTenantContext(tenantId);
      
      return {
        tenant,
        tenantId
      };
    }

    return {
      tenant: null,
      tenantId: null
    };
  }
} 