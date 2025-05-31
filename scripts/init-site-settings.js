import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Načteme environment proměnné
dotenv.config();

const supabaseUrl = process.env.PRIVATE_SBUrl || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.PRIVATE_SBKey || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Chybí Supabase credentials v .env souboru');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Výchozí nastavení
const DEFAULT_SETTINGS = [
  {
    key: 'general',
    value: {
      shopName: 'Šťastné srdce',
      shortName: 'ŠS',
      legalName: 'Šťastné srdce s.r.o.'
    }
  },
  {
    key: 'seo',
    value: {
      metaTitle: '',
      metaDescription: '',
      metaKeywords: '',
      ogImage: '',
      googleAnalyticsId: ''
    }
  },
  {
    key: 'contact',
    value: {
      email: '',
      phone: '',
      address: '',
      mapCoordinates: { lat: 0, lng: 0 },
      openingHours: {}
    }
  },
  {
    key: 'social',
    value: {
      facebook: '',
      instagram: '',
      twitter: '',
      linkedin: '',
      youtube: ''
    }
  },
  {
    key: 'appearance',
    value: {
      logo: '',
      favicon: '',
      primaryColor: '#10b981',
      secondaryColor: '#3b82f6',
      footerText: ''
    }
  },
  {
    key: 'business',
    value: {
      companyName: '',
      street: '',
      streetNumber: '',
      zipCode: '',
      city: '',
      ico: '',
      dic: '',
      bankAccount: ''
    }
  },
  {
    key: 'email',
    value: {
      orderConfirmationTemplate: '',
      contactFormTemplate: ''
    }
  },
  {
    key: 'integrations',
    value: {
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
      },
      googleAnalyticsEnabled: false,
      googleAnalyticsTrackingId: '',
      facebookPixelEnabled: false,
      facebookPixelId: ''
    }
  },
  {
    key: 'eshop',
    value: {
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
    }
  },
  {
    key: 'doprava',
    value: {
      shippingMethods: [],
      minimumOrderValue: 0,
      freeDeliveryThreshold: 1000
    }
  },
  {
    key: 'products',
    value: {
      menuTitle: 'Obědy',
      menuIntroText: '',
      visibleDays: 7,
      features: [],
      showAllergens: true,
      showAllergensTooltip: true
    }
  },
  {
    key: 'customer',
    value: {
      allowRegistration: true,
      requireEmailVerification: true,
      defaultRole: 'customer'
    }
  },
  {
    key: 'inventory',
    value: {
      trackInventory: false,
      lowStockThreshold: 10
    }
  }
];

async function initializeSettings() {
  console.log('🚀 Inicializace výchozích nastavení...');

  try {
    // Načteme existující nastavení
    const { data: existingSettings, error: fetchError } = await supabase
      .from('site_settings')
      .select('key');

    if (fetchError) {
      console.error('❌ Chyba při načítání existujících nastavení:', fetchError);
      return;
    }

    const existingKeys = new Set(existingSettings?.map(s => s.key) || []);
    const missingSettings = DEFAULT_SETTINGS.filter(s => !existingKeys.has(s.key));

    if (missingSettings.length === 0) {
      console.log('✅ Všechna nastavení již existují');
      return;
    }

    console.log(`📝 Přidávám ${missingSettings.length} chybějících nastavení...`);

    // Přidáme timestamp
    const settingsToInsert = missingSettings.map(setting => ({
      ...setting,
      updated_at: new Date().toISOString()
    }));

    const { error: insertError } = await supabase
      .from('site_settings')
      .insert(settingsToInsert);

    if (insertError) {
      console.error('❌ Chyba při vkládání nastavení:', insertError);
      return;
    }

    console.log('✅ Výchozí nastavení byla úspěšně inicializována');
    
    // Vypíšeme přidaná nastavení
    missingSettings.forEach(s => {
      console.log(`  - ${s.key}`);
    });

  } catch (error) {
    console.error('❌ Neočekávaná chyba:', error);
  }
}

// Spustíme inicializaci
initializeSettings(); 