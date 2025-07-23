<script lang="ts">
	import { getLoyaltyTiers, saveLoyaltyTier, deleteLoyaltyTier } from "$lib/services/loyaltyService";
	import type { LoyaltyTier } from "$lib/services/loyaltyService";
	import { getContext } from "svelte";

	export let editableSettings: any;
	
	// Získáme supabase z kontextu
	const supabase = getContext("supabase") as any;

	let tiers: LoyaltyTier[] = [];
	let loading = false;

	// Načtení úrovní při mountování komponenty
	$: if (supabase) {
		loadTiers();
	}

	async function loadTiers() {
		try {
			loading = true;
			tiers = await getLoyaltyTiers(supabase);
			// Aktualizace tiers v editableSettings
			$editableSettings.customer.loyalty.tiers = tiers;
		} catch (error) {
			console.error("Error loading loyalty tiers:", error);
		} finally {
			loading = false;
		}
	}

	async function saveTier(tier: LoyaltyTier) {
		try {
			await saveLoyaltyTier(supabase, tier);
			await loadTiers(); // Znovu načíst tiers
		} catch (error) {
			console.error("Error saving tier:", error);
		}
	}

	async function removeTier(tierId: number) {
		try {
			await deleteLoyaltyTier(supabase, tierId);
			await loadTiers(); // Znovu načíst tiers
		} catch (error) {
			console.error("Error deleting tier:", error);
		}
	}

	async function addNewTier() {
		const newTier: LoyaltyTier = {
			name: "NEW",
			minOrders: 0,
			discount: 0,
			bonus: 0,
			color: "#6B7280",
			icon: "🆕",
			description: ""
		};
		
		try {
			await saveLoyaltyTier(supabase, newTier);
			await loadTiers(); // Znovu načíst tiers
		} catch (error) {
			console.error("Error adding tier:", error);
		}
	}
</script>

