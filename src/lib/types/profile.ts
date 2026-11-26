export interface Profile {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    telephone: string | null;
    street: string | null;
    street_number: string | null;
    city: string | null;
    zip_code: string | null;
    delivery_first_name: string | null;
    delivery_last_name: string | null;
    delivery_telephone: string | null;
    delivery_street: string | null;
    delivery_street_number: string | null;
    delivery_city: string | null;
    delivery_zip_code: string | null;
    ico: string | null;
    dic: string | null;
    company: string | null;
    registration_status: string;
} 