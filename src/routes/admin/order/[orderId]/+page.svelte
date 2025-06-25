<script lang="ts">
	import { goto } from "$app/navigation";
	import { ROUTES } from "$lib/stores/store";
	import { formatDateToCzech, formatPrice, formatDateToCzechShort } from "$lib/utils/formatting"
	import FakturoidButton from "./FakturoidButton.svelte";
	import { onMount } from 'svelte';
	import AdminPageLayout from "$lib/component/AdminPageLayout.svelte";

	export let data;
	console.log("====== ORDER PAGE CLIENT INIT ======");
	console.log("Received data keys:", Object.keys(data || {}));

	let { session, supabase, order, orderSettings, navigation } = data;
	$: ({ session, supabase, order, orderSettings, navigation } = data);

	console.log("Order exists:", !!order);
	if (order) {
		console.log("Order has date:", !!order.date);
		console.log("Order properties:", Object.keys(order));
	}

	let loading = false;
	let date: string = "";
	let orderId: string = "";
	let formattedDate = "";
	let selectedPaymentMethod: string = ""; // Zůstává prázdný dokud se nenačtou všechna data
	let selectedOrderState: string = ""; // Zůstává prázdný dokud se nenačtou všechna data
	let selectedCurrency: string = ""; // Zůstává prázdný dokud se nenačtou všechna data
	let selectedShippingMethod: string = ""; // Zůstává prázdný dokud se nenačtou všechna data
	let isPaid: boolean = false;
	let note: string = "";

	// Fakturační údaje
	let customer_email: string = "";
	let customer_first_name: string = "";
	let customer_last_name: string = "";
	let customer_street: string = "";
	let customer_street_number: string = "";
	let customer_city: string = "";
	let customer_zip_code: string = "";
	let customer_telephone: string = "";

	// Dodací údaje
	let delivery_first_name: string = "";
	let delivery_last_name: string = "";
	let delivery_street: string = "";
	let delivery_street_number: string = "";
	let delivery_city: string = "";
	let delivery_zip_code: string = "";
	let delivery_telephone: string = "";

	let updateMessage = "";
	let orderStates: string[] = [];
	let isInitialLoad = true;

	// Reaktivní aktualizace všech polí při změně order dat (kromě dropdown hodnot které se synchronizují zvlášť)
	$: if (order) {
		date = order.date ?? "";
		orderId = order.id ?? "";
		formattedDate = date ? formatSupabaseDate(date) : "";
		// Dropdown hodnoty se nastavují zvlášť v synchronizačních funkcích
		// selectedPaymentMethod = order.pay_method ?? "";
		// selectedOrderState se nastavuje zvlášť v synchronizačním bloku
		// selectedCurrency = order.currency ?? "";
		// selectedShippingMethod = order.shipping_method ?? "";
		// isPaid = order.pay_state || false;
		note = order.note ?? "";

		// Fakturační údaje
		customer_email = order.customer_email ?? "";
		customer_first_name = order.customer_first_name ?? "";
		customer_last_name = order.customer_last_name ?? "";
		customer_street = order.customer_street ?? "";
		customer_street_number = order.customer_street_number ?? "";
		customer_city = order.customer_city ?? "";
		customer_zip_code = order.customer_zip_code ?? "";
		customer_telephone = order.customer_telephone ?? "";

		// Dodací údaje
		delivery_first_name = order.delivery_first_name ?? "";
		delivery_last_name = order.delivery_last_name ?? "";
		delivery_street = order.delivery_street ?? "";
		delivery_street_number = order.delivery_street_number ?? "";
		delivery_city = order.delivery_city ?? "";
		delivery_zip_code = order.delivery_zip_code ?? "";
		delivery_telephone = order.delivery_telephone ?? "";

		console.log("Order data updated - all fields refreshed");
		console.log("Customer email:", customer_email);
		console.log("Customer name:", customer_first_name, customer_last_name);
		console.log("Customer phone:", customer_telephone);
	}

	// Získáme seznam stavů objednávek ze site_settings
	$: {
		const settingsStates = orderSettings?.orderStates?.map((state: any) => state.name) || [];
		const allPossibleStates = ['Nová', 'Expedovaná', 'Fakturovaná', 'Stornovaná'];
		
		// Kombinujeme stavy z nastavení s všemi možnými stavy (bez duplikátů)
		orderStates = [...new Set([...settingsStates, ...allPossibleStates])];
		
		console.log('Debug - orderStates:', orderStates);
		console.log('Debug - orderSettings:', orderSettings);
	}

	// Synchronizace selectedOrderState pomocí onMount (vyhneme se cyclické závislosti)
	function initializeSelectedOrderState() {
		if (order && orderStates.length > 0) {
			const orderState = order.state;
			
			// Pouze pokud existuje order.state (nejedná se o novou objednávku)
			if (orderState && orderStates.includes(orderState)) {
				selectedOrderState = orderState;
				console.log('Initial sync: selectedOrderState set to:', selectedOrderState);
			} else if (orderState && !orderStates.includes(orderState)) {
				console.warn('Order state not found in orderStates:', orderState, 'Available:', orderStates);
				// Fallback na první dostupný stav pouze pokud order.state není v seznamu
				selectedOrderState = orderStates[0] || "";
			} else if (!orderState) {
				// Pokud order.state je null/undefined/empty, použij první stav (nová objednávka)
				selectedOrderState = orderStates[0] || "";
				console.log('New order - selectedOrderState set to first available:', selectedOrderState);
			}
			
			console.log('Final selectedOrderState after initial sync:', selectedOrderState);
		}
	}

	// Synchronizace selectedPaymentMethod
	function initializeSelectedPaymentMethod() {
		if (order && paymentMethods.length > 0) {
			const orderPaymentMethod = order.pay_method;
			console.log('=== PAYMENT METHOD INIT ===');
			console.log('order.pay_method:', orderPaymentMethod);
			console.log('paymentMethods:', paymentMethods);
			
			if (orderPaymentMethod && paymentMethods.includes(orderPaymentMethod)) {
				selectedPaymentMethod = orderPaymentMethod;
				console.log('Initial sync: selectedPaymentMethod set to:', selectedPaymentMethod);
			} else if (orderPaymentMethod && !paymentMethods.includes(orderPaymentMethod)) {
				console.warn('Payment method not found in paymentMethods:', orderPaymentMethod, 'Available:', paymentMethods);
				selectedPaymentMethod = paymentMethods[0] || "";
			} else {
				selectedPaymentMethod = paymentMethods[0] || "";
				console.log('New order - selectedPaymentMethod set to first available:', selectedPaymentMethod);
			}
			console.log('=== END PAYMENT METHOD INIT ===');
		}
	}

	// Synchronizace selectedCurrency
	function initializeSelectedCurrency() {
		if (order && currencies.length > 0) {
			const orderCurrency = order.currency;
			
			if (orderCurrency && currencies.includes(orderCurrency)) {
				selectedCurrency = orderCurrency;
				console.log('Initial sync: selectedCurrency set to:', selectedCurrency);
			} else if (orderCurrency && !currencies.includes(orderCurrency)) {
				console.warn('Currency not found in currencies:', orderCurrency, 'Available:', currencies);
				selectedCurrency = currencies[0] || "";
			} else {
				selectedCurrency = currencies[0] || "";
				console.log('New order - selectedCurrency set to first available:', selectedCurrency);
			}
		}
	}

	// Synchronizace selectedShippingMethod
	function initializeSelectedShippingMethod() {
		if (order && shippingMethods.length > 0) {
			const orderShippingMethod = order.shipping_method;
			
			if (orderShippingMethod && shippingMethods.includes(orderShippingMethod)) {
				selectedShippingMethod = orderShippingMethod;
				console.log('Initial sync: selectedShippingMethod set to:', selectedShippingMethod);
			} else if (orderShippingMethod && !shippingMethods.includes(orderShippingMethod)) {
				console.warn('Shipping method not found in shippingMethods:', orderShippingMethod, 'Available:', shippingMethods);
				selectedShippingMethod = shippingMethods[0] || "";
			} else {
				selectedShippingMethod = shippingMethods[0] || "";
				console.log('New order - selectedShippingMethod set to first available:', selectedShippingMethod);
			}
		}
	}

	// Synchronizace isPaid
	function initializeIsPaid() {
		if (order) {
			isPaid = order.pay_state || false;
			console.log('Initial sync: isPaid set to:', isPaid);
		}
	}

	// Sleduje změny v order a orderStates pro inicializaci
	// KRITICKÉ: Musí počkat na oba - order data i orderStates
	$: if (order && orderStates.length > 0 && isInitialLoad) {
		console.log('=== INITIALIZING ALL DROPDOWNS ===');
		initializeSelectedOrderState();
		
		// Inicializace ostatních dropdown pokud jsou data dostupná
		if (paymentMethods.length > 0) {
			initializeSelectedPaymentMethod();
		}
		
		if (currencies.length > 0) {
			initializeSelectedCurrency();
		}
		
		if (shippingMethods.length > 0) {
			initializeSelectedShippingMethod();
		}
		
		initializeIsPaid();
		
		isInitialLoad = false;
		console.log('=== ALL DROPDOWNS INITIALIZED ===');
	}

	// Získáme seznam měn - nyní již jen stringy
	$: currencies = Array.isArray(orderSettings?.currencies) 
		? orderSettings.currencies 
		: ['CZK', 'EUR'];

	// Získáme seznam způsobů doručení
	$: shippingMethods = orderSettings?.shippingMethods?.map((method: any) => method.name) || ['Osobní odběr', 'Doručení na adresu'];

	// Získáme seznam platebních metod - pokud jsou to objekty, extrahujeme názvy, jinak použijeme přímo
	$: paymentMethods = Array.isArray(orderSettings?.paymentMethods) 
		? (typeof orderSettings.paymentMethods[0] === 'string' 
			? orderSettings.paymentMethods 
			: orderSettings.paymentMethods.map((method: any) => method.name || method))
		: ['Hotově', 'Kartou', 'Převodem'];

	// Vypočítáme celkovou cenu
	$: totalPrice = order?.order_items?.reduce((sum: number, item: any) => sum + (item.quantity * item.price), 0) || 0;
	$: totalItems = order?.order_items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0;

	// Navigační funkce
	async function goToPreviousOrder() {
		if (navigation?.prevOrderId) {
			await goto(`/admin/order/${navigation.prevOrderId}`);
		}
	}

	async function goToNextOrder() {
		if (navigation?.nextOrderId) {
			await goto(`/admin/order/${navigation.nextOrderId}`);
		}
	}

	// Keyboard navigation
	function handleKeydown(event: KeyboardEvent) {
		if (event.target && (event.target as HTMLElement).tagName === 'INPUT' || 
			event.target && (event.target as HTMLElement).tagName === 'TEXTAREA' ||
			event.target && (event.target as HTMLElement).tagName === 'SELECT') {
			return; // Nenavigovat pokud je focus na input elementu
		}

		if (event.key === 'ArrowLeft' && navigation?.prevOrderId) {
			event.preventDefault();
			goToPreviousOrder();
		} else if (event.key === 'ArrowRight' && navigation?.nextOrderId) {
			event.preventDefault();
			goToNextOrder();
		}
	}

	async function updateOrder() {
		try {
			loading = true;

			// Debug informace před uložením
			console.log("=== UPDATE ORDER DEBUG ===");
			console.log("selectedOrderState:", selectedOrderState);
			console.log("isPaid:", isPaid);
			console.log("selectedCurrency:", selectedCurrency);
			console.log("selectedShippingMethod:", selectedShippingMethod);
			console.log("selectedPaymentMethod:", selectedPaymentMethod);
			console.log("=== END UPDATE ORDER DEBUG ===");

			const update = {
				updated_at: new Date().toISOString(),
				date: date ? new Date(date).toISOString() : null,
				state: selectedOrderState,
				pay_state: isPaid,
				currency: selectedCurrency,
				shipping_method: selectedShippingMethod,
				pay_method: selectedPaymentMethod,
				customer_email,
				customer_first_name,
				customer_last_name,
				customer_street,
				customer_street_number,
				customer_city,
				customer_zip_code,
				customer_telephone,
				delivery_first_name,
				delivery_last_name,
				delivery_street,
				delivery_street_number,
				delivery_city,
				delivery_zip_code,
				delivery_telephone
			};

			const { data, error } = await supabase
				.from("orders")
				.update(update)
				.eq("id", orderId)
				.select("*");

			if (error) {
				console.error("Error saving:", error);
				throw error;
			} else {
				console.log("Order saved successfully!");
				console.log("Saved data:", data);
				updateMessage = "Objednávka úspěšně uložena !";
			}
		} catch (error) {
			if (error instanceof Error) {
				console.error("Error saving:", error);
				alert(error.message);
			}
		} finally {
			loading = false;
		}
	}

	async function deleteOrder() {
		try {
			loading = true;
			const { error } = await supabase
				.from("orders")
				.delete()
				.eq("id", orderId);

			if (error) {
				console.error("Error deleting order:", error);
				throw error;
			} else {
				console.log("Order deleted successfully!");
				await goto("/order", { replaceState: true });
			}
		} catch (error) {
			if (error instanceof Error) {
				console.error("Error in Delete order:", error);
				alert(error.message);
			}
		} finally {
			loading = false;
		}
	}

	function formatSupabaseDate(inputDate: string) {
		if (!inputDate) return "";
		const [year, month, day] = inputDate.split("-");
		return `${day.padStart(2, "0")}-${month.padStart(2, "0")}-${year}`;
	}

	async function back() {
		await goto($ROUTES.ADMIN.ORDER.LIST);
	}

	async function createInvoice() {
		await goto(`/admin/order/${orderId}/create-invoice`);
	}

	// Získáme barvu pro stav objednávky - s fallbackem pro neznámé stavy
	function getOrderStateColor(stateName: any) {
		if (!orderSettings?.orderStates) {
			// Výchozí barvy pro základní stavy když nejsou v nastavení
			const defaultColors: Record<string, string> = {
				'Nová': '#0284c7',
				'Expedovaná': '#eab308', 
				'Fakturovaná': '#16a34a',
				'Stornovaná': '#dc2626'
			};
			return defaultColors[stateName] || '#9ca3af';
		}
		
		const state = orderSettings.orderStates.find((state: any) => state.name === stateName);
		return state ? state.color : '#9ca3af';
	}

	// Formátovací funkce - používáme centrální implementaci

	// Používáme centrální funkci pro formátování data přímo

	// Definice akcí pro AdminPageLayout
	$: actions = [
		{
			label: loading ? 'Ukládá se...' : 'Uložit změny',
			onClick: updateOrder,
			variant: 'primary' as const,
			loading,
			disabled: loading
		},
		{
			label: order?.fakturoid_data?.invoice_id ? 'Faktura vytvořena' : 'Vytvořit fakturu',
			onClick: createInvoice,
			variant: 'secondary' as const,
			disabled: loading || order?.fakturoid_data?.invoice_id
		},
		{
			label: loading ? 'Maže se...' : 'Smazat',
			onClick: deleteOrder,
			variant: 'danger' as const,
			loading,
			disabled: loading
		}
	];

	onMount(() => {
		console.log("====== ORDER PAGE CLIENT MOUNTED ======");
		console.log("Order data available at mount:", !!order);
		console.log("Full order object:", order);
		console.log("Order settings available:", !!orderSettings);
		console.log("Order settings keys:", orderSettings ? Object.keys(orderSettings) : 'none');
		console.log("Shipping methods:", orderSettings?.shippingMethods);
		console.log("Payment methods:", orderSettings?.paymentMethods);
		console.log("Currencies:", orderSettings?.currencies);
		console.log("Navigation available:", !!navigation);
		console.log("Prev order ID:", navigation?.prevOrderId);
		console.log("Next order ID:", navigation?.nextOrderId);
		
		// Detailní výpis kontaktních údajů
		if (order) {
			console.log("=== CONTACT FIELDS DEBUG ===");
			console.log("customer_email:", order.customer_email);
			console.log("customer_first_name:", order.customer_first_name);
			console.log("customer_last_name:", order.customer_last_name);
			console.log("customer_telephone:", order.customer_telephone);
			console.log("customer_street:", order.customer_street);
			console.log("customer_street_number:", order.customer_street_number);
			console.log("customer_city:", order.customer_city);
			console.log("customer_zip_code:", order.customer_zip_code);
			console.log("=== END CONTACT FIELDS DEBUG ===");
		}
		
		// Detailní inspekce order_items pro zjištění chybějícího menu_id
		if (order && order.order_items) {
			console.log("Number of order items:", order.order_items.length);
			
			order.order_items.forEach((item: any, index: number) => {
				console.log(`Item ${index + 1}:`);
				console.log(`  - variant_id exists:`, !!item.variant_id);
				
				if (item.variant_id) {
					console.log(`  - variant_id:`, item.variant_id);
					console.log(`  - menu_id exists:`, !!item.variant_id.menu_id);
					
					if (item.variant_id.menu_id) {
						console.log(`  - menu_id:`, item.variant_id.menu_id);
						console.log(`  - date exists:`, !!item.variant_id.menu_id.date);
					}
				}
			});
		}

		// Přidání keyboard listeneru
		document.addEventListener('keydown', handleKeydown);
		
		return () => {
			document.removeEventListener('keydown', handleKeydown);
		};
	});
