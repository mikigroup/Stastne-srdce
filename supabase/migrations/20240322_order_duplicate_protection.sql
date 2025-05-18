-- Vytvoření typu pro položky objednávky
DO $$ BEGIN
    CREATE TYPE order_item_input AS (
        variant_id UUID,
        price NUMERIC,
        quantity INTEGER
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Vytvoření tabulky pro sledování odeslání objednávek
CREATE TABLE IF NOT EXISTS public.order_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id TEXT NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(submission_id)
);

-- Vytvoření indexu pro rychlé vyhledávání duplicitních submission_id
CREATE INDEX IF NOT EXISTS idx_order_submissions_submission_id ON public.order_submissions(submission_id);

-- Vytvoření indexu pro optimalizaci vyhledávání duplicitních objednávek
CREATE INDEX IF NOT EXISTS idx_orders_duplicate_check 
ON public.orders (user_id, created_at, state, total_price, total_pieces);

-- Funkce pro kontrolu duplicitních objednávek
CREATE OR REPLACE FUNCTION public.check_duplicate_order()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM public.orders 
        WHERE user_id = NEW.user_id 
        AND created_at > NEW.created_at - INTERVAL '2 minutes'
        AND created_at < NEW.created_at + INTERVAL '2 minutes'
        AND state = 'Nová'
        AND total_price = NEW.total_price
        AND total_pieces = NEW.total_pieces
        AND id != NEW.id
    ) THEN
        RAISE EXCEPTION 'Duplicitní objednávka detekována. Počkejte prosím 2 minuty před vytvořením podobné objednávky.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Vytvoření triggeru pro kontrolu duplicit
DROP TRIGGER IF EXISTS check_duplicate_order_trigger ON public.orders;
CREATE TRIGGER check_duplicate_order_trigger
    BEFORE INSERT ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.check_duplicate_order();

-- Funkce pro vytvoření objednávky s ochranou proti duplicitám
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
) RETURNS public.orders AS $$
DECLARE
    v_order public.orders;
    v_item order_item_input;
    v_order_number TEXT;
    v_duplicate_exists BOOLEAN;
BEGIN
    -- Kontrola duplicitní objednávky v časovém okně
    SELECT EXISTS (
        SELECT 1 
        FROM orders 
        WHERE user_id = p_user_id 
        AND created_at > p_created_at - INTERVAL '2 minutes'
        AND created_at < p_created_at + INTERVAL '2 minutes'
        AND state = 'Nová'
        AND total_price = p_total_price
        AND total_pieces = p_total_pieces
    ) INTO v_duplicate_exists;

    IF v_duplicate_exists THEN
        RAISE EXCEPTION 'Duplicitní objednávka detekována. Počkejte prosím 2 minuty před vytvořením podobné objednávky.';
    END IF;

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

    RETURN v_order;
EXCEPTION
    WHEN OTHERS THEN
        -- Rollback se provede automaticky
        RAISE;
END;
$$ LANGUAGE plpgsql;

-- Přidání komentářů k objektům
COMMENT ON FUNCTION public.create_order_with_items IS 'Vytvoří novou objednávku s položkami a ochranou proti duplicitám. Kontroluje duplicity v časovém okně 2 minut.';
COMMENT ON TABLE public.order_submissions IS 'Sledování ID odeslání objednávek pro prevenci duplicit';
COMMENT ON FUNCTION public.check_duplicate_order IS 'Kontroluje duplicitní objednávky v časovém okně 2 minut'; 