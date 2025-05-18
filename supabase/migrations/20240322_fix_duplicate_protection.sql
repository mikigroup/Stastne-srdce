-- Odstranění všech předchozích implementací duplicitních kontrol
DROP TRIGGER IF EXISTS check_order_window ON orders;
DROP TRIGGER IF EXISTS check_duplicate_order_trigger ON orders;
DROP FUNCTION IF EXISTS check_order_time_window();
DROP FUNCTION IF EXISTS check_duplicate_order();
DROP FUNCTION IF EXISTS check_recent_orders(UUID, TIMESTAMP WITH TIME ZONE);

-- Odstranění existující funkce create_order_with_items
DROP FUNCTION IF EXISTS create_order_with_items(UUID, TIMESTAMP WITH TIME ZONE, TIMESTAMP WITH TIME ZONE, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, INTEGER, NUMERIC, TEXT, BOOLEAN, TEXT, order_item_input[]);

-- Odstranění konfliktních indexů a constraintů
DROP INDEX IF EXISTS unique_user_order_window;
DROP INDEX IF EXISTS idx_orders_duplicate_check;
ALTER TABLE orders DROP CONSTRAINT IF EXISTS prevent_duplicate_orders;

-- Ponecháme pouze tabulku pro sledování submission_id
CREATE TABLE IF NOT EXISTS public.order_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id TEXT NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(submission_id)
);

-- Vytvoření indexu pro rychlé vyhledávání submission_id
CREATE INDEX IF NOT EXISTS idx_order_submissions_submission_id 
ON public.order_submissions(submission_id);

-- Funkce pro vytvoření objednávky s položkami (bez kontroly duplicit)
CREATE OR REPLACE FUNCTION public.create_order_with_items(
    p_user_id UUID,
    p_created_at TIMESTAMP WITH TIME ZONE,
    p_date TIMESTAMP WITH TIME ZONE,
    p_customer_first_name TEXT,
    p_customer_last_name TEXT,
    p_customer_street TEXT,
    p_customer_street_number TEXT,
    p_customer_city TEXT,
    p_customer_zip_code TEXT,
    p_customer_telephone TEXT,
    p_customer_email TEXT,
    p_note TEXT,
    p_total_pieces INTEGER,
    p_total_price NUMERIC,
    p_currency TEXT,
    p_pay_state BOOLEAN,
    p_shipping_method TEXT,
    p_order_items order_item_input[]
)
RETURNS SETOF public.orders AS $$
#variable_conflict use_column
DECLARE
    v_order public.orders;
    v_item order_item_input;
    v_order_number TEXT;
BEGIN
    -- Generování čísla objednávky
    SELECT public.generate_order_number() INTO v_order_number;

    -- Vytvoření objednávky
    INSERT INTO public.orders (
        user_id,
        created_at,
        updated_at,
        state,
        date,
        customer_first_name,
        customer_last_name,
        customer_street,
        customer_street_number,
        customer_city,
        customer_zip_code,
        customer_telephone,
        customer_email,
        note,
        total_pieces,
        total_price,
        currency,
        pay_state,
        shipping_method,
        order_number
    ) VALUES (
        p_user_id,
        p_created_at,
        p_created_at,
        'Nová',
        p_date,
        p_customer_first_name,
        p_customer_last_name,
        p_customer_street,
        p_customer_street_number,
        p_customer_city,
        p_customer_zip_code,
        p_customer_telephone,
        p_customer_email,
        p_note,
        p_total_pieces,
        p_total_price,
        p_currency,
        p_pay_state,
        p_shipping_method,
        v_order_number
    )
    RETURNING * INTO v_order;

    -- Vložení položek objednávky
    FOREACH v_item IN ARRAY p_order_items
    LOOP
        INSERT INTO public.order_items (
            order_id,
            variant_id,
            price,
            quantity,
            created_at,
            updated_at
        ) VALUES (
            v_order.id,
            v_item.variant_id,
            v_item.price,
            v_item.quantity,
            p_created_at,
            p_created_at
        );
    END LOOP;

    -- Vrátit vytvořenou objednávku
    RETURN NEXT v_order;
    RETURN;

EXCEPTION WHEN OTHERS THEN
    -- Rollback se provede automaticky
    RAISE;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- Přidání komentářů
COMMENT ON FUNCTION public.check_duplicate_order IS 'Kontroluje duplicitní objednávky v časovém okně 30 sekund';
COMMENT ON TABLE public.order_submissions IS 'Sledování submission_id pro prevenci duplicitního odeslání formuláře';
COMMENT ON TRIGGER check_duplicate_order_trigger ON orders IS 'Trigger pro kontrolu duplicitních objednávek'; 