<div class="space-y-6">
	<!-- Základní nastavení -->
	<div class="form-control">
		<div class="flex items-start gap-3">
			<input type="checkbox" bind:checked={$editableSettings.customer.loyalty.enabled} class="checkbox checkbox-primary mt-1" />
			<div>
				<span class="label-text font-medium">Povolit věrnostní systém</span>
				<p class="text-xs text-gray-500 mt-1">
					Zákazníci mohou získávat body za objednávky a využívat slevy
				</p>
			</div>
		</div>
	</div>

	{#if $editableSettings.customer.loyalty.enabled}
		<!-- Bodový systém -->
		<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
			<div class="form-control">
				<label class="label">
					<span class="label-text">Body za 1 Kč</span>
				</label>
				<input type="number" bind:value={$editableSettings.customer.loyalty.pointsPerCzk} class="input input-bordered w-full" min="0" step="0.1" />
				<span class="text-xs text-gray-500 mt-1">
					Kolik bodů získá zákazník za každou korunu
				</span>
			</div>
			<div class="form-control">
				<label class="label">
					<span class="label-text">Hodnota 1 bodu (Kč)</span>
				</label>
				<input type="number" bind:value={$editableSettings.customer.loyalty.pointsValue} class="input input-bordered w-full" min="0" step="0.01" />
				<span class="text-xs text-gray-500 mt-1">
					Kolik korun stojí jeden bod
				</span>
			</div>
		</div>

		<!-- Bonusy -->
		<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
			<div class="form-control">
				<label class="label">
					<span class="label-text">Uvítací bonus (body)</span>
				</label>
				<input type="number" bind:value={$editableSettings.customer.loyalty.welcomeBonus} class="input input-bordered w-full" min="0" />
				<span class="text-xs text-gray-500 mt-1">
					Body za registraci nového zákazníka
				</span>
			</div>
			<div class="form-control">
				<label class="label">
					<span class="label-text">Narozeninový bonus (body)</span>
				</label>
				<input type="number" bind:value={$editableSettings.customer.loyalty.birthdayBonus} class="input input-bordered w-full" min="0" />
				<span class="text-xs text-gray-500 mt-1">
					Body za narozeniny zákazníka
				</span>
			</div>
		</div>

		<!-- Úrovně věrnosti -->
		<div class="form-control">
			<div class="flex items-start gap-3">
				<input type="checkbox" bind:checked={$editableSettings.customer.loyalty.enableTiers} class="checkbox checkbox-primary mt-1" />
				<div>
					<span class="label-text font-medium">Povolit úrovně věrnosti</span>
					<p class="text-xs text-gray-500 mt-1">
						Zákazníci mohou získat vyšší úrovně s lepšími výhodami
					</p>
				</div>
			</div>
		</div>

		{#if $editableSettings.customer.loyalty.enableTiers}
			<div class="mt-4 p-4 bg-gray-50 rounded-lg">
				<h3 class="font-semibold mb-4">Úrovně věrnosti</h3>
				
				{#if loading}
					<div class="flex items-center justify-center p-4">
						<div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
						<span class="ml-2 text-gray-600">Načítání úrovní...</span>
					</div>
				{:else}
					<div class="space-y-3">
						{#each tiers as tier (tier.id || tier.name)}
							<div class="border rounded-lg p-4 bg-white">
								<div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 items-end">
									<div class="form-control">
										<label class="label">
											<span class="label-text text-xs">Kód</span>
										</label>
										<input 
											type="text" 
											bind:value={tier.name} 
											class="input input-bordered input-sm w-full" 
											placeholder="NEW"
											on:blur={() => saveTier(tier)} />
									</div>
									<div class="form-control">
										<label class="label">
											<span class="label-text text-xs">Min. objednávek</span>
										</label>
										<input 
											type="number" 
											bind:value={tier.minOrders} 
											class="input input-bordered input-sm w-full" 
											placeholder="0" 
											min="0"
											on:blur={() => saveTier(tier)} />
									</div>
									<div class="form-control">
										<label class="label">
											<span class="label-text text-xs">Sleva %</span>
										</label>
										<input 
											type="number" 
											bind:value={tier.discount} 
											class="input input-bordered input-sm w-full" 
											placeholder="0" 
											min="0" 
											max="100"
											on:blur={() => saveTier(tier)} />
									</div>
									<div class="form-control">
										<label class="label">
											<span class="label-text text-xs">Bonus %</span>
										</label>
										<input 
											type="number" 
											bind:value={tier.bonus} 
											class="input input-bordered input-sm w-full" 
											placeholder="0" 
											min="0" 
											max="100"
											on:blur={() => saveTier(tier)} />
									</div>
									<div class="form-control">
										<label class="label">
											<span class="label-text text-xs">Barva</span>
										</label>
										<input 
											type="color" 
											bind:value={tier.color} 
											class="w-full h-10 border rounded"
											on:change={() => saveTier(tier)} />
									</div>
									<div class="form-control">
										<label class="label">
											<span class="label-text text-xs">Ikona</span>
										</label>
										<input 
											type="text" 
											bind:value={tier.icon} 
											class="input input-bordered input-sm w-full" 
											placeholder="🆕"
											on:blur={() => saveTier(tier)} />
									</div>
									<div class="form-control">
										<label class="label">
											<span class="label-text text-xs">Akce</span>
										</label>
										<button 
											class="btn btn-xs btn-error w-full" 
											on:click={() => tier.id && removeTier(tier.id)}>
											Smazat
										</button>
									</div>
								</div>
								<div class="mt-3">
									<label class="label">
										<span class="label-text text-xs">Popis</span>
									</label>
									<textarea 
										bind:value={tier.description} 
										class="textarea textarea-bordered textarea-sm w-full" 
										placeholder="Popis úrovně"
										on:blur={() => saveTier(tier)}></textarea>
								</div>
							</div>
						{/each}
						<button class="btn btn-sm btn-primary" on:click={addNewTier}>
							Přidat úroveň
						</button>
					</div>
				{/if}
			</div>
		{/if}

		<!-- Pokročilá nastavení -->
		<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
			<div class="form-control">
				<label class="label">
					<span class="label-text">Práh neaktivity (dny)</span>
				</label>
				<input type="number" bind:value={$editableSettings.customer.loyalty.inactivityThreshold} class="input input-bordered w-full" min="1" />
				<span class="text-xs text-gray-500 mt-1">
					Po kolika dnech se zákazník označí jako neaktivní
				</span>
			</div>
			<div class="form-control">
				<label class="label">
					<span class="label-text">Expirace bodů (měsíce)</span>
				</label>
				<input type="number" bind:value={$editableSettings.customer.loyalty.pointsExpiryMonths} class="input input-bordered w-full" min="1" />
				<span class="text-xs text-gray-500 mt-1">
					Po kolika měsících body expirují
				</span>
			</div>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
			<div class="form-control">
				<label class="label">
					<span class="label-text">Max. body za objednávku</span>
				</label>
				<input type="number" bind:value={$editableSettings.customer.loyalty.maxPointsPerOrder} class="input input-bordered w-full" min="0" />
				<span class="text-xs text-gray-500 mt-1">
					Omezení maximálního počtu bodů za jednu objednávku
				</span>
			</div>
		</div>

		<!-- Automatické funkce -->
		<div class="space-y-3">
			<div class="form-control">
				<div class="flex items-start gap-3">
					<input type="checkbox" bind:checked={$editableSettings.customer.loyalty.enableAutoTierUpgrade} class="checkbox checkbox-primary mt-1" />
					<div>
						<span class="label-text font-medium">Automatické povýšení úrovně</span>
						<p class="text-xs text-gray-500 mt-1">
							Zákazníci se automaticky povýší na vyšší úroveň při splnění podmínek
						</p>
					</div>
				</div>
			</div>
			<div class="form-control">
				<div class="flex items-start gap-3">
					<input type="checkbox" bind:checked={$editableSettings.customer.loyalty.enableTierDowngrade} class="checkbox checkbox-primary mt-1" />
					<div>
						<span class="label-text font-medium">Povolit snížení úrovně</span>
						<p class="text-xs text-gray-500 mt-1">
							Zákazníci mohou být sníženi na nižší úroveň při neaktivitě
						</p>
					</div>
				</div>
			</div>
		</div>
	{/if}
</div> 