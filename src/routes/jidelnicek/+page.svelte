<script lang="ts">
	import CartItemsStore from "../Stores/stores";
	import { page } from "$app/stores";
	import { totalPiecesStore } from "../Stores/totalPiecesStore";
	import { onMount  } from "svelte";

	interface MenuVariant {
		id: string;
		variant_number: string;
		description: string;
		price: number;
	}

	interface Menu {
		id: string;
		date: string;
		soup: string;
		price: number;
		active: boolean;
		notes: string | null;
		type: string | null;
		nutri: string | null;
		alergens: any;
		variants: MenuVariant[];
	}

	export let data: {
		menus: Menu[];
		weeks: Menu[][];
		startDate: string;
		endDate: string;
		texts: Text[];
	};

	let { weeks, startDate, texts } = data;
	$: ({ weeks, startDate, texts } = data);

	let totalPieces: number;
	$: totalPieces = $totalPiecesStore;

	let selectedTab = "1. týden";
	let currentWeekMenus: Menu[] = [];
	let menuText = texts || "";

	let scrollDiv: HTMLElement;

	/*function scrollToContent()
	document.getElementById("scrollDiv").scrollIntoView();{
		scrollDiv.scrollIntoView({ behavior: 'smooth' });
	}*/

	async function selectTab(tabName: string) {
		selectedTab = tabName;
		const weekIndex = parseInt(tabName.split('.')[0]) - 1;
		currentWeekMenus = weeks[weekIndex] || [];
	}

	function skocNaPrvek(event:any) {
		event.preventDefault();
		document.getElementById("scrollDiv")?.scrollIntoView({ behavior: "smooth" });
	}

	function formatDate(dateString: string): string {
		const date = new Date(dateString);
		return date.toLocaleDateString('cs-CZ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
	}

	onMount(async () => {
		await selectTab("1. týden");
	});

	function addToCart(menu: Menu, variantId: string) {
		CartItemsStore.update((currentCartItems) => {
			const existingMenuIndex = currentCartItems.findIndex(
				(item) => item.id === menu.id && item.date === menu.date
			);

			if (existingMenuIndex !== -1) {
				const existingVariantIndex = currentCartItems[existingMenuIndex].variants.findIndex(
					(item) => item.variantId === variantId
				);

				if (existingVariantIndex !== -1) {
					currentCartItems[existingMenuIndex].variants[existingVariantIndex].quantity++;
				} else {
					const selectedVariant = menu.variants.find((variant) => variant.id === variantId);
					if (selectedVariant) {
						currentCartItems[existingMenuIndex].variants.push({
							variantId: selectedVariant.id,
							quantity: 1,
							value: selectedVariant.description,
							price: selectedVariant.price
						});
					}
				}
			} else {
				const selectedVariant = menu.variants.find((variant) => variant.id === variantId);
				if (selectedVariant) {
					currentCartItems.push({
						...menu,
						variants: [
							{
								variantId: selectedVariant.id,
								quantity: 1,
								value: selectedVariant.description,
								price: selectedVariant.price
							}
						]
					});
				}
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
			<div class="max-w-4xl p-5 pb-2 mx-auto bg-white border-2 rounded-lg mb-3">
		<!--		<p class=" text-center">
					<strong>Od 1.9.2024 přistupujeme ke zvýšení ceny obědů na 128,- Kč včetně DPH. Nadále budeme
						usilovat o co nejlepší kvalitu, chuť obědů a organizaci dovozu obědů k Vám.</strong>
					<br />
					<br />
					<strong>Děkujeme všem za důvěru a pochopení.</strong>
					<br />
					<br />
				</p>
				<hr class="">
				<br />
				<p class="text-center">
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
				<br id="cilovyPrvek" />-->

				{@html menuText}
			</div>

			<div class="max-w-4xl mx-auto mt-5 bg-white border-2 rounded-lg">
				<div class="pb-10" id="tabs-tabContent">
					<div class="tab-pane fade show active" id="" role="tabpanel">
						<div>
							<div class="flex items-center pl-0 mb-4 text-center border-b-0" id="tabs-tab">
								{#each weeks as _, index}
									<button
										class={`w-full px-6 py-3 text-xs font-medium leading-tight border-t-0 border-b-2 md:text-lg ${
										selectedTab === `${index + 1}. týden`
											? "border-green-600"
											: "border-transparent hover:border-green-600"
									}`}
										on:click={() => selectTab(`${index + 1}. týden`)}>
										{index + 1}. týden
									</button>
								{/each}
							</div>
						</div>
						<div class="mt-10 border-2 md:mx-10 md:p-5 bg-orange-50" id="scrollDiv">
							<div class="mb-5">
								{#if currentWeekMenus.length > 0}
									{#each currentWeekMenus as menu (menu.id)}
										<div class="p-2 my-3 border rounded-lg bg-stone-100">
											<div class="py-1 bg-green-800 border rounded-lg shadow-md sm:py-3">
												<p class="pl-3 text-2xl font-bold tracking-tight text-gray-200 dark:text-white">
													{formatDate(menu.date)}
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
																				{#if !$page.data.session}
																					<div class="flex justify-end m-3 text-base">
																						<a href="/login">Přihlaš se</a>
																					</div>
																				{:else}
																					<div class="flex justify-end">
																						<p class="text-base">
																							{variant.price} Kč
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
										</div>
									{/each}
								{:else}
									<p>Žádný jídelníček nenalezen pro tento týden</p>
								{/if}
							</div>
						</div>
					</div>

				</div>
			</div>
			<div class="flex justify-end pt-10 pr-5 text-md active:text-lg">
					<a class="px-4 py-2 text-center text-white transition duration-200 ease-in bg-green-800 rounded-lg shadow-md btn hover:bg-green-900" href="#scrollDiv" on:click={skocNaPrvek}>Skoč nahoru</a>
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
/*    . {
        scroll-behavior: smooth;
    }*/
</style>