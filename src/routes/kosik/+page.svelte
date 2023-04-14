<script>
	import CartItemsStore from '../Stores/stores';
	import { get } from 'svelte/store';	
	import { page } from '$app/stores';
	import { user } from '../Stores/stores';
	import client from "../sanityClient";
  import { onMount } from 'svelte/internal';
	import { supabaseClient } from "$lib/supabaseClient";
	// import { onMount } from "svelte"; // pro využití localstorage
	




	$: cartItems = $CartItemsStore;

	function removeItem(menuid) {
		CartItemsStore.update((currentCartItems) => {
			return currentCartItems.filter((cartItem) => cartItem._id != menuid);
		});
	}

	//mazání pokud object/item v cart dosáhne qty = 0
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

// V1 create order
/* function createDoc() {
  var txt2  = document.getElementById('txt2').value;
	const cart = JSON.parse(localStorage.getItem('cart'));
	const items = [];
	for (const obj of cart) {
		items.push({
			title: obj.title,
			description: obj.description,
			quantity: obj.quantity
		});
  }
	console.log(items);
  const doc = {
    _type: 'order',      
    itemsOrder: JSON.stringify(items),
    note: txt2
  }   
  client.create(doc).then((res) => {
    console.log(`Objednávka byla vytvořena , document ID je ${res._id}`)
  });
}; */

// V2 create order
// const email = supabase.user_metadata.email;
/* const {
  data: { user },
} = supabase.auth.getUser()
let metadata = user.user_metadata */

// const user = supabase.auth.api.user()

// console.log(user); 

function createDoc() {
  var txt  = document.getElementById('txt').value;
	const cart = JSON.parse(localStorage.getItem('cart'));
	const titles = [];
	for (const obj of cart) {		
	titles.push(obj.title);
	titles.push(obj.description);
	titles.push(obj.quantity);
}

const doc = {
    _type: 'order',
		// customer: ,      
    itemsOrder: titles,
    note: txt
  }   
  client.create(doc).then((res) => {
    console.log(`Objednávka byla vytvořena , document ID je ${res._id}`)
  });
};

// sendOrderBySendGrid
function refreshPage() {
    //ensure reloading from server instead of cache
    location.reload(true);
}
function delayRefreshPage(mileSeconds) {
    window.setTimeout(refreshPage, mileSeconds);
	}
function sendOrderBySendGrid() {
		var txt = document.getElementById('txt');	
		supabaseClient.auth.functions.functions.invoke('sendOrderBySendGrid_T', {
		body: JSON.stringify({ cart: get(CartItemsStore), user: supabase.auth.user(), txt: txt.value })
		});
		CartItemsStore.update(() => {
			return [];
		});		 
		delayRefreshPage(2000);
	 }
	
</script>

<svelte:head>
	<title>Šťastné srdce - Košík</title>
</svelte:head>

