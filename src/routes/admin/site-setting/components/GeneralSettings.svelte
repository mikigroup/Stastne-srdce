<script lang="ts">
	import { fade } from "svelte/transition";
	import type { Writable } from 'svelte/store';

	export let editableSettings: Writable<any>;
	export let availableCurrencies: Array<{code: string, name: string}>;

	// Handle přidání měny z selectu - pouze jedna měna
	function handleCurrencyAdd(event: Event) {
		const target = event.target as HTMLSelectElement;
		const currencyCode = target.value;
		
		if (currencyCode && currencyCode.trim() !== '') {
			if (!$editableSettings.general) {
				$editableSettings.general = {};
			}
			
			// Nastavíme pouze jednu měnu (přepíše původní)
			$editableSettings.general.currencies = [currencyCode];
			$editableSettings = $editableSettings;
			
			// Reset selectu
			target.value = '';
		}
	}

	// Remove currency - smaže všechny měny
	function removeCurrency(index: number) {
		if ($editableSettings.general?.currencies) {
			$editableSettings.general.currencies = [];
			$editableSettings = $editableSettings;
		}
	}
</script>

<div in:fade={{ duration: 300 }}>
	<h2 class="text-xl font-semibold mb-4">Obecné nastavení</h2>

	<div class="space-y-4">
		<div class="form-control">
			<label class="label">
				<span class="label-text text-sm sm:text-base">Název obchodu</span>
			</label>
			<input
				type="text"
				bind:value={$editableSettings.general.shopName}
				class="input input-bordered w-full input-sm sm:input-md"
			/>
		</div>

		<div class="form-control">
			<label class="label">
				<span class="label-text text-sm sm:text-base">Krátký název</span>
			</label>
			<input
				type="text"
				bind:value={$editableSettings.general.shortName}
				class="input input-bordered w-full input-sm sm:input-md"
			/>
		</div>
		
		<!-- Měny -->
		<div class="mb-6 border-t pt-4 mt-4">
			<h3 class="text-base sm:text-lg font-medium mb-3">Měny</h3>
			<p class="text-gray-500 mb-3 text-sm">Vyberte měny, které chcete podporovat v systému</p>
			
			<!-- Dostupné měny k výběru -->
			<div class="mb-3">
				<label class="label">
					<span class="label-text text-sm sm:text-base">Přidat měnu</span>
				</label>
				<select 
					class="select select-bordered input-sm sm:input-md w-full max-w-xs"
					on:change={handleCurrencyAdd}>
					<option value="">Vyberte měnu</option>
					{#each availableCurrencies as currency}
						{#if !$editableSettings.general?.currencies?.includes(currency.code)}
							<option value={currency.code}>{currency.code} - {currency.name}</option>
						{/if}
					{/each}
				</select>
			</div>
			
			<!-- Vybraná měna -->
			{#if $editableSettings.general?.currencies && $editableSettings.general.currencies.length > 0}
				<div class="space-y-2 max-w-xs">
					<label class="label">
						<span class="label-text text-sm sm:text-base">Vybraná měna</span>
					</label>
					<div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-white">
						<div class="flex gap-2 flex-1 items-center">
							<span class="px-3 py-2 bg-blue-100 text-blue-800 rounded-md text-sm font-medium min-w-0">
								{$editableSettings.general.currencies[0]}
							</span>
						</div>
						<button 
							class="btn btn-xs btn-outline btn-error self-end sm:self-auto" 
							on:click={() => removeCurrency(0)}>
							×
						</button>
					</div>
				</div>
			{:else}
				<p class="text-gray-500 text-sm">Žádná měna nebyla vybrána</p>
			{/if}
		</div>
	</div>
</div> 