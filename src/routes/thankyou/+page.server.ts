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
        .single();

    if (orderError) {
        console.error('Error fetching order:', orderError);
        throw error(500, 'Chyba při načítání objednávky');
    }

    if (!order) {
        throw error(404, 'Objednávka nenalezena');
    }

    // Načteme aktuální data menu pro každou položku objednávky
    if (order && order.order_items) {
        console.log("Načítání aktuálních dat menu pro thankyou stránku...");
        
        for (const item of order.order_items) {
            if (item.variant_id && item.variant_id.menu_id) {
                const menuId = item.variant_id.menu_id.id;
                console.log(`Načítání aktuální verze menu pro ID: ${menuId}`);
                
                try {
                    // Použijeme stejný systém jako admin order detail - načteme aktuální verzi menu
                    const { data: currentVersionId, error: versionError } = await supabase.rpc(
                        "get_current_menu_version",
                        { p_menu_id: menuId }
                    );

                    if (!versionError && currentVersionId) {
                        // Načteme data aktuální verze menu
                        const { data: versionData, error: versionDataError } = await supabase
                            .from("menu_versions")
                            .select("*")
                            .eq("id", currentVersionId)
                            .single();

                        if (!versionDataError && versionData) {
                            // Načteme aktuální varianty pro tuto verzi
                            const { data: currentVariants, error: variantsError } = await supabase
                                .from("menu_variants")
                                .select("*")
                                .eq("menu_id", menuId)
                                .eq("menu_version_id", currentVersionId)
                                .eq("variant_number", item.variant_id.variant_number)
                                .single();

                            if (!variantsError && currentVariants) {
                                // Aktualizujeme data položky objednávky aktuálními daty
                                (item as any).menuVersionData = versionData;
                                (item as any).currentVariantData = currentVariants;
                                console.log(`Aktualizována položka objednávky s aktuálními daty menu pro thankyou stránku`);
                            }
                        }
                    }
                } catch (error) {
                    console.error(`Chyba při načítání aktuální verze menu ${menuId}:`, error);
                }
            }
        }
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