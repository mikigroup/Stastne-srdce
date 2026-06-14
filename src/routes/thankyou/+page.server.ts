import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { validateProfileForInvoicing } from '$lib/utils/profileValidation';

export const prerender = false;

export const load: PageServerLoad = async ({ url, locals: { supabase, tenantId } }) => {
    const orderNumber = url.searchParams.get('order');
    
    if (!orderNumber) {
        throw error(400, 'Číslo objednávky není k dispozici');
    }

    // Fetch the order with its items
    const { data: order, error: orderError } = await supabase
        .from('orders')
        .select(`
            *,
            order_items (
                *,
                variant_id (
                    *,
                    menu_id (*)
                )
            )
        `)
        .eq('order_number', orderNumber)
        .eq('tenant_id', tenantId)  // ← Přidáno
        .maybeSingle();

    if (orderError) {
        console.error('Error fetching order:', orderError);
        throw error(500, 'Chyba při načítání objednávky');
    }

    // Prázdný výsledek = objednávka neexistuje, nebo k ní přihlášený zákazník
    // ztratil přístup přes RLS (pozastavený tenant / zrušené členství v tenant_members).
    // Viz MALYLEO_DB_HANDOFF.md, kap. 4 a riziko č. 6.
    if (!order) {
        throw error(404, 'Objednávku se nepodařilo zobrazit. Pokud jste ji právě vytvořili a problém přetrvává, kontaktujte nás prosím na info@stastnesrdce.cz.');
    }

    // Používáme pouze původní data z objednávky - žádné načítání aktuální verze

    // Validate customer profile data
    const validationResult = validateProfileForInvoicing({
        first_name: order.customer_first_name,
        last_name: order.customer_last_name,
        street: order.customer_street,
        street_number: order.customer_street_number,
        city: order.customer_city,
        zip_code: order.customer_zip_code,
        email: order.customer_email,
        telephone: order.customer_telephone,
        delivery_method: order.shipping_method,
        payment_method: order.payment_method
    });

    return {
        order,
        profileValidation: {
            isComplete: validationResult.isComplete,
            missingFields: validationResult.missingFields
        }
    };
}; 