<script lang="ts">
	import { onMount } from "svelte";
	import { enhance } from "$app/forms";
	import type { SubmitFunction } from "@sveltejs/kit";
	import { fade } from "svelte/transition";

	export let data;
	export let form;
	let { session, supabase, profile, orders } = data;
	$: ({ session, supabase, profile, orders } = data);
	// console.log(data)
	// console.log(data.session)
	console.log("Obj:", orders);

	let visible: boolean = false;
	let expandedOrders: { [key: string]: boolean } = {};
	let selectedOrderId: string | null = null;

	const toggleVisible = () => {
		visible = !visible;
	};

	function toggleOrderDetails(orderId: string) {
		if (selectedOrderId === orderId) {
			selectedOrderId = null;
		} else {
			selectedOrderId = orderId;
		}
		expandedOrders[orderId] = !expandedOrders[orderId];
	}

	function formatDate(dateString: string): string {
		return new Date(dateString).toLocaleDateString("cs-CZ", {
			year: "numeric",
			month: "long",
			day: "numeric"
		});
	}

	let profileForm: HTMLFormElement;
	let loading = false;
	let username: string = profile?.username ?? "";
	let first_name: string = profile?.first_name ?? "";
	let last_name: string = profile?.last_name ?? "";
	let telephone: string = profile?.telephone ?? "";
	let street: string = profile?.street ?? "";
	let street_number: string = profile?.street_number ?? "";
	let city: string = profile?.city ?? "";
	let ico: string = profile?.ico ?? "";
	let dic: string = profile?.dic ?? "";
	let company: string = profile?.company ?? "";
	let zip_code: string = profile?.zip ?? "";

	const handleSubmit: SubmitFunction = () => {
		loading = true;
		return async () => {
			loading = false;
		};
	};
</script>

<svelte:head>
	<title>Šťastné srdce - Účet</title>
	<meta name="description" content="Účet" />
</svelte:head>

<section>
	<div
		class="max-w-screen-lg px-4 py-16 mx-auto mt-20 mb-10 rounded-lg bg-stone-100">
		<h1
			class="mb-10 text-5xl font-extrabold tracking-tight text-center text-gray-900">
			Profil účtu
		</h1>
		<form
			class="form-widget"
			method="post"
			action="?/update"
			use:enhance={handleSubmit}
			bind:this={profileForm}>
			<div
				class="max-w-4xl p-5 pb-2 mx-auto bg-white border-2 rounded-lg lg:mx-auto">
				<div
					class="mb-8 text-xl font-light text-center text-gray-500 lg:mb-16 dark:text-gray-400 md:text-lg">
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
									placeholder="Email" />
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
										class="w-full px-4 py-2 text-base text-center text-gray-700 placeholder-gray-400 bg-white border border-gray-300 rounded-lg shadow-sm appearance-none focus:outline-none focus:border-green-600"
										required
										placeholder="Jméno" />
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
										placeholder="Příjmení" />
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
										placeholder="Telefon" />
								</div>
							</div>
							<hr class="w-32" />
						</div>
						<div class="flex justify-center mt-5" on:click={toggleVisible}>
							{#if visible}
								<div><p class="w-24 cursor-pointer">Méně</p></div>
							{:else}
								<div>
									<p
										class="w-36 cursor-pointer lg:tooltip"
										data-tip="Klikni pro více informací">
										Více informací
									</p>
								</div>
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
												placeholder="Ulice" />
										</div>
									</div>
									<hr class="w-32" />
								</div>
								<div class="my-2">
									<div class="flex flex-col items-center md:flex-row">
										<div class="flex justify-start basis-1/2">
											<label class="pr-2" for="street_number"
												>Číslo popisné</label>
										</div>
										<div class="w-full basis-1/2">
											<input
												value={form?.street_number ?? street_number}
												type="text"
												name="street_number"
												id="street_number"
												class="w-full px-4 py-2 text-base text-center text-gray-700 placeholder-gray-400 bg-white border border-gray-300 rounded-lg shadow-sm appearance-none focus:outline-none focus:border-green-600"
												placeholder="Číslo popisné" />
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
												class="w-full px-4 py-2 text-base text-center text-gray-700 placeholder-gray-400 bg-white border border-gray-300 rounded-lg shadow-sm appearance-none focus:outline-none focus:border-green-600"
												placeholder="Město" />
										</div>
									</div>
									<hr class="w-32" />
								</div>
								<div class="my-2">
									<div class="flex flex-col items-center md:flex-row">
										<div class="flex justify-start basis-1/2">
											<label class="pr-2" for="city">PSČ</label>
										</div>
										<div class="w-full basis-1/2">
											<input
												value={form?.city ?? zip_code}
												type="text"
												name="zip_code"
												id="zip_code"
												class="w-full px-4 py-2 text-base text-center text-gray-700 placeholder-gray-400 bg-white border border-gray-300 rounded-lg shadow-sm appearance-none focus:outline-none focus:border-green-600"
												placeholder="PSČ" />
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
												placeholder="Firma" />
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
												placeholder="IČO" />
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
												placeholder="DIČ" />
										</div>
									</div>
									<hr class="w-32" />
								</div>
							</div>
						{/if}
						<div class="mt-10">
							<button
								type="submit"
								class="w-full px-4 py-2 text-base font-semibold text-center text-white transition duration-200 ease-in-out transform bg-green-800 rounded-lg shadow-md hover:scale-105"
								disabled={loading}>
								{loading ? "Ukládá se..." : "Uložit"}
							</button>
						</div>
					</div>
				</div>
			</div>
		</form>
	</div>
	<!-- Orders -->
	<div
		class="max-w-screen-lg px-4 py-16 mx-auto mt-20 mb-10 rounded-lg bg-stone-100">
		<h1
			class="mb-10 text-5xl font-extrabold tracking-tight text-center text-gray-900">
			Objednávky
		</h1>
		<div>
			{#if !orders || orders.length === 0}
				<p>Žádné objednávky</p>
			{:else}
				<ul class="space-y-4">
					{#each orders as order}
						<li class="border p-4 rounded-lg odd:bg-gray-200 even:bg-gray-100">
							<button
								class="w-full text-left transition-all duration-300 ease-in-out"
								class:underline={selectedOrderId === order.id}
								class:text-xl={selectedOrderId === order.id}
								on:click={() => toggleOrderDetails(order.id)}>
								Objednávka <strong>{order.order_number}</strong> zde dne {formatDate(
									order.created_at
								)}
							</button>
							{#if expandedOrders[order.id]}
								<div class="border p-5 rounded-xl bg-white">
									<p>
										<strong>Celková cena:</strong>
										{order.total_price}
										{order.currency}
									</p>
									<p><strong>Stav:</strong> {order.state}</p>
								</div>
								<h3 class="mt-2">Položky:</h3>
								{#each order.grouped_items as group}
									<div class="mb-4 border p-5 rounded-xl bg-white">
										<h4 class="font-semibold underline">
											Menu ze dne: {formatDate(group.date)}
										</h4>
										<p class="py-2">
											<strong>Polévka:</strong>
											{group.items[0].variant.menu.soup}
										</p>
										<ul class="list-disc pl-4">
											{#each group.items as item}
												<strong>Varianta:</strong>
												{item.variant.variant_number} - {item.variant
													.description}<br />
												<strong>Cena:</strong>
												{item.price}<br />
												<strong>Množství:</strong>
												{item.quantity}
												<br /> <br />
											{/each}
										</ul>
									</div>
								{/each}
							{/if}
						</li>
					{/each}
				</ul>
			{/if}
		</div>
	</div>
</section>