</script>

<svelte:window on:keydown={handleKeydown} />

<AdminPageLayout
	title="Detail objednávky"
	subtitle="#{order?.order_number ?? ''}"
	backUrl={$ROUTES.ADMIN.ORDER.LIST}
	{actions}
	successMessage={updateMessage}
	{loading}>

	<!-- Navigační šipky -->
	{#if navigation?.prevOrderId || navigation?.nextOrderId}
		<div class="flex justify-between items-center mb-6 px-4 py-2 bg-gray-50 rounded-lg border">
			<button
				on:click={goToPreviousOrder}
				disabled={!navigation?.prevOrderId}
				class="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
				title="Předchozí objednávka (←)">
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
				</svg>
				Předchozí
			</button>
			

			<button
				on:click={goToNextOrder}
				disabled={!navigation?.nextOrderId}
				class="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
				title="Následující objednávka (→)">
				Následující
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
				</svg>
			</button>
		</div>
	{/if}

	{#if order}
		<!-- Základní informace ve dvou sloupcích -->
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
			<!-- Základní údaje objednávky -->
			<div class="space-y-4">
				<h3 class="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">Základní údaje</h3>
				
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-1">Číslo objednávky</label>
						<input
							type="text"
							readonly
							disabled
							value={order?.order_number ?? ""}
							class="w-full px-3 py-2 border border-gray-300 rounded bg-gray-100 cursor-not-allowed" />						
					</div>
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-1">Datum</label>
						<input
							type="text"
							readonly
							disabled
							value={formattedDate}
							class="w-full px-3 py-2 border border-gray-300 rounded bg-gray-100 cursor-not-allowed" />
					</div>
				</div>

				<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-1">Stav objednávky</label>
						{#if !isInitialLoad && selectedOrderState !== ""}
							<select
								bind:value={selectedOrderState}
								on:change={() => console.log('SELECT CHANGED to:', selectedOrderState)}
								class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500">
								{#each orderStates as state}
									<option value={state}>{state}</option>
								{/each}
							</select>
						{:else}
							<!-- Loading placeholder -->
							<div class="w-full px-3 py-2 border border-gray-300 rounded bg-gray-100 text-gray-500">
								Načítá se...
							</div>
						{/if}						
					</div>
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-1">Stav platby</label>
						{#if !isInitialLoad && order}
							<select 
								bind:value={isPaid}
								class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500">
								<option value={false}>Neuhrazena</option>
								<option value={true}>Uhrazena</option>
							</select>
						{:else}
							<div class="w-full px-3 py-2 border border-gray-300 rounded bg-gray-100 text-gray-500">
								Načítá se...
							</div>
						{/if}
					</div>
				</div>
			</div>

			<!-- Osobní údaje zákazníka -->
			<div class="space-y-4">
				<h3 class="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">Kontaktní údaje</h3>
				
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-1">Jméno</label>
						<input
							type="text"
							bind:value={customer_first_name}
							placeholder="Jméno zákazníka"
							class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500" />
					</div>
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-1">Příjmení</label>
						<input
							type="text"
							bind:value={customer_last_name}
							placeholder="Příjmení zákazníka"
							class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500" />
					</div>
				</div>

				<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
						<input
							type="email"
							bind:value={customer_email}
							placeholder="Email zákazníka"
							class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500" />
					</div>
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
						<input
							type="tel"
							bind:value={customer_telephone}
							placeholder="Telefon zákazníka"
							class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500" />
					</div>
				</div>

				
			</div>
		</div>

		<!-- Doplňující informace ve třech sloupcích -->
		<div class="pt-6 border-t border-gray-200">
			<div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
				<!-- Platební údaje -->
				<div class="space-y-4">
					<h4 class="font-medium text-gray-900">Platební údaje</h4>
					<div class="space-y-3">
						<div>
							<label class="block text-sm text-gray-600 mb-1">Způsob platby</label>
							{#if !isInitialLoad && paymentMethods.length > 0}
								<select
									bind:value={selectedPaymentMethod}
									class="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500">
									{#each paymentMethods as method}
										<option value={method}>{method}</option>
									{/each}
								</select>
							{:else}
								<div class="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-gray-100 text-gray-500">
									Načítá se...
								</div>
							{/if}
						</div>
						<div class="grid grid-cols-2 gap-2">
							<div>
								<label class="block text-sm text-gray-600 mb-1">Měna</label>
								{#if !isInitialLoad && currencies.length > 0}
									<select
										bind:value={selectedCurrency}
										class="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500">
										{#each currencies as currency}
											<option value={currency}>{currency}</option>
										{/each}
									</select>
								{:else}
									<div class="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-gray-100 text-gray-500">
										Načítá se...
									</div>
								{/if}
							</div>
							<div>
								<label class="block text-sm text-gray-600 mb-1">Celkem</label>
								<div class="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-gray-50 font-medium">
									{formatPrice(totalPrice)}
								</div>
							</div>
						</div>
					</div>
				</div>

				<!-- Doručení -->
				<div class="space-y-4">
					<h4 class="font-medium text-gray-900">Způsob doručení</h4>
					<div class="space-y-3">
						<div>
							<label class="block text-sm text-gray-600 mb-1">Doprava</label>
							{#if !isInitialLoad && shippingMethods.length > 0}
								<select
									bind:value={selectedShippingMethod}
									class="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500">
									{#each shippingMethods as method}
										<option value={method}>{method}</option>
									{/each}
								</select>
							{:else}
								<div class="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-gray-100 text-gray-500">
									Načítá se...
								</div>
							{/if}
						</div>						
					</div>
				</div>

				<!-- Adresa -->
				<div class="space-y-4">
					<h4 class="font-medium text-gray-900">Fakturační adresa</h4>
					<div class="space-y-3">
						<div class="grid grid-cols-3 gap-2">
							<div class="col-span-2">
								<label class="block text-sm text-gray-600 mb-1">Ulice</label>
								<input
									type="text"
									bind:value={customer_street}
									placeholder="Ulice"
									class="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500" />
							</div>
							<div>
								<label class="block text-sm text-gray-600 mb-1">Číslo</label>
								<input
									type="text"
									bind:value={customer_street_number}
									placeholder="Č.p."
									class="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500" />
							</div>
						</div>
						<div class="grid grid-cols-2 gap-2">
							<div>
								<label class="block text-sm text-gray-600 mb-1">Město</label>
								<input
									type="text"
									bind:value={customer_city}
									placeholder="Město"
									class="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500" />
							</div>
							<div>
								<label class="block text-sm text-gray-600 mb-1">PSČ</label>
								<input
									type="text"
									bind:value={customer_zip_code}
									placeholder="PSČ"
									class="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500" />
							</div>
						</div>
					</div>
				</div>
			</div>
			{#if order?.fakturoid_data?.invoice_url}
							<div class="mt-2">
								<a href={order.fakturoid_data.invoice_url} target="_blank" rel="noopener noreferrer" class="text-blue-600 underline hover:text-blue-800 text-sm">
									Otevřít fakturu ve Fakturoidu
								</a>
							</div>
						{/if}
		</div>

	<!-- Poznámky -->
	<div class="pt-6 border-t border-gray-200">
		<h3 class="text-lg font-medium text-gray-900 mb-4">Poznámky</h3>
		
		<div class="grid grid-cols-1 gap-6">
			<div>
				<label class="block text-sm font-medium text-gray-700 mb-2">Poznámka k objednávce</label>
				<div class="w-full px-3 py-3 border border-gray-300 rounded-md bg-gray-50 text-sm text-gray-800 min-h-[100px] whitespace-pre-wrap">
					{note}
				</div>
			</div>
		</div>
	</div>

		<!-- Položky objednávky -->
		<div class="pt-6 border-t border-gray-200">
			<h3 class="text-lg font-medium text-gray-900 mb-4">Položky objednávky</h3>
			
			<!-- Desktop verze (tabulka) -->
			<div class="hidden md:block bg-white rounded-lg border overflow-hidden">
				<div class="overflow-x-auto">
					<table class="min-w-full divide-y divide-gray-200">
						<thead class="bg-gray-50">
							<tr>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Varianta</th>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Datum</th>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Název</th>
								<th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Množství</th>
								<th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Cena/ks</th>
								<th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Celkem</th>
							</tr>
						</thead>
						<tbody class="bg-white divide-y divide-gray-200">
							{#each order.order_items as item, i}
								<tr class="hover:bg-gray-50">
									<td class="px-6 py-4 whitespace-nowrap">
										<span class="inline-flex items-center px-3.5 py-1.5 rounded-full text-md font-medium bg-blue-100 text-blue-800">
											{item.variant_id.variant_number}
										</span>
									</td>
									<td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
										{#if item.menuVersionData}
											{formatDateToCzechShort(item.menuVersionData.date)}
										{:else if item.variant_id?.menu_id?.date}
											{formatDateToCzechShort(item.variant_id.menu_id.date)}
										{:else if item.variant_id?.menu_version_id?.date}
											{formatDateToCzechShort(item.variant_id.menu_version_id.date)}
										{:else}
											N/A
										{/if}
									</td>
									<td class="px-6 py-4">
										<div class="text-sm font-medium text-gray-900">{item.variant_id.description}</div>
										{#if item.menuVersionData}
											<div class="text-sm text-gray-500">Polévka: {item.menuVersionData.soup}</div>
										{/if}
									</td>
									<td class="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
										{item.quantity}
									</td>
									<td class="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
										{formatPrice(item.price)}
									</td>
									<td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
										{formatPrice(item.quantity * item.price)}
									</td>
								</tr>
							{/each}
						</tbody>
						<tfoot class="bg-gray-50">
							<tr>								
								<td colspan="4" class="px-6 py-4 text-right text-lg font-bold text-gray-900">
									{totalItems} ks
								</td>
								<td colspan="2"class="px-6 py-4 text-right text-lg font-bold text-gray-900">
									{formatPrice(totalPrice)}
								</td>
							</tr>
						</tfoot>
					</table>
				</div>
			</div>

			<!-- Mobilní verze (karty) -->
			<div class="md:hidden space-y-4">
				{#each order.order_items as item, i}
					<div class="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
						<div class="flex justify-between items-start mb-3">
							<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
								Varianta {item.variant_id.variant_number}
							</span>
							<span class="text-sm font-medium text-gray-600">
								{#if item.menuVersionData}
									{formatDateToCzechShort(item.menuVersionData.date)}
								{:else if item.variant_id?.menu_id?.date}
									{formatDateToCzechShort(item.variant_id.menu_id.date)}
								{:else if item.variant_id?.menu_version_id?.date}
									{formatDateToCzechShort(item.variant_id.menu_version_id.date)}
								{:else}
									N/A
								{/if}
							</span>
						</div>

						<div class="mb-3">
							<div class="font-medium text-gray-900">{item.variant_id.description}</div>
							{#if item.menuVersionData}
								<div class="text-sm text-gray-500">Polévka: {item.menuVersionData.soup}</div>
							{/if}
						</div>

						<div class="flex justify-between items-center text-sm">
							<div class="flex gap-4">
								<span><span class="font-medium">Množství:</span> {item.quantity}</span>
								<span><span class="font-medium">Cena/ks:</span> {formatPrice(item.price)}</span>
							</div>
							<div class="font-medium">{formatPrice(item.quantity * item.price)}</div>
						</div>
					</div>
				{/each}

				<div class="bg-gray-50 rounded-lg p-4 mt-4">
					<div class="flex justify-between items-center">
						<span class="font-bold">{totalItems} ks</span>
						<span class="text-lg font-bold">{formatPrice(totalPrice)}</span>
					</div>
				</div>
			</div>
		</div>
	
	{:else}
		<div class="p-8 text-center">
			<p class="text-gray-600">Načítání dat objednávky...</p>
		</div>
	{/if}
</AdminPageLayout>
