import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Import function to get unified defaults
async function getDefaultSettingsForInit() {
  try {
    const { getDefaultSettingsForInit: getDefaults } = await import('../src/lib/constants/defaultSettings.js');
    return getDefaults();
  } catch (e) {
    console.warn('Could not import unified defaults, using fallback');
    return [];
  }
}

// Načteme environment proměnné
dotenv.config();

const supabaseUrl = process.env.PRIVATE_SBUrl || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.PRIVATE_SBKey || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Chybí Supabase credentials v .env souboru');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function initializeSettings() {
  // Use unified default settings from the central source
  const DEFAULT_SETTINGS = await getDefaultSettingsForInit();
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