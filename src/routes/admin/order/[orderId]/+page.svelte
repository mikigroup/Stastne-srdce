<script lang="ts">
	import { goto } from "$app/navigation";
	import { fade, fly } from "svelte/transition";

	export let data;
	let { session, supabase, order } = data;
	$: ({ session, supabase, order } = data);

	let loading = false;
	let date: string = order?.date ?? "";
	let order_number: number = order?.order_number ?? "";
	let state: string = order?.state ?? "";
	let customer_first_name: string = order?.customer_first_name ?? "";
	let customer_last_name: string = order?.customer_last_name ?? "";
	let customer_street: string = order?.customer_street ?? "";
	let customer_street_number: string = order?.customer_street_number ?? "";
	let customer_city: string = order?.customer_city ?? "";
	let customer_zip_code: string = order?.customer_zip_code ?? "";
	let customer_email: string = order?.customer_email ?? "";
	let customer_telephone: string = order?.customer_telephone ?? "";
	let delivery_first_name: string = order?.delivery_first_name ?? "";
	let delivery_last_name: string = order?.delivery_last_name ?? "";
	let delivery_street_number: string = order?.delivery_street_number ?? "";
	let delivery_street: string = order?.delivery_street ?? "";
	let delivery_telephone: string = order?.delivery_telephone ?? "";
	let delivery_zip_code: string = order?.delivery_zip_code ?? "";
	let delivery_city: string = order?.delivery_city ?? "";
	let orderId: string = order?.id;
	let formattedDate = date ? formatSupabaseDate(date) : "";
	let selectedPaymentMethod: string = order?.pay_method;
	let paymentMethodOptions = ["Hotově", "Online", "Dobírka"];
	let selectedOrderState: string = order?.state;
	let orderStateOptions = ["Přijata", "Expedována", "Vyfakturována"];
	let selectedCurrency: string = order?.currency;
	let currencyOptions = ["CZK", "EUR", "USD"];
	let selectedShippingMethod: string = order?.shipping_method;
	let shippingMethodOptions = ["Osobní odběr", "Kurýr", "Česká pošta"];
	let isPaid: boolean = order?.pay_state || false;
	let note: string = order?.note ?? "";

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
				pay_method: selectedPaymentMethod,
				note
			};

			const { data, error } = await supabase
				.from("orders")
				.update(update)
				.eq("id", orderId)
				.select(
					"id, updated_at, order_number, state, customer_first_name, customer_last_name, customer_street, customer_street_number, customer_city, customer_zip_code, customer_telephone, customer_email, pay_state, delivery_first_name, delivery_last_name, delivery_street_number, delivery_street, delivery_telephone, delivery_zip_code, delivery_city, currency, note"
				);

			if (error) {
				console.error("Error saving:", error);
				throw error;
			} else {
				console.log("Order saved successfully!");
				updateMessage = "Order saved successfully!";
			}
		} catch (error) {
			if (error instanceof Error) {
				console.error("Error saving:", error);
				alert(error.message);
			}
		} finally {
			loading = false;
		}
	}

	async function deleteOrder() {
		try {
			loading = true;
			const { error } = await supabase.from("orders").delete().eq("id", orderId);

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
	class="relative p-5 overflow-x-auto shadow-lg sm:rounded-lg border"
	in:fly={{ y: 50, duration: 500 }}>
	<section>
		<div class="flex justify-between items-center mb-4">
			<button on:click={back} class="btn btn-outline">Zpět</button>
			{#if updateMessage}
				<div class="p-2 my-2 text-green-800 bg-green-200 rounded">
					{updateMessage}
				</div>
			{/if}
			<div class="flex flex-col gap-2 md:flex-row">
				<div>
					<button
						value={loading ? "Nahrává se..." : "Změněno"}
						disabled={loading}
						type="submit"
						on:click={updateOrder}
						class="btn btn-outline">
						Upravit
					</button>
				</div>
				<div>
					<button
						class="invisible w-full p-4 px-5 border rounded-xl hover:bg-slate-100"
						value={loading ? "Nahrává se..." : "Update"}
						disabled={loading}
						type="submit"
						on:click={deleteOrder}>
						Smazat
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

				<!--Položky:-->
				<div class="border-black p-4 border shadow-xl rounded-lg">
					<div class="font-medium text-lg mb-4">Položky objednávky</div>

					<div class="overflow-x-auto">
						<table class="table table-zebra w-full">
							<thead>
							<tr class="grid grid-cols-12 gap-4">
								<th>Výběr</th>
								<th>Pořadí</th>
								<th class="col-span-9">Název</th>
								<th>Množství</th>
							</tr>
							</thead>
							<tbody>
							{#each order.order_items as item, i}
								<tr class="hover grid grid-cols-12 gap-4">
									<td>
										<label>
											<input type="checkbox" class="checkbox" />
										</label>
									</td>
									<td>
										{i + 1}
									</td>
									<td class="col-span-9">
										<div class="flex items-center space-x-3">
											<div>
												<div class="font-bold">{item.variant_id.description}</div>
												<div class="text-sm opacity-50">{item.variant_id.menu_id.type}</div>
											</div>
										</div>
									</td>
									<td>{item.quantity}</td>
								</tr>
							{/each}
							</tbody>
							<tfoot>
							<tr class="grid grid-cols-3 gap-4">
								<th colspan="4"></th>
								<th class="text-right">Cena {order.order_items.reduce((sum, item) => sum + item.quantity * item.price, 0)} CZK a množství {order.order_items.reduce((sum, item) => sum + item.quantity,0)} </th>
							</tr>
							</tfoot>
						</table>
					</div>

					<div class="mt-4">
						<div class="text-sm text-gray-500">Počet položek: {order.order_items.length}</div>
					</div>
				</div>

			</div>
	</section>
</div>