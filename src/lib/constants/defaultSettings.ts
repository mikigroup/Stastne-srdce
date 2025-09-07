/**
 * UNIFIED DEFAULT SETTINGS
 * Single source of truth for all default values across the application
 * 
 * Based on current DB state and consolidating differences from:
 * - +page.svelte DEFAULT_VALUES
 * - settingsService.ts DEFAULT_SETTINGS  
 * - eshopSettingsService.ts getDefault* functions
 * - init-site-settings.js DEFAULT_SETTINGS
 */

export const UNIFIED_DEFAULT_SETTINGS = {
  general: {
    shopName: 'Šťastné srdce',
    currencies: ['CZK', 'EUR']
  },

  seo: {
    metaTitle: 'Šťastné srdce - Zdravé stravování a rozvoz jídla',
    metaDescription: 'Šťastné srdce nabízí zdravé stravování a rozvoz jídla v Mikulovicích a Jeseníku. Dietologické poradenství od Kamily Kučerové pro vaše zdraví a spokojenost.',
    metaKeywords: 'šťastné srdce, mikulovice, zdraví, dietolog, kamila forejtová, rozvoz jídla, jeseník',
    ogImage: '/og-image.jpg',
    // Meta tagy
    metaAuthor: 'malyleo.cz',
    metaCopyright: 'Šťastné srdce',
    metaRobots: 'index, follow',
    // Open Graph
    ogType: 'website',
    ogUrl: 'https://www.stastnesrdce.cz',
    ogLocale: 'cs_CZ',
    // Twitter
    twitterCard: 'summary_large_image',
    // Web App
    appleTouchIcon: '/favi/apple-touch-icon.png',
    webManifest: '/favi/site.webmanifest',
    // Custom scripts
    customHeadScripts: '',
    customBodyScripts: '',
    // Analytics
    googleAnalyticsId: '',
    googleAnalyticsEnabled: false,
    facebookPixelEnabled: false,
    facebookPixelId: ''
  },

  contact: {
    email: '',
    phone: '',
    phone1: '',
    phone2: '',
    address: '',
    mapCoordinates: { 
      lat: 50.299513, 
      lng: 17.324304 
    },
    showOpeningHours: true,
    openingHours: {
      monday: '',
      tuesday: '',
      wednesday: '',
      thursday: '',
      friday: '',
      saturday: '',
      sunday: ''
    }
  },

  social: {
    facebook: 'https://facebook.com/stastnesrdce',
    instagram: '',
    twitter: '',
    linkedin: '',
    youtube: ''
  },

  appearance: {
    logo: '/favi/web-app-manifest-192x192.png',
    favicon: '/favi/favicon.ico',
    primaryColor: '#3CB371',
    secondaryColor: '#4A5568',
    footerText: '',
    // FontAwesome
    fontAwesomeEnabled: true,
    fontAwesomeKit: 'e5ce1babf6',
    // Lottie player
    lottiePlayerEnabled: true
  },

  business: {
    companyName: '',
    street: '',
    streetNumber: '',
    zipCode: '',
    city: '',
    ico: '',
    dic: '',
    bankAccount: '',
    // Including fields from current DB that aren't in other defaults
    paymentMethods: ['Hotově', 'Převodem'],
    deliveryOptions: ['Osobní odběr', 'Rozvoz']
  },

  email: {
    orderConfirmationTemplate: 'Děkujeme za Vaši objednávku č. {{orderNumber}}.',
    contactFormTemplate: 'Děkujeme za Váš dotaz, budeme Vás kontaktovat co nejdříve.',
    // Nové šablony pro lepší komunikaci
    welcomeEmailTemplate: 'Vítejte v Šťastném srdci! Děkujeme za registraci.',
    birthdayEmailTemplate: 'Všechno nejlepší k narozeninám! Máte slevu {{discount}}%.',
    loyaltyUpgradeTemplate: 'Gratulujeme! Byli jste povýšeni na {{tierName}}.',
    orderReminderTemplate: 'Nezapomeňte si objednat oběd na zítra!',
    deliveryNotificationTemplate: 'Vaše objednávka byla odeslána k doručení.',
    paymentReminderTemplate: 'Připomínáme platbu za objednávku č. {{orderNumber}}.',
    menuUpdateTemplate: 'Nové menu je k dispozici! Podívejte se na naše nabídky.',
    specialOfferTemplate: 'Speciální nabídka jen pro vás: {{offer}}',
    feedbackRequestTemplate: 'Jak se vám líbilo vaše jídlo? Dejte nám vědět!',
    reactivationTemplate: 'Váš účet byl úspěšně obnoven. Vítejte zpět!'
  },

  integrations: {
    fakturoid: {
      enabled: false,
      connected: false,
      subdomain: '', // Ruční zadání subdomény
      accounts: [],
      defaultLanguage: 'cz',
      autoCreateInvoices: false,
      invoiceDueDays: 14,
      defaultPaymentMethod: 'bank',
      sendInvoiceEmail: false,
      invoiceNote: ''
    }
  },

  eshop: {
    enabled: false,
    orderStates: [
      { name: 'Nová', color: '#0284c7' },
      { name: 'Expedovaná', color: '#eab308' },
      { name: 'Fakturovaná', color: '#16a34a' },
      { name: 'Stornovaná', color: '#dc2626' }
    ]
  },

  orders: {
    enabled: true,
    orderStates: [
      { name: 'Nová', color: '#0284c7' },
      { name: 'Expedovaná', color: '#eab308' },
      { name: 'Fakturovaná', color: '#16a34a' },
      { name: 'Stornovaná', color: '#dc2626' }
      // Zakomentované stavy - nepoužívají se:
      // { name: 'Přijatá', color: '#059669' },
      // { name: 'Připravuje se', color: '#d97706' },
      // { name: 'Připraveno', color: '#7c3aed' },
      // { name: 'Doručena', color: '#16a34a' },
      // { name: 'Zaplacena', color: '#059669' },
      // { name: 'Dokončena', color: '#16a34a' }
    ],
    notificationEmail: 'admin@stastnesrdce.cz'
  },

  delivery: {
    enabled: true,
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
    minimumOrderValue: 0,
    freeDeliveryThreshold: 1000
  },

  products: {
    perPage: 10,
    visibleDays: 7,
    showAllergens: true,
    showAllergensTooltip: true,
    showPrices: true,
    menuVariantsCount: 3,
    allowVariableVariants: true,
    minVariants: 1,
    maxVariants: 10,
    // Nastavení pro zobrazení menu pro další den
    nextDayMenuTime: '17:00', // Čas, kdy se začne zobrazovat menu pro další den
    nextDayMenuEnabled: true, // Zda zobrazovat menu pro další den
    // Časové sloty pro objednávky
    timeSlotsEnabled: false, // Zda povolit časové sloty
    advanceOrderDays: 1, // Počet dnů dopředu pro objednávky
    orderDeadlineTime: '10:00', // Uzavírací čas objednávek
    timeSlots: [
      { startTime: '11:00', endTime: '12:00' },
      { startTime: '12:00', endTime: '13:00' },
      { startTime: '13:00', endTime: '14:00' }
    ],
    showTimeSlotAvailability: true // Zobrazovat dostupnost slotů
  },

  customer: {
    enabled: false,
    registration: {
      requireRegistration: false,
      allowGuestOrders: true,
      requireEmailVerification: false,
      requirePhoneVerification: false,
      autoCreateAccount: true
    },
    loyalty: {
      enabled: true,
      pointsPerCzk: 1, // 1 Kč = 1 bod
      pointsValue: 0.01, // 1 bod = 1 haléř (0.01 Kč)
      welcomeBonus: 100, // Uvítací bonus pro nové zákazníky
      birthdayBonus: 200, // Bonus k narozeninám
      enableTiers: true,
      tiers: [
        { 
          name: 'NEW', 
          label: 'Nový zákazník',
          minOrders: 0, 
          discount: 5,
          bonus: 0,
          color: '#6B7280',
          icon: '🆕',
          description: 'Nový zákazník - základní sleva 5%'
        },
        { 
          name: 'REGULAR', 
          label: 'Pravidelný zákazník',
          minOrders: 3, 
          discount: 10,
          bonus: 10,
          color: '#3B82F6',
          icon: '👤',
          description: 'Pravidelný zákazník - sleva 10%, bonus 10%'
        },
        { 
          name: 'LOYAL', 
          label: 'Věrný zákazník',
          minOrders: 10, 
          discount: 15,
          bonus: 20,
          color: '#EAB308',
          icon: '⭐',
          description: 'Věrný zákazník - sleva 15%, bonus 20%'
        },
        { 
          name: 'VIP', 
          label: 'VIP zákazník',
          minOrders: 20, 
          discount: 20,
          bonus: 30,
          color: '#8B5CF6',
          icon: '💎',
          description: 'VIP zákazník - sleva 20%, bonus 30%'
        }
      ],
      // Dodatečná nastavení
      inactivityThreshold: 90, // Dny pro označení jako neaktivní
      pointsExpiryMonths: 12, // Měsíce do expirace bodů
      maxPointsPerOrder: 10000, // Maximální body za jednu objednávku
      enableAutoTierUpgrade: true, // Automatické povýšení úrovně
      enableTierDowngrade: false, // Automatické snížení úrovně
      // Kampaně a akce
      campaigns: [
        {
          name: 'Jarní restart',
          description: '2x body za zdravé jídlo',
          multiplier: 2.0,
          startDate: '2024-03-01',
          endDate: '2024-05-31',
          applicableTiers: ['NEW', 'REGULAR', 'LOYAL', 'VIP']
        }
      ]
    },
    communication: {
      enableNewsletters: true,
      enableSmsMarketing: false,
      enablePushNotifications: false,
      enableOrderReminders: true,
      enableBirthdayMessages: false,
      enableFeedbackRequests: true
    },
    privacy: {
      enableGdprCompliance: true,
      dataRetentionMonths: 36,
      enableCookieConsent: true,
      enableDataExport: true,
      enableAccountDeletion: true
    },
    segmentation: {
      enableAutoSegmentation: false,
      segments: [
        { name: 'Noví zákazníci', criteria: 'orders_count < 3' },
        { name: 'Pravidelní zákazníci', criteria: 'orders_count >= 10' },
        { name: 'VIP zákazníci', criteria: 'total_spent > 10000' }
      ]
    }
  },

  inventory: {
    enabled: false,
    lowStock: 10,
    stockManagement: {
      enableStockTracking: true,
      enableLowStockAlerts: true,
      lowStockThreshold: 5,
      enableOutOfStockNotifications: true,
      allowBackorders: false,
      enableStockReservation: true,
      reservationTimeMinutes: 30
    },
    autoReplenishment: {
      enabled: false,
      defaultReorderPoint: 10,
      defaultReorderQuantity: 50,
      enableSeasonalAdjustments: false,
      leadTimeDays: 1
    },
    menuPlanning: {
      enableCapacityPlanning: true,
      defaultDailyCapacity: 100,
      enableIngredientTracking: false,
      enableNutritionalTracking: false,
      enableCostTracking: true
    },
    alerts: {
      enableDailyCapacityAlerts: true,
      enableIngredientShortageAlerts: false,
      enableExpirationAlerts: false,
      alertEmailRecipients: ['admin@stastnesrdce.cz']
    },
    reporting: {
      enableDailyReports: true,
      enableWeeklyReports: true,
      enableMonthlyReports: false,
      includeWasteTracking: false,
      includeCostAnalysis: true
    }
  }
} as const;

