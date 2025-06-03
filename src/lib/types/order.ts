export interface OrderItem {
    id: string;
    order_id: string;
    variant_id: string;
    quantity: number;
    price: number;
    subtotal: number;
    description?: string;
}

export interface Order {
    id: string;
    order_number: string;
    date: string;
    state: string;
    pay_state: boolean;
    currency: string;
    pay_method: string;
    shipping_method: string;
    customer_email: string;
    customer_first_name: string;
    customer_last_name: string;
    customer_street: string;
    customer_street_number: string;
    customer_city: string;
    customer_zip_code: string;
    customer_telephone: string;
    total_price: number;
    note?: string;
    meta?: {
        fakturoid_invoice_id?: string;
        fakturoid_invoice_number?: string;
        fakturoid_created_at?: string;
    };
    // Multi-account Fakturoid data
    fakturoid_data?: {
        invoice_id: string;
        invoice_number: string;
        invoice_url?: string;
        created_at: string;
        account_id: string; // ID účtu který fakturu vytvořil
    } | null;
    order_items: OrderItem[];
} 