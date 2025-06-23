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
    shortName: 'ŠS', // Using the shorter version as it's more practical for UI
    slogan: 'Zdravé stravování a rozvoz jídla',
    legalName: 'Šťastné srdce s.r.o.',
    currencies: ['CZK', 'EUR']
  },

  seo: {
    metaTitle: 'Šťastné srdce - Zdravé stravování a rozvoz jídla',
    metaDescription: 'Šťastné srdce nabízí zdravé stravování a rozvoz jídla v Mikulovicích a Jeseníku. Dietologické poradenství od Kamily Kučerové pro vaše zdraví a spokojenost.',
    metaKeywords: 'šťastné srdce, mikulovice, zdraví, dietolog, kamila kučerová, rozvoz jídla, jeseník',
    ogImage: '/og-image.jpg',
    googleAnalyticsId: '',
    googleAnalyticsEnabled: false,
    facebookPixelEnabled: false,
    facebookPixelId: ''
  },

  contact: {
    email: 'info@stastnesrdce.cz',
    phone: '777111222',
    phone1: '+420 724 448 377 Kamila Kučerová',
    phone2: '+420 732 722 115 Martin Forejt',
    address: 'Potoční 16, Mikulovice 79084',
    mapCoordinates: { 
      lat: 50.299513, 
      lng: 17.324304 
    },
    openingHours: {
      monday: '8:00-16:00',
      tuesday: '8:00-16:00',
      wednesday: '8:00-16:00',
      thursday: '8:00-16:00',
      friday: '8:00-16:00',
      saturday: 'Zavřeno',
      sunday: 'Zavřeno'
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
    footerText: 'Šťastné srdce s.r.o. 2022 - 2025',
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
    // Apple touch icon
    appleTouchIcon: '/favi/apple-touch-icon.png',
    // Web manifest
    webManifest: '/favi/site.webmanifest',
    // FontAwesome
    fontAwesomeEnabled: true,
    fontAwesomeKit: 'e5ce1babf6',
    // Lottie player
    lottiePlayerEnabled: true,
    // Custom scripts
    customHeadScripts: '',
    customBodyScripts: ''
  },

  business: {
    companyName: 'Šťastné srdce s.r.o.',
    street: 'Potoční',
    streetNumber: '16', // Using the canonical address
    zipCode: '79084',
    city: 'Mikulovice',
    ico: '21300674',
    dic: 'CZ21300674',
    bankAccount: '670100-2210515001/6210',
    // Including fields from current DB that aren't in other defaults
    paymentMethods: ['Hotově', 'Převodem'],
    deliveryOptions: ['Osobní odběr', 'Rozvoz']
  },

  email: {
    orderConfirmationTemplate: 'Děkujeme za Vaši objednávku č. {{orderNumber}}.',
    contactFormTemplate: 'Děkujeme za Váš dotaz, budeme Vás kontaktovat co nejdříve.'
  },

  integrations: {
    fakturoid: {
      enabled: false,
      connected: false,
      accounts: [],
      subdomain: '',
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
      { name: 'Přijatá', color: '#059669' },
      { name: 'Připravuje se', color: '#d97706' },
      { name: 'Připraveno', color: '#7c3aed' },
      { name: 'Expedovaná', color: '#eab308' },
      { name: 'Doručena', color: '#16a34a' },
      { name: 'Fakturovaná', color: '#10b981' },
      { name: 'Zaplacena', color: '#059669' },
      { name: 'Stornovaná', color: '#dc2626' },
      { name: 'Dokončena', color: '#16a34a' }
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
    enabled: false,
    perPage: 10,
    menuIntroText: 'Vyberte si z naší nabídky chutných a zdravých obědů.',
    visibleDays: 7,
    features: [
      { title: 'Lokální suroviny', description: 'Používáme lokální a čerstvé suroviny' },
      { title: 'Zdravé porce', description: 'Připravujeme vyváženě velkosti porcí' }
    ],
    showAllergens: true,
    showAllergensTooltip: true
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
      enabled: false,
      pointsPerCzk: 1,
      pointsValue: 0.1,
      welcomeBonus: 100,
      birthdayBonus: 200,
      enableTiers: false,
      tiers: [
        { name: 'Bronzový', minOrders: 0, discount: 0 },
        { name: 'Stříbrný', minOrders: 10, discount: 5 },
        { name: 'Zlatý', minOrders: 25, discount: 10 }
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