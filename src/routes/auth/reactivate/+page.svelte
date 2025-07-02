<script lang="ts">
	export let data;
	export let form;
	
	let { profile, token, isValid, daysRemaining } = data;
	$: ({ profile, token, isValid, daysRemaining } = data);
</script>

<svelte:head>
	<title>Reaktivace účtu - GDPR</title>
	<meta name="description" content="Reaktivace účtu po žádosti o smazání dat" />
</svelte:head>

<section class="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
	<div class="max-w-md w-full space-y-8">
		<div>
			<h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
				🔓 Reaktivace účtu
			</h2>
			<p class="mt-2 text-center text-sm text-gray-600">
				Žádost o smazání dat (GDPR)
			</p>
		</div>

		{#if !isValid}
			<div class="bg-red-50 border border-red-200 rounded-lg p-4">
				<div class="flex">
					<div class="flex-shrink-0">
						<svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
							<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
						</svg>
					</div>
					<div class="ml-3">
						<h3 class="text-sm font-medium text-red-800">
							Neplatný nebo expirovaný odkaz
						</h3>
						<p class="mt-2 text-sm text-red-700">
							Tento odkaz pro reaktivaci účtu není platný nebo už vypršel. 
							Možné důvody:
						</p>
						<ul class="mt-1 text-sm text-red-700 list-disc list-inside">
							<li>Odkaz je starší než 30 dní</li>
							<li>Účet už byl reaktivován</li>
							<li>Účet už byl smazán</li>
							<li>Odkaz je poškozený</li>
						</ul>
						<p class="mt-2 text-sm text-red-700">
							Pro pomoc kontaktujte zákaznickou podporu.
						</p>
					</div>
				</div>
			</div>
		{:else}
			<div class="bg-white shadow rounded-lg p-6">
				<div class="text-center">
					<div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
						<svg class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
					</div>
					<h3 class="mt-4 text-lg leading-6 font-medium text-gray-900">
						Chcete reaktivovat svůj účet?
					</h3>
					<div class="mt-2">
						<p class="text-sm text-gray-500">
							Účet: <strong>{profile?.email || 'Neznámý'}</strong>
						</p>
						<p class="text-sm text-gray-500 mt-1">
							⏰ Zbývá <strong>{daysRemaining} dní</strong> na reaktivaci
						</p>
					</div>
				</div>

				<div class="mt-6 bg-yellow-50 border border-yellow-200 rounded p-4">
					<h4 class="text-sm font-medium text-yellow-800">
						ℹ️ Co se stane při reaktivaci:
					</h4>
					<ul class="mt-2 text-sm text-yellow-700 list-disc list-inside space-y-1">
						<li>Žádost o smazání dat bude zrušena</li>
						<li>Získáte opět plný přístup k účtu</li>
						<li>Všechna vaše data zůstanou zachována</li>
						<li>Budete se moci přihlásit jako obvykle</li>
					</ul>
				</div>

				{#if form?.success}
					<div class="mt-4 bg-green-50 border border-green-200 rounded p-4">
						<p class="text-green-800">
							✅ <strong>Účet byl úspěšně reaktivován!</strong><br>
							Nyní se můžete <a href="/login" class="underline">přihlásit</a> jako obvykle.
						</p>
					</div>
				{:else if form?.error}
					<div class="mt-4 bg-red-50 border border-red-200 rounded p-4">
						<p class="text-red-800">
							❌ <strong>Chyba:</strong> {form.error}
						</p>
					</div>
				{:else}
					<form method="POST" action="?/reactivate" class="mt-6 space-y-4">
						<input type="hidden" name="token" value={token} />
						
						<div class="flex items-center">
							<input 
								id="confirm-reactivation" 
								name="confirmed" 
								type="checkbox" 
								required
								class="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
							>
							<label for="confirm-reactivation" class="ml-2 block text-sm text-gray-900">
								Potvrzujem, že chci reaktivovat svůj účet a zrušit žádost o smazání dat
							</label>
						</div>

						<div class="flex space-x-4">
							<button 
								type="submit"
								class="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
							>
								✅ Reaktivovat účet
							</button>
							<a 
								href="/"
								class="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md text-center hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
							>
								❌ Zrušit
							</a>
						</div>
					</form>
				{/if}
			</div>
		{/if}

		<div class="text-center">
			<p class="text-xs text-gray-500">
				Tento proces je v souladu s GDPR (EU 2016/679) článek 17<br>
				"Právo na výmaz" a českou legislativou o ochraně osobních údajů.
			</p>
		</div>
	</div>
</section> 