-- Odstranění všech implementací duplicitní ochrany
DROP TRIGGER IF EXISTS check_order_window ON orders;
DROP TRIGGER IF EXISTS check_duplicate_order_trigger ON orders;
DROP FUNCTION IF EXISTS check_order_time_window();
DROP FUNCTION IF EXISTS check_duplicate_order();
DROP FUNCTION IF EXISTS check_recent_orders(UUID, TIMESTAMP WITH TIME ZONE);

-- Odstranění indexů a constraintů
DROP INDEX IF EXISTS unique_user_order_window;
DROP INDEX IF EXISTS idx_orders_duplicate_check;
ALTER TABLE orders DROP CONSTRAINT IF EXISTS prevent_duplicate_orders;

-- Odstranění tabulky order_submissions
DROP TABLE IF EXISTS public.order_submissions; 