<script lang="ts">
	import { fade } from "svelte/transition";
	import type { Writable } from "svelte/store";

	export let editableSettings: Writable<any>;

	// Add product feature
	function addProductFeature() {
		if (!$editableSettings.products) {
			$editableSettings.products = {};
		}
		if (!$editableSettings.products.features) {
			$editableSettings.products.features = [];
		}
		$editableSettings.products.features.push({ title: "", description: "" });
		$editableSettings = $editableSettings;
	}

	// Remove product feature
	function removeProductFeature(index: number) {
		if ($editableSettings.products?.features && $editableSettings.products.features.length > index) {
			$editableSettings.products.features.splice(index, 1);
			$editableSettings = $editableSettings;
		}
	}

	// Add time slot
	function addTimeSlot() {
		if (!$editableSettings.products) {
			$editableSettings.products = {};
		}
		if (!$editableSettings.products.timeSlots) {
			$editableSettings.products.timeSlots = [];
		}
		$editableSettings.products.timeSlots.push({ 
			startTime: "11:00", 
			endTime: "12:00", 
			maxOrders: 10 
		});
		$editableSettings = $editableSettings;
	}

	// Remove time slot
	function removeTimeSlot(index: number) {
		if ($editableSettings.products?.timeSlots && $editableSettings.products.timeSlots.length > index) {
			$editableSettings.products.timeSlots.splice(index, 1);
			$editableSettings = $editableSettings;
		}
	}
</script>

