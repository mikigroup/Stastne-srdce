<script lang="ts">
	import type { Actions } from "@sveltejs/kit";
	import { CartItemsStore, totalPiecesStore, type CartItem } from "$lib/stores/store";
	import { page } from "$app/stores";
	import Modal from "./Modal.svelte";
	import { onMount } from "svelte";
	import { goto } from "$app/navigation";
	import { enhance } from "$app/forms";
	import { validateProfileForInvoicing } from "$lib/utils/profileValidation";
	import { ROUTES } from "$lib/constants/routes";
	import { formatDateDayMonth } from "$lib/utils/formatting";
	import { getAvailableTimeSlots, formatTimeSlot, type TimeSlotAvailability } from "$lib/services/timeSlotService";
	import { getDefaultSettings } from "$lib/constants/defaultSettings";
	import { PUBLIC_TENANT } from "$env/static/public";

	export let data;
	export let form: Actions;

	let { session, supabase, user } = data;
	let loading = false;
	let modal: Modal;
	let isSubmitting = false;
	let errorMessage = '';
	let profileData: any = null;
	let selectedTimeSlot: string = '';
	let availableTimeSlots: TimeSlotAvailability[] = [];
	let timeSlotSettings: any = null;
	
	// Nové proměnné pro dopravu
	let deliverySettings: any = null;
	let deliveryPrice = 0;
	let isDeliveryFree = false;

	$: ({ session, supabase, user } = data);

	// Store subscriptions
	let cartItems: any[] = [];
	$: cartItems = $CartItemsStore;
	$: totalPieces = $totalPiecesStore;

	// Calculate total price
	$: totalPrice = cartItems.reduce((sum: number, item: any) => {
		if (!item?.variants?.length) return sum;
		return (
			sum +
			item.variants.reduce(
				(variantSum: number, variant: any) =>
					variantSum + (variant.price || 0) * (variant.quantity || 0),
				0
			)
		);
	}, 0);

	// Výpočet ceny dopravy a celkové ceny
	$: if (deliverySettings && totalPrice > 0) {
		// Kontrola dopravy zdarma
		isDeliveryFree = totalPrice >= (deliverySettings.freeDeliveryThreshold || 0);
		
		// Výpočet ceny dopravy
		if (isDeliveryFree) {
			deliveryPrice = 0;
		} else {
			// Najdeme nejlevnější dopravní metodu
			const availableMethods = deliverySettings.shippingMethods?.filter((method: any) => method.enabled !== false) || [];
			if (availableMethods.length > 0) {
				deliveryPrice = Math.min(...availableMethods.map((method: any) => method.price || 0));
			} else {
				deliveryPrice = 0;
			}
		}
	} else {
		deliveryPrice = 0;
		isDeliveryFree = false;
	}

	// Celková cena včetně dopravy
	$: totalPriceWithDelivery = totalPrice + deliveryPrice;

	// Funkce pro výpočet ceny variant
	function calculateVariantPrice(variants: any[]): number {
		return variants.reduce((total: number, variant: any) => 
			total + (variant.price || 0) * (variant.quantity || 0), 0
		);
	}

	// Kontrola minimální hodnoty objednávky
	$: minimumOrderMet = !deliverySettings?.minimumOrderValue || totalPrice >= deliverySettings.minimumOrderValue;
	$: minimumOrderMessage = deliverySettings?.minimumOrderValue && totalPrice < deliverySettings.minimumOrderValue 
		? `Minimální hodnota objednávky je ${deliverySettings.minimumOrderValue} Kč. Chybí ${deliverySettings.minimumOrderValue - totalPrice} Kč.`
		: '';

	async function getProfile() {
		if (!user?.id) return;

		try {
			loading = true;

			const { data: customerData, error } = await supabase
				.from("profiles")
				.select(`
					first_name, last_name, street, street_number, city, zip_code, 
					telephone, delivery_method, payment_method, company, ico, dic, 
					allergies, allergies_description
				`)
				.eq("id", user.id)
				.single();

			if (error && error.code !== "406") throw error;

			if (customerData) {
				profileData = customerData;
			}
		} catch (error) {
			console.error("Error fetching profile:", error);
		} finally {
			loading = false;
		}
	}

	async function loadDeliverySettings() {
		try {
			const { data: deliveryData } = await supabase
				.from('site_settings')
				.select('value')
				.eq('key', 'delivery')
				.eq('tenant_id', PUBLIC_TENANT)
				.single();

			if (deliveryData?.value) {
				deliverySettings = typeof deliveryData.value === 'string' 
					? JSON.parse(deliveryData.value) 
					: deliveryData.value;
			}
		} catch (error) {
			console.error("Error loading delivery settings:", error);
		}
	}

	async function loadTimeSlots() {
		console.log('🔍 Debug - loadTimeSlots called, cartItems.length:', cartItems.length);

		try {
			// Načtení nastavení časových slotů
			const { data: productsSettings } = await supabase
				.from('site_settings')
				.select('value')
				.eq('key', 'products')
				.eq('tenant_id', PUBLIC_TENANT)
				.single();

			console.log('🔍 Debug - productsSettings:', productsSettings);
			console.log('🔍 Debug - productsSettings.value:', productsSettings?.value);

			if (productsSettings?.value) {
				// Zkusíme parsovat JSON, pokud je to string
				if (typeof productsSettings.value === 'string') {
					timeSlotSettings = JSON.parse(productsSettings.value);
				} else {
					timeSlotSettings = productsSettings.value;
				}
				console.log('🔍 Debug - timeSlotSettings:', timeSlotSettings);
				
				// Kontrola, zda jsou časové sloty povolené
				if (timeSlotSettings.timeSlotsEnabled) {
					console.log('🔍 Debug - Loading time slots...');
					
					// Vyčistíme stará data (maxOrders)
					if (timeSlotSettings.timeSlots) {
						timeSlotSettings.timeSlots = timeSlotSettings.timeSlots.map((slot: any) => ({
							startTime: slot.startTime,
							endTime: slot.endTime
							// Odstraníme maxOrders
						}));
					}
					
					const firstDate = cartItems[0]?.date;
					console.log('🔍 Debug - firstDate:', firstDate);
					console.log('🔍 Debug - timeSlotsEnabled:', timeSlotSettings.timeSlotsEnabled);
					
					availableTimeSlots = await getAvailableTimeSlots(supabase, firstDate, timeSlotSettings);
					console.log('🔍 Debug - availableTimeSlots:', availableTimeSlots);
					
					// Nastavení výchozího slotu
					if (availableTimeSlots.length > 0) {
						selectedTimeSlot = `${availableTimeSlots[0].slot.startTime}-${availableTimeSlots[0].slot.endTime}`;
						console.log('🔍 Debug - selectedTimeSlot:', selectedTimeSlot);
					}
				}
			} else {
				// Fallback na defaultní hodnoty
				console.log('🔍 Debug - No data from DB, using defaults');
				timeSlotSettings = getDefaultSettings('products');
			}
		} catch (error) {
			console.error("Error loading time slots:", error);
		}
	}

	function handleSubmit(e: Event) {
		e.preventDefault(); // Zastavíme výchozí odeslání formuláře
		console.log('handleSubmit called');
		
		if (isSubmitting) {
			console.log('Already submitting, returning');
			return;
		}

		// Validace minimální hodnoty objednávky
		if (!minimumOrderMet) {
			errorMessage = minimumOrderMessage;
			return;
		}

		// Validace profilu před zobrazením modálu
		if (profileData && user?.email) {
			const validationResult = validateProfileForInvoicing({
				...profileData,
				email: user.email
			});

			if (!validationResult.isComplete) {
				errorMessage = `Pro vytvoření objednávky musíte mít vyplněné všechny povinné údaje v <a href="/profile" class="text-blue-600 underline">profilu</a>. Chybí: ${validationResult.missingFields.join(', ')}.`;
				return;
			}
		}

		// Vyčistíme chybové zprávy
		errorMessage = '';

		// Zobrazíme potvrzovací modál
		if (modal) {
			modal.show();
		}
	}

	function truncateText(text: string, maxLength: number) {
		if (!text) return "";
		return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
	}

	onMount(async () => {
		await Promise.all([
			getProfile(),
			loadDeliverySettings(),
			loadTimeSlots()
		]);
	});

	// Reakce na změnu košíku - načtení časových slotů
	$: if (cartItems.length > 0) {
		loadTimeSlots();
	}

	const { generalSettings } = data;


