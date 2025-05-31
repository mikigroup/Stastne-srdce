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
        // Stavy objednávek
        orderStates: [
            { name: 'Nová', color: '#0284c7' },
            { name: 'Expedovaná', color: '#eab308' },
            { name: 'Fakturovaná', color: '#16a34a' },
            { name: 'Stornovaná', color: '#dc2626' }
        ],
        
        // Automatizace objednávek
        automation: {
            autoConfirmOrders: true,
            autoConfirmAfterMinutes: 30,
            autoCompleteAfterDays: 7,
            sendConfirmationEmail: true,
            sendStatusUpdateEmails: true,
            sendReminderEmails: false,
            reminderHoursBefore: 24
        },
        
        // Časové limity
        timeSettings: {
            orderDeadlineHour: 17, // Do kdy lze objednávat na další den
            orderDeadlineMinute: 0,
            advanceOrderDays: 7, // Kolik dní dopředu lze objednávat
            cancelDeadlineHours: 24, // Do kdy lze zrušit objednávku
            editDeadlineHours: 12 // Do kdy lze upravit objednávku
        },
        
        // Omezení objednávek
        orderLimits: {
            maxItemsPerOrder: 10,
            maxOrdersPerDay: 3,
            maxOrdersPerWeek: 15,
            requireMinimumAmount: false,
            minimumOrderAmount: 0
        },
        
        // Platební metody
        paymentMethods: [
            { name: 'Hotově při převzetí', code: 'cash', enabled: true, fee: 0 },
            { name: 'Kartou při převzetí', code: 'card', enabled: true, fee: 0 },
            { name: 'Bankovní převod', code: 'bank', enabled: true, fee: 0 },
            { name: 'Online platba', code: 'online', enabled: false, fee: 0 }
        ],
        
        // Slevy a kupóny
        discounts: {
            enableLoyaltyDiscount: false,
            loyaltyDiscountPercent: 5,
            loyaltyOrdersRequired: 10,
            enableBulkDiscount: false,
            bulkDiscountPercent: 10,
            bulkDiscountMinItems: 5,
            enableCoupons: false
        },
        
        // Notifikace
        notifications: {
            adminNewOrderEmail: true,
            adminOrderStatusEmail: false,
            customerOrderConfirmEmail: true,
            customerStatusUpdateEmail: true,
            smsNotifications: false,
            pushNotifications: false
        }
    };
}

/**
 * Vrátí výchozí nastavení dopravy, pokud v databázi nejsou žádná
 */
