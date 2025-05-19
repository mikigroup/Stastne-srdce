-- Add a unique constraint to prevent duplicate orders from the same user within a short time window
ALTER TABLE orders 
ADD CONSTRAINT prevent_duplicate_orders 
UNIQUE (user_id, date, total_price, total_pieces);

-- Add an index to improve performance of the constraint
CREATE INDEX idx_orders_duplicate_check 
ON orders (user_id, date, total_price, total_pieces);

-- Add comment explaining the constraint
COMMENT ON CONSTRAINT prevent_duplicate_orders ON orders 
IS 'Prevents duplicate orders from the same user with the same date, total price and pieces within a short time window'; 