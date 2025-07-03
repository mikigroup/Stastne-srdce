-- Vytvoření tabulky pro věrnostní data zákazníků
CREATE TABLE customer_loyalty (
    id SERIAL PRIMARY KEY,
    customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    current_points INTEGER DEFAULT 0,
    total_points_earned INTEGER DEFAULT 0,
    total_points_spent INTEGER DEFAULT 0,
    tier_id INTEGER NOT NULL REFERENCES loyalty_tiers(id),
    last_order_date TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(customer_id)
);

-- Vytvoření indexů pro výkonnost
CREATE INDEX idx_customer_loyalty_customer_id ON customer_loyalty(customer_id);
CREATE INDEX idx_customer_loyalty_tier_id ON customer_loyalty(tier_id);
CREATE INDEX idx_customer_loyalty_is_active ON customer_loyalty(is_active);
CREATE INDEX idx_customer_loyalty_last_order_date ON customer_loyalty(last_order_date); 