<main>
	<section>
	<div class="max-w-screen-lg px-4 py-8 py-16 mx-auto mt-20 mb-10 rounded-lg bg-stone-100 footer_fix">
		<h1
			class="mb-4 mb-10 text-5xl font-extrabold tracking-tight text-center text-gray-900 ">
			Košík
		</h1>
		<!-- TEST -->
		<!-- <button class="p-2 border rounded-lg border-slate-600 hover:bg-slate-200 " on:click={() => {
									createDoc();
								}} >
								Odeslat košík a vytvořit objednávku
		</button>
		<div class="grid p-5 border-b-2">									
					  <p><label for="txt2">Poznámka</label></p>
  					<textarea class="shadow-sm bg-gray-50 border border-gray-300 text-sm rounded-lg block w-full p-2.5
						appearance-none	block w-full border border-gray-200 rounded-lg py-3 px-3 focus:outline-none border
						focus:ring-2 focus:ring-green-700 mb-5" name="txt2" id="txt2" rows="4" cols="50" placeholder="poznámka k objednávce"></textarea>  				
		</div> -->

		
		<!-- vrchní část -->
		<div class="max-w-screen-xl px-4 py-4 mx-auto md:hidden bg-orange-50">
			<!-- obsah košíku pokud je prázdný pro mobile -->
			<div class="text-lg place-items-center">
				{#if cartItems.length === 0}
					<div class="flex flex-col items-center justify-center w-full overflow-hidden">
						<div class="my-20 text-xl font-bold text-center md:text-2xl">
							<p>Košík je prázdný...</p>
						</div>
					</div>
					<!-- obsah košíku pro mobile -->
				{/if}
				{#each cartItems as cartItem, i (cartItem._id)}
					<div class="mb-5 border-2 rounded-lg bg-stone-100">
						<div class="text-center rounded-lg bg-slate-300">
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
						<div class="mb-5 font-light text-center lg:mb-5">
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
						<div class="col-span-4 mt-5 font-light text-center">
							<p>
								<strong>Popis</strong>
							</p>
						</div>
						<div class="col-span-4 p-8 mb-5 font-light">{cartItem.description}</div>
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
			class="hidden max-w-screen-xl px-4 py-4 mx-auto mt-5 border-2 rounded-lg md:grid border-b-transparen">
			<div
				class="grid items-center grid-cols-9 p-2 pl-5 text-xl border divide-x rounded-lg border-slate-600 bg-slate-300">
				<div class="font-light text-center">
					<p>Den</p>
				</div>
				<div class="font-light text-center">
					<p>Menu č.</p>
				</div>
				<div class="font-light text-center ">
					<p>Počet</p>
				</div>
				<div class="font-light text-center ">
					<p>Cena</p>
				</div>
				<div class="col-span-4 font-light text-center">
					<p>Popis</p>
				</div>
				<div class="font-light text-center">
					<p>Odebrat</p>
				</div>
			</div>
		</div>

		<!-- obsah košíku pro desktop -->
		<div class="hidden max-w-screen-xl p-4 mx-auto border-2 rounded-lg md:grid bg-orange-50">
			<!-- obsah košíku pokud je prázdný pro desktop -->
			{#if cartItems.length === 0}
				<div class="flex flex-col items-center justify-center w-full overflow-hidden">
					<div class="my-20 text-2xl font-bold text-center">
						<p>Košík je prázdný...</p>
					</div>
				</div>
			{/if}
			<!-- obsah pro desktop -->
			{#each cartItems as cartItem, i (cartItem._id)}
				<div
					class="items-center hidden pl-5 my-1 text-lg border-2 rounded-lg md:grid-cols-9 bg-stone-100 md:grid">
					<div class="text-center">
						<p class="border-r-2 border-slate-300">
							{new Date(cartItem.releaseDate).toLocaleDateString('cs-CZ', {
								month: 'long',
								day: 'numeric'
							})}
						</p>
					</div>
					<div class="text-center">
						<p class="border-r-2 border-slate-300">{cartItem.title}</p>
					</div>
					<div class="text-center">
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
					<div class="text-center">
						<p class="">{cartItem.price},-</p>
					</div>					
					<div class="col-span-4 p-8 font-light border-x-2 break-word">
						{cartItem.description}
					</div>
					<div class="text-center">
						<button
							class=""
							on:click={() => {
								removeItem(cartItem._id);
							}}>
							X
						</button>
					</div>
				</div>
			{/each}
		</div>
		<!-- spodní část -> celková cena a tlačítko potvrdit -->
		{#if cartItems.length !== 0}
			<div class="mt-5 border-2 rounded-lg">
				
				<div class="grid p-5 border-b-2">									
					  <p><label for="txt">Poznámka</label></p>
  					<textarea class="shadow-sm bg-gray-50 border border-gray-300 text-sm rounded-lg block w-full p-2.5
						appearance-none	block w-full border border-gray-200 rounded-lg py-3 px-3 focus:outline-none border
						focus:ring-2 focus:ring-green-700 mb-5" id="txt" name="txt" rows="4" cols="50" placeholder="poznámka k objednávce"></textarea>		
				</div>
				
				<div class="grid p-5 border-b-2 justify-items-end">
						{#if $user}			
					<p
						class="justify-center text-sm text-center text-gray-500 flex-items-center ">
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
						type="button"
						class="w-full px-4 py-2 text-center text-white transition duration-200 ease-in bg-green-600 rounded-lg shadow-md btn btn-success hover:bg-green-700 focus:ring-green-500 f ocus:ring-offset-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
						data-te-toggle="modal"
						data-te-target="#exampleModal"
						data-te-ripple-init
						data-te-ripple-color="light">
						<span>Potvrzení košíku</span>
					</button>					
					{:else}
					<button
						class="w-full px-4 py-2 text-center text-white transition duration-200 ease-in bg-green-600 rounded-lg shadow-md btn btn-success hover:bg-green-700 focus:ring-green-500 f ocus:ring-offset-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2">
						<a href="/login">Přihlaš se</a>
					</button>
					{/if}					
					<!-- Modal -->
					<div
						data-te-modal-init
						class="fixed top-0 left-0 z-[1055] hidden h-full w-full overflow-y-auto overflow-x-hidden outline-none"
						id="exampleModal"
						tabindex="-1"
						aria-labelledby="exampleModalLabel"
						aria-hidden="true">
						<div
							data-te-modal-dialog-ref
							class="pointer-events-none relative w-auto translate-y-[-50px] opacity-0 transition-all duration-300 ease-in-out min-[576px]:mx-auto min-[576px]:mt-7 min-[576px]:max-w-[500px]">
							<div
								class="min-[576px]:shadow-[0_0.5rem_1rem_rgba(#000, 0.15)] pointer-events-auto relative flex w-full flex-col rounded-md border-none bg-white bg-clip-padding text-current shadow-lg outline-none dark:bg-neutral-600">
								<div
									class="flex items-center justify-between flex-shrink-0 p-4 border-b-2 border-opacity-100 rounded-t-md border-neutral-100 dark:border-opacity-50">
									<h5
										class="text-xl font-medium leading-normal text-neutral-800 dark:text-neutral-200"
										id="exampleModalLabel">
										Upozornění
									</h5>
									<button
										type="button"
										class="box-content border-none rounded-none hover:no-underline hover:opacity-75 focus:opacity-100 focus:shadow-none focus:outline-none"
										data-te-modal-dismiss
										aria-label="Close">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											fill="none"
											viewBox="0 0 24 24"
											stroke-width="1.5"
											stroke="currentColor"
											class="w-6 h-6">
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												d="M6 18L18 6M6 6l12 12" />
										</svg>
									</button>
								</div>
								<div class="relative flex-auto p-4" data-te-modal-body-ref>
									Opravdu chcete potvrdit košík a odeslat
								</div>
								<div
									class="flex flex-wrap items-center justify-end flex-shrink-0 p-4 border-t-2 border-opacity-100 rounded-b-md border-neutral-100 dark:border-opacity-50">
									<button
										type="button"
										class="px-4 py-2 mr-2 text-center text-white transition duration-200 ease-in bg-green-600 rounded-lg shadow-md btn btn-success hover:bg-green-700 focus:ring-green-500 f ocus:ring-offset-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
										data-te-modal-dismiss
										data-te-ripple-init
										data-te-ripple-color="light">
										Zavřít
									</button>
									<button
										on:click={() => {sendOrderBySendGrid();}}
										type="button"
										class="px-4 py-2 text-center text-white transition duration-200 ease-in bg-green-600 rounded-lg shadow-md active:text-lg btn btn-success hover:bg-green-700 focus:ring-green-500 focus:ring-offset-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
										data-te-ripple-init
										data-te-ripple-color="light">	<a activeClass={$page.url.pathname === '/thankyou'} href="/thankyou">Odeslat</a>
									</button>
								</div>
							</div>
						</div>
					</div>

					<!-- Modal -->
					<div
						class="fixed top-0 left-0 hidden w-full h-full overflow-x-hidden overflow-y-auto outline-none modal fade md:w-1/2"
						id="Modal"
						tabindex="-1"
						aria-labelledby="ModalLabel"
						aria-hidden="true">
						<div class="relative w-auto pointer-events-none modal-dialog">
							<div
								class="flex flex-col w-full text-current bg-white border-none rounded-md shadow-lg outline-none pointer-events-auto modal-content bg-clip-padding">
								<div
									class="flex items-center justify-between flex-shrink-0 p-4 border-b border-gray-200 modal-header rounded-t-md">
									<h5 class="text-xl font-medium leading-normal text-gray-800" id="">Upozornění</h5>
									<button
										type="button"
										class="box-content w-4 h-4 p-1 text-black border-none rounded-none opacity-50 btn-close focus:shadow-none focus:outline-none focus:opacity-100 hover:text-black hover:opacity-75 hover:no-underline"
										data-bs-dismiss="modal"
										aria-label="Close" />
								</div>
								<div class="relative p-4 text-center modal-body">
									Opravdu chcete potvrdit košík a odeslat?
								</div>
								<div
									class="flex flex-wrap items-center justify-end flex-shrink-0 p-4 border-t border-gray-200 modal-footer rounded-b-md">
									<button
										type="button"
										class="px-4 py-2 mr-2 text-center text-white transition duration-200 ease-in bg-green-600 rounded-lg shadow-md btn btn-success hover:bg-green-700 focus:ring-green-500 f ocus:ring-offset-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
										data-bs-dismiss="modal">
										Zavřít
									</button>
									<button
										on:click={() => {sendOrderBySendGrid();}}
										type="button"
										data-bs-dismiss="modal"
										class="px-4 py-2 text-center text-white transition duration-200 ease-in bg-green-600 rounded-lg shadow-md active:text-lg btn btn-success hover:bg-green-700 focus:ring-green-500 focus:ring-offset-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2">
										
									</button>
								</div>
							</div>
						</div>
					</div>
					<!-- Konec modal -->
				</div>
			</div>
		{/if}
		<!-- spodní část -> celková cena a tlačítko potvrdit -->
		<div>			
		
		</div>	
	</div>
	{#if $user}
	<div class="">

	</div>	
	{/if}
	</section>
</main>


