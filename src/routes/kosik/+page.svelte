<script lang="ts">
	import type { Actions } from "@sveltejs/kit";
	import { CartItemsStore, totalPiecesStore, type CartItem } from "$lib/stores/store";
	import { page } from "$app/state";
	import Modal from "./Modal.svelte";
	import { onMount } from "svelte";
	import { goto } from "$app/navigation";
	import { resolve } from "$app/paths";
	import { enhance } from "$app/forms";
	import { validateProfileForInvoicing } from "$lib/utils/profileValidation";
	import { ROUTES } from "$lib/constants/routes";
	import { formatDateDayMonth } from "$lib/utils/formatting";
	import { getAvailableTimeSlots, formatTimeSlot, type TimeSlotAvailability } from "$lib/services/timeSlotService";
	import { getDefaultSettings } from "$lib/constants/defaultSettings";
	import { PUBLIC_TENANT } from "$env/static/public";
	import { shippingPriceForMethod } from "$lib/utils/deliveryPricing";
	import { labelForDeliveryMethod } from "$lib/constants/deliveryMethods";
	import type { Attachment } from "svelte/attachments";

	interface Props {
		data: any;
		form: Actions;
	}

	let { data, form }: Props = $props();

	let session = $derived(data.session);
	let supabase = $derived(data.supabase);
	let user = $derived(data.user);
	let loading = false;
	let modal: Modal | undefined = $state();
	let isSubmitting = $state(false);
	let errorMessage = $state('');
	let profileData: any = $state(null);
	let profileLoaded = $state(false);
	let selectedTimeSlot = $state('');
	let availableTimeSlots: TimeSlotAvailability[] = $state([]);
	let timeSlotSettings: any = $state(null);
	let removeTarget = $state<{
		itemId: string;
		variantId: string;
		description: string;
		date: string;
	} | null>(null);
	let clearCartOpen = $state(false);
	
	// Nové proměnné pro dopravu
	let deliverySettings: any = $state(null);
	let cartItems = $derived($CartItemsStore);
	let totalPieces = $derived($totalPiecesStore);

	// Calculate total price
	let totalPrice = $derived(cartItems.reduce((sum: number, item: any) => {
		if (!item?.variants?.length) return sum;
		return (
			sum +
			item.variants.reduce(
				(variantSum: number, variant: any) =>
					variantSum + (variant.price || 0) * (variant.quantity || 0),
				0
			)
		);
	}, 0));

	let deliveryMethodCode = $derived(String(profileData?.delivery_method ?? "").trim());
	let shippingPrice = $derived(
		shippingPriceForMethod(deliverySettings, deliveryMethodCode, totalPrice)
	);
	let totalPriceWithDelivery = $derived(totalPrice + shippingPrice);

	let deliveryMethodLabel = $derived(
		labelForDeliveryMethod(deliveryMethodCode, deliverySettings?.shippingMethods)
	);

	// Funkce pro výpočet ceny variant
	function calculateVariantPrice(variants: any[]): number {
		return variants.reduce((total: number, variant: any) => 
			total + (variant.price || 0) * (variant.quantity || 0), 0
		);
	}

	// Kontrola minimální hodnoty objednávky
	let minimumOrderMet = $derived(!deliverySettings?.minimumOrderValue || totalPrice >= deliverySettings.minimumOrderValue);
	let minimumOrderMessage = $derived(deliverySettings?.minimumOrderValue && totalPrice < deliverySettings.minimumOrderValue 
		? `Minimální hodnota objednávky je ${deliverySettings.minimumOrderValue} Kč. Chybí ${deliverySettings.minimumOrderValue - totalPrice} Kč.`
		: '');

	async function getProfile() {
		const client = supabase;
		if (!client || !user?.id) {
			profileLoaded = true;
			return;
		}

		try {
			loading = true;

			const { data: customerData, error } = await client
				.from("profiles")
				.select(`
					first_name, last_name, street, street_number, city, zip_code,
					telephone, delivery_method, payment_method, company, ico, dic,
					allergies, allergies_description,
					delivery_first_name, delivery_last_name, delivery_telephone,
					delivery_street, delivery_street_number, delivery_city, delivery_zip_code
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
			profileLoaded = true;
		}
	}

	async function loadDeliverySettings() {
		const client = supabase;
		if (!client) return;

		try {
			const { data: deliveryData } = await client
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

		const client = supabase;
		if (!client) return;

		try {
			// Načtení nastavení časových slotů
			const { data: productsSettings } = await client
				.from('site_settings')
				.select('value')
				.eq('key', 'products')
				.eq('tenant_id', PUBLIC_TENANT)
				.single();


			if (productsSettings?.value) {
				timeSlotSettings = typeof productsSettings.value === 'string'
					? JSON.parse(productsSettings.value)
					: productsSettings.value;
			} else {
				timeSlotSettings = getDefaultSettings('products');
			}

			if (timeSlotSettings.timeSlots) {
				timeSlotSettings.timeSlots = timeSlotSettings.timeSlots.map((slot: any) => ({
					startTime: slot.startTime,
					endTime: slot.endTime
				}));
			}

			const firstDate = cartItems[0]?.date;
			if (!firstDate) return;
			availableTimeSlots = await getAvailableTimeSlots(client, firstDate, timeSlotSettings);

			if (availableTimeSlots.length > 0 && !selectedTimeSlot) {
				selectedTimeSlot = `${availableTimeSlots[0].slot.startTime}-${availableTimeSlots[0].slot.endTime}`;
			}
		} catch (error) {
			console.error("Error loading time slots:", error);
		}
	}

	function handleSubmit(e: Event) {
		e.preventDefault(); // Zastavíme výchozí odeslání formuláře
		
		if (isSubmitting) {
			return;
		}

		// Validace minimální hodnoty objednávky
		if (!minimumOrderMet) {
			errorMessage = minimumOrderMessage;
			return;
		}

		if (availableTimeSlots.length > 0 && !selectedTimeSlot) {
			errorMessage = 'Vyberte čas vyzvednutí objednávky.';
			return;
		}

		if (!deliveryMethodCode) {
			errorMessage = 'V profilu chybí způsob dodání. Doplňte ho a objednávku odešlete znovu.';
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

	function cartDayLabel(date: string): { title: string; subtitle: string } {
		const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(date ?? "");
		const dateObj = match
			? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
			: new Date(date);

		if (Number.isNaN(dateObj.getTime())) {
			return { title: "Den", subtitle: "" };
		}

		const weekday = dateObj.toLocaleDateString("cs-CZ", { weekday: "long" });
		const weekdayLabel = weekday.charAt(0).toUpperCase() + weekday.slice(1);
		const shortDate = dateObj
			.toLocaleDateString("cs-CZ", { day: "numeric", month: "numeric" })
			.replace(/\u00a0/g, " ");

		const now = new Date();
		const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
		const diffDays = Math.round((dateObj.getTime() - todayStart.getTime()) / 86_400_000);

		if (diffDays === 0) return { title: "Dnes", subtitle: `${weekdayLabel} ${shortDate}` };
		if (diffDays === 1) return { title: "Zítra", subtitle: `${weekdayLabel} ${shortDate}` };
		if (diffDays === 2) return { title: "Pozítří", subtitle: `${weekdayLabel} ${shortDate}` };

		return { title: weekdayLabel, subtitle: shortDate };
	}

	function changeQuantity(itemId: string, variantId: string, quantity: number) {
		const next = Math.min(99, Math.max(0, quantity));
		CartItemsStore.updateQuantity(itemId, variantId, next);
	}

	const openRemoveDialog: Attachment<HTMLDialogElement> = (node) => {
		$effect(() => {
			if (removeTarget) {
				if (!node.open) node.showModal();
			} else if (node.open) {
				node.close();
			}
		});
	};

	function askRemove(itemId: string, variantId: string, description: string, date: string) {
		removeTarget = { itemId, variantId, description, date };
	}

	function confirmRemove() {
		if (!removeTarget) return;
		const target = removeTarget;
		removeTarget = null;
		CartItemsStore.removeItem(target.itemId, target.variantId);
	}

	function cancelRemove() {
		removeTarget = null;
	}

	const openClearDialog: Attachment<HTMLDialogElement> = (node) => {
		$effect(() => {
			if (clearCartOpen) {
				if (!node.open) node.showModal();
			} else if (node.open) {
				node.close();
			}
		});
	};

	function askClearCart() {
		clearCartOpen = true;
	}

	function confirmClearCart() {
		clearCartOpen = false;
		CartItemsStore.clear();
	}

	function cancelClearCart() {
		clearCartOpen = false;
	}

	onMount(async () => {
		await Promise.all([
			getProfile(),
			loadDeliverySettings(),
			loadTimeSlots()
		]);
	});

	// Reakce na změnu košíku - načtení časových slotů
	$effect(() => {
		if (cartItems.length > 0) {
			loadTimeSlots();
		}
	});

</script>

<section>
	{#if page.data.session}
		<form
			id="order-form"
			method="POST"
			action="?/sendOrder"
			onsubmit={(event) => {
				event.preventDefault();
				handleSubmit(event);
			}}
			use:enhance={() => {
				return async ({ result }) => {
					
					if (result.type === 'success' && result.data?.success) {
						CartItemsStore.clear();
						
						const orderId = result.data?.orderId;
						if (!orderId) {
							console.error('Missing order ID in response:', result);
							errorMessage = 'Chyba: Číslo objednávky není k dispozici';
							return;
						}
						
						const redirectUrl = `/thankyou?order=${orderId}`;
						await goto(redirectUrl, { replaceState: true });
					} else {
						console.error('Order submission error:', result);
						const data =
							result.type === 'failure' || result.type === 'success' ? result.data : undefined;
						const record =
							data && typeof data === 'object'
								? (data as { message?: unknown; developerNotified?: unknown })
								: null;
						const serverMessage =
							record?.message != null && String(record.message).trim()
								? String(record.message)
								: 'Došlo k chybě při zpracování objednávky.';
						errorMessage = record?.developerNotified
							? `${serverMessage} Hlášení bylo odesláno vývojáři k opravě.`
							: serverMessage;
					}
					
					isSubmitting = false;
				};
			}}
			class="space-y-4">
			<input type="hidden" name="cartItems" value={JSON.stringify(cartItems)} />
			<div
				class="max-w-screen-xl px-4 py-16 mx-auto mt-20 mb-10 rounded-lg bg-stone-100">
				<h1
					class="mb-4 text-5xl font-extrabold tracking-tight text-center text-gray-900 animate__animated animate__rubberBand">
					Košík
				</h1>
				{#if timeSlotSettings?.nextDayMenuEnabled && timeSlotSettings?.nextDayMenuTime}
					<p class="mb-10 text-xs text-right text-gray-500">
						Objednávky na další den jsou možné do
						<strong class="text-sm leading-none text-gray-500">{timeSlotSettings.nextDayMenuTime}</strong>
					</p>
				{/if}

				<!-- Mobile cart -->
				<div class="md:hidden">
					{#if !cartItems.length}
						<div class="py-16 text-xl font-bold text-center">
							<p>Košík je prázdný...</p>
						</div>
					{:else}
						<div class="space-y-4">
							{#each cartItems as cartItem (cartItem.id)}
								{@const day = cartDayLabel(cartItem.date)}
								{@const dayPieces = cartItem.variants.reduce(
									(sum: number, variant: { quantity?: number }) => sum + (variant.quantity || 0),
									0
								)}
								<article class="overflow-hidden bg-white border border-gray-200 rounded-xl shadow-sm">
									<header class="flex items-center justify-between gap-3 px-4 py-3 text-white bg-green-800">
										<div class="min-w-0">
											<p class="text-lg font-semibold leading-tight">{day.title}</p>
											<p class="text-sm text-green-100">{day.subtitle}</p>
										</div>
										<div class="text-right shrink-0">
											<p class="text-base font-semibold tabular-nums">
												{calculateVariantPrice(cartItem.variants)} Kč
											</p>
											<p class="text-xs text-green-100">{dayPieces} ks</p>
										</div>
									</header>

									{#if cartItem.soup}
										<div class="px-4 py-3 border-b border-gray-100">
											<p class="text-xs font-medium tracking-wide text-gray-500 uppercase">Polévka</p>
											<p class="mt-1 text-sm leading-snug text-gray-800">{cartItem.soup}</p>
										</div>
									{/if}

									<ul>
										{#each cartItem.variants as variant (variant.id)}
											<li class="px-4 py-3 border-b border-gray-100 last:border-b-0">
												<div class="flex gap-3">
													<span
														class="flex items-center justify-center shrink-0 w-8 h-8 text-sm font-semibold rounded-full bg-slate-200"
														aria-hidden="true">
														{variant.variant_number}
													</span>
													<div class="min-w-0">
														<p class="text-sm leading-snug text-gray-900">{variant.description}</p>
														<p class="mt-1 text-xs text-gray-500">{variant.price || 0} Kč / ks</p>
													</div>
												</div>

												<div class="flex flex-wrap items-center justify-between gap-3 mt-3">
													<div
														class="inline-flex items-center"
														role="group"
														aria-label="Počet porcí">
														<button
															type="button"
															class="flex items-center justify-center w-8 h-8 text-base font-semibold text-gray-700 bg-white border border-gray-300 rounded-l-lg disabled:opacity-40"
															aria-label="Snížit počet"
															disabled={(variant.quantity || 0) <= 1}
															onclick={(event) => {
																event.preventDefault();
																changeQuantity(
																	cartItem.id,
																	variant.id,
																	(variant.quantity || 1) - 1
																);
															}}>
															−
														</button>
														<input
															min="0"
															max="99"
															type="number"
															inputmode="numeric"
															aria-label={`Počet porcí: ${variant.description}`}
															bind:value={variant.quantity}
															onchange={() =>
																changeQuantity(
																	cartItem.id,
																	variant.id,
																	Number(variant.quantity) || 0
																)}
															class="w-10 h-8 text-sm text-center bg-white border-y border-gray-300 [appearance:textfield] focus:outline-none focus:border-green-700 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" />
														<button
															type="button"
															class="flex items-center justify-center w-8 h-8 text-base font-semibold text-gray-700 bg-white border border-gray-300 rounded-r-lg disabled:opacity-40"
															aria-label="Zvýšit počet"
															disabled={(variant.quantity || 0) >= 99}
															onclick={(event) => {
																event.preventDefault();
																changeQuantity(
																	cartItem.id,
																	variant.id,
																	(variant.quantity || 0) + 1
																);
															}}>
															+
														</button>
													</div>

													<div class="flex items-center gap-3 ml-auto">
														<p class="text-sm font-semibold tabular-nums">
															{(variant.price || 0) * (variant.quantity || 0)} Kč
														</p>
														<button
															type="button"
															class="px-3 py-2 text-sm font-medium text-red-700 rounded-lg hover:bg-red-50"
															aria-label={`Odebrat ${variant.description}`}
															onclick={(event) => {
																event.preventDefault();
																askRemove(
																	cartItem.id,
																	variant.id,
																	variant.description,
																	cartItem.date
																);
															}}>
															Odebrat
														</button>
													</div>
												</div>
											</li>
										{/each}
									</ul>
								</article>
							{/each}
							<div class="flex justify-end">
								<button
									type="button"
									class="text-sm font-medium text-red-800 underline-offset-2 hover:underline"
									onclick={(event) => {
										event.preventDefault();
										askClearCart();
									}}>
									Vyprázdnit košík
								</button>
							</div>
						</div>
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
													onchange={() =>
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
											aria-label={`Odebrat ${variant.description}`}
											onclick={(event) => {
												event.preventDefault();
												askRemove(
													cartItem.id,
													variant.id,
													variant.description,
													cartItem.date
												);
											}}>
											X
										</button>
									{/each}
								</div>
							</div>
						{/each}
						<div class="flex justify-end pt-3">
							<button
								type="button"
								class="text-sm font-medium text-red-800 underline-offset-2 hover:underline"
								onclick={(event) => {
									event.preventDefault();
									askClearCart();
								}}>
								Vyprázdnit košík
							</button>
						</div>
					{/if}
				</div>

				<!-- Total and checkout -->
				{#if cartItems.length}
					<div class="mt-5 border rounded-lg border-gray-300">
						{#if availableTimeSlots.length > 0}
							<div class="grid p-5 border-b">
								<p class="block mb-2 text-sm font-medium text-gray-700">
									Čas vyzvednutí objednávky
								</p>
								<div class="space-y-2">
									{#each availableTimeSlots as slot (`${slot.slot.startTime}-${slot.slot.endTime}`)}
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
							</div>
						{/if}

						{#if cartItems.length}
							{#if profileData?.delivery_street}
								<p class="px-5 pt-5 text-right text-gray-800">
									Dodací adresa:
									{[profileData.delivery_street, profileData.delivery_street_number].filter(Boolean).join(" ")},{" "}
									{[profileData.delivery_zip_code, profileData.delivery_city].filter(Boolean).join(" ")}
								</p>
							{:else if profileData?.street}
								<p class="px-5 pt-5 text-right text-gray-800">
									Rozvoz na fakturační adresu:
									{[profileData.street, profileData.street_number, profileData.city, profileData.zip_code].filter(Boolean).join(", ")}
								</p>
							{/if}
							<div class="grid p-5 border-b">
								<label for="note">Poznámka</label>
								<textarea
									class="bg-gray-50 border rounded-lg block w-full p-2.5 focus:outline-none focus:border-green-600 mb-5 border-gray-300"
									id="note"
									name="note"
									rows="4"
									cols="50"
									placeholder="poznámka k objednávce"></textarea>
							</div>

							<div class="grid p-5 border-b justify-items-end">
								{#if deliveryMethodLabel}
									<p class="w-full pb-4 text-right">
										{deliveryMethodLabel}
									</p>
								{:else if profileLoaded}
									<p class="text-right text-sm text-red-600">
										V profilu chybí způsob dodání.
										<a
											href={resolve("/profile")}
											class="font-medium underline"
											onclick={(event) => {
												event.preventDefault();
												void goto(resolve("/profile"));
											}}
										>
											Doplňte ho v profilu
										</a>.
									</p>
								{/if}

								{#if shippingPrice > 0}
									<p class="text-right">
										Cena dopravy: <strong>{shippingPrice} Kč</strong>
									</p>
								{/if}

								<p class="text-right text-lg border-t pt-5">
									Celkově: <strong>{totalPieces} ks</strong> obědů za
									<strong>{totalPriceWithDelivery} Kč</strong>
								</p>
								
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
									disabled={isSubmitting || cartItems.length === 0 || !minimumOrderMet || !deliveryMethodCode}
									onclick={handleSubmit}
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
			<div class="flex flex-col items-center max-w-lg mx-auto text-center">
				<p class="text-xl text-gray-700">Pro přístup ke košíku se musíte přihlásit.</p>
				<a
					href={ROUTES.AUTH.LOGIN}
					class="inline-block px-8 py-4 mt-8 text-lg font-semibold bg-green-800 text-white rounded-lg hover:bg-green-900"
				>
					Přihlásit se
				</a>
			</div>
		</div>
	{/if}

	<dialog
		class="remove-dialog"
		{@attach openRemoveDialog}
		aria-labelledby="remove-dialog-title"
		oncancel={(event) => {
			event.preventDefault();
			cancelRemove();
		}}
		onclick={(event) => {
			if (event.target === event.currentTarget) cancelRemove();
		}}>
		<div class="p-6">
			<h2 id="remove-dialog-title" class="text-xl font-semibold text-gray-900">
				Odebrat z košíku
			</h2>
			<p class="mt-3 text-gray-700">
				Opravdu chcete odebrat
				{#if removeTarget}
					<strong>{removeTarget.description}</strong>
					({formatDateDayMonth(removeTarget.date)})
				{/if}
				z košíku?
			</p>
			<div class="flex flex-col gap-3 mt-6 sm:flex-row sm:justify-end">
				<button
					type="button"
					class="px-4 py-2 font-medium text-gray-800 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
					onclick={cancelRemove}>
					Zrušit
				</button>
				<button
					type="button"
					class="px-4 py-2 font-semibold text-white bg-red-700 rounded-lg hover:bg-red-800"
					onclick={confirmRemove}>
					Odebrat
				</button>
			</div>
		</div>
	</dialog>

	<dialog
		class="remove-dialog"
		{@attach openClearDialog}
		aria-labelledby="clear-cart-title"
		oncancel={(event) => {
			event.preventDefault();
			cancelClearCart();
		}}
		onclick={(event) => {
			if (event.target === event.currentTarget) cancelClearCart();
		}}>
		<div class="p-6">
			<h2 id="clear-cart-title" class="text-xl font-semibold text-gray-900">
				Vyprázdnit košík
			</h2>
			<p class="mt-3 text-gray-700">
				Opravdu chcete odebrat všechny položky z košíku?
			</p>
			<div class="flex flex-col gap-3 mt-6 sm:flex-row sm:justify-end">
				<button
					type="button"
					class="px-4 py-2 font-medium text-gray-800 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
					onclick={cancelClearCart}>
					Zrušit
				</button>
				<button
					type="button"
					class="px-4 py-2 font-semibold text-white bg-red-700 rounded-lg hover:bg-red-800"
					onclick={confirmClearCart}>
					Vyprázdnit
				</button>
			</div>
		</div>
	</dialog>

	<Modal 
		bind:this={modal} 
		onclose={() => {
			if (modal) modal.close();
		}}
		onconfirm={() => {
			const form = document.getElementById("order-form");
			if (!(form instanceof HTMLFormElement)) return;
			isSubmitting = true;
			modal?.close();
			form.requestSubmit();
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

<style>
	.remove-dialog {
		border: none;
		padding: 0;
		margin: auto;
		width: calc(100% - 2rem);
		max-width: 28rem;
		border-radius: 0.6em;
		background: white;
		box-shadow: 0 12px 40px rgba(0, 0, 0, 0.18);
	}

	.remove-dialog::backdrop {
		background: rgba(0, 0, 0, 0.3);
	}
</style>
