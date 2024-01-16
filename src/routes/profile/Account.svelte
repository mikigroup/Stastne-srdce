<script lang="ts">
	import { supabaseClient } from '$lib/supabaseClient'
	import { onMount } from 'svelte'
	import type { AuthSession } from '@supabase/supabase-js'
	import client from '../../lib/sanityClient'
	import { fade } from 'svelte/transition'
	export let session: AuthSession

	let loading = false
	let username: string | null = null
	let website: string | null = null
	let avatarUrl: string | null = null
	let first_name = null
	let last_name = null
	let telephone = null
	let company_name = null
	let street = null
	let street_number = null
	let city = null
	let ico = null
	let dic = null
	let company = null

	let uniqueOrders = []

	let orders: any[] = []
	let itemsOrder: any[] = []
	let visible_jiri = []	
	let visible = false;

	const toggleVisible = () => {
		visible = !visible;
	}
	
	orders.forEach((order, index) => (visible[index] = false))
	async function loadOrders(email) {
		try {
			let orders = await client.fetch(
				`*[_type == "order" && email == "${email}"] { orderNumber, itemsOrder, timestamp, _id }`
			)		
			// Ensure the function still returns the fetched data
			return orders
		} catch (error) {
			console.error('Failed to fetch orders:', error)
			throw error // re-throw the error so it can be caught and handled by the calling function
		}
	}

	onMount(async () => {
		const xemail = session.user.email
		try {
			orders = await loadOrders(xemail)
			//console.log(`Fetched orders: ${JSON.stringify(orders)}`)
		} catch (error) {
			console.error(`Error fetching orders: ${error}`)
		}
	})

	onMount(() => {
		getProfile()
	})
	const getProfile = async () => {
		try {
			loading = true
			const { user } = session
			const { data, error, status } = await supabaseClient
				.from('profiles')
				.select(
					`username, website, avatar_url, first_name, last_name, telephone, company_name, street, street_number, city, ico, dic, company`
				)
				.eq('id', user.id)
				.single()

			if (data) {
				username = data.username
				website = data.website
				avatarUrl = data.avatar_url
				first_name = data.first_name
				last_name = data.last_name
				telephone = data.telephone
				company_name = data.company_name
				street = data.street
				street_number = data.street_number
				ico = data.ico
				dic = data.dic
				company = data.company
				city = data.city
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

	async function updateProfile() {
		try {
			loading = true
			const { user } = session

			const updates = {
				id: user.id,
				avatar_url: avatarUrl,
				updated_at: new Date(),
				first_name,
				last_name,
				telephone,
				company_name,
				street,
				street_number,
				city,
				ico,
				dic,
				company,
				username,
				website
			}

			let { error } = await supabaseClient.from('profiles').upsert(updates)

			if (error) throw error
		} catch (error) {
			if (error instanceof Error) {
				alert(error.message)
			}
		} finally {
			loading = false
		}
	}
	//const email = session.user.email;
	//console.log(email);
</script>

<svelte:head>
	<title>Šťastné srdce - Účet</title>
	<meta name="description" content="Účet" />
</svelte:head>

<section>
	<div class="max-w-screen-lg px-4 py-8 py-16 mx-auto mt-20 mb-10 rounded-lg bg-stone-100">
		<h1 class="mb-4 mb-10 text-5xl font-extrabold tracking-tight text-center text-gray-900">
			Profil účtu
		</h1>
{#if visible}	
{/if}
		<form class="form-widget" on:submit|preventDefault={updateProfile}>
			<div class="max-w-3xl max-w-4xl p-5 pb-2 mx-auto bg-white border-2 rounded-lg lg:mx-auto">
				<div
					class="mb-8 text-xl font-light text-center text-gray-500 lg:mb-16 dark:text-gray-400 md:text-lg"
				>
					<div class="my-2">
						<div class="flex flex-col items-center md:flex-row">
							<div class="flex justify-start basis-1/2">
								<label class="pr-2" for="email">Email / uživatel</label>
							</div>
							<div class="w-full basis-1/2">
								<input
									value={session.user.email}
									disabled
									type="email"
									id="email"
									class="w-full px-4 py-2 text-base text-center text-gray-700 placeholder-gray-400 border border-gray-300 rounded-lg shadow-sm appearance-none form-control bg-slate-200 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
									placeholder="Email"
								/>
							</div>
						</div>
						<hr class="w-32" />
						<div class="my-2">
							<div class="flex flex-col items-center md:flex-row">
								<div class="flex justify-start basis-1/2">
									<label class="pr-2" for="first_name">Jméno</label>
								</div>
								<div class="w-full basis-1/2">
									<input
										bind:value={first_name}
										type="first_name"
										id="first_name"
										class="w-full px-4 py-2 text-base text-center text-gray-700 placeholder-gray-400 bg-white border border-gray-300 rounded-lg shadow-sm appearance-none focus:outline-none focus:border-green-600"
										required
										placeholder="Jméno"
									/>
								</div>
							</div>
							<hr class="w-32" />
						</div>
						<div class="my-2">
							<div class="flex flex-col items-center md:flex-row">
								<div class="flex justify-start basis-1/2">
									<label class="pr-2" for="first_name">Příjmení</label>
								</div>
								<div class="w-full basis-1/2">
									<input
										bind:value={last_name}
										type="last_name"
										id="last_name"
										class="w-full px-4 py-2 text-base text-center text-gray-700 placeholder-gray-400 bg-white border border-gray-300 rounded-lg shadow-sm appearance-none focus:outline-none focus:border-green-600"
										placeholder="Příjmení"
									/>
								</div>
							</div>
							<hr class="w-32" />
						</div>
						<div class="my-2">
							<div class="flex flex-col items-center md:flex-row">
								<div class="flex justify-start basis-1/2">
									<label class="pr-2" for="telephone">Telefon</label>
								</div>
								<div class="w-full basis-1/2">
									<input
										bind:value={telephone}
										type="telephone"
										id="telephone"
										class="w-full px-4 py-2 text-base text-center text-gray-700 placeholder-gray-400 bg-white border border-gray-300 rounded-lg shadow-sm appearance-none focus:outline-none focus:border-green-600"
										placeholder="Telefon"
									/>
								</div>
							</div>
							<hr class="w-32" />
						</div>						
				<div class="mt-5" on:click={toggleVisible}>
	{#if visible} Méně{/if}
	{#if !visible} Více {/if}
</div>				
<div>
	</div>
{#if visible}
						<div class="flex flex-col my-2">							
							<div class="my-2">
								<div class="flex flex-col items-center md:flex-row">
									<div class="flex justify-start basis-1/2">
										<label class="pr-2" for="street">Ulice</label>
									</div>
									<div class="w-full basis-1/2">
										<input
											bind:value={street}
											type="street"
											id="street"
											class="w-full px-4 py-2 text-base text-center text-gray-700 placeholder-gray-400 bg-white border border-gray-300 rounded-lg shadow-sm appearance-none focus:outline-none focus:border-green-600"
											placeholder="Ulice"
										/>
									</div>
								</div>
								<hr class="w-32" />
							</div>
							<div class="my-2">
								<div class="flex flex-col items-center md:flex-row">
									<div class="flex justify-start basis-1/2">
										<label class="pr-2" for="street_number">Číslo popisné</label>
									</div>
									<div class="w-full basis-1/2">
										<input
											bind:value={street_number}
											type="street_number"
											id="street_number"
											class="w-full px-4 py-2 text-base text-center text-gray-700 placeholder-gray-400 bg-white border border-gray-300 rounded-lg shadow-sm appearance-none focus:outline-none focus:border-green-600"
											placeholder="Číslo popisné"
										/>
									</div>
								</div>
								<hr class="w-32" />
							</div>
							<div class="my-2">
								<div class="flex flex-col items-center md:flex-row">
									<div class="flex justify-start basis-1/2">
										<label class="pr-2" for="city">Město</label>
									</div>
									<div class="w-full basis-1/2">
										<input
											bind:value={city}
											type="city"
											id="city"
											class="form-control
                  </div>
                   w-full px-4 py-2 text-base text-center text-gray-700 placeholder-gray-400 bg-white border border-gray-300 rounded-lg shadow-sm appearance-none focus:outline-none focus:border-green-600"
											placeholder="Město"
										/>
									</div>
								</div>
								<hr class="w-32" />
							</div>
							<div class="my-2">
								<div class="flex flex-col items-center md:flex-row">
									<div class="flex justify-start basis-1/2">
										<label class="pr-2" for="company">Firma</label>
									</div>
									<div class="w-full basis-1/2">
										<input
											bind:value={company}
											type="company"
											id="company"
											class="w-full px-4 py-2 text-base text-center text-gray-700 placeholder-gray-400 bg-white border border-gray-300 rounded-lg shadow-sm appearance-none focus:outline-none focus:border-green-600"
											placeholder="Firma"
										/>
									</div>
								</div>
								<hr class="w-32" />
							</div>
							<div class="my-2">
								<div class="flex flex-col items-center md:flex-row">
									<div class="flex justify-start basis-1/2">
										<label class="pr-2" for="ico">IČO</label>
									</div>
									<div class="w-full basis-1/2">
										<input
											bind:value={ico}
											type="ico"
											id="ico"
											class="w-full px-4 py-2 text-base text-center text-gray-700 placeholder-gray-400 bg-white border border-gray-300 rounded-lg shadow-sm appearance-none focus:outline-none focus:border-green-600"
											placeholder="IČO"
										/>
									</div>
								</div>
								<hr class="w-32" />
							</div>
							<div class="my-2">
								<div class="flex flex-col items-center md:flex-row">
									<div class="flex justify-start basis-1/2">
										<label class="pr-2" for="dic">DIČ</label>
									</div>
									<div class="w-full basis-1/2">
										<input
											bind:value={dic}
											type="dic"
											id="dic"
											class="w-full px-4 py-2 text-base text-center text-gray-700 placeholder-gray-400 bg-white border border-gray-300 rounded-lg shadow-sm appearance-none focus:outline-none focus:border-green-600"
											placeholder="DIČ"
										/>
									</div>
								</div>
								<hr class="w-32" />
							</div>
						</div>
						{/if}
						<div class="mt-10">
							<button
								type="submit"
								class="w-full px-4 py-2 text-base font-semibold text-center text-white transition duration-200 ease-in bg-green-600 rounded-lg shadow-md btn btn-success hover:bg-green-700 focus:ring-green-500 focus:ring-offset-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
								disabled={loading}
							>
								{loading ? 'Ukládá se...' : 'Uložit'}
							</button>
						</div>
					</div>
				</div>
			</div>
		</form>
		<div class="max-w-screen-lg px-4 py-8 py-16 mx-auto mt-20 mb-10 rounded-lg bg-stone-100">
			<h1 class="mb-4 mb-10 text-5xl font-extrabold tracking-tight text-center text-gray-900">
				Objednávky
			</h1>
			<div class="max-w-3xl max-w-4xl p-5 pb-2 mx-auto bg-white border-2 rounded-lg lg:mx-auto">
				<div class="px-5 border-2 rounded-md bg-slate-50">
					{#if orders && orders.length > 0}
						<ul>
							{#each orders as order, index (order._id)}
								<li class="text-lg transition duration-300 ease-in-out">
									<br />
									<div
										class="p-5 text-center bg-white border-2 rounded-md"
										on:click={() => (visible_jiri[index] = !visible_jiri[index])}
									>
										Objednávka: <span class="font-semibol d">{order.orderNumber}</span>
										<br />
										Datum: {new Date(order.timestamp).toLocaleDateString('cs-CZ', {
											weekday: 'short',
											month: 'long',
											day: 'numeric'
										})}
									</div>
									{#if visible_jiri[index]}
										<div class="p-5 border-2 rounded-md" in:fade|global={{ duration: 500 }}>
											<ul>
												<br />
												{#each order.itemsOrder as item, i (i)}
													<li>{item}</li>
													{#if i % 4 === 3 && i !== order.itemsOrder.length - 1}
													<br>	
													<hr />
														<br>
													{/if}
												{/each}
											</ul>
										</div>
									{/if}
									<br />
									<hr />
								</li>
							{/each}
						</ul>
					{:else}
						<p>Žádné objednávky</p>
					{/if}

					<!-- 		{#each orders as order, index (order._id)}
			<li class="text-lg text-center transition duration-300 ease-in-out delay-150 md:hover:-translate-y-1 md:hover:scale-105">
				<br>
				<div class="p-5 border-2 rounded-md" on:click={() => visible[index] = !visible[index]}>
					Objednávka: <span class="font-semibold">{order.orderNumber}</span>
					<br>
					Datum: {new Date(order.timestamp).toLocaleDateString('cs-CZ', {
						weekday: 'short',
						month: 'long',
						day: 'numeric'
					})}
				</div>
				{#if visible[index]}
				<div class="p-5 border-2 rounded-md" in:fade|global={{duration: 500}}>
					<ul>
						<br>
						{#each order.itemsOrder as item, i (i)}
							<li>{item}</li>
						{/each}
					</ul>
				</div>
				{/if}
				<br>
				<hr>
			</li>
		{/each}
	</ul>
</div>
{:else}
	<p>Nahrávám objednávky...</p>
{/if} -->
				</div>
			</div>
		</div>
	</div>
</section>
