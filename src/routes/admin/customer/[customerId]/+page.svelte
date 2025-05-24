<script lang="ts">
	import CustomerDetail from "../CustomerDetail.svelte";
	export let data: any;
	
	// Destructuring dat ze serveru
	$: customer = data.customer;
	$: orders = data.orders;
	$: supabase = data.supabase;
	$: session = data.session;
</script>

<svelte:head>
	<title>LEO - Zákazník</title>
</svelte:head>

<CustomerDetail data={{ supabase, session }} {customer} />

<!-- Historie objednávek -->
<div class="mt-8 bg-white rounded-lg shadow-md p-6">
	<h2 class="text-xl font-semibold mb-4">Historie objednávek</h2>
	{#if orders && orders.length > 0}
		<div class="overflow-x-auto">
			<table class="min-w-full divide-y divide-gray-200">
				<thead class="bg-gray-50">
					<tr>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
							Číslo objednávky
						</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
							Datum
						</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
							Stav
						</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
							Celková cena
						</th>
						<th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
							Akce
						</th>
					</tr>
				</thead>
				<tbody class="bg-white divide-y divide-gray-200">
					{#each orders as order}
						<tr>
							<td class="px-6 py-4 whitespace-nowrap">
								<div class="text-sm font-medium text-gray-900">
									#{order.order_number}
								</div>
							</td>
							<td class="px-6 py-4 whitespace-nowrap">
								<div class="text-sm text-gray-900">
									{new Date(order.created_at).toLocaleDateString('cs-CZ')}
								</div>
							</td>
							<td class="px-6 py-4 whitespace-nowrap">
								<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
									{order.state}
								</span>
							</td>
							<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
								{order.total_price} Kč
							</td>
							<td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
								<a
									href="/admin/order/{order.id}"
									class="text-blue-600 hover:text-blue-900"
								>
									Detail
								</a>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{:else}
		<p class="text-gray-500 text-center py-4">
			Zákazník zatím nemá žádné objednávky
		</p>
	{/if}
</div>