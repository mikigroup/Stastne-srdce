// Rozhraní pro odpověď z Fakturoidu
export interface FakturoidInvoice {
	id: string;
	number: string;
	subject_id: string;
	total: number;
	html_url: string;
}

// Rozhraní pro vytvoření kontaktu
export interface FakturoidContact {
	name: string;
	street: string;
	city: string;
	zip: string;
	email: string;
	phone?: string;
	registration_no?: string; // IČO
	vat_no?: string; // DIČ
}

// Rozhraní pro řádek faktury
export interface FakturoidLine {
	name: string;
	quantity: number;
	unit_price: number;
	vat_rate: number;
}

// Rozhraní pro vytvoření faktury
export interface FakturoidInvoiceCreate {
	subject_id: string;
	lines: FakturoidLine[];
	due: number;
	issued_on?: string;
	note?: string;
	currency?: string;
	payment_method?: string;
	language?: string;
	vat_price_mode?: string;
}

// Token z Fakturoid API
export interface FakturoidToken {
	access_token: string;
	token_type: string;
	refresh_token: string;
	expires_in: number;
	scope: string;
}

// Tabulky v Supabase pro Fakturoid
export interface FakturoidTables {
    fakturoid_tokens: {
        Row: {
            id: string;
            user_id: string;
            access_token: string;
            refresh_token: string;
            expires_at: string;
            account_email?: string;
            account_name?: string;
            created_at: string;
            updated_at: string;
        };
        Insert: {
            id?: string;
            user_id: string;
            access_token: string;
            refresh_token: string;
            expires_at: string;
            account_email?: string;
            account_name?: string;
            created_at?: string;
            updated_at?: string;
        };
        Update: {
            id?: string;
            user_id?: string;
            access_token?: string;
            refresh_token?: string;
            expires_at?: string;
            account_email?: string;
            account_name?: string;
            created_at?: string;
            updated_at?: string;
        };
    };
    fakturoid_auth_states: {
        Row: {
            id: string;
            state: string;
            customer_id: string;
            expires_at: string;
            created_at: string;
        };
        Insert: {
            id?: string;
            state: string;
            customer_id: string;
            expires_at: string;
            created_at?: string;
        };
        Update: {
            id?: string;
            state?: string;
            customer_id?: string;
            expires_at?: string;
            created_at?: string;
        };
    };
} 