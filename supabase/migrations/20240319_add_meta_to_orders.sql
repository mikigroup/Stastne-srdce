-- Přidání sloupce fakturoid_data do tabulky orders
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS fakturoid_data JSONB DEFAULT NULL;

-- Přidání indexu pro rychlejší vyhledávání podle fakturoid dat
CREATE INDEX IF NOT EXISTS idx_orders_fakturoid ON orders USING gin (fakturoid_data);

-- Přidání komentáře pro dokumentaci
COMMENT ON COLUMN orders.fakturoid_data IS 'Data z Fakturoidu - ID faktury, číslo faktury, datum vytvoření, atd.';

-- Povolení aktualizace sloupce fakturoid_data
ALTER TABLE orders 
  ALTER COLUMN fakturoid_data SET DEFAULT NULL,
  ALTER COLUMN fakturoid_data DROP NOT NULL; 