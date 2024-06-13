<script lang="ts">
	import type { Actions } from "@sveltejs/kit";
	import CartItemsStore from "../Stores/stores";
	import { totalPiecesStore } from "../Stores/totalPiecesStore";
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

	onMount(() => {
		const unsubscribe = CartItemsStore.subscribe((value) => {
			cartItems = value;
			console.log("cartItems", cartItems);
		});

		return unsubscribe;
	});
	console.log("CartItemsStore", $CartItemsStore);
	console.log("cartItems", cartItems);

	function removeItem(id) {
		CartItemsStore.update((items) => items.filter((item) => item.id !== id));
	}

	function updateCartItems() {
		CartItemsStore.update((currentCartItems) => {
			return currentCartItems.map((item) => {
				const updatedVariants = item.variants.map((variant) => ({
					...variant,
					quantity: variant.quantity < 0 ? 0 : variant.quantity,
				})).filter((variant) => variant.quantity > 0);

				if (updatedVariants.length === 0) {
					return null;
				}

				return {
					...item,
					variants: updatedVariants,
				};
			}).filter((item) => item !== null);
		});
	}

	$: totalPrice = $CartItemsStore.reduce((sum, item) => {
		const itemTotalPrice = item.variants.reduce((itemSum, variant) => {
			return itemSum + (item.price * variant.quantity);
		}, 0);
		return sum + itemTotalPrice;
	}, 0);

	function refreshPage() {
		location.reload(true);
	}

	function delayRefreshPage(mileSeconds) {
		window.setTimeout(refreshPage, mileSeconds);
	}

	let loading = false;
	let first_name = null;
	let last_name = null;

	const email = session?.user?.email;

	onMount(() => {
		getProfile();
	});

	const getProfile = async () => {
		try {
			loading = true;
			if (session && session.user) {
				const { data, error, status } = await supabase
					.from("profiles")
					.select(`first_name, last_name`)
					.eq("id", session.user.id)
					.single();

				if (data) {
					first_name = data.first_name;
					last_name = data.last_name;
				}

				if (error && status !== 406) throw error;
			}
		} catch (error) {
			if (error instanceof Error) {
				alert(error.message);
			}
		} finally {
			loading = false;
		}
	};

	let showModal = false;
	let formSubmitted = false;

	onMount(() => {
		if (form?.success) {
			CartItemsStore.update(() => []);
			localStorage.removeItem("cartItems");
			goto("/thankyou");
		} else {
			console.log("Chyba vyprázdnění localStorage");
		}
	});
	console.log(cartItems);
</script>

<svelte:head>
	<title>Šťastné srdce - Košík</title>
	<meta name="description" content="Košík" />
