<script>
	import CartItemsStore from '../Stores/stores';
	import { get } from 'svelte/store';
	import { supabase } from '../supabaseClient';
	import { page } from '$app/stores';
	import { user } from '../Stores/stores';
	import client from "../sanityClient";
	import { onMount } from "svelte";
	export let dataOrder = [];
	export let dataOrder2 = [];
	export let dataOrder3 = [];
	
	$: cartItems = $CartItemsStore;

	function removeItem(menuid) {
		CartItemsStore.update((currentCartItems) => {
			return currentCartItems.filter((cartItem) => cartItem._id != menuid);
		});
	}

	//mazání pokud object/item v cart dosáhne qty
	$: $CartItemsStore.map((currentCartItems, index, menuid) => {
		if (currentCartItems.quantity === 0) {
			$CartItemsStore.splice(index, 1) &&
				CartItemsStore.update((currentCartItems) => {
					return currentCartItems.filter((cartItem) => cartItem._id != menuid);
				});
		}
	});

	$: totalPrice =
		$CartItemsStore.length &&
		$CartItemsStore.reduce((sum, cartItems) => sum + cartItems.price * cartItems.quantity, 0);
	$: totalPieces =
		$CartItemsStore.length &&
		$CartItemsStore.reduce((sum, cartItems) => sum + cartItems.quantity, 0);

	function sendOrder() {
		supabase.functions.invoke('sendOrder', {
			body: JSON.stringify({ cart: get(CartItemsStore), user: supabase.auth.user() })
		});
		CartItemsStore.update(() => {
			return [];
		});
	}



/* 	function createDoc {
		client.create(doc).then((res) => {
  console.log(`Objednávka byla vytvořena , document ID is ${res._id}`)
		});
	} */
console.log(dataOrder);
console.log(dataOrder2);
console.log(dataOrder3);

/* const values = Object.values(dataOrder);
const novaObj = values.reduce((accumulator, value) => {
  return accumulator + value;
}, +1); */	

function createOrder() {		
		const values = Object.values(dataOrder);
		const novaObj = values.reduce((accumulator, value) => {
  	return accumulator + value;
			}, +1);
 
const doc = {
    _type: 'order',
		orderNumber: 	'',	
    note: 'První poznámka objednávky',
		/* orderNumber: novaObj,		 */
}
console.log(novaObj);
		client.create(doc).then((res) => {
  console.log(`Objednávka byla vytvořena , document ID is ${res._id}`)
		});	
	}	
</script>

<svelte:head>
	<title>Šťastné srdce - Košík</title>
</svelte:head>

