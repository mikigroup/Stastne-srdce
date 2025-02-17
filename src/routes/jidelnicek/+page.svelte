<script>
	import CartItemsStore from "../Stores/stores";
	import client from "../../lib/sanityClient";
	import { page } from "$app/stores";

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

	let lastRenderedDate = null;
	export let data;

	export async function loadmenu(from, to) {
		return client.fetch(
			`*[_type == "menu" && releaseDate > "${from.toISOString()}" && releaseDate < "${to.toISOString()}"] | order(releaseDate) { _id, title, _createdAt, _type, description, content, price, releaseDate, quantity }`
		);
	}

	function addToCart(menu) {
		CartItemsStore.update((currentCartItems) => {
			const updatedCartItemIndex = currentCartItems.findIndex(
				(cartItem) => cartItem._id === menu._id
			);
			if (updatedCartItemIndex === -1) {
				return [
					...currentCartItems,
					{
						...menu,
						quantity: 1
					}
				];
			} else {
				currentCartItems[updatedCartItemIndex].quantity += 1;
				return currentCartItems;
			}
		});
	}
	/* let search = '';
	$: searchMenu = menus.filter((menu) => {
		return menu.description.includes(search);
	}); */

	$: totalPieces =
		$CartItemsStore.length &&
		$CartItemsStore.reduce((sum, cartItems) => sum + cartItems.quantity, 0);
</script>

<svelte:head>
	<title>Šťastné srdce - Jídelníček</title>
	<meta name="description" content="Jídelníček" />
