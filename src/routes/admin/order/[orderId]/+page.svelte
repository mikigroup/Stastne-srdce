<script lang="ts">
	import { goto } from "$app/navigation";
	import { fade, fly } from "svelte/transition";

	export let data;
	let { session, supabase, orders } = data;
	$: ({ session, supabase, orders } = data);

	let loading = false;
	let date: string = orders?.date ?? "";
	let order_number: number = orders?.order_number ?? "";
	let state: string = orders?.state ?? "";
	let customer_first_name: string = orders?.customer_first_name ?? "";
	let customer_last_name: string = orders?.customer_last_name ?? "";
	let customer_street: string = orders?.customer_street ?? "";
	let customer_street_number: string = orders?.customer_street ?? "";
	let customer_city: string = orders?.customer_city ?? "";
	let customer_zip_code: string = orders?.customer_zip_code ?? "";
	let customer_email: string = orders?.customer_email ?? "";
	let customer_telephone: string = orders?.customer_telephone ?? "";
	let delivery_first_name: string = orders?.delivery_first_name ?? "";
	let delivery_last_name: string = orders?.delivery_last_name ?? "";
	let delivery_street_number: string = orders?.delivery_street_number ?? "";
	let delivery_street: string = orders?.delivery_street ?? "";
	let delivery_telephone: string = orders?.delivery_telephone ?? "";
	let delivery_zip_code: string = orders?.delivery_zip_code ?? "";
	let delivery_city: string = orders?.delivery_city ?? "";
	let itemId: string = orders?.id;
	let formattedDate = date ? formatSupabaseDate(date) : "";
	let selectedPaymentMethod: string = orders?.pay_method;
	let paymentMethodOptions = ["Hotově", "Online", "Dobírka"];
	let selectedOrderState: string = orders?.state;
	let orderStateOptions = ["Přijata", "Expedována", "Vyfakturována"];
	let selectedCurrency: string = orders?.currency;
	let currencyOptions = ["CZK", "EUR", "USD"];
	let selectedShippingMethod: string = orders?.shipping_method;
	let shippingMethodOptions = ["Osobní odběr", "Kurýr", "Česká pošta"];
	let isPaid: boolean = orders?.pay_state || false;

	let updateMessage = "";
	async function updateOrder() {
		try {
			loading = true;

			const update = {
				updated_at: new Date().toISOString(),
				date: date ? new Date(date).toISOString() : null,
				customer_first_name,
				customer_last_name,
				customer_street,
				customer_street_number,
				customer_city,
				customer_zip_code,
				customer_telephone,
				customer_email,
				state: selectedOrderState,
				pay_state: isPaid,
				delivery_first_name,
				delivery_last_name,
				delivery_street_number,
				delivery_street,
				delivery_telephone,
				delivery_zip_code,
				delivery_city,
				currency: selectedCurrency,
				shipping_method: selectedShippingMethod,
				pay_method: selectedPaymentMethod
			};

			console.log("Objednávka se ukládá s těmito daty:", update);

			const { data, error } = await supabase
				.from("orders")
				.update(update)
				.eq("id", itemId)
				.select(
					"id, updated_at, order_number, state, customer_first_name, customer_last_name, customer_street, customer_street_number, customer_city, customer_zip_code, customer_telephone, customer_email, pay_state, delivery_first_name, delivery_last_name, delivery_street_number, delivery_street, delivery_telephone, delivery_zip_code, delivery_city, currency"
				);
			if (error) {
				console.error("Chyba ukládání:", error);
				throw error;
			} else {
				console.log("Objednávka úspěšně uložena!");
				updateMessage = "Objednávka úspěšně uložena!";
			}
		} catch (error) {
			if (error instanceof Error) {
				console.error("Chyba ukládání:", error);
				alert(error.message);
			}
		} finally {
			loading = false;
		}
	}

	async function deleteOrder() {
		try {
			loading = true;
			const { error } = await supabase.from("orders").delete().eq("id", itemId);

			if (error) {
				console.error("Error deleting order:", error);
				throw error;
			} else {
				console.log("Order deleted successfully!");
				await goto("/order", { replaceState: true });
			}
		} catch (error) {
			if (error instanceof Error) {
				console.error("Error in Delete order:", error);
				alert(error.message);
			}
		} finally {
			loading = false;
		}
	}

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
		return `${day.padStart(2, "0")}-${month.padStart(2, "0")}-${year}`;
	}

	async function back() {
		await goto("/admin/order");
	}
</script>

<div
	class="relative p-5 overflow-x-auto shadow-lg sm:rounded-lg border "
	in:fly={{ y: 50, duration: 500 }}>
	<section>
		<div class="flex justify-between items-center mb-4">
			<button on:click={back} class="btn btn-outline">Zpět</button>
			{#if updateMessage}
				<div class="alert alert-success shadow-lg" transition:fade>
					<div>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-6 w-6 flex-shrink-0 stroke-current"
							fill="none"
							viewBox="0 0 24 24"
							><path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
						<span>{updateMessage}</span>
					</div>
				</div>
			{/if}
			<div class="flex gap-2">
				<button
					value={loading ? "Nahrává se..." : "Upraveno"}
					disabled={loading}
					type="submit"
					on:click={updateOrder}
					class="btn btn-outline">Upravit</button>
				<button
					class="btn btn-outline btn-error"
					value={loading ? "Nahrává se..." : "Update"}
					disabled={loading}
					type="submit"
					on:click={deleteOrder}>Smazat</button>
			</div>
		</div>
	</section>

	<div class="divider"></div>

	<section>
		<div class="bg-base-100">
			<div class="py-6 px-4">
				<h2 class="text-2xl font-bold mb-6">Objednávka</h2>

				<div class="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
					<div in:fly={{ x: -50, duration: 500, delay: 200 }}>
						<div class="border-black collapse collapse-plus bg-base-200 p-10 border shadow-xl">
							<input type="checkbox" name="my-accordion-1" checked="checked" />
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
							</div>
						</div>
					</div>

					<div in:fly={{ x: 50, duration: 500, delay: 400 }}>
						<div class="border-black collapse collapse-plus bg-base-200 p-10 border shadow-xl">
							<input type="checkbox" name="my-accordion-2" checked="checked" />
							<div class="collapse-title text-xl font-medium">
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
										<span class="label-text">Uhrazeno</span>
									</label>
									<select
										class="select select-bordered w-full"
										bind:value={isPaid}>
										<option value={false}>Ne</option>
										<option value={true}>Ano</option>
									</select>
								</div>
							</div>
						</div>
					</div>

					<div in:fly={{ x: -50, duration: 500, delay: 600 }}>
						<div class="border-black collapse collapse-plus bg-base-200 p-10 border shadow-xl">
							<input type="checkbox" />
							<div class="collapse-title text-xl font-medium">
								Fakturační údaje
							</div>
							<div class="collapse-content">
								<div class="form-control w-full mb-2">
									<input
										type="text"
										placeholder="Jméno"
										class="input input-bordered w-full"
										bind:value={customer_first_name} />
								</div>
								<div class="form-control w-full mb-2">
									<input
										type="text"
										placeholder="Příjmení"
										class="input input-bordered w-full"
										bind:value={customer_last_name} />
								</div>
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

					<div in:fly={{ x: 50, duration: 500, delay: 800 }}>
						<div class="border-black collapse collapse-plus bg-base-200 p-10 border shadow-xl">
							<input type="checkbox" />
							<div class="collapse-title text-xl font-medium">
								Dodací adresa
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

				<button class="btn btn-outline mt-6"> Připojit dokument </button>
			</div>
		</div>
	</section>
</div>
