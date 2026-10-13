import type { TypedSupabaseClient } from "$lib/supabase";
import { getDefaultSettings } from '$lib/constants/defaultSettings';
import { PUBLIC_TENANT } from '$env/static/public';

/**
 * Načte nastavení objednávek z databáze
 */
export async function getOrderSettings(supabase: TypedSupabaseClient) {
    try {
        const { data, error } = await supabase
            .from('site_settings')
            .select('value')
            .eq('key', 'orders')
            .eq('tenant_id', PUBLIC_TENANT)
            .single();
        
        if (error) {
            console.error('Error loading order settings:', error);
            return getDefaultOrderSettings();
        }
        
        if (data && data.value) {
            return typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
        }
        
        return getDefaultOrderSettings();
    } catch (e) {
        console.error('Error parsing order settings:', e);
        return getDefaultOrderSettings();
    }
}

/**
 * Vrátí výchozí nastavení objednávek
 */
export function getDefaultOrderSettings() {
    return getDefaultSettings('orders');
}

/**
 * Vrátí výchozí nastavení dopravy
 */
export function getDefaultDeliverySettings() {
    return getDefaultSettings('delivery');
}