</svelte:head>
<main>
	<section class="">
		<div
			class="max-w-screen-lg py-16 mx-auto mt-20 mb-10 rounded-lg md:px-4 bg-stone-100">
			<h1
				class="mb-10 text-5xl font-extrabold tracking-tight text-center text-gray-900 animate__animated animate__rubberBand">
				Jídelníček
			</h1>
			<div class="max-w-4xl p-5 pb-2 mx-auto bg-white border-2 rounded-lg">
				<h2 class="text-2xl text-center"><strong>Naši milí strávníci, od března 2025 budou tyto změny a novinky.</strong></h2>

				<p class="mt-3 text-center">
					<strong
						>Naši milí strávníci, všechny Vás srdečně zdravíme. Voláte nám ze
						všech stran, zda jsme v pořádku. „ My jsme ty ohromné přívaly vody
						ustáli.“ Doufáme, že Vy také. <br> Voda nám zatřásla životem, nastal čas
						vykročit a pořádně se s překážkami poprat.<br> Od pondělí 23.9. začínáme
						vařit, máme na dalších 14 dnů naplánovaný povodňový jídelníček s
						jedním menu (i s variantou bez lepku a bez laktózy). Vzhledem ke
						ztíženým hygienickým podmínkám, budeme používat jednorázové
						menuboxy.<br> Většina z Vás měla jídlo předplaceno, jakmile se situace
						trochu zklidní všem se ozvu a domluvíme se na vrácení peněz.
						<br>Nesmírně se na Vás všechny těšíme a pevně věříme, že se setkáme.</strong>
					<!--<strong>Od 1.9.2024 přistupujeme ke zvýšení ceny obědů na 128,- Kč včetně DPH. Nadále budeme
						usilovat o co nejlepší kvalitu, chuť obědů a organizaci dovozu obědů k Vám.</strong>-->
					<br />
					<br />
					<!--<strong>Děkujeme všem za důvěru a pochopení.</strong>-->
					<br />
					<br />
				</p>
				<hr class="devider_dashed" />
				<p class="mt-5 text-center text-lg">
					<strong
						>Platbu můžete provést v hotovosti nebo přes bankovní účet číslo
						131-2288130267/0100.</strong>
					Pokud potřebujete fakturu, dejte vědět.
					<br />
					<br />
					<strong>Pro nové zájemce o naši stravu.</strong>
					<br />
					V případě, že se chcete stát našimi strávníky, prosíme, kontaktujte nás
					na tel. <strong>724 448 377</strong>. Pokud se nám hned nedovoláte,
					pošlete SMS nebo nás kontaktujte na emailu
					<strong class="underline">stastnesrdcekk@seznam.cz</strong>
					a my se Vám co nejdříve ozveme. Na každého nového strávníka se těšíme.
					<br />
					<br />
					<strong
						>Všem strávníkům přejeme dobrou chuť a děkujeme za přízeň.</strong>
				</p>
				<br id="cilovyPrvek" />
				<!-- <h6 class="pb-2">Vyhledávání</h6> 
				<form class="flex items-center">					
					<label for="simple-search" class="sr-only">Search</label>
					<div class="relative w-full">
						<div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
							<svg
								aria-hidden="true"
								class="w-5 h-5 text-gray-500 dark:text-gray-400"
								fill="currentColor"
								viewBox="0 0 20 20"
								xmlns="http://www.w3.org/2000/svg">
								<path
									fill-rule="evenodd"
									d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0
									01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
									clip-rule="evenodd" />
							</svg>
						</div>
						<input
							type="text"
							
							id="search"
							class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg
							focus:ring-green-500 focus:border-green-500 block w-full pl-10 p-2.5 dark:bg-gray-700
							dark:border-gray-600 dark:placeholder-gray-400 dark:text-white
							dark:focus:green-blue-500 dark:focus:border-green-500"
							placeholder="př. rizoto"
							/>  bind:value={search} 
					</div>										
				</form>
				 <div class="text-sm text-slate-500 ">* citlivé na velikost písmen</div>							 -->
			</div>

			<div class="max-w-4xl mx-auto mt-5 bg-white border-2 rounded-lg">
				<div class="pb-10 tab-content" id="tabs-tabContent">
					<div class="tab-pane fade show active" id="" role="tabpanel">
						<div class="mt-10 border-2 md:mx-10 md:p-5 bg-orange-50">
							<div class="">
								<div class="">
									<!-- karta menu -->
									<div class="mb-5">
										{#if $page.data.session && data.menus && data.menus.length}
											{#each data.menus as menu}
												<!-- //searchMenu -->
												<div class="p-2 my-3 border rounded-lg bg-stone-100">
													{#if new Date(menu.releaseDate).toDateString() !== lastRenderedDate}
														<div
															class="py-1 bg-green-600 border rounded-lg shadow-md sm:py-3 shadow-green-700/40">
															<p
																class="pl-3 text-xl font-bold tracking-tight text-gray-200 dark:text-white">
																{new Date(menu.releaseDate).toLocaleDateString(
																	"cs-CZ",
																	{
																		weekday: "long",
																		month: "long",
																		day: "numeric"
																	}
																)}
															</p>
														</div>
													{/if}
													<div
														class="p-5 my-3 border rounded-lg shadow-md md:p-8">
														<p
															class="pb-1 text-xl underline underline-offset-8">
															{menu.title}
														</p>
														<span style="white-space: pre-line"
															><p class="pt-2 text-lg">
																{menu.description}
															</p></span>
													</div>
													<hr class="px-5" />
													<div class="flex justify-end pt-2 basis-4">
														<button
															class="text-sm"
															on:click={() => addToCart(menu)}>
															<div
																class="p-3 flex flex-col border rounded-lg inline-block
																px-6 py-2.5 shadow-md hover:bg-white hover:shadow-xl
																focus:bg-green-700 focus:shadow-lg focus:outline-none focus:ring-0
																active:bg-green-800 active:shadow-lg active:text-white transition
																duration-150 ease-in-out">
																<div class="flex justify-end">
																	<p class="text-base">{menu.price} Kč</p>
																</div>
																<div class="flex justify-end text-sm uppercase">
																	Přidat do košíku
																</div>
															</div>
														</button>
													</div>
												</div>
											{/each}
										{:else if data.menus && data.menus.length}
											{#each data.menus as menu}
												<!-- // searchMenu -->
												<div class="p-2 my-3 border rounded-lg bg-stone-100">
													<div
														class="py-1 bg-green-600 border rounded-lg shadow-md sm:py-3 shadow-green-700/40">
														<p
															class="pl-3 text-xl font-bold tracking-tight text-gray-200 dark:text-white">
															{new Date(menu.releaseDate).toLocaleDateString(
																"cs-CZ",
																{
																	weekday: "long",
																	month: "long",
																	day: "numeric"
																}
															)}
														</p>
													</div>
													<div
														class="p-5 my-3 border rounded-lg shadow-md md:p-8">
														<p
															class="pb-1 text-xl underline underline-offset-8">
															{menu.title}
														</p>
														<span style="white-space: pre-line"
															><p class="pt-2 text-lg">
																{menu.description}
															</p></span>
													</div>
													<hr class="px-5" />
													<div class="flex justify-end pt-2 basis-4">
														<a href="/login">
															<div
																class="p-3 flex flex-col border rounded-lg shadow-md inline-block
																px-6 py-2.5 shadow-md hover:bg-white hover:shadow-xl
																focus:bg-green-700 focus:shadow-lg focus:outline-none focus:ring-0
																active:bg-green-800 active:shadow-lg active:text-white transition
																duration-150 ease-in-out">
																<div class="flex justify-end m-3 text-base">
																	Přihlaš se
																</div>
															</div>
														</a>
													</div>
												</div>
											{/each}
										{:else}
											<p>Žádný jídelníček nenalezen</p>
										{/if}
									</div>
								</div>
								<div
									class="grid border-2 rounded-lg justify-items-end btn-group"
									role="group" />
							</div>
							<hr />
						</div>
					</div>
					<div>
						<div
							class="flex items-center pl-0 mb-4 text-center border-b-0"
							id="tabs-tab">
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
								class="px-4 py-2 text-center text-white transition duration-200 ease-in bg-green-600 rounded-lg shadow-md btn btn-success hover:bg-green-700 focus:ring-green-500 focus:ring-offset-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2">
								<p>Skoč nahoru</p>
							</button>
						</div>
					</div>
				</div>
			</div>
			{#if totalPieces > 0 && $page.data.session}
				<div class="flex text-md">
					<a
						class="w-full py-2 text-center text-white transition duration-200 ease-in bg-green-600 rounded-lg shadow-md btn btn-success hover:bg-green-700 focus:ring-green-500 f ocus:ring-offset-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
						href="/kosik"
						>Košík
					</a>
				</div>
			{/if}
		</div>
	</section>
</main>

<style>
	.nav-tabs,
	.nav-link.active {
		border-color: green !important;
		color: black;
	}
	main {
		scroll-behavior: smooth;
	}

	.devider_dashed {
		border-top: 2px dashed;
	}
</style>
