<script lang="ts">
	import { fade } from "svelte/transition";
	import type { Writable } from "svelte/store";

	export let editableSettings: Writable<any>;

	// Add shipping method
	function addShippingMethod() {
		if (!$editableSettings.delivery) {
			$editableSettings.delivery = {};
		}
		if (!$editableSettings.delivery.shippingMethods) {
			$editableSettings.delivery.shippingMethods = [];
		}
		$editableSettings.delivery.shippingMethods.push({ name: "", price: 0 });
		$editableSettings = $editableSettings;
	}

	// Remove shipping method
	function removeShippingMethod(index: number) {
		if ($editableSettings.delivery?.shippingMethods && $editableSettings.delivery.shippingMethods.length > index) {
			$editableSettings.delivery.shippingMethods.splice(index, 1);
			$editableSettings = $editableSettings;
		}
	}
</script>

<div in:fade={{ duration: 300 }}>
	<h2 class="text-xl font-semibold mb-4">Nastavení dopravních služeb</h2>
	
	<div class="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
		<p class="text-blue-800 text-sm">
			<strong>Poznámka:</strong> Zde nastavujete dopravní služby s cenami pro výpočet poštovného.
			<br>Preference zákazníků (Vlastní nosič, REkrabička, atd.) se nastavují při registraci.
		</p>
	</div>
	
	<!-- Způsoby dopravy -->
	<div class="mb-6 border-b pb-4">
		<h3 class="text-lg font-medium mb-3">Dopravní služby</h3>
		<p class="text-sm text-gray-600 mb-3">Nastavte dopravní firmy a jejich ceny pro výpočet poštovného v e-shopu</p>
		
		{#if !$editableSettings.delivery?.shippingMethods || $editableSettings.delivery.shippingMethods.length === 0}
			<p class="text-gray-500 mb-2">Žádné dopravní služby nebyly definovány</p>
		{:else}
			<div class="space-y-2">
				{#each $editableSettings.delivery.shippingMethods as method, index}
					<div class="flex items-center gap-2">
						<input 
							type="text" 
							bind:value={method.name} 
							class="input input-bordered flex-grow"
							placeholder="Název (např. Česká pošta)"
						/>
						<input 
							type="number" 
							bind:value={method.price} 
							class="input input-bordered w-32"
							placeholder="Cena v Kč"
						/>
						<button 
							class="btn btn-sm btn-outline btn-error" 
							on:click={() => removeShippingMethod(index)}>
							×
						</button>
					</div>
				{/each}
			</div>
		{/if}
		
		<button 
			class="btn btn-sm btn-outline mt-2" 
			on:click={addShippingMethod}>
			Přidat dopravní službu
		</button>
	</div>
	
	<!-- Obecná nastavení e-shopu -->
	<div class="mb-6">
		<h3 class="text-lg font-medium mb-3">Nastavení e-shopu</h3>
		
		<div class="form-control mb-3">
			<label class="label">
				<span class="label-text">Minimální hodnota objednávky</span>
			</label>
			<div class="flex items-center gap-3">
				<input
					type="number"
					bind:value={$editableSettings.delivery.minimumOrderValue}
					class="input input-bordered w-32"
					min="0"
					step="10"
					placeholder="0"
				/>
				<p class="text-sm text-gray-500">
					Minimální částka pro vytvoření objednávky
				</p>
			</div>
		</div>
		
		<div class="form-control mb-3">
			<label class="label">
				<span class="label-text">Doprava zdarma od</span>
			</label>
			<div class="flex items-center gap-3">
				<input
					type="number"
					bind:value={$editableSettings.delivery.freeDeliveryThreshold}
					class="input input-bordered w-32"
					min="0"
					step="100"
					placeholder="1000"
				/>
				<p class="text-sm text-gray-500">
					Hodnota objednávky, od které je doprava zdarma
				</p>
			</div>
		</div>
	</div>
</div> 