// Type definitions derived from the unified settings
export type SiteSettings = typeof UNIFIED_DEFAULT_SETTINGS;
export type GeneralSettings = SiteSettings['general'];
export type SeoSettings = SiteSettings['seo'];
export type ContactSettings = SiteSettings['contact'];
export type SocialSettings = SiteSettings['social'];
export type AppearanceSettings = SiteSettings['appearance'];
export type BusinessSettings = SiteSettings['business'];
export type EmailSettings = SiteSettings['email'];
export type IntegrationsSettings = SiteSettings['integrations'];
export type EshopSettings = SiteSettings['eshop'];
export type OrdersSettings = SiteSettings['orders'];
export type DeliverySettings = SiteSettings['delivery'];
export type ProductsSettings = SiteSettings['products'];
export type CustomerSettings = SiteSettings['customer'];
export type InventorySettings = SiteSettings['inventory'];

// Helper function to get default for specific section
export function getDefaultSettings<K extends keyof SiteSettings>(
  section: K
): SiteSettings[K] {
  return UNIFIED_DEFAULT_SETTINGS[section];
}

// Helper function to get all default settings
export function getAllDefaultSettings(): SiteSettings {
  return UNIFIED_DEFAULT_SETTINGS;
}

// Helper function to convert to init script format
export function getDefaultSettingsForInit() {
  return Object.entries(UNIFIED_DEFAULT_SETTINGS).map(([key, value]) => ({
    key,
    value
  }));
}