export function getDefaultDopravaSettings() {
    return {
        // Způsoby dopravy
        shippingMethods: [
            { 
                name: 'Osobní odběr', 
                code: 'pickup',
                price: 0, 
                enabled: true,
                description: 'Vyzvednutí na prodejně',
                estimatedTime: '0 minut',
                availableDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
            },
            { 
                name: 'Doručení na adresu', 
                code: 'delivery',
                price: 150, 
                enabled: true,
                description: 'Doručení kurýrem',
                estimatedTime: '30-60 minut',
                availableDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
            }
        ],
        
        // Obecná nastavení
        minimumOrderValue: 0,
        freeDeliveryThreshold: 1000,
        
        // Časové sloty pro doručení
        deliveryTimeSlots: {
            enabled: true,
            slotDuration: 60, // minuty
            slots: [
                { start: '11:00', end: '12:00', enabled: true, maxOrders: 10 },
                { start: '12:00', end: '13:00', enabled: true, maxOrders: 15 },
                { start: '13:00', end: '14:00', enabled: true, maxOrders: 10 }
            ]
        },
        
        // Doručovací zóny
        deliveryZones: [
            { 
                name: 'Mikulovice centrum', 
                postcodes: ['79084'], 
                price: 0, 
                enabled: true,
                estimatedTime: '15-30 minut'
            },
            { 
                name: 'Jeseník', 
                postcodes: ['79001'], 
                price: 50, 
                enabled: true,
                estimatedTime: '30-45 minut'
            },
            { 
                name: 'Okolní obce', 
                postcodes: ['79085', '79086'], 
                price: 100, 
                enabled: true,
                estimatedTime: '45-60 minut'
            }
        ],
        
        // Nastavení kurýrů
        couriers: {
            maxOrdersPerCourier: 8,
            maxDeliveryRadius: 15, // km
            enableRouteOptimization: false,
            enableGpsTracking: false
        },
        
        // Speciální dny
        specialDays: {
            enableHolidayDelivery: false,
            holidayDeliveryFee: 100,
            enableWeekendDelivery: false,
            weekendDeliveryFee: 50
        }
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
    return {
        enabled: false,
        orderStates: [
            { name: 'Nová', color: '#0284c7' },
            { name: 'Expedovaná', color: '#eab308' },
            { name: 'Fakturovaná', color: '#16a34a' },
            { name: 'Stornovaná', color: '#dc2626' }
        ],
        currencies: [
            { code: 'CZK', symbol: 'Kč', name: 'Česká koruna' }
        ]
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

/**
 * Vrátí výchozí nastavení zákazníků, pokud v databázi nejsou žádná
 */
export function getDefaultCustomerSettings() {
    return {
        // Registrace zákazníků
        registration: {
            requireRegistration: false,
            allowGuestOrders: true,
            requireEmailVerification: false,
            requirePhoneVerification: false,
            autoCreateAccount: true
        },
        
        // Věrnostní program
        loyalty: {
            enabled: false,
            pointsPerCzk: 1, // body za 1 Kč
            pointsValue: 0.1, // hodnota 1 bodu v Kč
            welcomeBonus: 100,
            birthdayBonus: 200,
            enableTiers: false,
            tiers: [
                { name: 'Bronzový', minOrders: 0, discount: 0 },
                { name: 'Stříbrný', minOrders: 10, discount: 5 },
                { name: 'Zlatý', minOrders: 25, discount: 10 }
            ]
        },
        
        // Komunikace se zákazníky
        communication: {
            enableNewsletters: true,
            enableSmsMarketing: false,
            enablePushNotifications: false,
            enableOrderReminders: true,
            enableBirthdayMessages: false,
            enableFeedbackRequests: true
        },
        
        // Ochrana osobních údajů
        privacy: {
            enableGdprCompliance: true,
            dataRetentionMonths: 36,
            enableCookieConsent: true,
            enableDataExport: true,
            enableAccountDeletion: true
        },
        
        // Segmentace zákazníků
        segmentation: {
            enableAutoSegmentation: false,
            segments: [
                { name: 'Noví zákazníci', criteria: 'orders_count < 3' },
                { name: 'Pravidelní zákazníci', criteria: 'orders_count >= 10' },
                { name: 'VIP zákazníci', criteria: 'total_spent > 10000' }
            ]
        }
    };
}

/**
 * Vrátí výchozí nastavení inventáře, pokud v databázi nejsou žádná
 */
export function getDefaultInventorySettings() {
    return {
        // Správa zásob
        stockManagement: {
            enableStockTracking: true,
            enableLowStockAlerts: true,
            lowStockThreshold: 5,
            enableOutOfStockNotifications: true,
            allowBackorders: false,
            enableStockReservation: true,
            reservationTimeMinutes: 30
        },
        
        // Automatické doplňování
        autoReplenishment: {
            enabled: false,
            defaultReorderPoint: 10,
            defaultReorderQuantity: 50,
            enableSeasonalAdjustments: false,
            leadTimeDays: 1
        },
        
        // Plánování menu
        menuPlanning: {
            enableCapacityPlanning: true,
            defaultDailyCapacity: 100,
            enableIngredientTracking: false,
            enableNutritionalTracking: false,
            enableCostTracking: true
        },
        
        // Varování a limity
        alerts: {
            enableDailyCapacityAlerts: true,
            enableIngredientShortageAlerts: false,
            enableExpirationAlerts: false,
            alertEmailRecipients: ['admin@stastnesrdce.cz']
        },
        
        // Reporting
        reporting: {
            enableDailyReports: true,
            enableWeeklyReports: true,
            enableMonthlyReports: false,
            includeWasteTracking: false,
            includeCostAnalysis: true
        }
    };
} 