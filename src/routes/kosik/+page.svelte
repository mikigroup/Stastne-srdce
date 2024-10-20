<script lang="ts">
	import type { Actions } from "@sveltejs/kit";
	import CartItemsStore from "$lib/stores/store";
	import { totalPiecesStore } from "$lib/stores/totalPiecesStore";
	import { page } from "$app/stores";
	import Modal from "./Modal.svelte";
	import { onMount } from "svelte";
	import { goto } from "$app/navigation";

	export let data;
	export let form: Actions;

	let { session, supabase, user } = data;
	$: ({ session, supabase, user } = data);
	$: totalPieces = $totalPiecesStore;
	let cartItems: any = [];

	$: totalPrice = $CartItemsStore.reduce((sum, item) => {
		if (!item || !item.variants || !Array.isArray(item.variants)) {
			console.error("Invalid item structure:", item);
			return sum;
		}
		const itemTotalPrice = item.variants.reduce((itemSum, variant) => {
			if (
				!variant ||
				typeof variant.quantity !== "number" ||
				typeof variant.price !== "number"
			) {
				console.error("Invalid variant structure:", variant);
				return itemSum;
			}
			return itemSum + variant.price * variant.quantity;
		}, 0);
		return sum + itemTotalPrice;
	}, 0);

	onMount(() => {
		const unsubscribe = CartItemsStore.subscribe((value) => {
			cartItems = value;
		});

		return () => {
			unsubscribe();
		};
	});

	function removeItem(itemId: any, variantValue: any) {
		CartItemsStore.update((currentCartItems) => {
			return currentCartItems
				.map((item: any) => {
					if (item.id === itemId) {
						const updatedVariants = item.variants.filter(
							(variant: any) => variant.value !== variantValue
						);
						if (updatedVariants.length === 0) {
							return null;
						}
						return {
							...item,
							variants: updatedVariants
						};
					}
					return item;
				})
				.filter((item) => item !== null);
		});
	}

	function updateCartItems() {
		CartItemsStore.update((currentCartItems) => {
			return currentCartItems
				.map((item: any) => {
					const updatedVariants = item.variants
						.map((variant: any) => ({
							...variant,
							quantity: variant.quantity < 0 ? 0 : variant.quantity
						}))
						.filter((variant: any) => variant.quantity > 0);

					if (updatedVariants.length === 0) {
						return null;
					}

					return {
						...item,
						variants: updatedVariants
					};
				})
				.filter((item) => item !== null);
		});
	}

	let loading = false;
	let first_name = null;
	let last_name = null;

	const email = session?.user?.email;

	async function getProfile() {
		try {
			loading = true;
			if (session && session.user) {
				const { data, error, status } = await supabase
					.from("customers")
					.select(`first_name, last_name`)
					.eq("id", session.user.id)
					.single();

				if (data) {
					first_name = data.first_name;
					last_name = data.last_name;
				}

				if (error && status !== 406) {
					console.error(error);
				}
			}
		} catch (error) {
			if (error instanceof Error) {
				alert(error.message);
			}
		} finally {
			loading = false;
		}
	}

	let showModal = false;
	let orderSubmitted = false;

	function handleOrderSubmit() {
		orderSubmitted = true;
	}

	onMount(() => {
		getProfile();
		if (form?.success) {
			CartItemsStore.set([]);
			localStorage.removeItem("cartItems");
			goto("/thankyou");
		}
	});

	function truncateText(text: string, maxLength: number) {
		return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
	}

	$: console.log("CartItemsStore:", $CartItemsStore);
</script>

<svelte:head>
	<title>Šťastné srdce - Košík</title>
	<meta name="description" content="Košík" />
