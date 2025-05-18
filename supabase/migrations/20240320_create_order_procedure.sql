-- Create a type for order items
CREATE TYPE order_item_input AS (
    variant_id UUID,
    price NUMERIC,
    quantity INTEGER
);

-- Create function to create order with items in a transaction
CREATE OR REPLACE FUNCTION create_order(
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
) RETURNS orders AS $$
DECLARE
    v_order orders;
    v_item order_item_input;
BEGIN
    -- Start transaction
    BEGIN
        -- Insert order
        INSERT INTO orders (
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
            shipping_method
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
            p_shipping_method
        )
        RETURNING * INTO v_order;

        -- Insert order items
        FOREACH v_item IN ARRAY p_order_items
        LOOP
            INSERT INTO order_items (
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

        -- Return the created order
        RETURN v_order;
    EXCEPTION WHEN OTHERS THEN
        -- Rollback will happen automatically
        RAISE;
    END;
END;
$$ LANGUAGE plpgsql; 