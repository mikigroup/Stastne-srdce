<script lang="ts">
	import CartItemsStore from "../Stores/stores";
	import { page } from "$app/stores";
	import { totalPiecesStore } from "../Stores/totalPiecesStore";

	export let totalPieces: number;
	export let data;
	let { menus } = data;
	$: ({ menus } = data);
	console.log("HAHA", data.menus);
	$: totalPieces = $totalPiecesStore;

	let selectedTab = "";
	const selectTab = (tabName) => {
		selectedTab = tabName;
	};

	const currentDate = new Date();
	const dateRanges = [
		[0, 10],
		[10, 20],
		[20, 30],
		[30, 42]
	];

	const dates = dateRanges.map(([start, end]) => {
		const startDate = new Date();
		startDate.setDate(startDate.getDate() + start);

		const endDate = new Date();
		endDate.setDate(endDate.getDate() + end);

		return { startDate, endDate };
	});
	function skocNaPrvek() {
		let skocPrvek = document.getElementById("cilovyPrvek");
		skocPrvek.scrollIntoView({ behavior: "smooth" });
	}

	const loadZalozka = (index) => {
		loadmenu(dates[index].startDate, dates[index].endDate).then((response) => {
			data.menus = response;
			skocNaPrvek();
		});

		selectedTab = `${index + 1}. týden`;
	};

	function addToCart(menu, variantId) {
		CartItemsStore.update((currentCartItems) => {
			const existingMenuIndex = currentCartItems.findIndex(
				(item) => item.id === menu.id && item.date === menu.date
			);

			if (existingMenuIndex !== -1) {
				const existingVariantIndex = currentCartItems[
					existingMenuIndex
					].variants.findIndex((item) => item.variantId === variantId);

				if (existingVariantIndex !== -1) {
					currentCartItems[existingMenuIndex].variants[existingVariantIndex]
						.quantity++;
				} else {
					const selectedVariant = menu.variants.find(
						(variant) => variant.id === variantId
					);
					currentCartItems[existingMenuIndex].variants.push({
						variantId: selectedVariant.id,
						quantity: 1,
						value: selectedVariant.description
					});
				}
			} else {
				const selectedVariant = menu.variants.find(
					(variant) => variant.id === variantId
				);
				currentCartItems.push({
					...menu,
					variants: [
						{
							variantId: selectedVariant.id,
							quantity: 1,
							value: selectedVariant.description
						}
					]
				});
			}

			return currentCartItems;
		});
	}
</script>

<svelte:head>
	<title>Šťastné srdce - Jídelníček</title>
	<meta name="description" content="Jídelníček" />
</svelte:head>

