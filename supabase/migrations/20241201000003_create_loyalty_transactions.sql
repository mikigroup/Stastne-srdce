-- Vytvoření tabulky pro historii bodových transakcí
CREATE TABLE loyalty_transactions (
    id SERIAL PRIMARY KEY,
    customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    points_earned INTEGER DEFAULT 0,
    points_spent INTEGER DEFAULT 0,
    transaction_type VARCHAR(20) NOT NULL, -- 'EARN', 'SPEND', 'BONUS', 'EXPIRY'
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vytvoření indexů pro výkonnost
CREATE INDEX idx_loyalty_transactions_customer_id ON loyalty_transactions(customer_id);
CREATE INDEX idx_loyalty_transactions_order_id ON loyalty_transactions(order_id);
CREATE INDEX idx_loyalty_transactions_created_at ON loyalty_transactions(created_at);
CREATE INDEX idx_loyalty_transactions_customer_date ON loyalty_transactions(customer_id, created_at); 