</svelte:head>
<main>
	<section>
		{#if $page.data.session}
			<form
				method="POST"
				action="?/sendOrder"
				on:submit={() => (formSubmitted = true)}>
				<div
					class="max-w-screen-lg px-4 py-16 mx-auto mt-20 mb-10 rounded-lg bg-stone-100 footer_fix">
					<h1
						class="mb-10 text-5xl font-extrabold tracking-tight text-center text-gray-900 animate__animated animate__rubberBand">
						Košík
					</h1>

					<div class="">
						<!-- Obsah košíku pro mobilní zařízení -->
						<div
							class="max-w-screen-xl px-4 py-4 mx-auto md:hidden bg-orange-50">
							<div class="text-lg place-items-center">
								{#if cartItems.length === 0}
									<div
										class="flex flex-col items-center justify-center w-full overflow-hidden">
										<div
											class="my-20 text-xl font-bold text-center md:text-2xl">
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
													{new Date(
														cartItem.date + "T00:00:00"
													).toLocaleDateString("cs-CZ", {
														month: "long",
														day: "numeric"
													})}
												</p>
											</div>
											<hr />
											<div class="m-5 font-light text-center">
												<p class="font-medium">
													<strong>{cartItem.soup}</strong>
												</p>
											</div>
											<hr />
											<div class="mt-5 font-light text-center">
												<p><strong>Počet</strong></p>
											</div>
											<div class="mb-5 font-light text-center lg:mb-5">
												{#each cartItem.variants as variant}
													<input
														min="0"
														max="99"
														class="w-20"
														type="number"
														bind:value={variant.quantity}
														on:change={updateCartItems} />
												{/each}
											</div>
											<hr />
											<div class="mt-5 font-light text-center">
												<p><strong>Cena</strong></p>
											</div>
											<div class="pl-2 mb-5 font-light text-center">
												{cartItem.price *
													cartItem.variants.reduce(
														(total, variant) => total + variant.quantity,
														0
													)} ,-
											</div>
											<hr />
											<div class="font-light text-center">
												<button
													class="m-5"
													on:click={() => {
														removeItem(cartItem.id);
													}}>
													✕
												</button>
											</div>
										</div>
									{/each}
								{/if}
							</div>
						</div>
						
						<!-- Obsah košíku pro desktopová zařízení -->
						<div
							class="hidden max-w-screen-xl p-4 mx-auto border-2 rounded-lg md:grid bg-orange-50">
							{#if cartItems.length === 0}
								<div
									class="flex flex-col items-center justify-center w-full overflow-hidden">
									<div class="my-20 text-2xl font-bold text-center">
										<p>Košík je prázdný...</p>
									</div>
								</div>
							{:else}
								{#each cartItems as cartItem (cartItem.id)}
									<div
										class="items-center hidden pl-5 my-1 text-lg border-2 rounded-lg md:grid-cols-9 bg-stone-100 md:grid">
										<div class="text-center">
											<p class="border-r-2 border-slate-300">
												{new Date(cartItem.date).toLocaleDateString("cs-CZ", {
													month: "long",
													day: "numeric"
												})}
											</p>
										</div>
										<div class="text-center">
											<p class="border-r-2 border-slate-300">{cartItem.soup}</p>
										</div>
										<div class="text-center">
											<p>{cartItem.variants.reduce((sum, variant) => sum + (cartItem.price * variant.quantity), 0)},-</p>
										</div>
										<div
											class="col-span-4 p-8 font-light border-x-2">
												{#each cartItem.variants as variant}
													<p class="my-5">
													{variant.value}
													</p>
												{/each}
										</div>
										<div class="text-center">
											{#each cartItem.variants as variant}
												<input
													min="0"
													max="99"
													type="number"
													bind:value={variant.quantity}
													on:change={updateCartItems}
													class="w-20 text-lg text-center transition-all duration-200 ease-in-out bg-white border border-transparent rounded-lg focus:outline-none focus:border-green-600" />
											{/each}
										</div>
										<div class="text-center">
											<button
												class="hover:animate-spin"
												on:click={() => {
													removeItem(cartItem.id);
												}}>
												X
											</button>
										</div>
									</div>
								{/each}
							{/if}
						</div>

						<!-- Část s celkovou cenou a tlačítkem pro potvrzení -->
						{#if cartItems.length !== 0}
							<div class="mt-5 border-2 rounded-lg">
								<div class="grid p-5 border-b-2">
									<label for="note">Poznámka</label>
									<textarea
										class="shadow-sm bg-gray-50 border border-gray-300 text-sm rounded-lg block w-full p-2.5 appearance-none focus:outline-none focus:border-green-600 mb-5"
										id="note"
										name="note"
										rows="4"
										cols="50"
										placeholder="poznámka k objednávce" />
								</div>
								<div class="grid p-5 border-b-2 justify-items-end">
									{#if $page.data.session}
										<p
											class="justify-center text-sm text-center text-gray-500 flex-items-center">
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
											class="w-full px-4 py-2 text-center text-white transition ease-in bg-green-600 border rounded-lg shadow-md hover:border-black hover:text-black"
											data-te-toggle="modal"
											data-te-target="#exampleModal"
											data-te-ripple-init
											data-te-ripple-color="light">
											<span>Potvrzení košíku</span>
										</button>
									{:else}
										<a>
											class="w-full px-4 py-2 text-center text-white transition
											ease-in bg-green-600 border rounded-lg shadow-md
											hover:border-black hover:text-black" href="/login">Přihlaš
											se</a>
									{/if}
									<Modal bind:showModal>
										<input
											type="hidden"
											name="cartItems"
											value={JSON.stringify($CartItemsStore)} />
										<div class="">
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
				</div>
			</form>
		{:else}
			<p>Pro zobrazení košíku se musíte přihlásit.</p>
		{/if}
	</section>
</main>
