import type { PageServerLoad } from "./$types";
import { getAllDeliveryMethods } from "$lib/constants/deliveryMethods";
import { getPaymentMethods } from "$lib/constants/paymentMethods";

export const load: PageServerLoad = async ({ locals: { supabase, safeGetSession } }) => {
	const { session } = await safeGetSession();

	const [deliveryMethodOptions, paymentMethodOptions] = await Promise.all([
		getAllDeliveryMethods(supabase),
		getPaymentMethods(supabase)
	]);

	return {
		session,
		deliveryMethodOptions,
		paymentMethodOptions
	};
};
