import type { TypedSupabaseClient } from "$lib/supabase";
import { getDefaultSettings } from '$lib/constants/defaultSettings';

/**
 * Načte nastavení objednávek z databáze (nový anglický název)
 */
export async function getOrderSettings(supabase: TypedSupabaseClient) {
    try {
        const { data, error } = await supabase
            .from('site_settings')
            .select('value')
            .eq('key', 'orders')
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
 * Načte nastavení zakázek z databáze (starý český název pro zpětnou kompatibilitu)
 */
export async function getZakazkySettings(supabase: TypedSupabaseClient) {
    try {
        const { data, error } = await supabase
            .from('site_settings')
            .select('value')
            .eq('key', 'eshop')
            .single();
        
        if (error) {
            console.error('Error loading zakazky settings:', error);
            return getDefaultZakazkySettings();
        }
        
        if (data && data.value) {
            return typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
        }
        
        return getDefaultZakazkySettings();
    } catch (e) {
        console.error('Error parsing zakazky settings:', e);
        return getDefaultZakazkySettings();
    }
}

/**
 * Načte nastavení dopravy z databáze
 */
export async function getDopravaSettings(supabase: TypedSupabaseClient) {
    try {
        const { data, error } = await supabase
            .from('site_settings')
            .select('value')
            .eq('key', 'doprava')
            .single();
        
        if (error) {
            console.error('Error loading doprava settings:', error);
            return getDefaultDopravaSettings();
        }
        
        if (data && data.value) {
            return typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
        }
        
        return getDefaultDopravaSettings();
    } catch (e) {
        console.error('Error parsing doprava settings:', e);
        return getDefaultDopravaSettings();
    }
  }

/**
 * Vrátí výchozí nastavení objednávek (nový anglický název)
 */
export function getDefaultOrderSettings() {
    return getDefaultSettings('orders');
}

/**
 * Vrátí výchozí nastavení dopravy (nový anglický název)
 */
export function getDefaultDeliverySettings() {
    return getDefaultSettings('delivery');
}

/**
 * Vrátí výchozí nastavení zakázek (dříve e-shop), pokud v databázi nejsou žádná
 */
export function getDefaultZakazkySettings() {
    return getDefaultSettings('eshop');
}

/**
 * Vrátí výchozí nastavení dopravy, pokud v databázi nejsou žádná (starý český název)
 */
export function getDefaultDopravaSettings() {
    return getDefaultSettings('delivery');
}

/**
 * Vrátí výchozí obecná nastavení včetně měn
 */
export function getDefaultGeneralSettings() {
    return getDefaultSettings('general');
}

/**
 * Vrátí výchozí nastavení produktů, pokud v databázi nejsou žádná
 */
export function getDefaultProductSettings() {
    return getDefaultSettings('products');
}

// Pro zpětnou kompatibilitu ponecháváme původní funkce se stejným jménem
export function getEshopSettings(supabase: TypedSupabaseClient) {
    return getZakazkySettings(supabase);
}

export function getDefaultEshopSettings() {
    return getDefaultSettings('eshop');
}

/**
 * Vrátí barvu pro daný stav objednávky
 */
export function getOrderStateColor(stateName: string, settings: any) {
    if (!settings?.orderStates) return '#9ca3af'; // default gray
    
    const state = settings.orderStates.find((state: any) => state.name === stateName);
    return state ? state.color : '#9ca3af';
}

/**
 * Formátuje cenu podle zadané měny
 */
export function formatPrice(price: number, currencyCode: string = 'CZK', settings: any) {
    let currencies = settings?.currencies;
    
    // Nejprve zkusíme najít měny v obecných nastaveních
    if (!currencies && settings?.general?.currencies) {
        currencies = settings.general.currencies;
    }
    
    // Pak zkusíme najít měny v eshop nastaveních (zpětná kompatibilita)
    if (!currencies && settings?.eshop?.currencies) {
        currencies = settings.eshop.currencies;
    }
    
    if (!currencies) {
        // Fallback pro formátování, když nejsou k dispozici nastavení
        return new Intl.NumberFormat('cs-CZ', { 
            style: 'currency', 
            currency: currencyCode 
        }).format(price);
    }
    
    const currency = currencies.find((curr: any) => curr.code === currencyCode);
    if (!currency) {
        return new Intl.NumberFormat('cs-CZ', { 
            style: 'currency', 
            currency: currencyCode 
        }).format(price);
    }
    
    // Vlastní formátování s uživatelsky nastaveným symbolem
    return `${new Intl.NumberFormat('cs-CZ').format(price)} ${currency.symbol}`;
}

/**
 * Vrátí výchozí nastavení zákazníků, pokud v databázi nejsou žádná
 */
export function getDefaultCustomerSettings() {
    return getDefaultSettings('customer');
}

/**
 * Vrátí výchozí nastavení inventáře, pokud v databázi nejsou žádná
 */
export function getDefaultInventorySettings() {
    return getDefaultSettings('inventory');
} 