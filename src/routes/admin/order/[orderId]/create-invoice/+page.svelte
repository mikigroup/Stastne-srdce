<!--
<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { fly, fade } from 'svelte/transition';
	import type { PageData } from './$types';

	export let data: PageData;
	export let form;

	let { order, profile, hasInvoice, invoiceId, invoiceNumber } = data;
	$: ({ order, profile, hasInvoice, invoiceId, invoiceNumber } = data);

	let loading = false;
	let sendEmail = true;
	let markPaid = false;

	async function goBack() {
		await goto(`/admin/order/${order.id}`);
	}

	function handleSubmit() {
		loading = true;
		return async ({ result, update }) => {
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

		<div class="w-20">&lt;!&ndash; Placeholder &ndash;&gt;</div>
	</div>

	{#if hasInvoice}
		<div class="bg-amber-50 p-4 rounded-lg border border-amber-200 mb-6">
			<p class="text-amber-800">
				Pro tuto objednávku již byla vytvořena faktura s číslem <strong>{invoiceNumber}</strong> (ID: {invoiceId}).
			</p>
		</div>
	{:else}
		<div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
			&lt;!&ndash; Informace o objednávce &ndash;&gt;
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

			&lt;!&ndash; Informace o zákazníkovi &ndash;&gt;
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

		&lt;!&ndash; Položky objednávky &ndash;&gt;
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

		&lt;!&ndash; Formulář pro vytvoření faktury &ndash;&gt;
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
						Označit fakturu jako uhrazenou a změnit stav objednávky na "Vyfakturovaná"
					</label>
				</div>
			</div>

			<div class="mt-6">
				<button
					type="submit"
					class="w-full inline-flex justify-center items-center py-3 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
					disabled={loading}
				>
					{#if loading}
						<svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
							<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
							<path class="opacity-75" fill="currentColor" d="M4-->
