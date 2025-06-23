<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { fly, fade } from 'svelte/transition';
	import type { PageData, ActionData } from './$types';
	import { browser } from '$app/environment';
	import { page } from '$app/stores';

	export let data: {
		fakturoidAuthUrl: string;
		fakturoidState: string;
	} & {
		order: any;
		profile: any; 
		hasInvoice: boolean;
		invoiceId: string;
		invoiceNumber: string;
		isFromCurrentAccount?: boolean;
		currentFakturoidAccount?: string;
	};

	export let form: ActionData | null = null;

	let { order, profile, hasInvoice, invoiceId, invoiceNumber } = data;
	$: ({ order, profile, hasInvoice, invoiceId, invoiceNumber } = data);

	let loading = false;
	let sendEmail = false;
	let markPaid = true;
	let authStatus = 'idle';
	let error = '';

	// Funkce pro formátování názvu položky - stejná jako ve Fakturoidu
	function formatItemName(item: any): string {
		// Zkusíme získat datum z různých možných míst ve struktuře
		let menuDate = null;
		
		// Priorita: menu_id > menu_version_id > jiné možnosti
		if (item.variant_id?.menu_id?.date) {
			menuDate = item.variant_id.menu_id.date;
		} else if (item.variant_id?.menu_version_id?.date) {
			menuDate = item.variant_id.menu_version_id.date;
		} else if (item.menuVersionData?.date) {
			menuDate = item.menuVersionData.date;
		}
		
		// Získání čísla varianty
		const variantNumber = item.variant_id?.variant_number || item.variant?.variant_number;
		
		// Formátování data do českého formátu
		let formattedDate = '';
		if (menuDate) {
			try {
				const date = new Date(menuDate);
				if (!isNaN(date.getTime())) {
					formattedDate = date.toLocaleDateString('cs-CZ', {
						day: 'numeric',
						month: 'numeric', 
						year: 'numeric'
					});
				}
			} catch (e) {
				console.warn('Chyba při formátování data:', e);
			}
		}
		
		// Sestavení názvu - pouze datum, "Menu" a číslo
		let itemName = '';
		
		// Přidáme datum pokud máme
		if (formattedDate) {
			itemName += `${formattedDate} `;
		}
		
		// Přidáme "Menu" a číslo
		if (variantNumber) {
			itemName += `Menu ${variantNumber}`;
		} else {
			itemName += 'Menu';
		}
		
		// Fallback pokud nemáme žádné údaje
		return itemName || 'Položka menu';
	}

	async function goBack() {
		await goto(`/admin/order/${order.id}`);
	}

	function handleSubmit() {
		loading = true;
		return async ({ result, update }: { result: any, update: () => Promise<void> }) => {
			await update();

			if (result.type === 'success') {
				setTimeout(() => {
					goBack();
				}, 3000);
			}

			loading = false;
		};
	}
</script>

<svelte:head>
	<title>Vytvoření faktury | Šťastné srdce</title>
</svelte:head>

