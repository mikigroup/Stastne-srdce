import { createClient } from "@supabase/supabase-js";
import type { TypedSupabaseClient } from "$lib/supabase";
import type { Database } from "$lib/types/database.types";
import type { FakturoidTables } from "$lib/types/fakturoid";
import { validateIntegrationsSettings } from "$lib/types/siteSettings";
import { getDefaultSettings } from '$lib/constants/defaultSettings';
import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL, PUBLIC_TENANT } from "$env/static/public";

/** Klíče, které anon politika nečte (SMTP a Fakturoid). Ostatní jsou veřejná. */
const RESTRICTED_SETTING_KEYS = new Set(["email", "integrations"]);

let publicSettingsClient: TypedSupabaseClient | null = null;

/**
 * Čtení veřejných site_settings bez uživatelské session.
 * Politika site_settings_anon_public_read platí jen pro roli anon.
 * Přihlášený zákazník by jinak dostal 0 řádků a PostgREST 406.
 */
function getPublicSettingsClient(): TypedSupabaseClient {
    if (!publicSettingsClient) {
        publicSettingsClient = createClient<Database & { public: FakturoidTables }>(
            PUBLIC_SUPABASE_URL,
            PUBLIC_SUPABASE_ANON_KEY,
            {
                auth: {
                    persistSession: false,
                    autoRefreshToken: false,
                    detectSessionInUrl: false,
                    storageKey: "sb-public-settings"
                }
            }
        );
    }
    return publicSettingsClient;
}

/**
 * Helper funkce pro serializaci hodnoty pro site_settings
 */
export function serializeSettingValue(value: any): string {
    return JSON.stringify(value);
}

/**
 * Helper funkce pro deserializaci hodnoty z site_settings
 */
export function deserializeSettingValue(value: any): any {
    if (value === null || value === undefined) {
        return null;
    }
    
    try {
        if (typeof value === 'string') {
            return JSON.parse(value);
        } else if (typeof value === 'object') {
            // Return object values as-is, they're already deserialized
            return value;
        } else {
            // For other types, convert to string representation
            return String(value);
        }
    } catch (e) {
        console.error('Error deserializing setting value:', e);
        return null;
    }
}

/**
 * Získá default tenant ID pro zpětnou kompatibilitu
 */
async function getDefaultTenantId(supabase: TypedSupabaseClient): Promise<string | null> {
    try {
        // Použijeme pouze PUBLIC_TENANT, žádný fallback
        if (PUBLIC_TENANT) {
            return PUBLIC_TENANT;
        }
        
        return null;
    } catch (e) {
        console.error('Error getting default tenant ID:', e);
        return null;
    }
}

/**
 * Načte nastavení z databáze s podporou tenant_id
 */
export async function getSetting(supabase: TypedSupabaseClient, key: string, tenantId?: string) {
    try {
        const client = RESTRICTED_SETTING_KEYS.has(key) ? supabase : getPublicSettingsClient();
        let query = client
            .from('site_settings')
            .select('value')
            .eq('key', key);
        
        // Pokud máme tenant_id, použijeme ho
        if (tenantId) {
            query = query.eq('tenant_id', tenantId);
        } else {
            // Pro zpětnou kompatibilitu použijeme default tenant
            const defaultTenantId = await getDefaultTenantId(supabase);
            if (defaultTenantId) {
                query = query.eq('tenant_id', defaultTenantId);
            }
        }
        
        const { data, error } = await query.maybeSingle();
        
        if (error) {
            if (error.code !== "PGRST116") {
                console.error(`Error loading setting ${key}:`, error);
            }
            return null;
        }

        if (!data) {
            return null;
        }
        
        const value = deserializeSettingValue(data?.value);

        // Validace pro integrations
        if (key === 'integrations') {
            const validation = validateIntegrationsSettings(value);
            if (!validation.success) {
                console.error('Invalid integrations settings:', validation.error);
                return getDefaultSettings('integrations');
            }
            return validation.data;
        }
        
        return value;
    } catch (e) {
        console.error(`Error getting setting ${key}:`, e);
        return null;
    }
}

/**
 * Uloží nastavení do databáze s podporou tenant_id
 */
export async function saveSetting(
    supabase: TypedSupabaseClient, 
    key: string, 
    value: any, 
    userId: string,
    tenantId?: string
) {
    try {
        // Validace pro integrations
        if (key === 'integrations') {
            const validation = validateIntegrationsSettings(value);
            if (!validation.success) {
                console.error('Invalid integrations settings:', validation.error);
                return false;
            }
            value = validation.data;
        }

        // Získáme tenant_id pro uložení
        let targetTenantId = tenantId;
        if (!targetTenantId) {
            targetTenantId = await getDefaultTenantId(supabase) || undefined;
        }

        if (!targetTenantId) {
            console.error('No tenant ID available for saving setting');
            return false;
        }

        const { error } = await supabase
            .from('site_settings')
            .upsert({
                key,
                value: serializeSettingValue(value),
                updated_at: new Date().toISOString(),
                updated_by: userId,
                user_id: userId,
                tenant_id: targetTenantId
            }, {
                onConflict: 'key,tenant_id'
            });
        
        if (error) {
            console.error(`Error saving setting ${key}:`, error);
            return false;
        }
        
        return true;
    } catch (e) {
        console.error(`Error saving setting ${key}:`, e);
        return false;
    }
}

/**
 * Načte všechna nastavení pro daný tenant
 */
export async function getAllSettings(supabase: TypedSupabaseClient, tenantId?: string) {
    try {
        let query = supabase
            .from('site_settings')
            .select('*');
        
        // Pokud máme tenant_id, použijeme ho
        if (tenantId) {
            query = query.eq('tenant_id', tenantId);
        } else {
            // Pro zpětnou kompatibilitu použijeme default tenant
            const defaultTenantId = await getDefaultTenantId(supabase);
            if (defaultTenantId) {
                query = query.eq('tenant_id', defaultTenantId);
            }
        }
        
        const { data, error } = await query;
        
        if (error) {
            console.error('Error loading all settings:', error);
            return [];
        }
        
        return data || [];
    } catch (e) {
        console.error('Error loading all settings:', e);
        return [];
    }
} 