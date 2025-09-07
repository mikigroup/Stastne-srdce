import { error, redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { getOrderSettings, getDefaultDeliverySettings } from "$lib/services/eshopSettingsService";

// Definujeme typovou strukturu pro business nastavení
interface BusinessSettings {
	paymentMethods?: string[];
	deliveryOptions?: string[];
	[key: string]: any;
}

export const load: PageServerLoad = async ({
	params,
	locals: { supabase, safeGetSession }
}) => {
	console.log("====== ORDER PAGE SERVER LOAD START ======");
	console.log("Params:", params);
	
	const { session } = await safeGetSession();
	if (!session) {
		throw redirect(303, "/login");
	}

	const { orderId } = params;
	console.log("Loading order with ID:", orderId);

	try {
		// Načtení objednávky
		const { data: order, error: orderError } = await supabase
			.from("orders")
			.select(
				`*,
				order_items(*, variant_id(*, menu_id(*), menu_version_id(*)))`
			)
			.eq("id", orderId)
			.single();

		console.log("Order loaded:", order ? "SUCCESS" : "UNDEFINED");
		if (orderError) {
			console.error("Error loading order:", orderError);
			if (orderError.code === "PGRST116") {
				throw error(404, {
					message: "Objednávka nenalezena"
				});
			}
			throw error(500, {
				message: orderError.message
			});
		} else {
			console.log("Order data structure:", JSON.stringify(order, null, 2).substring(0, 500) + "...");
		}

		// Načtení předchozí a následující objednávky pro navigaci
		let prevOrderId = null;
		let nextOrderId = null;

		if (order) {
			// Najít předchozí objednávku (starší podle order_number)
			const { data: prevOrder } = await supabase
				.from("orders")
				.select("id")
				.lt("order_number", order.order_number)
				.order("order_number", { ascending: false })
				.limit(1)
				.single();

			if (prevOrder) {
				prevOrderId = prevOrder.id;
			}

			// Najít následující objednávku (novější podle order_number)
			const { data: nextOrder } = await supabase
				.from("orders")
				.select("id")
				.gt("order_number", order.order_number)
				.order("order_number", { ascending: true })
				.limit(1)
				.single();

			if (nextOrder) {
				nextOrderId = nextOrder.id;
			}
		}

		// Načteme nastavení objednávek
		const orderSettings = await getOrderSettings(supabase);
		
		// Načteme nastavení dopravy
		const { data: deliveryData, error: deliveryError } = await supabase
			.from('site_settings')
			.select('value')
			.eq('key', 'delivery')
			.order('updated_at', { ascending: false })
			.limit(1)
			.single();
		
		let deliverySettings = getDefaultDeliverySettings();
		if (!deliveryError && deliveryData?.value) {
			try {
				deliverySettings = typeof deliveryData.value === 'string' 
					? JSON.parse(deliveryData.value) 
					: deliveryData.value;
			} catch (e) {
				console.error('Error parsing delivery settings:', e);
			}
		}
		
		// Zkombinujeme měny z obecných nastavení
		const { data: generalData, error: generalError } = await supabase
			.from('site_settings')
			.select('value')
			.eq('key', 'general')
			.order('updated_at', { ascending: false })
			.limit(1)
			.single();
		
		let currencies = ['CZK', 'EUR'];
		if (!generalError && generalData?.value) {
			try {
				const generalSettings = typeof generalData.value === 'string' 
					? JSON.parse(generalData.value) 
					: generalData.value;
				if (generalSettings?.currencies && Array.isArray(generalSettings.currencies)) {
					currencies = generalSettings.currencies;
				}
			} catch (e) {
				console.error('Error parsing general settings:', e);
			}
		}
		
		// Načteme platební metody z business nastavení
		const { data: businessData, error: businessError } = await supabase
			.from('site_settings')
			.select('value')
			.eq('key', 'business')
			.order('updated_at', { ascending: false })
			.limit(1)
			.single();
		
		let paymentMethods = ['Hotově', 'Kartou', 'Převodem'];
		if (!businessError && businessData?.value) {
			try {
				const businessSettings = typeof businessData.value === 'string' 
					? JSON.parse(businessData.value) 
					: businessData.value;
				if (businessSettings?.paymentMethods) {
					paymentMethods = businessSettings.paymentMethods;
				}
			} catch (e) {
				console.error('Error parsing business settings:', e);
			}
		}

		// Načteme Fakturoid integraci z site_settings - použijeme getSetting funkci
		// která správně zvládá tenant_id
		const { getSetting } = await import('$lib/services/siteSettingsService');
		const integrations = await getSetting(supabase, 'integrations');
		
		let integrationsData = null;
		let integrationsError = null;
		
		if (integrations) {
			integrationsData = { value: integrations };
		} else {
			integrationsError = new Error('Integrations settings not found');
		}
		
		let fakturoidConfig = null;
		if (!integrationsError && integrationsData?.value) {
			try {
				const integrations = typeof integrationsData.value === 'string' 
					? JSON.parse(integrationsData.value) 
					: integrationsData.value;
				
				if (integrations?.fakturoid?.enabled) {
					fakturoidConfig = integrations.fakturoid;
				}
			} catch (e) {
				console.error('Error parsing integrations settings:', e);
			}
		}

		// Kontrola Fakturoid tokenu v databázi a ověření přístupu k aktuálnímu slugu
		let fakturoidTokenValid = false;
		let currentSubdomain = '';
		
		if (fakturoidConfig?.connected) {
			// Získáme aktuální subdomain - priorita: ruční nastavení nebo aktivní účet
			currentSubdomain = fakturoidConfig.subdomain;
			if (!currentSubdomain) {
				const activeAccount = fakturoidConfig.accounts?.find((acc: any) => acc.isActive);
				currentSubdomain = activeAccount?.subdomain || '';
			}
			
			console.log('Current subdomain for order:', currentSubdomain);

			// TENANT-AWARE PŘÍSTUP: Použijeme getAccessTokenWithSupabase funkci
			// která správně zvládá tenant_id
			const { getAccessTokenWithSupabase } = await import('$lib/fakturoidAuth');
			const accessToken = await getAccessTokenWithSupabase(supabase);
			
			if (accessToken) {
				// Token je platný
				fakturoidTokenValid = true;
				console.log('Fakturoid token je platný');
			} else {
				fakturoidTokenValid = false;
				console.log('Fakturoid token není platný nebo nebyl nalezen');
			}
		}

		// Zkombinujeme všechna nastavení do jednoho objektu pro snadnější použití
		const combinedOrderSettings = {
			...orderSettings,
			shippingMethods: deliverySettings?.shippingMethods || [],
			currencies: currencies,
			paymentMethods: paymentMethods,
			// Přidáme Fakturoid informace
			fakturoid: fakturoidConfig ? {
				enabled: fakturoidConfig.enabled,
				connected: fakturoidConfig.connected,
				tokenValid: fakturoidTokenValid,
				subdomain: currentSubdomain,
				configuredSubdomain: fakturoidConfig.subdomain || '',
				hasActiveAccount: fakturoidConfig.accounts?.some((acc: any) => acc.isActive) || false,
				availableAccounts: fakturoidConfig.accounts || []
			} : {
				enabled: false,
				connected: false,
				tokenValid: false,
				subdomain: '',
				configuredSubdomain: '',
				hasActiveAccount: false,
				availableAccounts: []
			}
		};

		const returnData = {
			order,
			orderSettings: combinedOrderSettings,
			navigation: {
				prevOrderId,
				nextOrderId
			}
		};

		console.log("Final return data keys:", Object.keys(returnData || {}));
		console.log("Order settings keys:", Object.keys(combinedOrderSettings || {}));
		console.log("Shipping methods count:", combinedOrderSettings?.shippingMethods?.length || 0);
		console.log("Navigation:", returnData.navigation);
		console.log("====== ORDER PAGE SERVER LOAD END ======");
		
		return returnData;
	} catch (err) {
		console.error("Unexpected error in order page load:", err);
		console.log("====== ORDER PAGE SERVER LOAD ERROR ======");
		throw err;
	}
};
