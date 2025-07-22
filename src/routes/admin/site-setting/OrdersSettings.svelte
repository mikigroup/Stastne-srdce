<script lang="ts">
	import { fade } from "svelte/transition";
	import type { Writable } from "svelte/store";

	export let editableSettings: Writable<any>;

	// Add order state
	function addOrderState() {
		if (!$editableSettings.orders) {
			$editableSettings.orders = {};
		}
		if (!$editableSettings.orders.orderStates) {
			$editableSettings.orders.orderStates = [];
		}
		$editableSettings.orders.orderStates.push({ name: "", color: "#3b82f6" });
		$editableSettings = $editableSettings;
	}

	// Remove order state
	function removeOrderState(index: number) {
		if ($editableSettings.orders?.orderStates && $editableSettings.orders.orderStates.length > index) {
			$editableSettings.orders.orderStates.splice(index, 1);
			$editableSettings = $editableSettings;
		}
	}
</script>

<div in:fade={{ duration: 300 }}>
	<h2 class="text-base sm:text-xl font-semibold mb-4">Nastavení zakázek</h2>
	
	<!-- Stavy zakázek -->
	<div class="mb-6 border-b pb-4">
		<h3 class="text-base sm:text-lg font-medium mb-3">Stavy zakázek</h3>
		<p class="text-xs sm:text-sm text-gray-600 mb-3">Definujte stavy objednávek, které se používají v systému. Stavy jsou automaticky načteny z existujících objednávek.</p>
		
		{#if !$editableSettings.orders.orderStates || $editableSettings.orders.orderStates.length === 0}
			<div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
				<p class="text-yellow-800 text-xs sm:text-sm">
					<i class="fa-solid fa-exclamation-triangle"></i>
					Žádné stavy zakázek nebyly definovány. Klikněte na "Načíst ze systému" pro automatické načtení stavů z existujících objednávek.
				</p>
			</div>
		{:else}
			<div class="space-y-2">
				{#each $editableSettings.orders.orderStates as state, index}
					<div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
						<div class="flex gap-2 flex-1">
							<input 
								type="text" 
								bind:value={state.name} 
								class="input input-bordered input-sm flex-grow min-w-0"
								placeholder="Název stavu"
							/>
							<input 
								type="color" 
								bind:value={state.color} 
								class="w-10 h-8 rounded border border-gray-300 flex-shrink-0"
								title="Barva stavu"
							/>
						</div>
						<button 
							class="btn btn-xs btn-outline btn-error self-end sm:self-auto" 
							on:click={() => removeOrderState(index)}
							title="Smazat stav">
							×
						</button>
					</div>
				{/each}
			</div>
		{/if}
		
		<div class="flex flex-col sm:flex-row gap-2 mt-3">
			<button 
				class="btn btn-xs sm:btn-sm btn-outline w-full sm:w-auto" 
				on:click={addOrderState}>
				<i class="fa-solid fa-plus"></i>
				<span class="hidden sm:inline">Přidat stav zakázky</span>
				<span class="sm:hidden">Přidat stav</span>
			</button>								
		</div>
	</div>
	
	<!-- Další nastavení zakázek -->
	<div class="mb-6">		
		
		<div class="space-y-4">
			<!-- <div class="form-control">
				<label class="label">
					<span class="label-text text-sm sm:text-base">Prefix čísla objednávky</span>
				</label>
				<input
					type="text"
					bind:value={$editableSettings.orders.orderNumberPrefix}
					class="input input-bordered input-sm sm:input-md w-full"
					placeholder="např. ORD"
				/>
			</div>

			<div class="form-control">
				<label class="label">
					<span class="label-text text-sm sm:text-base">Počáteční číslo objednávky</span>
				</label>
				<input
					type="number"
					bind:value={$editableSettings.orders.startingOrderNumber}
					class="input input-bordered input-sm sm:input-md w-full"
					min="1"
				/>
			</div> -->

			<div class="form-control">
				<label class="label cursor-pointer justify-start gap-3">
					<input
						type="checkbox"
						bind:checked={$editableSettings.orders.autoCreateInvoice}
						class="checkbox checkbox-primary"
					/>
					<span class="label-text text-sm sm:text-base">Automaticky vytvářet faktury</span>
				</label>
			</div>

			<div class="form-control">
				<label class="label cursor-pointer justify-start gap-3">
					<input
						type="checkbox"
						bind:checked={$editableSettings.orders.sendOrderConfirmation}
						class="checkbox checkbox-primary"
					/>
					<span class="label-text text-sm sm:text-base">Posílat potvrzení objednávky e-mailem</span>
				</label>
			</div>
		</div>
	</div>
	
	<!-- Notifikace -->
	<div class="mb-6">
		<h3 class="text-base sm:text-lg font-medium mb-3">Notifikace</h3>
		
		<div class="form-control">
			<label class="label">
				<span class="label-text text-sm sm:text-base">E-mail pro notifikace</span>
			</label>
			<input
				type="email"
				bind:value={$editableSettings.orders.notificationEmail}
				class="input input-bordered input-sm sm:input-md w-full"
				placeholder="admin@example.com"
			/>
			<span class="text-xs text-gray-500 mt-1">
				E-mail, na který budou zasílány notifikace o nových objednávkách
			</span>
		</div>
	</div>
</div> 