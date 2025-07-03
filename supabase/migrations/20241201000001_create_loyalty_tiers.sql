-- Vytvoření tabulky pro úrovně věrnosti
CREATE TABLE loyalty_tiers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(20) NOT NULL UNIQUE,
    min_orders INTEGER NOT NULL,
    discount_percent INTEGER NOT NULL,
    bonus_percent INTEGER NOT NULL,
    color VARCHAR(7) NOT NULL,
    icon VARCHAR(10) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vložení výchozích úrovní
INSERT INTO loyalty_tiers (name, min_orders, discount_percent, bonus_percent, color, icon, description) VALUES
('NEW', 0, 5, 0, '#6B7280', '🆕', 'Nový zákazník - základní sleva 5%'),
('REGULAR', 3, 10, 10, '#3B82F6', '👤', 'Pravidelný zákazník - sleva 10%, bonus 10%'),
('LOYAL', 10, 15, 20, '#EAB308', '⭐', 'Věrný zákazník - sleva 15%, bonus 20%'),
('VIP', 20, 20, 30, '#8B5CF6', '💎', 'VIP zákazník - sleva 20%, bonus 30%');

-- Vytvoření indexů pro výkonnost
CREATE INDEX idx_loyalty_tiers_name ON loyalty_tiers(name);
CREATE INDEX idx_loyalty_tiers_min_orders ON loyalty_tiers(min_orders); 