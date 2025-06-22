import type { TypedSupabaseClient } from "$lib/supabase";
import { validateIntegrationsSettings, getDefaultIntegrationsSettings } from "$lib/types/siteSettings";
import { getDefaultSettings } from '$lib/constants/defaultSettings';

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
 * Načte nastavení z databáze
 */
export async function getSetting(supabase: TypedSupabaseClient, key: string) {
    try {
        const { data, error } = await supabase
            .from('site_settings')
            .select('value')
            .eq('key', key)
            .single();
        
        if (error) {
            console.error(`Error loading setting ${key}:`, error);
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
 * Uloží nastavení do databáze
 */
export async function saveSetting(
    supabase: TypedSupabaseClient, 
    key: string, 
    value: any, 
    userId: string
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

        const { error } = await supabase
            .from('site_settings')
            .upsert({
                key,
                value: serializeSettingValue(value),
                updated_at: new Date().toISOString(),
                updated_by: userId,
                user_id: userId
            }, {
                onConflict: 'key'
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