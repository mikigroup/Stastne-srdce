-- Create a table to track order submissions
CREATE TABLE IF NOT EXISTS order_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    submission_id TEXT NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(submission_id)
);

-- Add a unique constraint to prevent duplicate orders within a short time window
CREATE UNIQUE INDEX IF NOT EXISTS unique_user_order_window 
ON orders (user_id, date_trunc('minute', created_at))
WHERE state = 'Nová';

-- Add function to check for recent orders
CREATE OR REPLACE FUNCTION check_recent_orders(
    p_user_id UUID,
    p_created_at TIMESTAMP WITH TIME ZONE
) RETURNS BOOLEAN AS $$
BEGIN
    -- Check if there's an order within 2 minutes
    RETURN EXISTS (
        SELECT 1 
        FROM orders 
        WHERE user_id = p_user_id 
        AND created_at > p_created_at - INTERVAL '2 minutes'
        AND created_at < p_created_at + INTERVAL '2 minutes'
        AND state = 'Nová'
    );
END;
$$ LANGUAGE plpgsql;

-- Vytvoření triggeru pro kontrolu časového okna mezi objednávkami
CREATE OR REPLACE FUNCTION check_order_time_window()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM orders 
        WHERE user_id = NEW.user_id 
        AND created_at > NEW.created_at - INTERVAL '2 minutes'
        AND created_at < NEW.created_at + INTERVAL '2 minutes'
        AND id != NEW.id
        AND state = 'Nová'
    ) THEN
        RAISE EXCEPTION 'Nelze vytvořit více objednávek v intervalu 2 minut';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Vytvoření triggeru pro nové objednávky
CREATE TRIGGER check_order_window
    BEFORE INSERT ON orders
    FOR EACH ROW
    EXECUTE FUNCTION check_order_time_window(); 