<main>
	<section class="">
		<div class="max-w-screen-lg py-16 mx-auto mt-20 mb-10 rounded-lg md:px-4 bg-stone-100">
			<h1 class="mb-10 text-5xl font-extrabold tracking-tight text-center text-gray-900 animate__animated animate__rubberBand">
				Jídelníček
			</h1>
			<div class="max-w-4xl p-5 pb-2 mx-auto bg-white border-2 rounded-lg">
				<p class="mt-3 text-center">
					<strong>Od 1.9.2024 přistupujeme ke zvýšení ceny obědů na 128,- Kč včetně DPH. Nadále budeme
						usilovat o co nejlepší kvalitu, chuť obědů a organizaci dovozu obědů k Vám.</strong>
					<br />
					<br />
					<strong>Děkujeme všem za důvěru a pochopení.</strong>
					<br />
					<br />
				</p>
				<hr class="devider_dashed">
				<p class="mt-5 text-center text-lg">
					<strong>Platbu můžete provést v hotovosti nebo přes bankovní účet číslo
						131-2288130267/0100.</strong> Pokud potřebujete fakturu, dejte vědět.
					<br />
					<br />
					<strong>Pro nové zájemce o naši stravu.</strong>
					<br />
					V případě, že se chcete stát našimi strávníky, prosíme, kontaktujte nás na
					tel. <strong>724 448 377</strong>. Pokud se nám hned nedovoláte, pošlete SMS nebo nás
					kontaktujte na emailu <strong class="underline">stastnesrdcekk@seznam.cz</strong> a my se Vám co nejdříve
					ozveme. Na každého nového strávníka se těšíme.
					<br />
					<br />
					<strong>Všem strávníkům přejeme dobrou chuť a děkujeme za přízeň.</strong>
				</p>
				<br id="cilovyPrvek" />
			</div>

			<div class="max-w-4xl mx-auto mt-5 bg-white border-2 rounded-lg">
				<div class="pb-10" id="tabs-tabContent">
					<div class="tab-pane fade show active" id="" role="tabpanel">
						<div class="mt-10 border-2 md:mx-10 md:p-5 bg-orange-50">
							<div class="mb-5">
								{#if data.menus && data.menus.length}
									{#each data.menus as menu}
										<div class="p-2 my-3 border rounded-lg bg-stone-100">
											<div class="py-1 bg-green-800 border rounded-lg shadow-md sm:py-3">
												<p class="pl-3 text-2xl font-bold tracking-tight text-gray-200 dark:text-white">
													{new Date(menu.date).toLocaleDateString("cs-CZ", {
														weekday: "long",
														month: "long",
														day: "numeric"
													})}
												</p>
											</div>
											<div class="my-3 border rounded-lg shadow-md md:p-8">
												<p class="text-lg">Polévka</p>
												<div class="p-5 border rounded-2xl">
													<p class="p-2 text-xl">
														{menu.soup}
													</p>
												</div>
												<span style="white-space: pre-line">
													<div class="py-2 text-lg rounded-2xl">
														<p class="text-lg mt-5">Hlavní jídlo</p>
														{#each menu.variants as variant (variant.id)}
															<div class="border rounded-2xl p-5">
																<div class="p-2 text-xl">
																	{variant.description}
																</div>
																<div class="flex justify-end pt-2 basis-4">
																	<button
																		class="text-sm"
																		on:click={$page.data.session
																			? () => addToCart(menu, variant.id)
																			: null}>
																		<div class="flex justify-end pt-2 basis-4">
																			<div class="p-3 flex flex-col border rounded-lg shadow-md md:inline-block
																					px-6 py-2.5 hover:bg-white hover:shadow-xl
																					focus:bg-green-700 focus:shadow-lg focus:outline-none focus:ring-0
																					active:bg-green-800 active:shadow-lg active:text-white transition
																					duration-150 ease-in-out">
																				{#if !$page.data.session && data.menus && data.menus.length}
																					<div class="flex justify-end m-3 text-base">
																						<a href="/login">Přihlaš se</a>
																					</div>
																				{:else}
																					<div class="flex justify-end">
																						<p class="text-base">
																							{menu.price} Kč
																						</p>
																					</div>
																					<div class="flex justify-end text-sm uppercase">
																						Přidat do košíku
																					</div>
																				{/if}
																			</div>
																		</div>
																	</button>
																</div>
															</div>
														{/each}
													</div>
												</span>
											</div>
											<div></div>
											<hr class="px-5" />
										</div>
									{/each}
								{:else}
									<p>Žádný jídelníček nenalezen</p>
								{/if}
							</div>
							<div class="grid border-2 rounded-lg justify-items-end btn-group" role="group" />
							<hr />
						</div>
					</div>
					<div>
						<div class="flex items-center pl-0 mb-4 text-center border-b-0" id="tabs-tab">
							<button
								class={`w-full px-6 py-3 text-xs font-medium leading-tight border-t-0 border-b-2 md:text-lg ${
									selectedTab === "1. týden"
										? "border-green-600"
										: "border-transparent hover:border-green-600"
								}`}
								on:click={async () => {
									loadZalozka(0);
									skocNaPrvek();
								}}>
								1. týden
							</button>
							<button
								class={`w-full px-6 py-3 text-xs font-medium leading-tight border-t-0 border-b-2 md:text-lg ${
									selectedTab === "2. týden"
										? "border-green-600"
										: "border-transparent hover:border-green-600"
								}`}
								on:click={() => {
									loadZalozka(1);
								}}>
								2. týden
							</button>
							<button
								class={`w-full px-6 py-3 text-xs font-medium leading-tight border-t-0 border-b-2 md:text-lg ${
									selectedTab === "3. týden"
										? "border-green-600"
										: "border-transparent hover:border-green-600"
								}`}
								on:click={() => {
									loadZalozka(2);
								}}>
								3. týden
							</button>
							<button
								class={`w-full px-6 py-3 text-xs font-medium leading-tight border-t-0 border-b-2 md:text-lg ${
									selectedTab === "4. týden"
										? "border-green-600"
										: "border-transparent hover:border-green-600"
								}`}
								on:click={() => {
									loadZalozka(3);
								}}>
								4. týden
							</button>
						</div>

						<div class="flex justify-end pt-10 pr-5 text-md active:text-lg">
							<button
								on:click={() => {
									skocNaPrvek();
								}}
								class="px-4 py-2 text-center text-white transition duration-200 ease-in bg-green-800 rounded-lg shadow-md btn hover:bg-green-900">
								<p>Skoč nahoru</p>
							</button>
						</div>
					</div>
				</div>
			</div>
			{#if totalPieces > 0 && $page.data.session}
				<div class="flex text-md justify-center">
					<a
						class="w-full lg:w-1/2 py-2 text-center text-white transition duration-200 ease-in bg-green-800 rounded-lg shadow-md btn hover:bg-green-900"
						href="/kosik"
					>Košík
					</a>
				</div>
			{/if}
		</div>
	</section>
</main>

<style>
    main {
        scroll-behavior: smooth;
    }
</style>