</script>

<svelte:head>
	<title>Košík - {generalSettings?.shopName ?? 'Obchod'}</title>
	<meta name="description" content="Košík" />
</svelte:head>

<section>
	{#if $page.data.session}
		<form
			method="POST"
			action="?/sendOrder"
			on:submit|preventDefault={handleSubmit}
			use:enhance={() => {
				return async ({ result }) => {
					console.log('Form action result:', result);
					
					if (result.type === 'success' && result.data?.success) {
						console.log('Order successful, clearing cart...');
						CartItemsStore.clear();
						
						const orderId = result.data?.orderId;
						if (!orderId) {
							console.error('Missing order ID in response:', result);
							errorMessage = 'Chyba: Číslo objednávky není k dispozici';
							return;
						}
						
						const redirectUrl = `/thankyou?order=${orderId}`;
						console.log('Redirecting to:', redirectUrl);
						await goto(redirectUrl, { replaceState: true });
					} else {
						console.error('Order submission error:', result);
						errorMessage = result.type === 'failure' ? String(result.data?.message || 'Došlo k chybě při zpracování objednávky.') : 'Došlo k chybě při zpracování objednávky.';
					}
					
					isSubmitting = false;
				};
			}}
			class="space-y-4">
			<input type="hidden" name="cartItems" value={JSON.stringify(cartItems)} />
			<div
				class="max-w-screen-xl px-4 py-16 mx-auto mt-20 mb-10 rounded-lg bg-stone-100">
				<h1
					class="mb-10 text-5xl font-extrabold tracking-tight text-center text-gray-900 animate__animated animate__rubberBand">
					Košík
				</h1>

				<!-- Mobile cart -->
				<div class="max-w-screen-xl px-4 py-4 mx-auto md:hidden bg-orange-50">
					{#if !cartItems.length}
						<div
							class="flex flex-col items-center justify-center w-full overflow-hidden">
							<div class="my-20 text-xl font-bold text-center md:text-2xl">
								<p>Košík je prázdný...</p>
							</div>
						</div>
					{:else}
						{#each cartItems as cartItem, i (cartItem.id)}
							<div class="mb-5 border rounded-lg bg-stone-100">
								<div class="text-center rounded-lg bg-slate-300">
									<p><strong>Den</strong></p>
								</div>
								<div class="m-2 text-center">
									<p>
										{formatDateDayMonth(cartItem.date)}
									</p>
								</div>
								<hr />
								<div class="m-5 font-light">
									<p class="font-medium">
										<strong>{cartItem.soup}</strong>
									</p>
								</div>
								<hr />
								<div class="m-5">
									{#each cartItem.variants as variant}
										<div class="flex justify-between items-center mb-2">
											<span class="mr-2">
												{variant.variant_number}. {truncateText(
													variant.description,
													50
												)}
											</span>
											<button
												class="hover:animate-spin"
												on:click|preventDefault={() =>
													CartItemsStore.removeItem(cartItem.id, variant.id)}>
												X
											</button>
										</div>
									{/each}
								</div>
								<div class="mt-5 font-light text-center">
									<p><strong>Počet</strong></p>
								</div>
								<div class="mb-5 font-light text-center">
									{#each cartItem.variants as variant}
										<input
											min="0"
											max="99"
											type="number"
											bind:value={variant.quantity}
											on:change={() =>
												CartItemsStore.updateQuantity(
													cartItem.id,
													variant.id,
													variant.quantity
												)}
											class="w-16 text-lg text-center bg-white border rounded-lg focus:outline-none focus:border-green-600" />
									{/each}
								</div>
								<hr />
								<div class="mt-5 font-light text-center">
									<p><strong>Cena</strong></p>
								</div>
								<div class="pl-2 mb-5 font-light text-center">
									{calculateVariantPrice(cartItem.variants)} Kč
								</div>
							</div>
						{/each}
					{/if}
				</div>

				<!-- Desktop cart header -->
				<div
					class="hidden max-w-screen-2xl px-4 py-2 mx-auto mt-5 border rounded-lg md:grid border-gray-300 bg-slate-300">
					<div
						class="grid items-center grid-cols-12 pl-5 text-lg rounded-lg text-center font-light">
						<div class="col-span-1 border-r border-white">
							<p>Den</p>
						</div>
						<div class="col-span-2 border-r border-white">
							<p>Polévka</p>
						</div>
						<div class="col-span-5 border-r border-white">
							<p>Menu</p>
						</div>
						<div class="col-span-3 border-r border-white">
							<p>Počet a cena</p>
						</div>
						<div class="col-span-1">
							<p>Odebrat</p>
						</div>
					</div>
				</div>

				<!-- Desktop cart -->
				<div
					class="hidden max-w-screen-2xl p-4 mx-auto border border-gray-300 rounded-lg md:grid bg-orange-50">
					{#if !cartItems.length}
						<div
							class="flex flex-col items-center justify-center w-full overflow-hidden">
							<div class="my-20 text-2xl font-bold text-center">
								<p>Košík je prázdný...</p>
							</div>
						</div>
					{:else}
						{#each cartItems as cartItem (cartItem.id)}
							<div
								class="items-center hidden pl-5 text-lg border border-gray-400 rounded-lg md:grid-cols-12 bg-stone-100 md:grid py-7 my-1">
								<div class="col-span-1 text-center border-r">
									<p class="">
										{formatDateDayMonth(cartItem.date)}
									</p>
								</div>
								<div class="col-span-2 pl-5 border-r">
									<p>{truncateText(cartItem.soup, 30)}</p>
								</div>
								<div
									class="col-span-5 pl-5 border-r mr-1 flex gap-2 flex-col">
									{#each cartItem.variants as variant, index}
										<div class="">
											{variant.variant_number}. {truncateText(variant.description, 50)}
										</div>
									{/each}
								</div>
								<div class="col-span-3 gap-8 flex flex-row justify-center">
									<div
										class="w-16 col-span-2 flex flex-col xl:gap-2 gap-10 justify-center">
										{#each cartItem.variants as variant}
											<div class="">
												<input
													min="0"
													max="99"
													type="number"
													bind:value={variant.quantity}
													on:change={() =>
														CartItemsStore.updateQuantity(
															cartItem.id,
															variant.id,
															variant.quantity
														)}
													class="w-full text-lg text-center bg-white border rounded-lg focus:outline-none focus:border-green-600" />
											</div>
										{/each}
									</div>
									<div class="flex flex-col gap-11 xl:gap-7 justify-center">
										{#each cartItem.variants as variant}
											<div class="">
												{(variant.price || 0) * (variant.quantity || 0)} Kč
											</div>
										{/each}
									</div>
								</div>

								<div class="col-span-1 flex flex-col gap-11 xl:gap-7">
									{#each cartItem.variants as variant}
										<button
											type="button"
											class="hover:animate-spin"
											on:click|preventDefault={() =>
												CartItemsStore.removeItem(cartItem.id, variant.id)}>
											X
										</button>
									{/each}
								</div>
							</div>
						{/each}
					{/if}
				</div>

				<!-- Total and checkout -->
				{#if cartItems.length || (timeSlotSettings?.timeSlotsEnabled && availableTimeSlots.length > 0)}
					<div class="mt-5 border rounded-lg border-gray-300">
						<!-- Debug informace -->
					<!-- 	<div class="p-4 bg-yellow-50 border-b border-yellow-200">
							<p class="text-sm text-yellow-800">
								🔍 Debug: timeSlotsEnabled={timeSlotSettings?.timeSlotsEnabled || 'undefined'}, 
								availableTimeSlots.length={availableTimeSlots?.length || 0},
								timeSlots={timeSlotSettings?.timeSlots?.length || 0} slotů,
								timeSlotSettings.timeSlotsEnabled={timeSlotSettings?.timeSlotsEnabled}
							</p>
						</div> -->

						<!-- Časové sloty - ZAKOMENTOVÁNO PRO VÝVOJ -->
						<!--
						{#if timeSlotSettings?.timeSlotsEnabled && availableTimeSlots.length > 0}
							<div class="grid p-5 border-b">
								<label class="block mb-2 text-sm font-medium text-gray-700">
									Čas vyzvednutí objednávky
								</label>
								<div class="space-y-2">
									{#each availableTimeSlots as slot}
										<label class="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
											<input
												type="radio"
												name="timeSlot"
												value="{slot.slot.startTime}-{slot.slot.endTime}"
												bind:group={selectedTimeSlot}
												class="mr-3"
											/>
											<div class="flex-1">
												<div class="font-medium">
													{formatTimeSlot(slot.slot)}
												</div>
											</div>
										</label>
									{/each}
								</div>
								<input type="hidden" name="timeSlot" value={selectedTimeSlot} />
							</div>
						{/if}
						-->

						{#if cartItems.length}
							<div class="grid p-5 border-b">
								<label for="note">Poznámka</label>
								<textarea
									class="bg-gray-50 border rounded-lg block w-full p-2.5 focus:outline-none focus:border-green-600 mb-5 border-gray-300"
									id="note"
									name="note"
									rows="4"
									cols="50"
									placeholder="poznámka k objednávce" />
							</div>

							<div class="grid p-5 border-b justify-items-end">			
								
								<!-- Cena dopravy -->
								{#if deliveryPrice > 0}
									<p class="text-right">
										{#if isDeliveryFree}
											<span class="text-green-600">Doprava zdarma</span>
										{:else}
											Doprava: <strong>{deliveryPrice} Kč</strong>
										{/if}
									</p>
								{/if}
								
								<!-- Celková cena -->
								<p class="text-right text-lg border-t pt-5">
									Celkově: <strong>{totalPieces} ks</strong> obědů za
									<strong>{totalPriceWithDelivery} Kč</strong>
								</p>
								
								<!-- Informace o dopravě zdarma -->
								{#if deliverySettings?.freeDeliveryThreshold && totalPrice > 0 && totalPrice < deliverySettings.freeDeliveryThreshold}
									<p class="text-sm text-blue-600">
										Pro dopravu zdarma přidejte ještě {deliverySettings.freeDeliveryThreshold - totalPrice} Kč
									</p>
								{/if}
								
								<!-- Chyba minimální hodnoty -->
								{#if !minimumOrderMet}
									<p class="text-sm text-red-500">
										{minimumOrderMessage}
									</p>
								{/if}
							</div>

							{#if errorMessage}
								<div class="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
									<p class="text-red-700">{@html errorMessage}</p>
								</div>
							{/if}

							<div class="m-5">
								<button
									type="button"
									class="w-full px-4 py-2 text-base font-semibold text-center text-white transition duration-200 ease-in-out transform bg-green-800 rounded-lg shadow-md hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
									disabled={isSubmitting || cartItems.length === 0 || !minimumOrderMet}
									on:click={handleSubmit}
								>
									{#if isSubmitting}
										<span class="inline-flex items-center">
											<svg class="w-4 h-4 mr-2 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
												<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
												<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
											</svg>
											Odesílám objednávku...
										</span>
									{:else}
										Odeslat objednávku
									{/if}
								</button>
							</div>
						{/if}
					</div>
				{/if}
			</div>
		</form>
	{:else}
		<div class="max-w-screen-xl px-4 py-16 mx-auto mt-20 mb-10 rounded-lg bg-stone-100">
			<h1 class="mb-10 text-5xl font-extrabold tracking-tight text-center text-gray-900">
				Košík
			</h1>
			<div class="text-center">
				<p class="text-xl mb-4">Pro přístup ke košíku se musíte přihlásit.</p>
				<a href={ROUTES.AUTH.LOGIN} class="px-6 py-3 bg-green-800 text-white rounded-lg hover:bg-green-900">
					Přihlásit se
				</a>
			</div>
		</div>
	{/if}

	<Modal 
		bind:this={modal} 
		on:close={() => {
			// Nepotřebujeme čistit errorMessage zde, protože validační chyby se zobrazují před modálem
			if (modal) modal.close();
		}}
		on:confirm={() => {
			isSubmitting = true;
			const form = document.querySelector('form');
			if (form) {
				modal?.close();
				form.requestSubmit();
			}
		}}
	>
		{#if errorMessage}
			<div class="p-4 mb-4 text-red-800 bg-red-100 rounded-lg">
				{errorMessage}
			</div>
		{:else}
			<div class="space-y-4">
				<h3 class="text-xl font-semibold mb-4">Opravdu chcete odeslat objednávku?</h3>				
			</div>
		{/if}
	</Modal>
</section>
