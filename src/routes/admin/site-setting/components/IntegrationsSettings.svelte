<script lang="ts">
	import { fade } from "svelte/transition";
	import type { Writable } from 'svelte/store';

	export let editableSettings: Writable<any>;

	// Fakturoid connection functions
	async function connectFakturoid() {
		try {
			// Přesměrujeme na správný OAuth endpoint pro Fakturoid
			window.location.href = '/auth/fakturoid/connect';
		} catch (error) {
			console.error('Chyba při připojování Fakturoid:', error);
		}
	}

	async function disconnectFakturoid() {
		if (!confirm('Opravdu chcete odpojit Fakturoid účet?')) {
			return;
		}

		// Použijeme klasický form submit místo fetch API pro správný redirect
		const form = document.createElement('form');
		form.method = 'POST';
		form.action = '?/disconnectFakturoid';
		form.style.display = 'none';
		
		document.body.appendChild(form);
		form.submit();
	}

	// Funkce pro přepnutí aktivního Fakturoid účtu
	async function switchFakturoidAccount(accountIndex: number) {
		console.log('Switching to account index:', accountIndex);
		
		// Přepneme aktivní účet
		$editableSettings.integrations.fakturoid.accounts.forEach((acc: any, i: number) => {
			acc.isActive = i === accountIndex;
		});
		
		// Aktualizujeme také subdoménu v hlavním objektu (DŮLEŽITÉ!)
		const activeAccount = $editableSettings.integrations.fakturoid.accounts[accountIndex];
		$editableSettings.integrations.fakturoid.subdomain = activeAccount.subdomain;
		
		console.log('🔄 Account switched:', {
			newActiveIndex: accountIndex,
			newActiveAccount: activeAccount.name,
			newSubdomain: activeAccount.subdomain
		});
		
		$editableSettings = $editableSettings;
		
		// Automaticky uložíme změnu
		const form = document.createElement('form');
		form.method = 'POST';
		form.action = '?/update';
		form.style.display = 'none';
		
		const input = document.createElement('input');
		input.type = 'hidden';
		input.name = 'settings';
		input.value = JSON.stringify($editableSettings);
		form.appendChild(input);
		
		document.body.appendChild(form);
		form.submit();
	}
</script>

<div in:fade={{ duration: 300 }}>
	<h2 class="text-xl font-semibold mb-4">Integrace</h2>
	
	<!-- Fakturoid Section -->
	<div class="mb-6 border-b pb-6">
		<h3 class="text-lg font-medium mb-4 flex items-center gap-2">
			<i class="fa-solid fa-file-invoice text-green-600"></i>
			Fakturoid
		</h3>
		
		<div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
			<h4 class="font-medium text-blue-800 mb-2">
				<i class="fa-solid fa-info-circle"></i>
				Informace o integraci
			</h4>
			<p class="text-sm text-blue-700 mb-2">
				Fakturoid je služba pro online fakturaci. Po konfiguraci budete moci automaticky vytvářet faktury pro objednávky.
			</p>
			<p class="text-sm text-blue-700">
				<strong>Potřebné údaje:</strong> API token, subdoména účtu a číslo účtu pro párování plateb.
			</p>
		</div>

		<!-- Enable/Disable Toggle -->
		<div class="form-control mb-4">
			<label class="label cursor-pointer justify-start gap-3">
				<input 
					type="checkbox" 
					bind:checked={$editableSettings.integrations.fakturoid.enabled} 
					class="checkbox checkbox-primary"
				/>
				<span class="label-text font-medium">Povolit integraci s Fakturoid</span>
			</label>
		</div>

		{#if $editableSettings.integrations.fakturoid.enabled}
			<div class="space-y-4 pl-4 border-l-4 border-green-200">
				<!-- OAuth Connection Status -->
				<div class="flex items-center justify-between">
					<div>
						<h3 class="text-lg font-medium">Fakturoid</h3>
						{#if $editableSettings.integrations?.fakturoid?.connected && $editableSettings.integrations.fakturoid.accounts?.length > 0}
							{#if $editableSettings.integrations.fakturoid.accounts?.length > 1}
								<p class="text-sm text-gray-500">Připojeno více účtů ({$editableSettings.integrations.fakturoid.accounts.length})</p>
							{:else}
								<p class="text-sm text-gray-500">Připojeno k účtu: {$editableSettings.integrations.fakturoid.accounts[0]?.email}</p>
							{/if}
						{:else}
							<p class="text-sm text-gray-500">Fakturoid používá bezpečné OAuth 2.0 ověření. Klikněte níže pro připojení vašeho Fakturoid účtu.</p>
						{/if}
					</div>
					{#if $editableSettings.integrations?.fakturoid?.connected && $editableSettings.integrations.fakturoid.accounts?.length > 0}
						<button
							on:click={() => disconnectFakturoid()}
							class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
						>
							Odpojit účet
						</button>
					{:else}
						<div class="flex gap-2">
							<button
								on:click={() => connectFakturoid()}
								class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
							>
								Připojit účet
							</button>
							
							<!-- Emergency reset tlačítko -->
							{#if $editableSettings.integrations?.fakturoid?.connected}
								<button
									on:click={() => {
										console.log('🧹 Manual reset of Fakturoid connection state');
										$editableSettings.integrations.fakturoid.connected = false;
										$editableSettings.integrations.fakturoid.subdomain = '';
										$editableSettings.integrations.fakturoid.accounts = [];
										$editableSettings = $editableSettings;
									}}
									class="inline-flex items-center px-3 py-2 border border-yellow-500 text-sm font-medium rounded-md text-yellow-700 bg-yellow-50 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
									title="Reset nekonzistentního stavu"
								>
									🧹 Reset
								</button>
							{/if}
						</div>
					{/if}
				</div>
				
				<!-- Detailní zobrazení všech účtů -->
				{#if $editableSettings.integrations.fakturoid.connected && $editableSettings.integrations.fakturoid.accounts?.length > 0}
					<div class="mt-4 border-t pt-4">
						<h4 class="text-sm font-medium mb-3">Dostupné Fakturoid účty:</h4>
						
						<div class="space-y-2">
							{#each $editableSettings.integrations.fakturoid.accounts as account, index}
								<div class="flex items-center justify-between p-3 border rounded-lg {account.isActive ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}">
									<div class="flex-1">
										<div class="flex items-center gap-2">
											<span class="font-medium text-sm">{account.name || account.email}</span>
											{#if account.isActive}
												<span class="px-2 py-1 text-xs bg-green-600 text-white rounded">Aktivní</span>
											{/if}
										</div>
										<div class="text-xs text-gray-600 mt-1">
											<div><strong>Email:</strong> {account.email}</div>
											<div><strong>Subdoména:</strong> {account.subdomain}</div>
											{#if account.currency}
												<div><strong>Měna:</strong> {account.currency}</div>
											{/if}
											{#if account.plan}
												<div><strong>Tarif:</strong> {account.plan}</div>
											{/if}
											<div><strong>Připojeno:</strong> {new Date(account.connectedAt).toLocaleString('cs-CZ')}</div>
										</div>
									</div>
									{#if !account.isActive}
										<button
											class="btn btn-xs btn-outline btn-primary"
											on:click={() => switchFakturoidAccount(index)}
										>
											Použít
										</button>
									{/if}
								</div>
							{/each}
						</div>
					</div>
				{/if}
			</div>
		{/if}
	</div>
</div> 