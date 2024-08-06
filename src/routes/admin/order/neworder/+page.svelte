<script lang="ts">
	import { onMount } from "svelte";
	import { createEventDispatcher } from "svelte";
	import { goto } from "$app/navigation";

	export let data;
	let { session, supabase } = data;
	$: ({ session, supabase } = data);

	let loading = false;
	let date: string = "";
	let order_number: number = 0;	
	let customer_first_name: string = "";
	let customer_last_name: string = "";
	let customer_street: string = "";
	let customer_street_number: string = "";
	let customer_city: string = "";
	let customer_zip_code: string = "";
	let customer_email: string = "";
	let customer_telephone: string = "";
	let delivery_first_name: string = "";
	let delivery_last_name: string = "";
	let delivery_street_number: string = "";
	let delivery_street: string = "";
	let delivery_telephone: string = "";
	let delivery_zip_code: string = "";
	let delivery_city: string = "";
	let currency: string = "";
	// let shipping_method: string = "";
	let itemId: string = "";
	let formattedDate: string = "";
	let selectedPaymentMethod: string = "";
	let paymentMethodOptions = ["Hotově", "Online", "Dobírka"];
	let selectedOrderState: string = "";
	let orderStateOptions = ["Přijata", "Expedována", "Vyfakturována"];
	let selectedCurrency: string = "";
	let currencyOptions = ["CZK", "EUR", "USD"];
	let selectedShippingMethod: string = "";
	let shippingMethodOptions = ["Osobní odběr", "Kurýr", "Česká pošta"];

	let isPaid: boolean = false;

	let isValidDate: boolean = true;
	let isEditingDate = false;

	function handleDateInput(event) {
		const enteredDate = event.target.value;
		const isValid = validateDate(enteredDate);

		if (isValid) {
			date = formatDateForSupabase(enteredDate);
			isValidDate = true;
		} else {
			isValidDate = false;
		}
		isEditingDate = true;
	}

	function validateDate(inputDate: string): boolean {
		const datePattern = /^(0[1-9]|[12]\d|3[01])-(0[1-9]|1[0-2])-\d{4}$/;
		return datePattern.test(inputDate);
	}

	function formatDateForSupabase(inputDate: string): string {
		const [day, month, year] = inputDate.split("-");
		return `${year}-${month}-${day}`;
	}

	function formatSupabaseDate(inputDate: string) {
		if (!inputDate) return "";
		const [year, month, day] = inputDate.split("-");
		return `${day}-${month}-${year}`;
	}

	function back() {
		goto("/order");
	}
	async function createOrder() {
		try {
			loading = true;
			const { user } = session;

			const createOrderData = {
				created_at: new Date().toISOString(),
				date: date ? new Date(date).toISOString() : null,
				currency,
				shipping_method: selectedShippingMethod,
				pay_method: selectedPaymentMethod,
				state: selectedOrderState,
				customer_first_name,
				customer_last_name,
				customer_street,
				customer_street_number,
				customer_city,
				customer_zip_code,
				customer_telephone,
				customer_email,				
				pay_state: isPaid,
				delivery_first_name,
				delivery_last_name,
				delivery_street_number,
				delivery_street,
				delivery_telephone,
				delivery_zip_code,
				delivery_city,
				user_id: user?.id
			};

			console.log(createOrderData);

			let { error } = await supabase.from("orders").insert(createOrderData);
			if (error) throw error;
			console.log("Order created successfully!");
			goto("/order", { replaceState: true });
		} catch (error) {
			if (error instanceof Error) {
				alert(error.message);
			}
		} finally {
			loading = false;
		}
	}
	// Testy
	// ---------------
</script>

<svelte:head>
	<title>LEO - Nová objednávka</title>
