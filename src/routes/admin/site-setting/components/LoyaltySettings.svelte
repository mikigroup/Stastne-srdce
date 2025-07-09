<script lang="ts">
	import { fade } from "svelte/transition";
	import type { Writable } from 'svelte/store';

	export let editableSettings: Writable<any>;
</script>

<div in:fade={{ duration: 300 }}>						
	<h2 class="text-xl font-semibold mb-4">Nastavení věrnostního systému</h2>
	<div class="space-y-6">
		<!-- Základní nastavení -->
		<div class="form-control">
			<div class="flex items-start gap-3">
				<input type="checkbox" bind:checked={$editableSettings.customer.loyalty.enabled} class="checkbox checkbox-primary mt-1" />
				<div>
					<span class="label-text font-medium">Povolit věrnostní systém</span>
					<p class="text-xs text-gray-500 mt-1">
						Aktivuje věrnostní program pro zákazníky
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
						Kolik korun je hodnota jednoho bodu
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
					<div class="space-y-3">
						{#each $editableSettings.customer.loyalty.tiers as tier, idx (tier.name)}
							<div class="border rounded-lg p-4 bg-white">
								<div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 items-end">
									<div class="form-control">
										<label class="label">
											<span class="label-text text-xs">Kód</span>
										</label>
										<input type="text" bind:value={tier.name} class="input input-bordered input-sm w-full" placeholder="NEW" />
									</div>
									<div class="form-control">
										<label class="label">
											<span class="label-text text-xs">Název</span>
										</label>
										<input type="text" bind:value={tier.label} class="input input-bordered input-sm w-full" placeholder="Nová úroveň" />
									</div>
									<div class="form-control">
										<label class="label">
											<span class="label-text text-xs">Min. objednávek</span>
										</label>
										<input type="number" bind:value={tier.minOrders} class="input input-bordered input-sm w-full" placeholder="0" min="0" />
									</div>
									<div class="form-control">
										<label class="label">
											<span class="label-text text-xs">Sleva %</span>
										</label>
										<input type="number" bind:value={tier.discount} class="input input-bordered input-sm w-full" placeholder="0" min="0" max="100" />
									</div>
									<div class="form-control">
										<label class="label">
											<span class="label-text text-xs">Bonus %</span>
										</label>
										<input type="number" bind:value={tier.bonus} class="input input-bordered input-sm w-full" placeholder="0" min="0" max="100" />
									</div>
									<div class="form-control">
										<label class="label">
											<span class="label-text text-xs">Barva</span>
										</label>
										<input type="color" bind:value={tier.color} class="w-full h-10 border rounded" />
									</div>
									<div class="form-control">
										<label class="label">
											<span class="label-text text-xs">Ikona</span>
										</label>
										<input type="text" bind:value={tier.icon} class="input input-bordered input-sm w-full" placeholder="🆕" />
									</div>
								</div>
								<div class="mt-3">
									<label class="label">
										<span class="label-text text-xs">Popis</span>
									</label>
									<textarea bind:value={tier.description} class="textarea textarea-bordered textarea-sm w-full" placeholder="Popis úrovně"></textarea>
								</div>
								<div class="mt-3 flex justify-end">
									<button class="btn btn-xs btn-error" on:click={() => $editableSettings.customer.loyalty.tiers.splice(idx, 1)}>
										Smazat úroveň
									</button>
								</div>
							</div>
						{/each}
						<button class="btn btn-sm btn-primary" on:click={() => $editableSettings.customer.loyalty.tiers.push({name:'NEW',label:'Nová úroveň',minOrders:0,discount:0,bonus:0,color:'#6B7280',icon:'🆕',description:''})}>
							Přidat úroveň
						</button>
					</div>
				</div>
			{/if}

			<!-- Pokročilé nastavení -->
			<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
				<div class="form-control">
					<label class="label">
						<span class="label-text">Prahová neaktivita (dny)</span>
					</label>
					<input type="number" bind:value={$editableSettings.customer.loyalty.inactivityThreshold} class="input input-bordered w-full" min="0" />
					<span class="text-xs text-gray-500 mt-1">
						Po kolika dnech se zákazník stane neaktivním
					</span>
				</div>
				<div class="form-control">
					<label class="label">
						<span class="label-text">Expirace bodů (měsíce)</span>
					</label>
					<input type="number" bind:value={$editableSettings.customer.loyalty.pointsExpiryMonths} class="input input-bordered w-full" min="0" />
					<span class="text-xs text-gray-500 mt-1">
						Po kolika měsících body vyprší
					</span>
				</div>
				<div class="form-control">
					<label class="label">
						<span class="label-text">Maximální body/objednávka</span>
					</label>
					<input type="number" bind:value={$editableSettings.customer.loyalty.maxPointsPerOrder} class="input input-bordered w-full" min="0" />
					<span class="text-xs text-gray-500 mt-1">
						Omezení bodů na jednu objednávku
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
								Automaticky povýší zákazníka při splnění podmínek
							</p>
						</div>
					</div>
				</div>
				<div class="form-control">
					<div class="flex items-start gap-3">
						<input type="checkbox" bind:checked={$editableSettings.customer.loyalty.enableTierDowngrade} class="checkbox checkbox-primary mt-1" />
						<div>
							<span class="label-text font-medium">Automatické snížení úrovně</span>
							<p class="text-xs text-gray-500 mt-1">
								Automaticky sníží úroveň při neaktivitě
							</p>
						</div>
					</div>
				</div>
			</div>
		{/if}
	</div>
</div> 