<main>
	<div class="py-8 py-16 px-4 mx-auto max-w-screen-lg mt-20 bg-slate-100 rounded-lg footer_fix mb-10">
		<h1
			class="mb-10 mb-4 text-4xl tracking-tight font-extrabold text-center text-gray-900
			dark:text-white">
			Košík
		</h1>

		<!-- vrchní část -->
		<div class="md:hidden bg-orange-50 py-4 px-4 mx-auto max-w-screen-xl">
			<!-- obsah košíku pokud je prázdný pro mobile -->
			<div class="place-items-center text-lg">
				{#if cartItems.length === 0}
					<div class="w-full flex flex-col items-center justify-center overflow-hidden">
						<div class="my-20 font-bold text-xl md:text-2xl text-center">
							<p>Pusto a prázdno :/</p>
						</div>
					</div>
					<!-- obsah košíku pro mobile -->
				{/if}
				{#each cartItems as cartItem, i (cartItem._id)}
					<div class="mb-5 bg-stone-100 border-2 rounded-lg">
						<div class="text-center bg-slate-300 rounded-lg">
							<p>
								<strong>Den</strong>
							</p>
						</div>
						<div class="m-2 text-center">
							<p class="">
								{new Date(cartItem.releaseDate).toLocaleDateString('cs-CZ', {
									month: 'long',
									day: 'numeric'
								})}
							</p>
						</div>
						<hr />
						<div class="m-5 font-light text-center">
							<p class="font-medium">
								<strong>{cartItem.title}</strong>
							</p>
						</div>
						<hr />
						<div class="mt-5 font-light text-center">
							<p>
								<strong>Počet</strong>
							</p>
						</div>
						<div class="mb-5 lg:mb-5 font-light text-center">
							<input
								min="0"
								max="99"
								class="w-20"
								type="number"
								bind:value={cartItem.quantity}
								on:change={(e) => {
									CartItemsStore.update((items) => items);
								}} />
						</div>
						<hr />
						<div class="mt-5 font-light text-center">
							<p>
								<strong>Cena</strong>
							</p>
						</div>
						<div class="pl-2 mb-5 font-light text-center">
							{cartItem.price * cartItem.quantity} ,-
						</div>
						<hr />
						<div class="mt-5 font-light text-center col-span-4">
							<p>
								<strong>Popis</strong>
							</p>
						</div>
						<div class="mb-5 font-light text-center col-span-4">{cartItem.description}</div>
						<hr />
						<div class="font-light text-center">
							<button
								class="m-5"
								on:click={() => {
									removeItem(cartItem._id);
								}}>
								✕
							</button>
						</div>
					</div>
				{/each}
			</div>
		</div>
		<!-- nadpisy sloupců pro desktop -->
		<div
			class="mt-5 py-4 px-4 mx-auto max-w-screen-xl rounded-lg border-2 hidden md:grid
			border-b-transparen">
			<div
				class="grid grid-cols-9 border border-slate-600 rounded-lg text-lg items-center divide-x
				bg-slate-300">
				<div class="font-light text-center">
					<p>Den</p>
				</div>
				<div class="font-light text-center">
					<p>Menu č.</p>
				</div>
				<div class=" font-light text-center">
					<p>Počet</p>
				</div>
				<div class=" font-light text-center">
					<p>Cena</p>
				</div>
				<div class="font-light text-center col-span-4">
					<p>Popis</p>
				</div>
				<div class="font-light text-center">
					<p>Odebrat</p>
				</div>
			</div>
		</div>

		<!-- obsah košíku pro desktop -->
		<div class="p-4 mx-auto max-w-screen-xl rounded-lg border-2 hidden md:grid bg-orange-50">
			<!-- obsah košíku pokud je prázdný pro desktop -->
			{#if cartItems.length === 0}
				<div class="w-full flex flex-col items-center justify-center overflow-hidden">
					<div class="my-20 text-center font-bold text-2xl text-center">
						<p>Pusto a prázdno :/</p>
					</div>
				</div>
			{/if}
			<!-- obsah pro desktop -->
			{#each cartItems as cartItem, i (cartItem._id)}
				<div
					class="my-1 md:grid-cols-9 border-2 rounded-lg items-center text-lg bg-stone-100 hidden
					md:grid">
					<div class="text-center">
						<p class="">
							{new Date(cartItem.releaseDate).toLocaleDateString('cs-CZ', {
								month: 'long',
								day: 'numeric'
							})}
						</p>
					</div>
					<div class="font-light text-center">
						<p class="font-medium">{cartItem.title}</p>
					</div>
					<div class="font-light text-center">
						<input
							min="0"
							max="99"
							class="w-20"
							type="number"
							bind:value={cartItem.quantity}
							on:change={(e) => {
								CartItemsStore.update((items) => items);
							}} />
					</div>
					<div class="font-light text-center">
						<p class="font-medium">{cartItem.price}</p>
					</div>
					<div class="font-light text-center border-x-2 break-word col-span-4">
						{cartItem.description}
					</div>
					<div class="font-light text-center">
						<button
							class=""
							on:click={() => {
								removeItem(cartItem._id);
							}}>
							✕
						</button>
					</div>
				</div>
			{/each}
		</div>
		<!-- spodní část -> celková cena a tlačítko potvrdit -->
		{#if cartItems.length !== 0}
			<div class="mt-5 border-2 rounded-lg">
				<div class="p-5 grid justify-items-end border-b-2">
						{#if $user}
					<p
						class="justify-center text-sm text-center text-gray-500 flex-items-center
						dark:text-gray-400">
						Máte již vyplněný
						<a href="/profile" class="text-sm text-blue-500 underline hover:text-blue-700">účet?</a>
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
						{#if $user}	
					<button
						class="btn btn-success py-2 px-4 bg-green-600 hover:bg-green-700 focus:ring-green-500 f
						ocus:ring-offset-green-200 text-white transition ease-in duration-200 w-full text-center
						shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-lg"
						data-bs-toggle="modal"
						data-bs-target="#Modal">
						<span>Potvrzení košíku</span>
					</button>
					{:else}
					<button
						class="btn btn-success py-2 px-4 bg-green-600 hover:bg-green-700 focus:ring-green-500 f
						ocus:ring-offset-green-200 text-white transition ease-in duration-200 w-full text-center
						shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-lg">
						<a href="/login">Přihlaš se</a>
					</button>
					{/if}
					
					<!-- Modal -->
<div class="relative z-10" aria-labelledby="modal-title" role="dialog" id="Modal" aria-modal="true">
  <!--
    Background backdrop, show/hide based on modal state.

    Entering: "ease-out duration-300"
      From: "opacity-0"
      To: "opacity-100"
    Leaving: "ease-in duration-200"
      From: "opacity-100"
      To: "opacity-0"
  -->
  <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

  <div class="fixed inset-0 z-10 overflow-y-auto">
    <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
      <!--
        Modal panel, show/hide based on modal state.

        Entering: "ease-out duration-300"
          From: "opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          To: "opacity-100 translate-y-0 sm:scale-100"
        Leaving: "ease-in duration-200"
          From: "opacity-100 translate-y-0 sm:scale-100"
          To: "opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
      -->
      <div class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div class="sm:flex sm:items-start">
            <div class="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
              <!-- Heroicon name: outline/exclamation-triangle -->
              <svg class="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 10.5v3.75m-9.303 3.376C1.83 19.126 2.914 21 4.645 21h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 4.88c-.866-1.501-3.032-1.501-3.898 0L2.697 17.626zM12 17.25h.007v.008H12v-.008z" />
              </svg>
            </div>
            <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
              <h3 class="text-lg font-medium leading-6 text-gray-900" id="modal-title">Deactivate account</h3>
              <div class="mt-2">
                <p class="text-sm text-gray-500">Are you sure you want to deactivate your account? All of your data will be permanently removed. This action cannot be undone.</p>
              </div>
            </div>
          </div>
        </div>
        <div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
          <button type="button" class="inline-flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm">Deactivate</button>
          <button type="button" class="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</div>



					<div
						class="modal fade fixed top-0 left-0 hidden w-full h-full outline-none overflow-x-hidden
						overflow-y-auto"
						id=""
						tabindex="-1"
						aria-labelledby="ModalLabel"
						aria-hidden="true">
						<div class="modal-dialog relative w-auto pointer-events-none">
							<div
								class="modal-content border-none shadow-lg relative flex flex-col w-full
								pointer-events-auto bg-white bg-clip-padding rounded-md outline-none text-current">
								<div
									class="modal-header flex flex-shrink-0 items-center justify-between p-4 border-b
									border-gray-200 rounded-t-md">
									<h5 class="text-xl font-medium leading-normal text-gray-800" id="">Upozornění</h5>
									<button
										type="button"
										class="btn-close box-content w-4 h-4 p-1 text-black border-none rounded-none
										opacity-50 focus:shadow-none focus:outline-none focus:opacity-100
										hover:text-black hover:opacity-75 hover:no-underline"
										data-bs-dismiss="modal"
										aria-label="Close" />
								</div>
								<div class="modal-body relative p-4 text-center">
									Opravdu chcete potvrdit košík a poslat?
								</div>
								<div
									class="modal-footer flex flex-shrink-0 flex-wrap items-center justify-end p-4
									border-t border-gray-200 rounded-b-md">
									<button
										type="button"
										class="btn btn-success py-2 px-4 bg-green-600 hover:bg-green-700
										focus:ring-green-500 f ocus:ring-offset-green-200 text-white transition ease-in
										duration-200 text-center shadow-md focus:outline-none focus:ring-2
										focus:ring-offset-2 rounded-lg mr-2"
										data-bs-dismiss="modal">
										Zavřít
									</button>
									<button
										on:click={() => {
											sendOrder();
										}}
										type="button"
										data-bs-dismiss="modal"
										class="active:text-lg btn btn-success py-2 px-4 bg-green-600 hover:bg-green-700
										focus:ring-green-500 focus:ring-offset-green-200 text-white transition ease-in
										duration-200 text-center shadow-md focus:outline-none focus:ring-2
										focus:ring-offset-2 rounded-lg">
										<a activeClass={$page.url.pathname === '/thankyou'} href="/thankyou">Odeslat</a>
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		{/if}
		<div>			
	<!-- 	<button
										on:click={() => {
											createOrder();
										}}
										type="button"
										data-bs-dismiss=""
										class="active:text-lg btn btn-success py-2 px-4 bg-green-600 hover:bg-green-700
										focus:ring-green-500 focus:ring-offset-green-200 text-white transition ease-in
										duration-200 text-center shadow-md focus:outline-none focus:ring-2
										focus:ring-offset-2 rounded-lg">
										<a activeClass={$page.url.pathname === '/thankyou'} href="/thankyou">TEST</a>
									</button> -->
		</div>	
	</div>
</main>

<!-- <Navbar on:nav={navHandler} />
  {#if nav === 'home'}
	 <CardWrapper /> 
  {:else}
 <Checkout />
  {/if} -->
