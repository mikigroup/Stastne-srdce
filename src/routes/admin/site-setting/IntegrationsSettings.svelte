<script lang="ts">
	import { fade } from "svelte/transition";
	import type { Writable } from "svelte/store";
	import { onMount } from "svelte";

	export let editableSettings: Writable<any>;

	// Stav tokenů z databáze
	let tokenStatus: {
		status: string;
		expires_at: string;
		account_email: string;
		last_used_at: string;
		refresh_attempts: number;
		isExpired: boolean;
		minutesToExpiry: number;
	} | null = null;

	let loadingTokenStatus = false;
	let tokenError: string | null = null;

	// Načtení stavu tokenů z databáze
	async function loadTokenStatus() {
		loadingTokenStatus = true;
		tokenError = null;
		
		try {
			const response = await fetch('/admin/site-setting/check-fakturoid-token', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				}
			});

			const result = await response.json();
			
			if (result.success) {
				tokenStatus = result.tokenStatus;
			} else {
				tokenError = result.error || 'Nepodařilo se načíst stav tokenů';
			}
		} catch (error) {
			console.error('Chyba při načítání stavu tokenů:', error);
			tokenError = 'Chyba při načítání stavu tokenů';
		} finally {
			loadingTokenStatus = false;
		}
	}

	// Test připojení k Fakturoid API
	async function testFakturoidConnection() {
		loadingTokenStatus = true;
		tokenError = null;
		
		try {
			const form = document.createElement("form");
			form.method = "POST";
			form.action = "?/testFakturoidOAuth";
			form.style.display = "none";
			
			document.body.appendChild(form);
			form.submit();
		} catch (error) {
			console.error("Chyba při testování Fakturoid:", error);
			tokenError = "Chyba při testování připojení";
			loadingTokenStatus = false;
		}
	}

	// Fakturoid connection functions
	async function connectFakturoid() {
		try {
			// Přesměrujeme na správný OAuth endpoint pro Fakturoid
			window.location.href = '/auth/fakturoid/connect';
		} catch (error) {
			console.error("Chyba při připojování Fakturoid:", error);
		}
	}

	async function disconnectFakturoid() {
		if (!confirm("Opravdu chcete odpojit Fakturoid účet?")) {
			return;
		}

		// Použijeme klasický form submit místo fetch API pro správný redirect
		const form = document.createElement("form");
		form.method = "POST";
		form.action = "?/disconnectFakturoid";
		form.style.display = "none";
		
		document.body.appendChild(form);
		form.submit();
	}

	// Funkce pro přepnutí aktivního Fakturoid účtu
	async function switchFakturoidAccount(accountIndex: number) {
		console.log("Switching to account index:", accountIndex);
		
		// Přepneme aktivní účet
		$editableSettings.integrations.fakturoid.accounts.forEach((acc: any, i: number) => {
			acc.isActive = i === accountIndex;
		});
		
		// Aktualizujeme také subdoménu v hlavním objektu (DŮLEŽITÉ!)
		const activeAccount = $editableSettings.integrations.fakturoid.accounts[accountIndex];
		$editableSettings.integrations.fakturoid.subdomain = activeAccount.subdomain;
		
		console.log("🔄 Account switched:", {
			newActiveIndex: accountIndex,
			newActiveAccount: activeAccount.name,
			newSubdomain: activeAccount.subdomain
		});
		
		$editableSettings = $editableSettings;
		
		// Automaticky uložíme změnu
		const form = document.createElement("form");
		form.method = "POST";
		form.action = "?/update";
		form.style.display = "none";
		
		const input = document.createElement("input");
		input.type = "hidden";
		input.name = "settings";
		input.value = JSON.stringify($editableSettings);
		form.appendChild(input);
		
		document.body.appendChild(form);
		form.submit();
	}

	// Načteme stav tokenů při mount
	onMount(() => {
		if ($editableSettings.integrations?.fakturoid?.connected) {
			loadTokenStatus();
		}
	});

	// Reaktivní načtení při změně connected stavu
	$: if ($editableSettings.integrations?.fakturoid?.connected) {
		loadTokenStatus();
	}

	// Helper funkce pro získání barvy statusu
	function getStatusColor(status: string): string {
		switch (status) {
			case 'active': return 'text-green-600 bg-green-50 border-green-200';
			case 'expired': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
			case 'refreshing': return 'text-blue-600 bg-blue-50 border-blue-200';
			case 'revoked': return 'text-red-600 bg-red-50 border-red-200';
			default: return 'text-gray-600 bg-gray-50 border-gray-200';
		}
	}

	// Helper funkce pro získání popisu statusu
	function getStatusDescription(status: string): string {
		switch (status) {
			case 'active': return 'Token je aktivní a platný';
			case 'expired': return 'Token vypršel, ale lze obnovit';
			case 'refreshing': return 'Token je v procesu obnovy';
			case 'revoked': return 'Token byl odvolán nebo je neplatný';
			default: return 'Neznámý stav tokenu';
		}
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
						<div class="flex gap-2">
							<button
								on:click={() => disconnectFakturoid()}
								class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
							>
								Odpojit účet
							</button>
							<button
								on:click={() => loadTokenStatus()}
								disabled={loadingTokenStatus}
								class="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
							>
								{#if loadingTokenStatus}
									<i class="fa-solid fa-spinner fa-spin mr-2"></i>
								{:else}
									<i class="fa-solid fa-refresh mr-2"></i>
								{/if}
								Zkontrolovat
							</button>
						</div>
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
										console.log("🧹 Manual reset of Fakturoid connection state");
										$editableSettings.integrations.fakturoid.connected = false;
										$editableSettings.integrations.fakturoid.subdomain = "";
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

				<!-- Token Status Display -->
				{#if $editableSettings.integrations?.fakturoid?.connected && $editableSettings.integrations.fakturoid.accounts?.length > 0}
					<div class="mt-4 border-t pt-4">
						<h4 class="text-sm font-medium mb-3 flex items-center gap-2">
							<i class="fa-solid fa-key"></i>
							Stav přístupových tokenů
						</h4>
						
						{#if loadingTokenStatus}
							<div class="flex items-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
								<i class="fa-solid fa-spinner fa-spin text-gray-500"></i>
								<span class="text-sm text-gray-600">Načítám stav tokenů...</span>
							</div>
						{:else if tokenError}
							<div class="p-3 bg-red-50 border border-red-200 rounded-lg">
								<div class="flex items-center gap-2 mb-2">
									<i class="fa-solid fa-exclamation-triangle text-red-600"></i>
									<span class="text-sm font-medium text-red-800">Chyba při načítání stavu</span>
								</div>
								<p class="text-sm text-red-700 mb-2">{tokenError}</p>
								<button
									on:click={() => loadTokenStatus()}
									class="text-sm text-red-600 hover:text-red-800 underline"
								>
									Zkusit znovu
								</button>
							</div>
						{:else if tokenStatus}
							<div class="p-3 border rounded-lg {getStatusColor(tokenStatus.status)}">
								<div class="flex items-center justify-between mb-2">
									<div class="flex items-center gap-2">
										<i class="fa-solid fa-circle text-xs"></i>
										<span class="text-sm font-medium">Status: {tokenStatus.status.toUpperCase()}</span>
									</div>
									{#if tokenStatus.status === 'revoked' || tokenStatus.status === 'expired'}
										<button
											on:click={() => connectFakturoid()}
											class="text-xs px-2 py-1 bg-white border border-current rounded hover:bg-opacity-10"
										>
											Obnovit připojení
										</button>
									{/if}
								</div>
								
								<p class="text-sm mb-2">{getStatusDescription(tokenStatus.status)}</p>
								
								<div class="text-xs space-y-1">
									<div><strong>Účet:</strong> {tokenStatus.account_email}</div>
									<div><strong>Vyprší:</strong> {new Date(tokenStatus.expires_at).toLocaleString('cs-CZ')}</div>
									{#if tokenStatus.isExpired}
										<div class="text-red-600"><strong>Token je expirovaný!</strong></div>
									{:else}
										<div><strong>Do expirace:</strong> {tokenStatus.minutesToExpiry} minut</div>
									{/if}
									<div><strong>Poslední použití:</strong> {new Date(tokenStatus.last_used_at).toLocaleString('cs-CZ')}</div>
									{#if tokenStatus.refresh_attempts > 0}
										<div><strong>Pokusy o obnovu:</strong> {tokenStatus.refresh_attempts}</div>
									{/if}
								</div>

								<!-- Action buttons based on status -->
								{#if tokenStatus.status === 'revoked' || tokenStatus.status === 'expired'}
									<div class="mt-3 pt-3 border-t border-current border-opacity-20">
										<div class="flex gap-2">
											<button
												on:click={() => testFakturoidConnection()}
												disabled={loadingTokenStatus}
												class="text-xs px-3 py-1 bg-white border border-current rounded hover:bg-opacity-10 disabled:opacity-50"
											>
												{#if loadingTokenStatus}
													<i class="fa-solid fa-spinner fa-spin mr-1"></i>
												{:else}
													<i class="fa-solid fa-flask mr-1"></i>
												{/if}
												Test připojení
											</button>
											<button
												on:click={() => connectFakturoid()}
												class="text-xs px-3 py-1 bg-white border border-current rounded hover:bg-opacity-10"
											>
												<i class="fa-solid fa-link mr-1"></i>
												Nové připojení
											</button>
										</div>
									</div>
								{/if}
							</div>
						{:else}
							<div class="p-3 bg-gray-50 border border-gray-200 rounded-lg">
								<p class="text-sm text-gray-600 mb-2">Stav tokenů nebyl načten.</p>
								<button
									on:click={() => loadTokenStatus()}
									class="text-sm text-blue-600 hover:text-blue-800 underline"
								>
									Načíst stav tokenů
								</button>
							</div>
						{/if}
					</div>
				{/if}
				
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