<div class="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md border" in:fly={{ y: 50, duration: 300 }}>
	<div class="flex justify-between items-center mb-6">
		<button
			class="btn btn-outline"
			on:click={goBack}
		>
			Zpět
		</button>

		<h1 class="text-2xl font-bold">Vytvoření faktury</h1>

		<div class="w-20"><!-- Placeholder --></div>
	</div>

	{#if hasInvoice}
		<div class="bg-amber-50 p-4 rounded-lg border border-amber-200 mb-6">
			<p class="text-amber-800">
				Pro tuto objednávku již byla vytvořena faktura s číslem <strong>{invoiceNumber}</strong> (ID: {invoiceId}).
			</p>
		</div>
	{:else}
		<div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
			<!-- Informace o objednávce -->
			<div class="bg-gray-50 p-4 rounded-lg border">
				<h2 class="text-lg font-semibold mb-3">Informace o objednávce</h2>

				<div class="space-y-2">
					<div class="flex justify-between">
						<span class="text-gray-600">Číslo objednávky:</span>
						<span class="font-medium">{order.order_number || 'N/A'}</span>
					</div>

					<div class="flex justify-between">
						<span class="text-gray-600">Datum objednávky:</span>
						<span class="font-medium">
							{order.date ? new Date(order.date).toLocaleDateString('cs-CZ') : 'N/A'}
						</span>
					</div>

					<div class="flex justify-between">
						<span class="text-gray-600">Celková částka:</span>
						<span class="font-semibold">{order.total_price} {order.currency || 'CZK'}</span>
					</div>

					<div class="flex justify-between">
						<span class="text-gray-600">Stav platby:</span>
						<span class="font-medium">
							{order.pay_state ? 'Zaplaceno' : 'Nezaplaceno'}
						</span>
					</div>

					<div class="flex justify-between">
						<span class="text-gray-600">Způsob platby:</span>
						<span class="font-medium">{order.pay_method || 'Neurčeno'}</span>
					</div>
				</div>
			</div>

			<!-- Informace o zákazníkovi -->
			<div class="bg-gray-50 p-4 rounded-lg border">
				<h2 class="text-lg font-semibold mb-3">Zákazník</h2>

				<div class="space-y-2">
					<div class="flex justify-between">
						<span class="text-gray-600">Jméno:</span>
						<span class="font-medium">{profile.first_name} {profile.last_name}</span>
					</div>

					<div class="flex justify-between">
						<span class="text-gray-600">E-mail:</span>
						<span class="font-medium">{profile.email}</span>
					</div>

					<div class="flex justify-between">
						<span class="text-gray-600">Telefon:</span>
						<span class="font-medium">{profile.telephone || 'N/A'}</span>
					</div>

					<div class="flex justify-between">
						<span class="text-gray-600">Adresa:</span>
						<span class="font-medium text-right">
							{profile.street} {profile.street_number}<br>
							{profile.zip_code} {profile.city}
						</span>
					</div>

					{#if profile.ico || profile.dic}
						<div class="flex justify-between">
							<span class="text-gray-600">IČO/DIČ:</span>
							<span class="font-medium">
								{profile.ico || '-'} / {profile.dic || '-'}
							</span>
						</div>
					{/if}
				</div>
			</div>
		</div>

		<!-- Položky objednávky -->
		<div class="mb-6">
			<h2 class="text-lg font-semibold mb-3">Položky faktury</h2>

			<div class="bg-gray-50 rounded-lg border overflow-x-auto">
				<table class="min-w-full divide-y divide-gray-200">
					<thead class="bg-gray-100">
					<tr>
						<th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Popis</th>
						<th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Množství</th>
						<th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Cena/ks</th>
						<th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Celkem</th>
					</tr>
					</thead>
					<tbody class="bg-white divide-y divide-gray-200">
					{#if order.order_items && order.order_items.length > 0}
						{#each order.order_items as item}
							<tr class="hover:bg-gray-50">
								<td class="px-4 py-3 text-sm">
									{item.variant?.description || 'Položka menu'}
								</td>
								<td class="px-4 py-3 text-sm text-center">{item.quantity} ks</td>
								<td class="px-4 py-3 text-sm text-right">{item.price} Kč</td>
								<td class="px-4 py-3 text-sm text-right font-medium">{(item.price * item.quantity).toFixed(2)} Kč</td>
							</tr>
						{/each}
					{:else}
						<tr>
							<td colspan="4" class="px-4 py-3 text-sm text-center text-gray-500">
								Žádné položky k fakturaci
							</td>
						</tr>
					{/if}
					</tbody>
					<tfoot class="bg-gray-50">
					<tr>
						<td colspan="3" class="px-4 py-3 text-sm text-right font-medium">Celkem:</td>
						<td class="px-4 py-3 text-sm text-right font-bold">{order.total_price} Kč</td>
					</tr>
					</tfoot>
				</table>
			</div>
		</div>

		<!-- Formulář pro vytvoření faktury -->
		<form
			method="POST"
			action="?/createInvoice"
			use:enhance={handleSubmit}
			class="bg-gray-50 p-6 rounded-lg border"
		>
			<h2 class="text-lg font-semibold mb-4">Nastavení faktury</h2>

			<div class="space-y-4">
				<div class="flex items-center">
					<input
						type="checkbox"
						id="sendEmail"
						name="sendEmail"
						value="true"
						bind:checked={sendEmail}
						class="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
					/>
					<label for="sendEmail" class="ml-2 block text-sm text-gray-700">
						Odeslat fakturu e-mailem zákazníkovi po vytvoření
					</label>
				</div>

				<div class="flex items-center">
					<input
						type="checkbox"
						id="markPaid"
						name="markPaid"
						value="true"
						bind:checked={markPaid}
						class="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
					/>
					<label for="markPaid" class="ml-2 block text-sm text-gray-700">
						Označit fakturu jako uhrazenou a změnit stav objednávky na "Fakturovaná"
					</label>
				</div>
			</div>

			<div class="mt-6 flex justify-end">
				<button
					type="submit"
					class="btn btn-primary"
					disabled={loading}
				>
					{loading ? 'Vytvářím fakturu...' : 'Vytvořit fakturu'}
				</button>
			</div>

			{#if form?.success === false}
				<div class="mt-4 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
					<div class="flex items-start">
						<div class="flex-shrink-0">
							<svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
								<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
							</svg>
						</div>
						<div class="ml-3 flex-1">
							<h3 class="text-sm font-medium text-red-800">
								{#if form.message?.includes('token vypršel')}
									Fakturoid token vypršel
								{:else if form.message?.includes('oprávnění')}
									Nedostatečná oprávnění
								{:else if form.message?.includes('připojení')}
									Problém s připojením
								{:else if form.message?.includes('Fakturoid')}
									Chyba Fakturoid API
								{:else}
									Chyba při vytváření faktury
								{/if}
							</h3>
							<div class="mt-2 text-sm text-red-700">
					{form.message}
							</div>
							{#if form.message?.includes('token vypršel') || form.message?.includes('oprávnění') || form.message?.includes('připojení') || form.message?.includes('Fakturoid')}
								<div class="mt-4">
									<a href="/admin/site-setting?tab=integrations" class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors">
										<svg class="mr-2 -ml-0.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
											<path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
										</svg>
										Reconnect Fakturoid
									</a>
								</div>
							{/if}
						</div>
					</div>
				</div>
			{/if}
		</form>
	{/if}
</div>
