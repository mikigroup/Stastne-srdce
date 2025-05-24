<script lang="ts">
	import { goto } from "$app/navigation";
	import { fly } from "svelte/transition";
	import { ROUTES } from "$lib/stores/store";
	import { formatDateToCzech } from "$lib/date"
	import FakturoidButton from "./FakturoidButton.svelte";
	import { onMount } from 'svelte';

	export let data;
	console.log("====== ORDER PAGE CLIENT INIT ======");
	console.log("Received data keys:", Object.keys(data || {}));

	let { session, supabase, order, eshopSettings } = data;
	$: ({ session, supabase, order, eshopSettings } = data);

	console.log("Order exists:", !!order);
	if (order) {
		console.log("Order has date:", !!order.date);
		console.log("Order properties:", Object.keys(order));
	}

	let loading = false;
	let date: string = order?.date ?? "";
	let orderId: string = order?.id;
	let formattedDate = date ? formatSupabaseDate(date) : "";
	let selectedPaymentMethod: string = order?.pay_method;
	let selectedOrderState: string = order?.state;
	let selectedCurrency: string = order?.currency;
	let selectedShippingMethod: string = order?.shipping_method;
	let isPaid: boolean = order?.pay_state || false;
	let note: string = order?.note ?? "";

	// Fakturační údaje
	let customer_email: string = order?.customer_email ?? "";
	let customer_first_name: string = order?.customer_first_name ?? "";
	let customer_last_name: string = order?.customer_last_name ?? "";
	let customer_street: string = order?.customer_street ?? "";
	let customer_street_number: string = order?.customer_street_number ?? "";
	let customer_city: string = order?.customer_city ?? "";
	let customer_zip_code: string = order?.customer_zip_code ?? "";
	let customer_telephone: string = order?.customer_telephone ?? "";

	// Dodací údaje
	let delivery_first_name: string = order?.delivery_first_name ?? "";
	let delivery_last_name: string = order?.delivery_last_name ?? "";
	let delivery_street: string = order?.delivery_street ?? "";
	let delivery_street_number: string = order?.delivery_street_number ?? "";
	let delivery_city: string = order?.delivery_city ?? "";
	let delivery_zip_code: string = order?.delivery_zip_code ?? "";
	let delivery_telephone: string = order?.delivery_telephone ?? "";

	let updateMessage = "";

	// Získáme seznam stavů objednávek
	$: orderStates = eshopSettings?.orderStates?.map((state: any) => state.name) || ['Nová', 'Zpracovává se', 'Dokončená', 'Zrušená'];

	// Získáme seznam měn
	$: currencies = eshopSettings?.currencies?.map((currency: any) => currency.code) || ['CZK'];

	// Získáme seznam způsobů doručení
	$: shippingMethods = eshopSettings?.shippingMethods?.map((method: any) => method.name) || ['Osobní odběr', 'Doručení na adresu'];

	// Získáme seznam platebních metod
	$: paymentMethods = eshopSettings?.paymentMethods?.map((method: any) => method.name) || ['Hotově', 'Kartou', 'Převodem'];

	// Vypočítáme celkovou cenu
	$: totalPrice = order?.order_items?.reduce((sum: number, item: any) => sum + (item.quantity * item.price), 0) || 0;
	$: totalItems = order?.order_items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0;

	async function updateOrder() {
		try {
			loading = true;

			const update = {
				updated_at: new Date().toISOString(),
				date: date ? new Date(date).toISOString() : null,
				state: selectedOrderState,
				pay_state: isPaid,
				currency: selectedCurrency,
				shipping_method: selectedShippingMethod,
				pay_method: selectedPaymentMethod,
				note,
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

	// Získáme barvu pro stav objednávky
	function getOrderStateColor(stateName: any) {
		if (!eshopSettings?.orderStates) return '#9ca3af';
		
		const state = eshopSettings.orderStates.find((state: any) => state.name === stateName);
		return state ? state.color : '#9ca3af';
	}

	// Formátovací funkce
	function formatPrice(price: number): string {
		return `${price.toLocaleString('cs-CZ')}\u00A0Kč`;
	}

	function formatDate(date: string): string {
		if (!date) return 'N/A';
		return formatDateToCzech(date);
	}

	onMount(() => {
		console.log("====== ORDER PAGE CLIENT MOUNTED ======");
		console.log("Order data available at mount:", !!order);
		
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
	});
</script>

<div class="bg-white rounded-lg shadow-md p-6" in:fly={{ y: 50, duration: 500 }}>
	<!-- Header -->
	<div class="flex items-center justify-between mb-6">
		<h2 class="text-xl font-semibold">
			Detail objednávky <span class="text-2xl">#{order?.order_number ?? ""}</span>
		</h2>
		<div class="flex gap-2">
			<button 
				on:click={back} 
				class="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors">
				Zpět
			</button>
			<button
				disabled={loading}
				on:click={updateOrder}
				class="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors">
				{loading ? 'Ukládá se...' : 'Uložit změny'}
			</button>
			<button
				class="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 transition-colors"
				disabled={loading || order?.fakturoid_data?.invoice_id}
				on:click={createInvoice}>
				{#if order?.fakturoid_data?.invoice_id}
					Faktura vytvořena
				{:else}
					Vytvořit fakturu
				{/if}
			</button>
			<button
				disabled={loading}
				on:click={deleteOrder}
				class="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 transition-colors">
				Smazat
			</button>
		</div>
	</div>

	{#if updateMessage}
		<div class="mb-4 p-3 bg-green-100 border border-green-200 text-green-800 rounded">
			{@html updateMessage}
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
						<select
							bind:value={selectedOrderState}
							class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500">
							{#each orderStates as state}
								<option value={state}>{state}</option>
							{/each}
						</select>
					</div>
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-1">Stav platby</label>
						<select 
							bind:value={isPaid}
							class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500">
							<option value={false}>Neuhrazena</option>
							<option value={true}>Uhrazena</option>
						</select>
					</div>
				</div>
			</div>

			<!-- Osobní údaje zákazníka -->
			<div class="space-y-4">
				<h3 class="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">Kontaktní údaje</h3>
				
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
						<input
							type="email"
							bind:value={customer_email}
							disabled
							placeholder="Email zákazníka"
							class="w-full px-3 py-2 border border-gray-300 rounded bg-gray-100 cursor-not-allowed" />
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
							<select
								bind:value={selectedPaymentMethod}
								class="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500">
								{#each paymentMethods as method}
									<option value={method}>{method}</option>
								{/each}
							</select>
						</div>
						<div class="grid grid-cols-2 gap-2">
							<div>
								<label class="block text-sm text-gray-600 mb-1">Měna</label>
								<select
									bind:value={selectedCurrency}
									class="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500">
									{#each currencies as currency}
										<option value={currency}>{currency}</option>
									{/each}
								</select>
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
							<select
								bind:value={selectedShippingMethod}
								class="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500">
								{#each shippingMethods as method}
									<option value={method}>{method}</option>
								{/each}
							</select>
						</div>
						<div class="grid grid-cols-2 gap-2">
							<div>
								<label class="block text-sm text-gray-600 mb-1">Položek</label>
								<div class="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-gray-50">
									{totalItems} ks
								</div>
							</div>
							<div>
								<label class="block text-sm text-gray-600 mb-1">Cena/ks</label>
								<div class="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-gray-50">
									{totalItems > 0 ? formatPrice(Math.round(totalPrice / totalItems)) : '0 Kč'}
								</div>
							</div>
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
											{formatDate(item.menuVersionData.date)}
										{:else if item.variant_id?.menu_id?.date}
											{formatDate(item.variant_id.menu_id.date)}
										{:else if item.variant_id?.menu_version_id?.date}
											{formatDate(item.variant_id.menu_version_id.date)}
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
								<td colspan="5" class="px-6 py-4 text-right text-sm font-medium text-gray-900">
									Celkem:
								</td>
								<td class="px-6 py-4 text-right text-lg font-bold text-gray-900">
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
									{formatDate(item.menuVersionData.date)}
								{:else if item.variant_id?.menu_id?.date}
									{formatDate(item.variant_id.menu_id.date)}
								{:else if item.variant_id?.menu_version_id?.date}
									{formatDate(item.variant_id.menu_version_id.date)}
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
						<span class="font-medium">Celkový počet položek: {totalItems}</span>
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
</div>
