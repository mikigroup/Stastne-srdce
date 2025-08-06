<script lang="ts">
	import type { PageData } from './$types';
	import AdminPageLayout from '$lib/component/AdminPageLayout.svelte';
	import { onMount } from 'svelte';

	export let data: PageData;

	let tenants = data.tenants;
	let loading = false;
	let error = data.error;

	// Form data pro nový tenant
	let newTenant = {
		slug: '',
		name: '',
		domain: '',
		status: 'active' as const
	};

	// Validace
	function validateTenant() {
		if (!newTenant.slug || !newTenant.name) {
			return 'Slug a název jsou povinné';
		}
		if (newTenant.slug.length < 3) {
			return 'Slug musí mít alespoň 3 znaky';
		}
		if (!/^[a-z0-9-]+$/.test(newTenant.slug)) {
			return 'Slug může obsahovat pouze malá písmena, čísla a pomlčky';
		}
		return null;
	}

	// Vytvořit nový tenant
	async function createTenant() {
		const validationError = validateTenant();
		if (validationError) {
			error = validationError;
			return;
		}

		loading = true;
		error = null;

		try {
			const response = await fetch('/admin/tenants', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(newTenant)
			});

			if (response.ok) {
				// Reset form
				newTenant = {
					slug: '',
					name: '',
					domain: '',
					status: 'active'
				};
				// Reload data
				window.location.reload();
			} else {
				const result = await response.json();
				error = result.error || 'Chyba při vytváření tenanta';
			}
		} catch (err) {
			error = 'Síťová chyba';
			console.error('Error creating tenant:', err);
		} finally {
			loading = false;
		}
	}

	// Formátování data
	function formatDate(dateString: string) {
		return new Date(dateString).toLocaleDateString('cs-CZ');
	}

	// Formátování statistik
	function formatNumber(num: number) {
		return num.toLocaleString('cs-CZ');
	}
</script>

<AdminPageLayout title="Správa tenantů">
	<div class="space-y-6">
		<!-- Header -->
		<div class="flex justify-between items-center">
			<div>
				<h1 class="text-2xl font-bold text-gray-900">Správa tenantů</h1>
				<p class="text-gray-600">Spravujte multi-tenant konfiguraci aplikace</p>
			</div>
		</div>

		<!-- Error message -->
		{#if error}
			<div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
				{error}
			</div>
		{/if}

		<!-- Create new tenant form -->
		<div class="bg-white shadow rounded-lg p-6">
			<h2 class="text-lg font-semibold text-gray-900 mb-4">Vytvořit nový tenant</h2>
			<form on:submit|preventDefault={createTenant} class="space-y-4">
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label for="slug" class="block text-sm font-medium text-gray-700">Slug *</label>
						<input
							type="text"
							id="slug"
							bind:value={newTenant.slug}
							class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
							placeholder="napr. novy-klient"
							required
						/>
						<p class="text-xs text-gray-500 mt-1">Unikátní identifikátor (pouze malá písmena, čísla, pomlčky)</p>
					</div>
					<div>
						<label for="name" class="block text-sm font-medium text-gray-700">Název *</label>
						<input
							type="text"
							id="name"
							bind:value={newTenant.name}
							class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
							placeholder="Název klienta"
							required
						/>
					</div>
				</div>
				<div>
					<label for="domain" class="block text-sm font-medium text-gray-700">Doména</label>
					<input
						type="text"
						id="domain"
						bind:value={newTenant.domain}
						class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
						placeholder="napr. novy-klient.malyleo.cz"
					/>
					<p class="text-xs text-gray-500 mt-1">Volitelné - pro automatické rozpoznávání tenanta</p>
				</div>
				<div>
					<button
						type="submit"
						disabled={loading}
						class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{loading ? 'Vytvářím...' : 'Vytvořit tenant'}
					</button>
				</div>
			</form>
		</div>

		<!-- Tenants list -->
		<div class="bg-white shadow rounded-lg">
			<div class="px-6 py-4 border-b border-gray-200">
				<h2 class="text-lg font-semibold text-gray-900">Aktivní tenanty</h2>
			</div>
			<div class="overflow-x-auto">
				<table class="min-w-full divide-y divide-gray-200">
					<thead class="bg-gray-50">
						<tr>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Tenant
							</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Doména
							</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Statistiky
							</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Vytvořeno
							</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Akce
							</th>
						</tr>
					</thead>
					<tbody class="bg-white divide-y divide-gray-200">
						{#each tenants as tenant}
							<tr>
								<td class="px-6 py-4 whitespace-nowrap">
									<div>
										<div class="text-sm font-medium text-gray-900">{tenant.name}</div>
										<div class="text-sm text-gray-500">@{tenant.slug}</div>
									</div>
								</td>
								<td class="px-6 py-4 whitespace-nowrap">
									{#if tenant.domain}
										<span class="text-sm text-gray-900">{tenant.domain}</span>
									{:else}
										<span class="text-sm text-gray-400">-</span>
									{/if}
								</td>
								<td class="px-6 py-4 whitespace-nowrap">
									<div class="text-sm text-gray-900">
										<div>👥 {formatNumber(tenant.stats.profiles)} uživatelů</div>
										<div>🍽️ {formatNumber(tenant.stats.menus)} menu</div>
										<div>📦 {formatNumber(tenant.stats.orders)} objednávek</div>
										<div>👤 {formatNumber(tenant.stats.customers)} zákazníků</div>
									</div>
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
									{formatDate(tenant.created_at)}
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
									<a
										href="/admin/tenants/{tenant.id}"
										class="text-blue-600 hover:text-blue-900"
									>
										Upravit
									</a>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	</div>
</AdminPageLayout> 