<div in:fade={{ duration: 300 }}>
	<h2 class="text-xl font-semibold mb-4">Nastavení produktů</h2>
	
	<!-- Zobrazení jídelníčku -->
	<div class="mb-6 border-b pb-4">
		<h3 class="text-lg font-medium mb-3">Zobrazení jídelníčku</h3>
		
		<div class="form-control mb-4">
			<label class="label">
				<span class="label-text">Počet viditelných dnů</span>
			</label>
			<div class="flex items-center gap-3">
				<input
					type="number"
					bind:value={$editableSettings.products.visibleDays}
					class="input input-bordered w-24"
					min="1"
					max="70"
					placeholder="7"
				/>
				<p class="text-sm text-gray-500">
					Počet dnů dopředu v jídelníčku
				</p>
			</div>
		</div>

		<!-- Nastavení zobrazení menu pro další den -->
		<div class="form-control mb-4">
			<label class="label cursor-pointer justify-start gap-2">
				<input 
					type="checkbox" 
					class="checkbox checkbox-primary" 
					bind:checked={$editableSettings.products.nextDayMenuEnabled} 
				/>
				<span class="label-text">Umožnit objednávky na další den do určeného času</span>
			</label>
			<span class="text-xs text-gray-500 mt-1">
				Po zapnutí se menu pro další den zobrazuje do nastaveného času, pak se uzavře
			</span>
		</div>

		{#if $editableSettings.products.nextDayMenuEnabled}
			<div class="form-control">
				<label class="label">
									<span class="label-text">Uzavírací čas pro objednávky na další den</span>
			</label>
			<div class="flex items-center gap-3">
				<input
					type="time"
					bind:value={$editableSettings.products.nextDayMenuTime}
					class="input input-bordered w-32"
					step="900"
				/>
				<p class="text-sm text-gray-500">
					Do tohoto času lze objednat jídlo na další den
				</p>
			</div>
			<span class="text-xs text-gray-500 mt-1">
				Například: 17:00 = objednávky na zítřek se uzavřou v 17:00 dnešního dne
			</span>
			</div>
		{/if}
	</div>

	<!-- Časové sloty pro objednávky -->
	<div class="mb-6 border-b pb-4">
		<h3 class="text-lg font-medium mb-3">Časové sloty pro objednávky</h3>
		
		<div class="form-control mb-4">
			<label class="label cursor-pointer justify-start gap-2">
				<input 
					type="checkbox" 
					class="checkbox checkbox-primary" 
					bind:checked={$editableSettings.products.timeSlotsEnabled} 
				/>
				<span class="label-text">Povolit časové sloty pro objednávky</span>
			</label>
			<span class="text-xs text-gray-500 mt-1">
				Zákazníci si budou moci vybrat čas vyzvednutí objednávky
			</span>
		</div>

		{#if $editableSettings.products.timeSlotsEnabled}
			<div class="form-control mb-4">
				<label class="label">
					<span class="label-text">Předobjednávky</span>
				</label>
				<div class="flex items-center gap-3">
					<input
						type="number"
						bind:value={$editableSettings.products.advanceOrderDays}
						class="input input-bordered w-24"
						min="0"
						max="30"
						placeholder="1"
					/>
					<p class="text-sm text-gray-500">
						Počet dnů dopředu, na které lze objednat (0 = pouze dnešní den)
					</p>
				</div>
			</div>

			<div class="form-control mb-4">
				<label class="label">
					<span class="label-text">Uzavírací čas objednávek</span>
				</label>
				<div class="flex items-center gap-3">
					<input
						type="time"
						bind:value={$editableSettings.products.orderDeadlineTime}
						class="input input-bordered w-32"
						step="900"
					/>
					<p class="text-sm text-gray-500">
						Do kdy lze objednat jídlo na daný den
					</p>
				</div>
				<span class="text-xs text-gray-500 mt-1">
					Například: 10:00 = objednávky na dnešní den se uzavřou v 10:00
				</span>
			</div>

			<div class="form-control mb-4">
				<label class="label">
					<span class="label-text">Časové sloty</span>
				</label>
				<div class="space-y-2">
					{#if !$editableSettings.products.timeSlots}
						$editableSettings.products.timeSlots = [];
					{/if}
					
					{#each $editableSettings.products.timeSlots as slot, index}
						<div class="flex items-center gap-2">
							<input
								type="time"
								bind:value={slot.startTime}
								class="input input-bordered w-32"
								step="900"
							/>
							<span class="text-gray-500">-</span>
							<input
								type="time"
								bind:value={slot.endTime}
								class="input input-bordered w-32"
								step="900"
							/>
							<input
								type="number"
								bind:value={slot.maxOrders}
								class="input input-bordered w-20"
								min="1"
								placeholder="10"
							/>
							<span class="text-sm text-gray-500">max objednávek</span>
							<button
								type="button"
								class="btn btn-sm btn-error"
								on:click={() => removeTimeSlot(index)}
							>
								❌
							</button>
						</div>
					{/each}
					
					<button
						type="button"
						class="btn btn-sm btn-primary"
						on:click={addTimeSlot}
					>
						➕ Přidat časový slot
					</button>
				</div>
				<span class="text-xs text-gray-500 mt-1">
					Definujte časové okna pro vyzvednutí objednávek a maximální počet objednávek na slot
				</span>
			</div>

			<div class="form-control mb-4">
				<label class="label cursor-pointer justify-start gap-2">
					<input 
						type="checkbox" 
						class="checkbox checkbox-primary" 
						bind:checked={$editableSettings.products.showTimeSlotAvailability} 
					/>
					<span class="label-text">Zobrazovat dostupnost časových slotů</span>
				</label>
				<span class="text-xs text-gray-500 mt-1">
					Zákazníci uvidí, kolik objednávek je ještě možné v každém slotu
				</span>
			</div>
		{/if}
	</div>
	
	<!-- Zobrazení alergenů -->
	<div class="mb-6 border-b pb-4">
		<h3 class="text-lg font-medium mb-3">Zobrazení alergenů</h3>
		
		<div class="form-control">
			<label class="label cursor-pointer justify-start gap-2">
				<input 
					type="checkbox" 
					class="checkbox checkbox-primary" 
					bind:checked={$editableSettings.products.showAllergens} 
				/>
				<span class="label-text">Zobrazit alergeny u produktů</span>
			</label>
			<span class="text-xs text-gray-500 mt-1">
				Základní zapnutí/vypnutí zobrazování alergenů
			</span>
		</div>
		
		<div class="form-control mt-3">
			<label class="label cursor-pointer justify-start gap-2">
				<input 
					type="checkbox" 
					class="checkbox checkbox-primary" 
					bind:checked={$editableSettings.products.showAllergensTooltip} 
				/>
				<span class="label-text">Zobrazit popis alergenů v nápovědě</span>
			</label>
		</div>
	</div>
	
	<!-- Zobrazení cen -->
	<div class="mb-6 border-b pb-4">
		<h3 class="text-lg font-medium mb-3">Zobrazení cen</h3>
		
		<div class="form-control">
			<label class="label cursor-pointer justify-start gap-2">
				<input 
					type="checkbox" 
					class="checkbox checkbox-primary" 
					bind:checked={$editableSettings.products.showPrices} 
				/>
				<span class="label-text">Zobrazit ceny produktů</span>
			</label>
			<span class="text-xs text-gray-500 mt-1">
				Možnost skrýt ceny pro neregistrované uživatele
			</span>
		</div>
	</div>
	
	<!-- Nastavení variant menu -->
	<div class="mb-6">
		<h3 class="text-lg font-medium mb-3">Nastavení variant menu</h3>
		
		<!-- Varování při změnách nastavení -->
		{#if $editableSettings.products.menuVariantsCount !== 3 || $editableSettings.products.minVariants !== 1 || $editableSettings.products.maxVariants !== 10}
			<div class="alert alert-warning mb-4">
				<div class="flex">
					<svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-2.186-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
					</svg>
					<div class="ml-2">
						<h3 class="font-bold">Upozornění na změny variant</h3>
						<div class="text-sm mt-1">
							<ul class="list-disc list-inside space-y-1">
								{#if $editableSettings.products.menuVariantsCount !== 3}
									<li>Změna výchozího počtu variant ovlivní pouze <strong>nová menu</strong></li>
								{/if}
								{#if $editableSettings.products.minVariants !== 1}
									<li>Existující menu s méně variantami zůstanou funkční</li>
								{/if}
								{#if $editableSettings.products.maxVariants !== 10}
									<li>Menu s více variantami než nový limit nebudou editovatelná</li>
								{/if}
							</ul>
						</div>
					</div>
				</div>
			</div>
		{/if}
		
		<div class="form-control mb-3">
			<label class="label">
				<span class="label-text">Výchozí počet variant hlavního chodu</span>
			</label>
			<div class="flex items-center gap-3">
				<input
					type="number"
					bind:value={$editableSettings.products.menuVariantsCount}
					class="input input-bordered w-24"
					min={$editableSettings.products.minVariants}
					max={$editableSettings.products.maxVariants}
					placeholder="3"
				/>
				<p class="text-sm text-gray-500">
					Počet variant, které se automaticky vytvoří pro nové menu
				</p>
			</div>
		</div>
		
		<div class="form-control mb-3">
			<label class="label cursor-pointer justify-start gap-2">
				<input 
					type="checkbox" 
					class="checkbox checkbox-primary" 
					bind:checked={$editableSettings.products.allowVariableVariants} 
				/>
				<span class="label-text">Povolit dynamické přidávání/ubírání variant</span>
			</label>
			<span class="text-xs text-gray-500 mt-1">
				Umožní administrátorům přidávat či odebírat varianty při vytváření menu
			</span>
		</div>
		
		<div class="grid grid-cols-2 gap-4">
			<div class="form-control">
				<label class="label">
					<span class="label-text">Minimální počet variant</span>
				</label>
				<div class="flex items-center gap-3">
					<input
						type="number"
						bind:value={$editableSettings.products.minVariants}
						class="input input-bordered w-20"
						min="1"
						max={$editableSettings.products.maxVariants}
						placeholder="1"
					/>
				</div>
			</div>
			
			<div class="form-control">
				<label class="label">
					<span class="label-text">Maximální počet variant</span>
				</label>
				<div class="flex items-center gap-3">
					<input
						type="number"
						bind:value={$editableSettings.products.maxVariants}
						class="input input-bordered w-20"
						min={$editableSettings.products.minVariants}
						max="20"
						placeholder="10"
					/>
				</div>
			</div>
		</div>
	</div>

</div> 