<script lang="ts">
	import { onMount } from "svelte";
	import { enhance } from "$app/forms";
	import type { SubmitFunction } from "@sveltejs/kit";
	import client from "../../lib/sanityClient";
	import { fade } from "svelte/transition";

	export let data;
	export let form;
	let { session, supabase, profile } = data;
	$: ({ session, supabase, profile } = data);
	// console.log(data)
	// console.log(data.session)

	let uniqueOrders = [];
	let orders: any[] = [];
	let itemsOrder: any[] = [];

    let visible = false;

    const toggleVisible = () => {
        visible =!visible;
    }

/* 	orders.forEach((order, index) => (visible[index] = false))	 */

	async function loadOrders(email: string) {
		try {
			let orders = await client.fetch(
				`*[_type == "order" && email == "${email}"] { orderNumber, itemsOrder, timestamp, _id }`
			)
			// Ensure the function still returns the fetched data
			return orders
		} catch (error) {
			console.error("Failed to fetch orders:", error)
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
	});

	
	let profileForm: HTMLFormElement;
	let loading = false;
	let username: string = profile?.username ?? "";
	let first_name: string = profile?.first_name ?? "";
	let last_name: string = profile?.last_name ?? "";
	let telephone: string = profile?.telephone ?? ""	;
	let street: string = profile?.street ?? "";
	let street_number: string = profile?.street_number ?? "";
	let city: string = profile?.city ?? "";
	let ico: string = profile?.ico ?? "";
	let dic: string = profile?.dic ?? "";
	let company: string = profile?.company ?? "";
	
	const handleSubmit: SubmitFunction = () => {
		loading = true
		return async () => {
			loading = false
		}
	};
</script>

<svelte:head>
	<title>Šťastné srdce - Účet</title>
	<meta name="description" content="Účet" />
</svelte:head>

<section>
	<div class="max-w-screen-lg px-4 py-16 mx-auto mt-20 mb-10 rounded-lg bg-stone-100">
		<h1 class="mb-10 text-5xl font-extrabold tracking-tight text-center text-gray-900">
			Profil účtu
		</h1>
		<!-- 
	<form
		class="form-widget"
		method="post"
		action="?/update"
		use:enhance={handleSubmit}
		bind:this={profileForm}
	>
		<div>
			<label for="email">Email</label>
			<input id="email" type="text" value={session.user.email} disabled />
		</div>

		<div>
			<label for="first_name">Full Name</label>
			
		</div>

		<div>
			<label for="username">Username</label>
			<input id="username" name="username" type="text" value={form?.username ?? username} />
		</div>

		<div>
			<label for="last_name">Website</label>
			<input id="last_name" name="last_name" type="text" value={form?.last_name ?? last_name} />
		</div>

		<div>
			<input
				type="submit"
				class="block button primary"
				value={loading ? "Loading..." : "Update"}
				disabled={loading}
			/>
		</div>
	</form>

	

 -->

		<form
			class="form-widget"
			method="post"
			action="?/update"
			use:enhance={handleSubmit}
			bind:this={profileForm}
		>
			<div class="max-w-4xl p-5 pb-2 mx-auto bg-white border-2 rounded-lg lg:mx-auto">
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
										value={form?.first_name ?? first_name}
										type="text"
										name="first_name"
										id="first_name"
										class="w-full px-4 py-2 text-base text-center bg-white border border-gray-300 rounded-lg shadow-sm appearance-none text-gray-aceholder-gray-400 focus:outline-none focus:border-green-600"
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
										value={form?.last_name ?? last_name}
										type="text"
										name="last_name"
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
										value={form?.telephone ?? telephone}
										type="text"
										name="telephone"
										id="telephone"
										class="w-full px-4 py-2 text-base text-center text-gray-700 placeholder-gray-400 bg-white border border-gray-300 rounded-lg shadow-sm appearance-none focus:outline-none focus:border-green-600"
										placeholder="Telefon"
									/>
								</div>
							</div>
							<hr class="w-32" />
						</div>
						<div class="mt-5" on:click={toggleVisible}>
							  {#if visible}
                    Méně
                {:else}
                    Více
                {/if}
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
												value={form?.street ?? street}												
												name="street"
												 type="text"
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
											value={form?.street_number ?? street_number}												
												 type="text"
												 name="street_number"
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
											value={form?.city ?? city}
												 type="text"
												 name="city"
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
											value={form?.company ?? company}												
												 type="text"
												 name="company"
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
											value={form?.ico ?? ico}												
												 type="text"
												 name="ico"
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
														value={form?.dic ?? dic}	
												 type="text"
												 name="dic"
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
								{loading ? "Ukládá se..." : "Uložit"}
							</button>
						</div>
					</div>
				</div>
			</div>
		</form>
		<!-- Orders -->
	 <div class="max-w-screen-lg px-4 py-16 mx-auto mt-20 mb-10 rounded-lg bg-stone-100">
			<h1 class="mb-10 text-5xl font-extrabold tracking-tight text-center text-gray-900">
				Objednávky
			</h1>
			<div class="max-w-4xl p-5 pb-2 mx-auto bg-white border-2 rounded-lg lg:mx-auto">
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
										Datum: {new Date(order.timestamp).toLocaleDateString("cs-CZ", {
											weekday: "short",
											month: "long",
											day: "numeric"
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
	</div>
</section>