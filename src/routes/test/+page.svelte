<script lang="ts">
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';

	export let data: PageData;

	let { invoices, pagination, rateLimit } = data;

	// Funkce pro formátování data
	function formatDate(dateString: string): string {
		const date = new Date(dateString);
		return date.toLocaleDateString('cs-CZ');
	}

	// Funkce pro navigaci na jinou stránku výpisu
	function goToPage(page: number) {
		goto(`?page=${page}`);
	}
</script>

<svelte:head>
	<title>Faktury ze systému Fakturoid</title>
</svelte:head>

<div class="max-w-screen-xl mx-auto p-4 bg-white shadow-lg rounded-lg">
	<h1 class="text-3xl font-bold mb-6">Přehled faktur</h1>

	<!-- Informace o API limitu -->
	<div class="mb-4 text-sm text-gray-600">
		<p>Zbývající požadavky: {rateLimit.remainingRequests} z {rateLimit.maxRequests}</p>
		<p>Limit se obnoví za: {Math.floor(rateLimit.resetTime / 60)}:{(rateLimit.resetTime % 60).toString().padStart(2, '0')}</p>
	</div>

	<!-- Tabulka faktur -->
	{#if invoices && invoices.length > 0}
		<div class="overflow-x-auto">
			<table class="w-full border-collapse">
				<thead>
				<tr class="bg-gray-100">
					<th class="border p-2 text-left">Číslo</th>
					<th class="border p-2 text-left">Odběratel</th>
					<th class="border p-2 text-left">Vystaveno</th>
					<th class="border p-2 text-left">Splatnost</th>
					<th class="border p-2 text-right">Částka</th>
					<th class="border p-2 text-center">Stav</th>
					<th class="border p-2 text-center">Akce</th>
				</tr>
				</thead>
				<tbody>
				{#each invoices as invoice}
					<tr class="hover:bg-gray-50">
						<td class="border p-2">{invoice.number}</td>
						<td class="border p-2">{invoice.subject_name}</td>
						<td class="border p-2">{formatDate(invoice.issued_on)}</td>
						<td class="border p-2">{formatDate(invoice.due_on)}</td>
						<td class="border p-2 text-right">{invoice.total} {invoice.currency}</td>
						<td class="border p-2 text-center">
                <span class="inline-block px-2 py-1 rounded-full text-xs font-semibold
                  {invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                   invoice.status === 'overdue' ? 'bg-red-100 text-red-800' :
                   'bg-blue-100 text-blue-800'}">
                  {invoice.status === 'paid' ? 'Zaplaceno' :
										invoice.status === 'overdue' ? 'Po splatnosti' :
											invoice.status === 'sent' ? 'Odesláno' : 'Otevřeno'}
                </span>
						</td>
						<td class="border p-2 text-center">
							<a
								href={invoice.html_url}
								target="_blank"
								rel="noopener noreferrer"
								class="text-blue-600 hover:text-blue-800 underline">
								Zobrazit
							</a>
						</td>
					</tr>
				{/each}
				</tbody>
			</table>
		</div>

		<!-- Stránkování -->
		<div class="flex justify-between items-center mt-4">
			<button
				class="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
				disabled={pagination.currentPage <= 1}
				on:click={() => goToPage(pagination.currentPage - 1)}>
				Předchozí stránka
			</button>

			<span>Stránka {pagination.currentPage} z {pagination.totalPages || '?'}</span>

			<button
				class="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
				on:click={() => goToPage(pagination.currentPage + 1)}>
				Další stránka
			</button>
		</div>
	{:else}
		<div class="p-8 text-center text-gray-500">
			<p>Žádné faktury nebyly nalezeny.</p>
		</div>
	{/if}
</div>