<script>
	import CartItemsStore from '../Stores/stores';
	import * as animateScroll from 'svelte-scrollto';
	import client from '../../lib/sanityClient';	
	import { page } from '$app/stores';	  
  	
  let selectedTab = '';

  const currentDate = new Date();
  const dateRanges = [[0, 10], [10, 20], [20, 30], [30, 42]];

  const dates = dateRanges.map(([start, end]) => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + start);
    
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + end);
    
    return {startDate, endDate};
  });

  const loadZalozka = (index) => {
    loadmenu(dates[index].startDate, dates[index].endDate).then((response) => {
      // Assuming that data is defined somewhere in your script
      data.menus = response;
    });
    selectedTab = `${index + 1}. týden`;
  };
	
	let lastRenderedDate = null;
	export let data;
	
	export async function loadmenu(from, to) {
		return client.fetch(`*[_type == "menu" && releaseDate > "${from.toISOString()}" && releaseDate < "${to.toISOString()}"] | order(releaseDate) { _id, title, _createdAt, _type, description, content, price, releaseDate, quantity }`
		);
	};

	

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

	$: totalPieces = $CartItemsStore.length && $CartItemsStore.reduce((sum, cartItems) => sum + cartItems.quantity, 0);
</script>

<style>
	.nav-tabs,
	.nav-link.active {
		border-color: green !important;
		color: black;
	}
</style>

<svelte:head>
	<title>Šťastné srdce - Jídelníček</title>	
	<meta name="description" content="Jídelníček" />
