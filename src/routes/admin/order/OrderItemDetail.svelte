<script lang="ts">
	export let order: any = {};
	export let formattedDate = "";
	export let date = "";
	export let isValidDate = true;
	export let selectedPaymentMethod = "";
	export let paymentMethodOptions = ["Hotově", "Online", "Dobírka"];
	export let selectedOrderState = "";
	export let orderStateOptions = ["Nová", "Expedovaná", "Vyfakturovaná"];
	export let selectedCurrency = "";
	export let currencyOptions = ["CZK", "EUR", "USD"];
	export let selectedShippingMethod = "";
	export let shippingMethodOptions = ["Osobní odběr", "Kurýr", "Česká pošta"];
	export let isPaid = false;

	// Fakturační údaje

	export let customer_email = "";
	export let customer_first_name = "";
	export let customer_last_name = "";
	export let customer_street = "";
	export let customer_street_number = "";
	export let customer_city = "";
	export let customer_zip_code = "";
	export let customer_telephone = "";

	// Dodací údaje
	export let delivery_first_name = "";
	export let delivery_last_name = "";
	export let delivery_street = "";
	export let delivery_street_number = "";
	export let delivery_city = "";
	export let delivery_zip_code = "";
	export let delivery_telephone = "";

	function handleDateInput(event) {
		const enteredDate = event.target.value;
		const isValid = validateDate(enteredDate);

		if (isValid) {
			date = formatDateForSupabase(enteredDate);
			isValidDate = true;
		} else {
			isValidDate = false;
		}
	}

	function validateDate(inputDate: string): boolean {
		const datePattern = /^(0[1-9]|[12]\d|3[01])-(0[1-9]|1[0-2])-\d{4}$/;
		return datePattern.test(inputDate);
	}

	function formatDateForSupabase(inputDate: string): string {
		const [day, month, year] = inputDate.split("-");
		return `${year}-${month}-${day}`;
	}
</script>

<!--Základní údaje-->
<div>
	<div
		class="border-black collapse collapse-plus bg-base-200 p-5 border shadow-xl rounded-lg">
		<input type="checkbox" checked="checked" />
		<div class="collapse-title text-xl font-medium">Základní údaje</div>
		<div class="collapse-content">
			<div class="form-control w-full mb-2">
				<label class="label">
					<span class="label-text">Číslo</span>
				</label>
				<input
					type="text"
					disabled
					placeholder=""
					readonly
					class="input input-bordered w-full !border-white !text-black"
					value={order?.order_number ?? ""} />
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
						<option value={state}>{state}</option>
					{/each}
				</select>
			</div>

			<div class="collapse">
				<input type="checkbox" />
				<div class="collapse-title text-lg font-medium">Platební údaje</div>
				<div class="collapse-content">
					<div class="form-control w-full mb-2">
						<label class="label">
							<span class="label-text">Způsob platby</span>
						</label>
						<select
							class="select select-bordered w-full"
							bind:value={selectedPaymentMethod}>
							{#each paymentMethodOptions as method}
								<option value={method}>{method}</option>
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
								<option value={currency}>{currency}</option>
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
								<option value={method}>{method}</option>
							{/each}
						</select>
					</div>

					<div class="form-control w-full mb-2">
						<label class="label">
							<span class="label-text">Stav platby</span>
						</label>
						<select class="select select-bordered w-full" bind:value={isPaid}>
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
<div>
	<div
		class="border-black collapse collapse-plus bg-base-200 p-5 border shadow-xl rounded-lg">
		<input type="checkbox" checked="checked" />
		<div class="collapse-title text-xl font-medium">Fakturační údaje</div>
		<div class="collapse-content">
			<div class="form-control w-full mb-2">
				<label class="label">
					<span class="label-text">E-mail</span>
				</label>
				<input
					type="text"
					disabled
					placeholder="E-mail"
					class="input input-bordered w-full !border-white !text-black"
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
<div>
	<div
		class="border-black collapse collapse-plus bg-base-200 p-5 border shadow-xl rounded-lg">
		<input type="checkbox" />
		<div class="collapse-title text-xl font-medium">Dodací údaje</div>
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
