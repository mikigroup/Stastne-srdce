<script lang="ts">
	export let order: any = {};
	export let formattedDate = "";
	export let date = "";
	export let isValidDate = true;
	export let selectedPaymentMethod = "";
	export let paymentMethods = ["Hotovost", "Faktura"];
	export let selectedOrderState = "";
	export let orderStates: Array<{name: string, color: string}> = [];
	export let selectedCurrency = "";
	export let currencies: Array<{code: string, name: string, symbol: string}> = [];
	export let selectedShippingMethod = "";
	export let shippingMethods: Array<{name: string, price: number}> = [];
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

	function handleDateInput(event: any) {
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

<div class="bg-white rounded-lg shadow-md p-6">
	<!-- Základní údaje ve dvou sloupcích -->
	<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
		<!-- Základní údaje objednávky -->
		<div class="space-y-4">
			<h3 class="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">Základní údaje</h3>
			
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1">Číslo objednávky</label>
					<input
						type="text"
						readonly
						disabled
						value={order?.order_number ?? ""}
						class="w-full px-3 py-2 border border-gray-300 rounded bg-gray-100 cursor-not-allowed" />
				</div>
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1">Datum</label>
					<input
						type="text"
						readonly
						disabled
						value={formattedDate}
						class="w-full px-3 py-2 border border-gray-300 rounded bg-gray-100 cursor-not-allowed" />
				</div>
			</div>

			<div>
				<label class="block text-sm font-medium text-gray-700 mb-1">Stav objednávky</label>
				<select
					bind:value={selectedOrderState}
					class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500">
					{#each orderStates as state}
						<option value={state}>{state}</option>
					{/each}
				</select>
			</div>
		</div>

		<!-- Fakturační údaje -->
		<div class="space-y-4">
			<h3 class="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">Fakturační údaje</h3>
			
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
					<input
						type="email"
						bind:value={customer_email}
						disabled
						placeholder="Email zákazníka"
						class="w-full px-3 py-2 border border-gray-300 rounded bg-gray-100 cursor-not-allowed" />
				</div>
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
					<input
						type="tel"
						bind:value={customer_telephone}
						placeholder="Telefon zákazníka"
						class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500" />
				</div>
			</div>

			<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1">Jméno</label>
					<input
						type="text"
						bind:value={customer_first_name}
						placeholder="Jméno zákazníka"
						class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500" />
				</div>
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1">Příjmení</label>
					<input
						type="text"
						bind:value={customer_last_name}
						placeholder="Příjmení zákazníka"
						class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500" />
				</div>
			</div>
		</div>
	</div>

	<!-- Doplňující informace ve třech sloupcích -->
	<div class="pt-6 border-t border-gray-200">
		<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
			<!-- Platební údaje -->
			<div class="space-y-4">
				<h4 class="font-medium text-gray-900">Platební údaje</h4>
				<div class="space-y-3">
					<div>
						<label class="block text-sm text-gray-600 mb-1">Způsob platby</label>
						<select
							bind:value={selectedPaymentMethod}
							class="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500">
							{#each paymentMethods as method}
								<option value={method}>{method}</option>
							{/each}
						</select>
					</div>
					<div class="grid grid-cols-2 gap-2">
						<div>
							<label class="block text-sm text-gray-600 mb-1">Měna</label>
							<select
								bind:value={selectedCurrency}
								class="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500">
								{#each currencies as currency}
									<option value={currency}>{currency}</option>
								{/each}
							</select>
						</div>
						<div>
							<label class="block text-sm text-gray-600 mb-1">Stav platby</label>
							<select 
								bind:value={isPaid}
								class="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500">
								<option value={false}>Neuhrazena</option>
								<option value={true}>Uhrazena</option>
							</select>
						</div>
					</div>
				</div>
			</div>

			<!-- Doručení -->
			<div class="space-y-4">
				<h4 class="font-medium text-gray-900">Způsob doručení</h4>
				<div class="space-y-3">
					<div>
						<label class="block text-sm text-gray-600 mb-1">Doprava</label>
						<select
							bind:value={selectedShippingMethod}
							class="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500">
							{#each shippingMethods as method}
								<option value={method}>{method}</option>
							{/each}
						</select>
					</div>
				</div>
			</div>

			<!-- Adresa -->
			<div class="space-y-4">
				<h4 class="font-medium text-gray-900">Fakturační adresa</h4>
				<div class="space-y-3">
					<div class="grid grid-cols-3 gap-2">
						<div class="col-span-2">
							<label class="block text-sm text-gray-600 mb-1">Ulice</label>
							<input
								type="text"
								bind:value={customer_street}
								placeholder="Ulice"
								class="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500" />
						</div>
						<div>
							<label class="block text-sm text-gray-600 mb-1">Číslo</label>
							<input
								type="text"
								bind:value={customer_street_number}
								placeholder="Č.p."
								class="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500" />
						</div>
					</div>
					<div class="grid grid-cols-2 gap-2">
						<div>
							<label class="block text-sm text-gray-600 mb-1">Město</label>
							<input
								type="text"
								bind:value={customer_city}
								placeholder="Město"
								class="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500" />
						</div>
						<div>
							<label class="block text-sm text-gray-600 mb-1">PSČ</label>
							<input
								type="text"
								bind:value={customer_zip_code}
								placeholder="PSČ"
								class="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500" />
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
