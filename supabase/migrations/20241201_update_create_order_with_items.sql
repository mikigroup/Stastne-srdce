-- Aktualizace create_order_with_items funkce pro podporu tenant_id
-- Tato funkce nyní podporuje tenant_id parametr pro multitenant architekturu
CREATE OR REPLACE FUNCTION create_order_with_items(
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
    p_tenant_id UUID,
    p_order_items order_item_input[]
)
RETURNS TABLE (
    id UUID,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    date TIMESTAMP WITH TIME ZONE,
    order_number TEXT,
    customer_first_name TEXT,
    customer_last_name TEXT,
    customer_street TEXT,
    customer_street_number TEXT,
    customer_city TEXT,
    customer_zip_code TEXT,
    customer_telephone TEXT,
    customer_email TEXT,
    delivery_first_name TEXT,
    delivery_last_name TEXT,
    delivery_street TEXT,
    delivery_street_number TEXT,
    delivery_city TEXT,
    delivery_zip_code TEXT,
    delivery_telephone TEXT,
    note TEXT,
    total_pieces INTEGER,
    total_price NUMERIC,
    currency TEXT,
    pay_method TEXT,
    pay_state BOOLEAN,
    shipping_method TEXT,
    state TEXT,
    fakturoid_data JSONB,
    user_id UUID,
    tenant_id UUID
) AS $$
DECLARE
    v_order_id UUID;
    v_order_number TEXT;
    v_item order_item_input;
BEGIN
    -- Generovat číslo objednávky
    v_order_number := generate_order_number();
    
    -- Vytvořit objednávku
    INSERT INTO orders (
        created_at,
        date,
        order_number,
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
        user_id,
        tenant_id
    ) VALUES (
        p_created_at,
        p_date,
        v_order_number,
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
        p_user_id,
        p_tenant_id
    ) RETURNING id INTO v_order_id;
    
    -- Vytvořit položky objednávky
    FOREACH v_item IN ARRAY p_order_items
    LOOP
        INSERT INTO order_items (
            order_id,
            variant_id,
            price,
            quantity
        ) VALUES (
            v_order_id,
            v_item.variant_id,
            v_item.price,
            v_item.quantity
        );
    END LOOP;
    
    -- Vrátit vytvořenou objednávku
    RETURN QUERY
    SELECT 
        o.id,
        o.created_at,
        o.updated_at,
        o.date,
        o.order_number,
        o.customer_first_name,
        o.customer_last_name,
        o.customer_street,
        o.customer_street_number,
        o.customer_city,
        o.customer_zip_code,
        o.customer_telephone,
        o.customer_email,
        o.delivery_first_name,
        o.delivery_last_name,
        o.delivery_street,
        o.delivery_street_number,
        o.delivery_city,
        o.delivery_zip_code,
        o.delivery_telephone,
        o.note,
        o.total_pieces,
        o.total_price,
        o.currency,
        o.pay_method,
        o.pay_state,
        o.shipping_method,
        o.state,
        o.fakturoid_data,
        o.user_id,
        o.tenant_id
    FROM orders o
    WHERE o.id = v_order_id;
END;
$$ LANGUAGE plpgsql;
