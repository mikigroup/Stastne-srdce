export interface OrderItem {
    id: string;
    quantity: number;
    price: number;
    variant_id: {
        id: string;
        description: string;
        variant_number: string;
        menu_id: {
            id: string;
            date: string;
        }
    }
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
    order_items: OrderItem[];
} 