</svelte:head>
<main>
	<section>
		{#if $page.data.session}
			<form method="POST" action="?/sendOrder" on:submit={handleOrderSubmit}>
				<div
					class="max-w-screen-xl px-4 py-16 mx-auto mt-20 mb-10 rounded-lg bg-stone-100">
					<h1
						class="mb-10 text-5xl font-extrabold tracking-tight text-center text-gray-900 animate__animated animate__rubberBand">
						Košík
					</h1>

					<!-- Mobile cart -->
					<div class="max-w-screen-xl px-4 py-4 mx-auto md:hidden bg-orange-50">
						{#if cartItems.length === 0}
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
										{#each cartItem.variants as variant, index}
											<div class="flex justify-between items-center mb-2">
												<span class="mr-2"
													>{index + 1}. {truncateText(variant.value, 50)}</span>
												<button
													class="hover:animate-spin"
													on:click|preventDefault={() =>
														removeItem(cartItem.id, variant.value)}>
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
												on:change={updateCartItems}
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
												total + (variant.price || 0) * variant.quantity,
											0
										)} ,-
									</div>
									<hr />
									<div class="font-light text-center">
										<button
											class="hover:animate-spin"
											on:click|preventDefault={() =>
												removeItem(cartItem.id, cartItem.variants[0].value)}>
											X
										</button>
									</div>
								</div>
							{/each}
						{/if}
					</div>

					<!-- Desktop cart header -->
					<div
						class="hidden max-w-screen-2xl px-4 py-4 mx-auto mt-5 border-2 rounded-lg md:grid">
						<div
							class="grid items-center grid-cols-12 p-2 pl-5 text-lg border rounded-lg bg-slate-300">
							<div class="col-span-1 font-light text-center">
								<p>Den</p>
	 						</div>
							<div class="col-span-2 font-light text-center">
								<p>Polévka</p>
							</div>
							<div class="col-span-5 font-light text-center">
								<p>Menu</p>
							</div>
							<div class="col-span-2 font-light text-center">
								<p>Počet / cena</p>
							</div>
							<div class="col-span-2 font-light text-center">
								<p>Odebrat</p>
							</div>
						</div>
					</div>

					<!-- Desktop cart -->
					<div class="hidden max-w-screen-2xl p-4 mx-auto border-2 rounded-lg md:grid bg-orange-50">
						{#if cartItems.length === 0}
							<div class="flex flex-col items-center justify-center w-full overflow-hidden">
								<div class="my-20 text-2xl font-bold text-center">
									<p>Košík je prázdný...</p>
								</div>
							</div>
						{:else}
							{#each cartItems as cartItem (cartItem.id)}
								<div class="items-center hidden pl-5 my-1 text-lg border-2 rounded-lg md:grid-cols-12 bg-stone-100 md:grid">
									<div class="col-span-1 text-center">
										<p class="border-r-2">
											{new Date(cartItem.date).toLocaleDateString("cs-CZ", {
												month: "long",
												day: "numeric"
											})}
										</p>
									</div>
									<div class="col-span-2 pl-5">
										<p>{truncateText(cartItem.soup, 30)}</p>
									</div>
									<div class="col-span-5 font-light border-x-2 pl-5 m-3">
										{#each cartItem.variants as variant, index}
											<div class="flex justify-between items-center mb-2">
												<span class="mr-2">{index + 1}. {truncateText(variant.value, 50)}</span>
											</div>
										{/each}
									</div>
									<div class="col-span-2 text-center h-full flex flex-col items-center justify-center">
										{#each cartItem.variants as variant}
											<div class="flex items-center justify-between w-full mb-8">
												<div class="w-16 mr-8">
													<input
														min="0"
														max="99"
														type="number"
														bind:value={variant.quantity}
														on:change={updateCartItems}
														class="w-full text-lg text-center bg-white border rounded-lg focus:outline-none focus:border-green-600"
													/>
												</div>
												<div class="flex-grow text-right">
													<span>{(variant.price || 0) * variant.quantity} ,-</span>
												</div>
											</div>
										{/each}
									</div>
									<div class="col-span-1 text-center">
										<button
											type="button"
											class="hover:animate-spin"
											on:click|preventDefault={() => removeItem(cartItem.id, cartItem.variants[0].value)}
										>
											X
										</button>
									</div>
								</div>
							{/each}
						{/if}
					</div>

					<!-- Total and confirmation -->
					{#if cartItems.length !== 0}
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
											class="text-sm text-blue-500 underline hover:text-blue-700"
											>účet?</a>
									</p>
								{/if}
								<p>
									Celkově:
									<strong>{totalPieces}ks</strong>
									obědů v ceně
									<strong>{totalPrice}</strong>
									Kč
								</p>
							</div>
							<div class="m-5">
								{#if $page.data.session}
									<button
										on:click={() => (showModal = true)}
										type="button"
										class="w-full px-4 py-2 text-center text-white bg-green-800 border rounded-lg shadow-md hover:border-black">
										<span>Potvrzení košíku</span>
									</button>
								{:else}
									<a
										class="w-full px-4 py-2 text-center text-white bg-green-800 border rounded-lg shadow-md hover:border-black hover:text-black"
										href="/login">Přihlaš se</a>
								{/if}
								<Modal bind:showModal>
									<input
										type="hidden"
										name="cartItems"
										value={JSON.stringify($CartItemsStore)} />
									<div>
										<input
											formaction="?/sendOrder"
											type="submit"
											class="w-full px-4 py-2 text-center text-white bg-green-600 rounded-lg shadow-md hover:text-black hover:cursor-pointer"
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
			<p>Pro zobrazení košíku se musíte přihlásit.</p>
		{/if}
	</section>
</main>