</svelte:head>
<main>
	<section class="">
		<div class="max-w-screen-lg py-8 py-16 mx-auto mt-20 mb-10 rounded-lg md:px-4 bg-stone-100">
			<h1
				class="mb-4 mb-10 text-5xl font-extrabold tracking-tight text-center text-gray-900 ">
				Jídelníček
			</h1>
			<div
				class="max-w-3xl max-w-4xl p-5 pb-2 mx-auto bg-white border-2 rounded-lg lg:mx-auto">
				<p class="mt-3 text-center">
					<strong>Cena obědů je 95,- Kč vč DPH, menuboxu 10,- kč vč DPH.</strong>
					<br />
					<br />
					<strong>
						Platbu můžete provést přes účet 43-6168890227/0100, terminálem platební nebo stravenkovou
						kartou</strong>, vždy ale jen po předchozí domluvě na emailu nebo telefonicky. <strong>Platba v hotovosti je stále možná a vítána.</strong>
						Pokud potřebujete fakturu, dejte vědět.					
					<br />
					<br />
					<strong>Pro nové zájemce o naši stravu.</strong>
					<br />
					Poslední  roky ve Šťastném srdce funguje Pořadník zájemců. V případě, že se chcete stát strávníky kuchyně, prosíme o kontakt  na tel. <strong>724 448 377</strong> a pokud nezvedáme, zašlete sms, případně na email <strong>stastnesrdcekk@seznam.cz</strong>. Napíšeme nebo zavoláme zpět a domluvíme se. Vždy prosím zvažte, zda bude strava ze Šťastného srdce pro Vás přínosem.
					<br />
					Na  každého nového strávníka se těšíme a máme radost, pokud zůstane mezi našimi věrnými. 
					<br />
					<br />
					<strong>Všem strávníkům děkujeme za přízeň a těm novým: "Vydržte s námi :) !".</strong>
				</p>
				<br />
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
							<div id="" class="">													
								<div class="">									
									<!-- karta menu -->					
								<div class="mb-5">                                                    
    {#if $page.data.session && data.menus && data.menus.length}
        {#each data.menus as menu}  <!-- //searchMenu -->
            <div class="p-2 my-3 border rounded-lg bg-stone-100">
                {#if new Date(menu.releaseDate).toDateString() !== lastRenderedDate}
                    <script>
                        lastRenderedDate = new Date(menu.releaseDate).toDateString();
                    </script>
                    <div
                        class="py-1 bg-green-600 border rounded-lg shadow-md sm:py-3 shadow-green-700/40">
                        <p
                            class="pl-3 text-xl font-bold tracking-tight text-gray-200 dark:text-white">
                            {new Date(menu.releaseDate).toLocaleDateString('cs-CZ', {
                                weekday: 'long',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </p>
                    </div>
                {/if}
													<div class="p-5 my-3 border rounded-lg shadow-md md:p-8">
														<p class="pb-1 text-xl underline underline-offset-8">{menu.title}</p>
														<span style="white-space: pre-line"><p class="pt-2 text-lg">{menu.description}</p></span>
													</div>
													<hr class="px-5" />
													<div class="flex justify-end pt-2 basis-4">
														<button class="text-sm" on:click={() => addToCart(menu)}>
															<div
																class="p-3 flex flex-col border rounded-lg shadow-md inline-block
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
											{#each data.menus as menu}  <!-- // searchMenu -->
												<div class="p-2 my-3 border rounded-lg bg-stone-100">
													<div
														class="py-1 bg-green-600 border rounded-lg shadow-md sm:py-3 shadow-green-700/40">
														<p
															class="pl-3 text-xl font-bold tracking-tight text-gray-200 dark:text-white">
															{new Date(menu.releaseDate).toLocaleDateString('cs-CZ', {
																weekday: 'long',
																month: 'long',
																day: 'numeric'
															})}
														</p>														
													</div>													
													<div class="p-5 my-3 border rounded-lg shadow-md md:p-8">
														<p class="pb-1 text-xl underline underline-offset-8">{menu.title}</p>
														<span style="white-space: pre-line"><p class="pt-2 text-lg">{menu.description}</p></span>														
													</div>
													<hr class="px-5" />
													<div class="flex justify-end pt-2 basis-4">
														<a href="/login">
														<button class="text-sm">
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
														</button>	
														</a>																										
													</div>													
												</div>
											{/each}
										<!-- 	{:else if data.menus && data.menus.length}										
												{#each data.menus as menu}
													<div class="p-2 my-3 border rounded-lg bg-stone-100">
													<div
														class="py-1 bg-green-600 border rounded-lg shadow-md sm:py-3 shadow-green-700/40">
														<p
															class="pl-3 text-xl font-bold tracking-tight text-gray-200 dark:text-white">
															{new Date(menu.releaseDate).toLocaleDateString('cs-CZ', {
																weekday: 'long',
																month: 'long',
																day: 'numeric'
															})}
														</p>														
													</div>
													<div class="p-5 my-3 text-lg border rounded-lg shadow-md">
														<p class="pb-1 underline underline-offset-8 ">{menu.title}</p>
														<span style="white-space: pre-line">{menu.description}</span>														
													</div>
													<hr class="px-5" />													
												</div>
												{/each}			 -->																
											{:else}
												<p>Žádný jídelníček nenalezen</p>
											{/if}
									</div>
								</div>
								<div class="grid border-2 rounded-lg justify-items-end btn-group" role="group" />
							</div>
							<hr />
						</div>
					</div>
					<div>
						<!-- {#if $user && menu && menu.length}
							{#each menus as menu}{/each}
						{:else}{/if}
						{#if $user && menu && menu.length}
							{#each menus as menu}{/each}
						{:else}{/if} -->

						
	<div class="">
					<ul
						class="flex items-center pl-0 mb-4 text-center list-none border-b-0 nav nav-tabs"
						id="tabs-tab"
						role="tablist">
						<li class="w-full nav-item" role="presentation" on:click={() => zalozkaPrvniTyden()} on:click={() => animateScroll.scrollTo({
										element: 'tabs-1-tab',
										duration: 1500,
										offset: 480
									})}>
							<a
								href=""
								class="block px-6 py-3 my-2 text-xs font-medium leading-tight border-t-0 border-b-2 border-transparent nav-link md:text-lg border-x-0 hover:border-transparent hover:bg-gray-100 focus:border-transparent active"
								id="tabs-1-tab-but"
								data-bs-toggle="pill"
								data-bs-target="#tabs-1"
								role="tab"
								aria-controls="tabs-1">
								1. týden
							</a>
						</li>
						<li class="w-full nav-item" role="presentation" on:click={() => zalozkaDruhyTyden()} on:click={() => animateScroll.scrollTo({
										element: 'tabs-1-tab',
										duration: 1500,
										offset: 480
									})}>
							<a
								href=""
								class="block px-6 py-3 my-2 text-xs font-medium leading-tight border-t-0 border-b-2 border-transparent nav-link md:text-lg border-x-0 hover:border-transparent hover:bg-gray-100 focus:border-transparent"								
								data-bs-toggle="pill"								
								role="tab"								
								aria-selected="false">
								2. týden
							</a>
						</li>
						<li class="w-full nav-item" role="presentation" on:click={() => zalozkaTretiTyden()} on:click={() => animateScroll.scrollTo({
										element: 'tabs-1-tab',
										duration: 1500,
										offset: 480
									})}>
							<a
								href=""
								class="block px-6 py-3 my-2 text-xs font-medium leading-tight border-t-0 border-b-2 border-transparent nav-link md:text-lg border-x-0 hover:border-transparent hover:bg-gray-100 focus:border-transparent"
								id="tabs-messages-tab"
								data-bs-toggle="pill"
								data-bs-target="#tabs-3"
								role="tab"
								aria-controls="tabs-3"
								aria-selected="false">
								3. týden
							</a>
						</li>
						<li class="w-full nav-item" role="presentation" on:click={() => zalozkaCtvrtyTyden()} on:click={() => animateScroll.scrollTo({
										element: 'tabs-1-tab',
										duration: 1500,
										offset: 480
									})}>
							<a
								href=""
								class="block px-6 py-3 my-2 text-xs font-medium leading-tight border-t-0 border-b-2 border-transparent nav-link md:text-lg border-x-0 hover:border-transparent hover:bg-gray-100 focus:border-transparent"
								id="tabs-contact-tab"
								data-bs-toggle="pill"
								data-bs-target="#tabs-4"
								role="tab"
								aria-controls="#tabs-4"
								aria-selected="false">
								4. týden
							</a>
						</li>
					</ul>
				</div>
				
<h3 class="mb-3 text-lg font-bold">Tabs</h3>
<div class="flex border-t-2 border-gray-300"> 
  <button 
    class={`nav-tabs px-4 py-2 font-semibold transition-colors duration-200 ease-in-out ${selectedTab === '1. týden' ? 'border-y-2' : ''}`} 
    on:click={() => selectTab('1. týden')}
  >
    1. týden
  </button>
	 <button 
    class={`px-4 py-2 font-semibold transition-colors duration-200 ease-in-out ${selectedTab === '2. týden' ? 'bg-gray-300' : ''}`} 
    on:click={() => selectTab('2. týden')}
  >
    2. týden
  </button>
	 <button 
    class={`px-4 py-2 font-semibold transition-colors duration-200 ease-in-out ${selectedTab === '3. týden' ? 'bg-gray-300' : ''}`} 
    on:click={() => selectTab('3. týden')}
  >
    3. týden
  </button>
	<button 
    class={`px-4 py-2 font-semibold transition-colors duration-200 ease-in-out ${selectedTab === '4. týden' ? 'bg-gray-300' : ''}`} 
    on:click={() => selectTab('4. týden')}
  >
    4. týden
  </button>
</div>
			<hr>

			<div class="flex items-center pl-0 mb-4 text-center border-b-0" id="tabs-tab">
  <button 
    class={`w-full px-6 py-3 text-xs font-medium leading-tight border-t-0 border-b-2 border-transparent md:text-lg ${selectedTab === '1. týden' ? 'bg-gray-300' : 'hover:bg-gray-100'}`} 
    on:click={() => loadZalozka(0)}
  >
    1. týden
  </button>
  <button 
    class={`w-full px-6 py-3 text-xs font-medium leading-tight border-t-0 border-b-2 border-transparent md:text-lg ${selectedTab === '2. týden' ? 'bg-gray-300' : 'hover:bg-gray-100'}`} 
    on:click={() => loadZalozka(1)}
  >
    2. týden
  </button>
  <button 
    class={`w-full px-6 py-3 text-xs font-medium leading-tight border-t-0 border-b-2 border-transparent md:text-lg ${selectedTab === '3. týden' ? 'bg-gray-300' : 'hover:bg-gray-100'}`} 
    on:click={() => loadZalozka(2)}
  >
    3. týden
  </button>
  <button 
    class={`w-full px-6 py-3 text-xs font-medium leading-tight border-t-0 border-b-2 border-transparent md:text-lg ${selectedTab === '4. týden' ? 'bg-gray-300' : 'hover:bg-gray-100'}`} 
    on:click={() => loadZalozka(3)}
  >
    4. týden
  </button>
</div>

						<div class="flex justify-end pt-10 pr-5 text-md active:text-lg">
							<button
								class="px-4 py-2 text-center text-white transition duration-200 ease-in bg-green-600 rounded-lg shadow-md btn btn-success hover:bg-green-700 focus:ring-green-500 focus:ring-offset-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
								on:click={() => animateScroll.scrollTo({
										element: 'tabs-1-tab',
										duration: 1500,
										offset: 480
									})}>
								<p>Skoč nahoru</p>
							</button>
						</div>
					</div>
				</div>
			</div>
			{#if totalPieces > 0 && $page.data.session}
							<div class="flex text-md">
								<a class="w-full py-2 text-center text-white transition duration-200 ease-in bg-green-600 rounded-lg shadow-md btn btn-success hover:bg-green-700 focus:ring-green-500 f ocus:ring-offset-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2" activeClass={$page.url.pathname === '/kosik'} href="/kosik"><button
									class="">									
									Košík						
								</button></a>
							</div>
						{/if}
		</div>
		
	</section>
</main>
