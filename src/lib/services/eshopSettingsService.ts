import type { TypedSupabaseClient } from "$lib/supabase";

/**
 * Načte nastavení zakázek z databáze
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
 * Vrátí výchozí nastavení zakázek (dříve e-shop), pokud v databázi nejsou žádná
 */
export function getDefaultZakazkySettings() {
    return {
        orderStates: [
            { name: 'Nová', color: '#0284c7' },
            { name: 'Zpracovává se', color: '#eab308' },
            { name: 'Dokončená', color: '#16a34a' },
            { name: 'Zrušená', color: '#dc2626' }
        ]
    };
}

/**
 * Vrátí výchozí nastavení dopravy, pokud v databázi nejsou žádná
 */
export function getDefaultDopravaSettings() {
    return {
        shippingMethods: [
            { name: 'Osobní odběr', price: 0 },
            { name: 'Doručení na adresu', price: 150 }
        ],
        minimumOrderValue: 0,
        freeDeliveryThreshold: 1000
    };
}

/**
 * Vrátí výchozí obecná nastavení včetně měn
 */
export function getDefaultGeneralSettings() {
    return {
        shopName: "Šťastné srdce",
        shortName: "Šťastné",
        slogan: "Zdravé stravování a rozvoz jídla",
        legalName: "Šťastné srdce s.r.o.",
        currencies: [
            { code: 'CZK', symbol: 'Kč', name: 'Česká koruna' }
        ]
    };
}

/**
 * Vrátí výchozí nastavení produktů, pokud v databázi nejsou žádná
 */
export function getDefaultProductSettings() {
    return {
        menuTitle: 'Obědy',
        menuIntroText: 'Vyberte si z naší nabídky chutných a zdravých obědů.',
        visibleDays: 7,
        showAllergens: true,
        showAllergensTooltip: true,
        features: [
            { title: 'Lokální suroviny', description: 'Používáme lokální a čerstvé suroviny' },
            { title: 'Zdravé porce', description: 'Připravujeme vyváženě velkosti porcí' }
        ]
    };
}

// Pro zpětnou kompatibilitu ponecháváme původní funkce se stejným jménem
export function getEshopSettings(supabase: TypedSupabaseClient) {
    return getZakazkySettings(supabase);
}

export function getDefaultEshopSettings() {
    // Pro zpětnou kompatibilitu, vrátíme původní strukturu včetně currencies a shippingMethods
    return {
        orderStates: getDefaultZakazkySettings().orderStates,
        currencies: getDefaultGeneralSettings().currencies,
        shippingMethods: getDefaultDopravaSettings().shippingMethods
    };
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