<script lang="ts">
	import { fade, fly } from "svelte/transition";
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
		goto("/admin/order");
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


<div
	class="relative p-5 overflow-x-auto shadow-lg sm:rounded-lg border"
	in:fly={{ y: 50, duration: 500 }}>
	<section>
		<div class="flex justify-between items-center mb-4">
			<button on:click={back} class="btn btn-outline">Zpět</button>
			<div class="flex flex-col gap-2 md:flex-row">
				<div>
					<button
						value={loading ? "Tvořím..." : "Vytvořeno"}
						disabled={loading}
						type="submit"
						on:click={createOrder}
						class="btn btn-outline">
						Vytvoř
					</button>
				</div>
			</div>
		</div>
	</section>

	<div class="divider"></div>

	<section>
		<div class="bg-base-100">
			<div class="py-6 px-4">
				<h2 class="text-2xl font-bold mb-6">Objednávka</h2>

				<div class="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">

					<!--Základní údaje-->
					<div in:fly={{ x: -50, duration: 500, delay: 200 }}>
						<div
							class="border-black collapse collapse-plus bg-base-200 p-5 border shadow-xl rounded-lg">
							<input type="checkbox" checked="checked" />
							<div class="collapse-title text-xl font-medium">
								Základní údaje
							</div>
							<div class="collapse-content">
								<div class="form-control w-full mb-2">
									<label class="label">
										<span class="label-text">Číslo</span>
									</label>
									<input
										type="text"
										placeholder=""
										readonly
										class="input input-bordered w-full"
										bind:value={order_number} />
								</div>

								<div class="form-control w-full mb-2">
									<label class="label">
										<span class="label-text">Datum</span>
									</label>
									<input
										type="text"
										placeholder="DD-MM-YYYY"
										autocomplete="off"
										class="input input-bordered w-full"
										class:input-error={!isValidDate}
										bind:value={formattedDate}
										on:input={handleDateInput} />
								</div>

								<div class="form-control w-full mb-2">
									<label class="label">
										<span class="label-text">Stav</span>
									</label>
									<select
										class="select select-bordered w-full"
										bind:value={selectedOrderState}>
										{#each orderStateOptions as state}
											<option value={state}>
												{state}
											</option>
										{/each}
									</select>
								</div>
								<div class="collapse">
									<input type="checkbox" />
									<div class="collapse-title text-lg font-medium">
										Platební údaje
									</div>
									<div class="collapse-content">
										<div class="form-control w-full mb-2">
											<label class="label">
												<span class="label-text">Způsob platby</span>
											</label>
											<select
												class="select select-bordered w-full"
												bind:value={selectedPaymentMethod}>
												{#each paymentMethodOptions as method}
													<option value={method}>
														{method}
													</option>
												{/each}
											</select>
										</div>

										<div class="form-control w-full mb-2">
											<label class="label">
												<span class="label-text">Měna</span>
											</label>
											<select
												class="select select-bordered w-full"
												bind:value={selectedCurrency}>
												{#each currencyOptions as currency}
													<option value={currency}>
														{currency}
													</option>
												{/each}
											</select>
										</div>

										<div class="form-control w-full mb-2">
											<label class="label">
												<span class="label-text">Doprava</span>
											</label>
											<select
												class="select select-bordered w-full"
												bind:value={selectedShippingMethod}>
												{#each shippingMethodOptions as method}
													<option value={method}>
														{method}
													</option>
												{/each}
											</select>
										</div>

										<div class="form-control w-full mb-2">
											<label class="label">
												<span class="label-text">Stav platby</span>
											</label>
											<select
												class="select select-bordered w-full"
												bind:value={isPaid}>
												<option value={false}>Neuhrazena</option>
												<option value={true}>Uhrazena</option>
											</select>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>

					<!--Fakturační-->
					<div in:fly={{ x: -50, duration: 500, delay: 600 }}>
						<div class="border-black collapse collapse-plus bg-base-200 p-5 border shadow-xl rounded-lg">
							<input type="checkbox" checked="checked" />
							<div class="collapse-title text-xl font-medium">
								Fakturační údaje
							</div>
							<div class="collapse-content">
								<div class="form-control w-full mb-2">
									<label class="label">
										<span class="label-text">E-mail</span>
									</label>
									<input
										type="text"
										placeholder="E-mail"
										class="input input-bordered w-full"
										bind:value={customer_email} />
								</div>
								<div class="form-control w-full mb-2">
									<label class="label">
										<span class="label-text">Jméno</span>
									</label>
									<input
										type="text"
										placeholder="Jméno"
										class="input input-bordered w-full"
										bind:value={customer_first_name} />
								</div>
								<div class="form-control w-full mb-2">
									<label class="label">
										<span class="label-text">Příjmení</span>
									</label>
									<input
										type="text"
										placeholder="Příjmení"
										class="input input-bordered w-full"
										bind:value={customer_last_name} />
								</div>
								<div class="collapse">
									<input type="checkbox" />
									<div class="collapse-title text-lg font-medium">
										Další fakturační údaje
									</div>
									<div class="collapse-content">
										<div class="form-control w-full mb-2">
											<input
												type="text"
												placeholder="Ulice"
												class="input input-bordered w-full"
												bind:value={customer_street} />
										</div>
										<div class="form-control w-full mb-2">
											<input
												type="text"
												placeholder="Číslo"
												class="input input-bordered w-full"
												bind:value={customer_street_number} />
										</div>
										<div class="form-control w-full mb-2">
											<input
												type="text"
												placeholder="Město"
												class="input input-bordered w-full"
												bind:value={customer_city} />
										</div>
										<div class="form-control w-full mb-2">
											<input
												type="text"
												placeholder="PSČ"
												class="input input-bordered w-full"
												bind:value={customer_zip_code} />
										</div>
										<div class="form-control w-full mb-2">
											<input
												type="text"
												placeholder="Telefon"
												class="input input-bordered w-full"
												bind:value={customer_telephone} />
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>

					<!--Dodací adresa-->
					<div in:fly={{ x: 50, duration: 500, delay: 800 }}>
						<div class="border-black collapse collapse-plus bg-base-200 p-5 border shadow-xl rounded-lg">
							<input type="checkbox" />
							<div class="collapse-title text-xl font-medium">
								Dodací údaje
							</div>
							<div class="collapse-content">
								<div class="form-control w-full mb-2">
									<input
										type="text"
										placeholder="Jméno"
										class="input input-bordered w-full"
										bind:value={delivery_first_name} />
								</div>
								<div class="form-control w-full mb-2">
									<input
										type="text"
										placeholder="Příjmení"
										class="input input-bordered w-full"
										bind:value={delivery_last_name} />
								</div>
								<div class="form-control w-full mb-2">
									<input
										type="text"
										placeholder="Ulice"
										class="input input-bordered w-full"
										bind:value={delivery_street} />
								</div>
								<div class="form-control w-full mb-2">
									<input
										type="text"
										placeholder="Číslo"
										class="input input-bordered w-full"
										bind:value={delivery_street_number} />
								</div>
								<div class="form-control w-full mb-2">
									<input
										type="text"
										placeholder="Město"
										class="input input-bordered w-full"
										bind:value={delivery_city} />
								</div>
								<div class="form-control w-full mb-2">
									<input
										type="text"
										placeholder="PSČ"
										class="input input-bordered w-full"
										bind:value={delivery_zip_code} />
								</div>
								<div class="form-control w-full mb-2">
									<input
										type="text"
										placeholder="Telefon"
										class="input input-bordered w-full"
										bind:value={delivery_telephone} />
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>
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
