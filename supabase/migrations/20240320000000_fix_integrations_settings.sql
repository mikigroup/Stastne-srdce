-- Oprava nesprávně serializovaných dat v site_settings pro integrations
DO $$
DECLARE
    v_record RECORD;
    v_fixed_value JSONB;
    v_char_array JSONB;
    v_string TEXT;
BEGIN
    -- Projdeme všechny záznamy s klíčem 'integrations'
    FOR v_record IN 
        SELECT id, value 
        FROM site_settings 
        WHERE key = 'integrations'
    LOOP
        -- Kontrola, zda je value pole znaků
        IF jsonb_typeof(v_record.value) = 'object' AND 
           EXISTS (
               SELECT 1 
               FROM jsonb_object_keys(v_record.value) k 
               WHERE k ~ '^\d+$'
           ) THEN
            
            -- Převedeme pole znaků zpět na string
            v_string := '';
            FOR i IN 0..1000 LOOP
                IF v_record.value->i::text IS NOT NULL THEN
                    v_string := v_string || (v_record.value->i->>'0');
                ELSE
                    EXIT;
                END IF;
            END LOOP;
            
            -- Pokusíme se parsovat string jako JSON
            BEGIN
                v_fixed_value := v_string::jsonb;
                
                -- Aktualizujeme záznam s opravenou hodnotou
                UPDATE site_settings 
                SET value = v_fixed_value,
                    updated_at = NOW()
                WHERE id = v_record.id;
                
                RAISE NOTICE 'Opraven záznam ID: %', v_record.id;
            EXCEPTION WHEN OTHERS THEN
                RAISE NOTICE 'Chyba při parsování JSON pro ID %: %', v_record.id, SQLERRM;
            END;
        END IF;
    END LOOP;
END $$;

-- Vytvoření zálohy tabulky před migrací
CREATE TABLE IF NOT EXISTS site_settings_backup AS 
SELECT * FROM site_settings;

-- Přidání komentáře pro dokumentaci
COMMENT ON TABLE site_settings_backup IS 'Záloha site_settings před migrací integrations dat z 20.3.2024';

-- Smazání existujícího záznamu integrations
DELETE FROM site_settings WHERE key = 'integrations';

-- Vytvoření nového záznamu s čistou strukturou
INSERT INTO site_settings (key, value, updated_at)
VALUES (
    'integrations',
    '{
        "fakturoid": {
            "enabled": false,
            "connected": false,
            "accounts": []
        }
    }'::jsonb,
    NOW()
); 