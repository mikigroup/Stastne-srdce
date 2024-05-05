<!-- <script lang="ts">
/* 	import Kosik from './Kosik.svelte'
	import { page } from '$app/stores'
	import client from '../../lib/sanityClient'
 */
	// export let data;
	// console.log(data.orders.orderNumber);

	/* const fetchLatestOrderId = async () => {
  try {
    // Fetch the schema for the 'order' type
    const orders = await client.fetch('*[_type == "order"]{_id}[0]');
    if (orders && orders._id) {
      // Extract the _id field
      const lastOrderId = orders._id;
      // You can use the lastOrderId as needed
      console.log('Last order ID:', lastOrderId);
    }
  } catch (error) {
    console.error('Error fetching latest order ID:', error);
  }
};
	console.log(data);
		console.log(orders); */
</script> -->
<!-- 
<svelte:head>
	<title>Šťastné srdce - Košík</title>
	<meta name="description" content="Košík" />
</svelte:head>

{#if !$page.data.session}
	<main>
		<section>
			<div
				class="max-w-screen-lg px-4 py-16 mx-auto mt-20 mb-10 text-center rounded-lg bg-stone-100 footer_fix"
			>
				<div class="flex">
					<a href="/login"
						class="w-full px-4 py-2 text-center text-white transition duration-200 ease-in bg-green-600 rounded-lg shadow-md w btn btn-success hover:bg-green-700 focus:ring-green-500 f ocus:ring-offset-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 s-H-c8uVOHPvWG">Přihlaš se
					</a>
				</div>
			</div>
		</section>
	</main>
{:else}
	<Kosik session={$page.data.session} />
{/if}
 -->


<script lang="ts">
	import CartItemsStore from '../Stores/stores'
	import { get } from 'svelte/store'
	import { page } from '$app/stores'
	import { user } from '../Stores/stores'
	import client from '../../lib/sanityClient'	
	import Modal from './Modal.svelte'
	import { onMount } from 'svelte'

	
	export let data;
	
	let { session, supabase, profile } = data;
	$: ({ session, supabase, profile } = data);
		
	$: cartItems = $CartItemsStore;

	function removeItem(menuid) {
		CartItemsStore.update((currentCartItems) => {
			return currentCartItems.filter((cartItem) => cartItem._id != menuid)
		})
	}

	$: totalPrice =
		$CartItemsStore.length &&
		$CartItemsStore.reduce((sum, cartItems) => sum + cartItems.price * cartItems.quantity, 0)
	$: totalPieces =
		$CartItemsStore.length &&
		$CartItemsStore.reduce((sum, cartItems) => sum + cartItems.quantity, 0)

	function refreshPage() {
		location.reload(true)
	}

	function delayRefreshPage(mileSeconds) {
		window.setTimeout(refreshPage, mileSeconds)
	}

	let loading = false
	let first_name = null
	let last_name = null

	const email = session.user.email
	console.log(email)

	onMount(() => {
		getProfile()
	})

	const getProfile = async () => {
		try {
			loading = true
			// const { user } = session
			console.log("TEST:", session.user.id)
			const { data, error, status } = await supabase
				.from('profiles')
				.select(`first_name, last_name`)
				.eq('id', session.user.id)
				.single()

			if (data) {
				first_name = data.first_name
				last_name = data.last_name
			}

			if (error && status !== 406) throw error
		} catch (error) {
			if (error instanceof Error) {
				alert(error.message)
			}
		} finally {
			loading = false
		}
	}

	async function sendOrderAndCreateDoc2() {
		try {
			loading = true
			var txt = document.getElementById('txt').value

			const latestOrder = await client.fetch('*[_type == "order"] | order(_createdAt desc) [0]')
			const orderNumber = latestOrder ? latestOrder.orderNumber + 1 : 1

			// Replace "yourFunctionName" with the correct Supabase function name
			await supabase.functions.invoke('sendOrderBySendGrid_T', {
				body: JSON.stringify({
					cart: get(CartItemsStore),
					user: supabase.auth.getUser(),
					txt: txt,
					orderNumber: orderNumber
				})
			})

			const cart = JSON.parse(localStorage.getItem('cart'))
			let totalPrice = 0
			let totalPieces = 0
			const order = []
			for (const obj of cart) {
				order.push(obj.title)
				const releaseDate = new Date(obj.releaseDate)
				const formattedDate = `${releaseDate.getDate().toString().padStart(2, '0')}-${(
					releaseDate.getMonth() + 1
				)
					.toString()
					.padStart(2, '0')}-${releaseDate.getFullYear()}`
				order.push(formattedDate)
				order.push(obj.description)
				order.push(obj.quantity)
				totalPrice += obj.price * obj.quantity
				totalPieces += obj.quantity
			}

			const now = new Date()
			const timestamp = now.toISOString()
			const fullname = `${first_name} ${last_name}`
			const email = session.user.email

			const doc = {
				_type: 'order',
				itemsOrder: order,
				note: txt,
				timestamp: timestamp,
				customer: fullname,
				totalPrice: totalPrice,
				totalPieces: totalPieces,
				email: email,
				orderNumber: orderNumber
			}

			const res = await client.create(doc)
			console.log(`Objednávka byla vytvořena, document ID je ${res._id}`)

			CartItemsStore.update(() => {
				return []
			})

			window.location.href = '/thankyou'
		} catch (error) {
			console.error(error)
		} finally {
			loading = false
		}
	}

	let showModal = false
</script>

<svelte:head>
	<title>Šťastné srdce - Košík</title>
	<meta name="description" content="Košík" />
</svelte:head>
<main>
	<section>
		<div
			class="max-w-screen-lg px-4 py-8 py-16 mx-auto mt-20 mb-10 rounded-lg bg-stone-100 footer_fix"
		>
			<h1
				class="mb-4 mb-10 text-5xl font-extrabold tracking-tight text-center text-gray-900 animate__animated animate__rubberBand"
			>
				Košík
			</h1>

			<div class="">
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
											CartItemsStore.update((items) => items)
										}}
									/>
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
											removeItem(cartItem._id)
										}}
									>
										✕
									</button>
								</div>
							</div>
						{/each}
					</div>
				</div>
				<!-- nadpisy sloupců pro desktop -->
				<div
					class="hidden max-w-screen-xl px-4 py-4 mx-auto mt-5 border-2 rounded-lg md:grid border-b-transparen"
				>
					<div
						class="grid items-center grid-cols-9 p-2 pl-5 text-lg border divide-x rounded-lg border-slate-600 bg-slate-300"
					>
						<div class="font-light text-center">
							<p>Den</p>
						</div>
						<div class="font-light text-center">
							<p>Menu č.</p>
						</div>
						<div class="font-light text-center">
							<p>Počet</p>
						</div>
						<div class="font-light text-center">
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
							class="items-center hidden pl-5 my-1 text-lg border-2 rounded-lg md:grid-cols-9 bg-stone-100 md:grid"
						>
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
									type="number"
									bind:value={cartItem.quantity}
									on:change={(e) => {
										CartItemsStore.update((items) => items)
									}}
									class="w-20 text-lg text-center transition-all duration-200 ease-in-out bg-white border border-transparent rounded-lg focus:outline-none focus:border-green-600"
								/>
							</div>

							<div class="text-center">
								<p class="">{cartItem.price},-</p>
							</div>
							<div class="col-span-4 p-8 font-light border-x-2 break-word">
								{cartItem.description}
							</div>
							<div class="text-center">
								<!-- animate__animated animate__flip -->
								<button
									class="hover:animate-spin"
									on:click={() => {
										removeItem(cartItem._id)
									}}
								>
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
							<textarea
								class="shadow-sm bg-gray-50 border border-gray-300 text-sm rounded-lg block w-full p-2.5
						appearance-none block w-full border border-gray-200 rounded-lg py-3 px-3 appearance-none focus:outline-none focus:border-green-600 mb-5"
								id="txt"
								name="txt"
								rows="4"
								cols="50"
								placeholder="poznámka k objednávce"
							/>
						</div>
						<div class="grid p-5 border-b-2 justify-items-end">
							{#if $page.data.session}
								<p class="justify-center text-sm text-center text-gray-500 flex-items-center">
									Máte již vyplněný
									<a href="/profile" class="text-sm text-blue-500 underline hover:text-blue-700"
										>účet?</a
									>
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
									data-te-ripple-color="light"
								>
									<span class="">Potvrzení košíku</span>
								</button>
							{:else}
								<a
									class="w-full px-4 py-2 text-center text-white transition ease-in bg-green-600 border rounded-lg shadow-md hover:border-black hover:text-black"
									href="/login">Přihlaš se</a
								>
							{/if}

							<Modal bind:showModal>
								<div class="">
									<button
										on:click={() => {
											sendOrderAndCreateDoc2()
										}}
										type="button"
										class="w-full px-4 py-2 text-center text-white bg-green-600 rounded-lg shadow-md hover:text-black"
										><input
											type="submit"
											class=""
											value={loading ? 'Odesílá se...' : 'Odeslat'}
											disabled={loading}
										/>
									</button>
									<!-- <button type="button" class="p-2 border hover:bg-slate-400">Zavřít</button> -->
								</div>
							</Modal>
						</div>
					</div>
				{/if}
				<!-- spodní část -> celková cena a tlačítko potvrdit -->
				<div />
			</div>
		</div>
	</section>
</main>
