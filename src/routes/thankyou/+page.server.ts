import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { validateProfileForInvoicing } from '$lib/utils/profileValidation';

export const load: PageServerLoad = async ({ url, locals: { supabase } }) => {
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
        .single();

    if (orderError) {
        console.error('Error fetching order:', orderError);
        throw error(500, 'Chyba při načítání objednávky');
    }

    if (!order) {
        throw error(404, 'Objednávka nenalezena');
    }

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
        delivery_method: order.delivery_method,
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