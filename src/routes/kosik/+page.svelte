<script lang="ts">
	import type { Actions } from "@sveltejs/kit";
	import { CartItemsStore, totalPiecesStore } from "$lib/stores/store";
	import { page } from "$app/stores";
	import Modal from "./Modal.svelte";
	import { onMount } from "svelte";
	import { goto } from "$app/navigation";
	import { enhance } from "$app/forms";

	export let data;
	export let form: Actions;

	let { session, supabase } = data;
	let loading = false;
	let showModal = false;
	$: ({ session, supabase } = data);

	// Store subscriptions
	let cartItems: any[] = [];
	$: cartItems = $CartItemsStore;
	$: totalPieces = $totalPiecesStore;

	// Calculate total price
	$: totalPrice = cartItems.reduce((sum, item) => {
		if (!item?.variants?.length) return sum;
		return (
			sum +
			item.variants.reduce(
				(variantSum, variant) =>
					variantSum + (variant.price || 0) * (variant.quantity || 0),
				0
			)
		);
	}, 0);

	async function getProfile() {
		if (!session?.user?.id) return;

		try {
			loading = true;
			let first_name: string;
			let last_name: string;

			const { data: customerData, error } = await supabase
				.from("profiles")
				.select("first_name, last_name")
				.eq("id", session.user.id)
				.single();

			if (error && error.code !== "406") throw error;

			if (customerData) {
				first_name = customerData.first_name;
				last_name = customerData.last_name;
			}
		} catch (error) {
			console.error("Error fetching profile:", error);
		} finally {
			loading = false;
		}
	}

	function handleOrderSubmit() {
		return async ({ result }) => {
			if (result.type === "success") {
				CartItemsStore.clear();
				await goto("/thankyou");
			} else {
				console.error("Chyba při odesílání objednávky - page", result.error);
			}
		};
	}

	function truncateText(text: string, maxLength: number) {
		if (!text) return "";
		return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
	}

	onMount(() => {
		getProfile();
	});
</script>

<svelte:head>
	<title>Šťastné srdce - Košík</title>
	<meta name="description" content="Košík" />
</svelte:head>

<main>
	<section>
		{#if $page.data.session}
			<form method="POST" action="?/sendOrder" use:enhance={handleOrderSubmit}>
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
								<div class="mb-5 border-2 rounded-lg bg-stone-100">
									<div class="text-center rounded-lg bg-slate-300">
										<p><strong>Den</strong></p>
									</div>
									<div class="m-2 text-center">
										<p>
											{new Date(cartItem.date).toLocaleDateString("cs-CZ", {
												month: "long",
												day: "numeric"
											})}
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
										{cartItem.variants.reduce(
											(total, variant) =>
												total + (variant.price || 0) * (variant.quantity || 0),
											0
										)} Kč
									</div>
								</div>
							{/each}
						{/if}
					</div>

					<!-- Desktop cart header -->
					<div
						class="hidden max-w-screen-2xl px-4 py-4 mx-auto mt-5 border-2 rounded-lg md:grid">
						<div
							class="grid items-center grid-cols-12 p-2 pl-5 text-lg border rounded-lg bg-slate-300 text-center font-light">
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
						class="hidden max-w-screen-2xl p-4 mx-auto border-2 rounded-lg md:grid bg-orange-50">
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
									class="items-center hidden pl-5 text-lg border-2 rounded-lg md:grid-cols-12 bg-stone-100 md:grid py-7 my-1">
									<div class="col-span-1 text-center border-r-2">
										<p class="">
											{new Date(cartItem.date).toLocaleDateString("cs-CZ", {
												month: "long",
												day: "numeric"
											})}
										</p>
									</div>
									<div class="col-span-2 pl-5 border-r-2">
										<p>{truncateText(cartItem.soup, 30)}</p>
									</div>
									<div
										class="col-span-5 pl-5 border-r-2 mr-1 flex gap-2 flex-col">
										{#each cartItem.variants as variant, index}
											<div class="">
												{index + 1}. {truncateText(variant.description, 50)}
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
										<div class="flex flex-col gap-11 xl:gap-2 justify-center">
											{#each cartItem.variants as variant}
												<div class="">
													{(variant.price || 0) * (variant.quantity || 0)} Kč
												</div>
											{/each}
										</div>
									</div>

									<div class="col-span-1 flex flex-col gap-11 xl:gap-2">
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
					{#if cartItems.length}
						<div class="mt-5 border-2 rounded-lg">
							<div class="grid p-5 border-b-2">
								<label for="note">Poznámka</label>
								<textarea
									class="bg-gray-50 border rounded-lg block w-full p-2.5 focus:outline-none focus:border-green-600 mb-5"
									id="note"
									name="note"
									rows="4"
									cols="50"
									placeholder="poznámka k objednávce" />
							</div>

							<div class="grid p-5 border-b-2 justify-items-end">
								{#if $page.data.session}
									<p class="text-sm text-gray-500">
										Máte již vyplněný
										<a
											href="/profile"
											class="text-sm text-blue-500 underline hover:text-blue-700">
											účet?
										</a>
									</p>
								{/if}
								<p>
									Celkově: <strong>{totalPieces} ks</strong> obědů v ceně
									<strong>{totalPrice} Kč</strong>
								</p>
							</div>

							<div class="m-5">
								<button
									on:click={() => (showModal = true)}
									type="button"
									class="w-full px-4 py-2 text-center text-white bg-green-800 border rounded-lg shadow-md hover:border-black">
									<span>Potvrzení košíku</span>
								</button>

								<Modal bind:showModal>
									<input
										type="hidden"
										name="cartItems"
										value={JSON.stringify(cartItems)} />
									<div>
										<input
											formaction="?/sendOrder"
											type="submit"
											class="w-full px-4 py-2 text-center text-white bg-green-800 border rounded-lg shadow-md hover:border-black"
											value={loading ? "Odesílá se..." : "Odeslat"}
											disabled={loading} />
									</div>
								</Modal>
							</div>
						</div>
					{/if}
				</div>
			</form>
		{:else}
			<div class="flex justify-center items-center h-screen">
				<p class="text-xl">Pro zobrazení košíku se musíte přihlásit.</p>
			</div>
		{/if}
	</section>
</main>