</svelte:head>
<div class="relative p-5 overflow-x-auto shadow-md sm:rounded-lg">
	<div class="flex justify-between">
		<div>
			<button
				value={loading ? "Tvořím..." : "Vytvořeno"}
				disabled={loading}
				type="submit"
				on:click={back}
				class="w-full p-4 px-5 border rounded-xl hover:bg-slate-100"
				>Zpět</button>
		</div>
		<div class="flex flex-col gap-2 md:flex-row">
			<div>
				<button
					value={loading ? "Tvořím..." : "Vytvořeno"}
					disabled={loading}
					type="submit"
					on:click={createOrder}
					class="w-full p-4 px-5 border rounded-xl hover:bg-slate-100"
					>Vytvoř</button>
			</div>
		</div>
	</div>
	<hr class="h-px my-8 bg-gray-200 border-0 dark:bg-gray-700" />

	<div class="antialiased bg-white sans-serif">
		<div class="md:py-6 md:px-4">
			<div class="flex justify-between">
				<h2 class="pb-2 mb-6 text-2xl font-bold tracking-wider uppercase">
					Objednávka
				</h2>
				<div />
			</div>

			<div class="justify-between mb-8 md:flex">
				<div class="md:md:w-2/4">
					<div class="items-center mb-2 md:mb-1 md:flex">
						<label
							class="block w-full text-sm font-bold tracking-wide text-gray-800 uppercase md:w-32"
							>Číslo</label>
						<span class="hidden inline-block mr-4 md:block">:</span>
						<div class="flex-1">
							<input
								class="w-full px-4 py-2 leading-tight text-gray-700 bg-gray-200 border-2 border-gray-200 rounded appearance-none md:w-48 focus:outline-none"
								type="text"
								placeholder=""
								readonly
								bind:value={order_number} />
						</div>
					</div>

					<div class="items-center mb-2 md:mb-1 md:flex">
						<label
							class="block w-full text-sm font-bold tracking-wide text-gray-800 uppercase md:w-32"
							>Datum</label>
						<span class="hidden inline-block mr-4 md:block">:</span>
						<div class="flex-1">
							<input
								class="w-full px-4 py-2 leading-tight text-gray-700 bg-gray-200 border-2 border-gray-200 rounded appearance-none md:w-48 focus:outline-none focus:bg-white"
								type="text"
								placeholder="DD-MM-YYYY"
								autocomplete="off"
								bind:value={formattedDate}
								on:input={handleDateInput}
								class:invalid={!isValidDate} />
						</div>
					</div>

					<div class="items-center mb-2 md:mb-1 md:flex">
						<label
							class="block w-full text-sm font-bold tracking-wide text-gray-800 uppercase md:w-32"
							>Stav</label>
						<span class="hidden inline-block mr-4 md:block">:</span>
						<div class="flex-2">
							<!-- <input class="w-full px-4 py-2 leading-tight text-gray-700 bg-gray-200 border-2 border-gray-200 rounded appearance-none md:w-48 focus:outline-none focus:bg-white" type="text" placeholder="" autocomplete="off" readonly /> -->
							<select
								class="w-full px-4 py-2 leading-tight text-gray-700 bg-gray-200 border-2 border-gray-200 rounded appearance-none md:w-48 focus:outline-none focus:bg-white"
								bind:value={selectedOrderState}>
								<!-- on:change={updateOrder} -->
								{#each orderStateOptions as category}
									<option value={category}>
										{category}
									</option>
								{/each}
							</select>
						</div>
					</div>
				</div>
				<div class="md:md:w-2/4">
					<div class="items-center mb-2 md:mb-1 md:flex">
						<label
							class="block w-full text-sm font-bold tracking-wide text-gray-800 uppercase md:w-32"
							>Způsob platby</label>
						<span class="hidden inline-block mr-4 md:block">:</span>
						<div class="flex-1">
							<select
								class="w-full px-4 py-2 leading-tight text-gray-700 bg-gray-200 border-2 border-gray-200 rounded appearance-none md:w-48 focus:outline-none focus:bg-white"
								bind:value={selectedPaymentMethod}>
								{#each paymentMethodOptions as category}
									<option value={category}>
										{category}
									</option>
								{/each}
							</select>
						</div>
					</div>
					<div class="items-center mb-2 md:mb-1 md:flex">
						<label
							class="block w-full text-sm font-bold tracking-wide text-gray-800 uppercase md:w-32"
							>Měna</label>
						<span class="hidden inline-block mr-4 md:block">:</span>
						<div class="flex-1">
							<select
								name=""
								id=""
								class="w-full px-4 py-2 leading-tight text-gray-700 bg-gray-200 border-2 border-gray-200 rounded appearance-none md:w-48 focus:outline-none focus:bg-white"
								bind:value={selectedCurrency}>
								{#each currencyOptions as category}
									<option value={category}>
										{category}
									</option>
								{/each}
							</select>
						</div>
					</div>

					<div class="items-center mb-2 md:mb-1 md:flex">
						<label
							class="block w-full text-sm font-bold tracking-wide text-gray-800 uppercase md:w-32"
							>Doprava</label>
						<span class="hidden inline-block mr-4 md:block">:</span>
						<div class="flex-1">
							<select
								class="w-full px-4 py-2 leading-tight text-gray-700 bg-gray-200 border-2 border-gray-200 rounded appearance-none md:w-48 focus:outline-none focus:bg-white"
								id=""
								bind:value={selectedShippingMethod}>
								{#each shippingMethodOptions as category}
									<option value={category}>
										{category}
									</option>
								{/each}
							</select>
						</div>
					</div>
				</div>

				<div class="md:w-2/4">
					<div class="items-center mb-2 md:mb-1 md:flex">
						<label
							class="block w-full text-sm font-bold tracking-wide text-gray-800 uppercase md:w-32"
							>Uhrazeno</label>
						<span class="hidden inline-block mr-4 md:block">:</span>
						<div class="flex-2">
							<select
								class="w-full px-4 py-2 leading-tight text-gray-700 bg-gray-200 border-2 border-gray-200 rounded appearance-none md:w-48 focus:outline-none focus:bg-white"
								bind:value={isPaid}>
								<option value={false}>Ne</option>
								<option value={true}>Ano</option>
							</select>
						</div>
					</div>
					<div class="items-center mb-2 md:mb-1 md:flex">
						<label
							class="block w-full text-sm font-bold tracking-wide text-gray-800 uppercase md:w-32"
							>?</label>
						<span class="hidden inline-block mr-4 md:block">:</span>
						<div class="flex-1">
							<input
								class="w-full px-4 py-2 leading-tight text-gray-700 bg-gray-200 border-2 border-gray-200 rounded appearance-none md:w-48 focus:outline-none focus:bg-white"
								type="text"
								id="datepicker1"
								placeholder=""
								autocomplete="off"
								readonly />
						</div>
					</div>

					<div class="items-center mb-2 md:mb-1 md:flex">
						<label
							class="block w-full text-sm font-bold tracking-wide text-gray-800 uppercase md:w-32"
							>?</label>
						<span class="hidden inline-block mr-4 md:block">:</span>
						<div class="flex-1">
							<input
								class="w-full px-4 py-2 leading-tight text-gray-700 bg-gray-200 border-2 border-gray-200 rounded appearance-none md:w-48 focus:outline-none focus:bg-white"
								type="text"
								placeholder=""
								autocomplete="off"
								readonly />
						</div>
					</div>
				</div>
			</div>

			<div class="mb-8 md:flex md:flex-wrap md:justify-between">
				<div class="w-full mb-2 md:w-1/3 md:mb-0">
					<label
						class="block mb-1 text-sm font-bold tracking-wide text-gray-800 uppercase"
						>Fakturační adresa</label>
					<input
						class="w-full px-4 py-2 mb-1 leading-tight text-gray-700 bg-gray-200 border-2 border-gray-200 rounded appearance-none focus:outline-none focus:bg-white"
						type="text"
						bind:value={customer_first_name}
						placeholder="Jméno" />
					<input
						class="w-full px-4 py-2 mb-1 leading-tight text-gray-700 bg-gray-200 border-2 border-gray-200 rounded appearance-none focus:outline-none focus:bg-white"
						type="text"
						bind:value={customer_last_name}
						placeholder="Příjmení" />
					<input
						class="w-full px-4 py-2 mb-1 leading-tight text-gray-700 bg-gray-200 border-2 border-gray-200 rounded appearance-none focus:outline-none focus:bg-white"
						type="text"
						bind:value={customer_street}
						placeholder="Ulice" />
					<input
						class="w-full px-4 py-2 mb-1 leading-tight text-gray-700 bg-gray-200 border-2 border-gray-200 rounded appearance-none focus:outline-none focus:bg-white"
						type="text"
						bind:value={customer_street_number}
						placeholder="Číslo" />
					<input
						class="w-full px-4 py-2 mb-1 leading-tight text-gray-700 bg-gray-200 border-2 border-gray-200 rounded appearance-none focus:outline-none focus:bg-white"
						type="text"
						bind:value={customer_city}
						placeholder="Město" />
					<input
						class="w-full px-4 py-2 mb-1 leading-tight text-gray-700 bg-gray-200 border-2 border-gray-200 rounded appearance-none focus:otline-none focus:bg-white"
						type="text"
						bind:value={customer_zip_code}
						placeholder="PSČ" />
					<input
						class="w-full px-4 py-2 mb-1 leading-tight text-gray-700 bg-gray-200 border-2 border-gray-200 rounded appearance-none focus:otline-none focus:bg-white"
						type="text"
						bind:value={customer_telephone}
						placeholder="Telefon" />
				</div>
				<div class="w-full md:w-1/3">
					<label
						class="block mb-1 text-sm font-bold tracking-wide text-gray-800 uppercase"
						>Dodací adresa</label>
					<input
						class="w-full px-4 py-2 mb-1 leading-tight text-gray-700 bg-gray-200 border-2 border-gray-200 rounded appearance-none focus:outline-none focus:bg-white"
						type="text"
						placeholder="Jméno"
						bind:value={delivery_first_name} />
					<input
						class="w-full px-4 py-2 mb-1 leading-tight text-gray-700 bg-gray-200 border-2 border-gray-200 rounded appearance-none focus:outline-none focus:bg-white"
						type="text"
						placeholder="Příjmení"
						bind:value={delivery_last_name} />
					<input
						class="w-full px-4 py-2 mb-1 leading-tight text-gray-700 bg-gray-200 border-2 border-gray-200 rounded appearance-none focus:outline-none focus:bg-white"
						type="text"
						placeholder="Ulice"
						bind:value={delivery_street} />
					<input
						class="w-full px-4 py-2 mb-1 leading-tight text-gray-700 bg-gray-200 border-2 border-gray-200 rounded appearance-none focus:outline-none focus:bg-white"
						type="text"
						placeholder="Číslo"
						bind:value={delivery_street_number} />
					<input
						class="w-full px-4 py-2 mb-1 leading-tight text-gray-700 bg-gray-200 border-2 border-gray-200 rounded appearance-none focus:outline-none focus:bg-white"
						type="text"
						placeholder="Město"
						bind:value={delivery_city} />
					<input
						class="w-full px-4 py-2 mb-1 leading-tight text-gray-700 bg-gray-200 border-2 border-gray-200 rounded appearance-none focus:outline-none focus:bg-white"
						type="text"
						placeholder="PSČ"
						bind:value={delivery_zip_code} />
					<input
						class="w-full px-4 py-2 mb-1 leading-tight text-gray-700 bg-gray-200 border-2 border-gray-200 rounded appearance-none focus:outline-none focus:bg-white"
						type="text"
						placeholder="Telefon"
						bind:value={delivery_telephone} />
				</div>
			</div>
		</div>

		<button
			class="px-4 py-2 mt-6 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-100">
			Připojit dokument
		</button>

		<div class="w-full py-2 mt-5 ml-auto sm:md:w-2/4 lg:w-1/4">
			<div class="flex justify-between mb-3">
				<div class="flex-1 text-right text-gray-800">Celkový součet</div>
				<div class="text-right md:w-40">
					<div class="font-medium text-gray-800" />
				</div>
			</div>
			<div class="flex justify-between mb-4">
				<div class="flex-1 text-sm text-right text-gray-600">
					Včetně daně (21%)
				</div>
				<div class="text-right md:w-40">
					<div class="text-sm text-gray-600" />
				</div>
			</div>
			<div class="py-2 border-t border-b">
				<div class="flex justify-between">
					<div class="flex-1 text-xl text-right text-gray-600">1 ,-</div>
					<div class="text-right md:w-40">
						<div class="text-xl font-bold text-gray-800" />
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	.date-input {
		background-color: #fff;
		border-radius: 10px;
		padding: 0.5rem 1rem;
		z-index: 2000;
		margin: 3px 0 0 0;
		border-top: 1px solid #eee;
		box-shadow:
			0 10px 15px -3px rgba(0, 0, 0, 0.1),
			0 4px 6px -2px rgba(0, 0, 0, 0.05);
	}
	.date-input.is-hidden {
		display: none;
	}
	.date-input .pika-title {
		padding: 0.5rem;
		width: 100%;
		text-align: center;
	}
	.date-input .pika-prev,
	.date-input .pika-next {
		margin-top: 0;
		/* margin-top: 0.5rem; */
		padding: 0.2rem 0;
		cursor: pointer;
		color: #4299e1;
		text-transform: uppercase;
		font-size: 0.85rem;
	}
	.date-input .pika-prev:hover,
	.date-input .pika-next:hover {
		text-decoration: underline;
	}
	.date-input .pika-prev {
		float: left;
	}
	.date-input .pika-next {
		float: right;
	}
	.date-input .pika-label {
		display: inline-block;
		font-size: 0;
	}
	.date-input .pika-select-month,
	.date-input .pika-select-year {
		display: inline-block;
		border: 1px solid #ddd;
		color: #444;
		background-color: #fff;
		border-radius: 10px;
		font-size: 0.9rem;
		padding-left: 0.5em;
		padding-right: 0.5em;
		padding-top: 0.25em;
		padding-bottom: 0.25em;
		appearance: none;
	}
	.date-input .pika-select-month:focus,
	.date-input .pika-select-year:focus {
		border-color: #cbd5e0;
		outline: none;
	}
	.date-input .pika-select-month {
		margin-right: 0.25em;
	}
	.date-input table {
		width: 100%;
		border-collapse: collapse;
		margin-bottom: 0.2rem;
	}
	.date-input table th {
		width: 2em;
		height: 2em;
		font-weight: normal;
		color: #718096;
		text-align: center;
	}
	.date-input table th abbr {
		text-decoration: none;
	}
	.date-input table td {
		padding: 2px;
	}
	.date-input table td button {
		/* border: 1px solid #e2e8f0; */
		width: 1.8em;
		height: 1.8em;
		text-align: center;
		color: #555;
		border-radius: 10px;
	}
	.date-input table td button:hover {
		background-color: #bee3f8;
	}
	.date-input table td.is-today button {
		background-color: #ebf8ff;
	}
	.date-input table td.is-selected button {
		background-color: #3182ce;
	}
	.date-input table td.is-selected button {
		color: white;
	}
	.date-input table td.is-selected button:hover {
		color: white;
	}
</style>
