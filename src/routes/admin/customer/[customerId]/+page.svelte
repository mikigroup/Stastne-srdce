<script lang="ts">
	import CustomerDetail from "../CustomerDetail.svelte";
	import { goto } from "$app/navigation";
	import AdminPageLayout from "$lib/component/AdminPageLayout.svelte";
	import { formatPrice, formatDateToCzechShort, formatDateTimeToCzechShort } from "$lib/utils/formatting";
	
	export let data: any;
	
	// Destructuring dat ze serveru
	$: customer = data.customer;
	$: orders = data.orders;
	$: stats = data.stats;
	$: loyaltyInfo = data.loyaltyInfo;
	$: supabase = data.supabase;
	$: session = data.session;

	// Importujeme centrální formatPrice funkci

	// Helper funkce pro formátování data


	// Helper funkce pro formátování období
	function formatDays(days: number): string {
		if (days < 30) return `${days} dnů`;
		if (days < 365) return `${Math.floor(days / 30)} měsíců`;
		return `${Math.floor(days / 365)} let`;
	}

	// Helper funkce pro získání CSS tříd podle úrovně věrnosti
	function getLoyaltyClasses(color: string): string {
		const colorMap: Record<string, string> = {
			purple: 'bg-purple-50 border-purple-200 text-purple-700',
			yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
			blue: 'bg-blue-50 border-blue-200 text-blue-700',
			gray: 'bg-gray-50 border-gray-200 text-gray-700'
		};
		return colorMap[color] || colorMap.gray;
	}

	// Navigační funkce
	async function back() {
		await goto("/admin/customer");
	}

	// Reference na CustomerDetail komponentu pro volání funkcí
	let customerDetailComponent: any;
	let loading = false;

	// Definice akcí pro AdminPageLayout
	$: actions = [
		{
			label: loading ? 'Ukládá se...' : 'Uložit změny',
			onClick: () => customerDetailComponent?.saveCustomer(),
			variant: 'primary' as const,
			loading,
			disabled: loading
		},
		{
			label: loading ? 'Maže se...' : 'Smazat',
			onClick: () => customerDetailComponent?.deleteCustomer(),
			variant: 'danger' as const,
			loading,
			disabled: loading
		}
	];
</script>

<svelte:head>
	<title>LEO - Zákazník</title>
</svelte:head>

<AdminPageLayout
	title="Detail zákazníka"
	subtitle="{customer?.first_name ?? ''} {customer?.last_name ?? ''}"
	backUrl="/admin/customer"
	{actions}>

	<CustomerDetail bind:this={customerDetailComponent} bind:loading data={{ supabase, session }} {customer} />

	<!-- Věrnostní systém zákazníka -->
	<div class="mt-8 bg-white rounded-lg shadow-md p-6">
		<h2 class="text-xl font-semibold mb-6">Věrnostní profil zákazníka</h2>
		
		<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
			<!-- Úroveň věrnosti -->
			<div class="lg:col-span-2">
				<div class="border-2 rounded-lg p-6 {getLoyaltyClasses(loyaltyInfo.color)}">
					<div class="flex items-center justify-between mb-4">
						<div class="flex items-center">
							<span class="text-3xl mr-3">{loyaltyInfo.icon}</span>
							<div>
								<h3 class="text-xl font-bold">{loyaltyInfo.label}</h3>
								<p class="text-sm opacity-75">
									{stats.totalOrders} objednávek • {formatPrice(stats.totalSpent, true)} celkem
								</p>
							</div>
						</div>
						<div class="text-right">
							{#if loyaltyInfo.isActive}
								<span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
									<span class="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
									Aktivní
								</span>
							{:else}
								<span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
									<span class="w-2 h-2 bg-red-400 rounded-full mr-2"></span>
									Neaktivní
								</span>
							{/if}
						</div>
					</div>

					<!-- Progress bar pro další úroveň -->
					{#if loyaltyInfo.level !== 'VIP'}
						{@const nextLevelThresholds = { NEW: 3, REGULAR: 10, LOYAL: 20 }}
						{@const nextThreshold = loyaltyInfo.level === 'NEW' ? 3 : loyaltyInfo.level === 'REGULAR' ? 10 : 20}
						{@const progress = Math.min((stats.totalOrders / nextThreshold) * 100, 100)}
						{@const remaining = Math.max(nextThreshold - stats.totalOrders, 0)}
						
						<div class="mt-4">
							<div class="flex justify-between text-sm mb-2">
								<span>Pokrok k další úrovni</span>
								<span>{remaining} objednávek zbývá</span>
							</div>
							<div class="w-full bg-gray-200 rounded-full h-2">
								<div class="h-2 rounded-full bg-current transition-all duration-300" style="width: {progress}%"></div>
							</div>
						</div>
					{:else}
						<div class="mt-4 text-center">
							<span class="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-purple-600 to-pink-600 text-white">
								🏆 Maximální úroveň dosažena!
							</span>
						</div>
					{/if}
				</div>
			</div>

			<!-- Časové údaje -->
			<div class="space-y-4">
				<div class="bg-gray-50 rounded-lg p-4">
					<h4 class="font-semibold text-gray-900 mb-3">Časové údaje</h4>
					<div class="space-y-3 text-sm">
						{#if loyaltyInfo.customerSince > 0}
							<div class="flex justify-between">
								<span class="text-gray-600">Zákazník od:</span>
								<span class="font-medium">{formatDays(loyaltyInfo.customerSince)}</span>
							</div>
						{/if}
						{#if loyaltyInfo.daysSinceLastOrder !== null}
							<div class="flex justify-between">
								<span class="text-gray-600">Poslední objednávka:</span>
								<span class="font-medium">
									{loyaltyInfo.daysSinceLastOrder === 0 ? 'Dnes' : `před ${loyaltyInfo.daysSinceLastOrder} dny`}
								</span>
							</div>
						{/if}
						{#if stats.averageOrderValue > 0}
							<div class="flex justify-between">
								<span class="text-gray-600">Průměr/objednávka:</span>
								<span class="font-medium">{formatPrice(stats.averageOrderValue, true)}</span>
							</div>
						{/if}
					</div>
				</div>

				<!-- Doporučené akce -->
				<div class="bg-blue-50 rounded-lg p-4">
					<h4 class="font-semibold text-blue-900 mb-3">Doporučené akce</h4>
					<div class="space-y-2">
						{#if !loyaltyInfo.isActive}
							<button class="w-full text-left px-3 py-2 text-sm bg-white border border-blue-200 rounded hover:bg-blue-50 transition-colors">
								📧 Poslat nabídku pro návrat
							</button>
						{/if}
						{#if loyaltyInfo.level === 'VIP' || loyaltyInfo.level === 'LOYAL'}
							<button class="w-full text-left px-3 py-2 text-sm bg-white border border-blue-200 rounded hover:bg-blue-50 transition-colors">
								🎁 Poslat speciální slevu
							</button>
						{/if}
						<button class="w-full text-left px-3 py-2 text-sm bg-white border border-blue-200 rounded hover:bg-blue-50 transition-colors">
							📞 Kontaktovat zákazníka
						</button>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Statistiky zákazníka -->
	<div class="mt-8 bg-white rounded-lg shadow-md p-6">
		<h2 class="text-xl font-semibold mb-6">Statistiky zákazníka</h2>
		
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
			<!-- Celkový počet objednávek -->
			<div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
				<div class="flex items-center">
					<div class="flex-shrink-0">
						<div class="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
							<svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
							</svg>
						</div>
					</div>
					<div class="ml-4">
						<p class="text-sm font-medium text-blue-600">Celkem objednávek</p>
						<p class="text-2xl font-bold text-blue-900">{stats.totalOrders}</p>
					</div>
				</div>
			</div>

			<!-- Celková útrata -->
			<div class="bg-green-50 border border-green-200 rounded-lg p-4">
				<div class="flex items-center">
					<div class="flex-shrink-0">
						<div class="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
							<svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
							</svg>
						</div>
					</div>
					<div class="ml-4">
						<p class="text-sm font-medium text-green-600">Celková útrata</p>
						<p class="text-2xl font-bold text-green-900">{formatPrice(stats.totalSpent, true)}</p>
					</div>
				</div>
			</div>

			<!-- Průměrná hodnota objednávky -->
			<div class="bg-purple-50 border border-purple-200 rounded-lg p-4">
				<div class="flex items-center">
					<div class="flex-shrink-0">
						<div class="w-8 h-8 bg-purple-100 rounded-md flex items-center justify-center">
							<svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
							</svg>
						</div>
					</div>
					<div class="ml-4">
						<p class="text-sm font-medium text-purple-600">Průměr na objednávku</p>
						<p class="text-2xl font-bold text-purple-900">{formatPrice(stats.averageOrderValue, true)}</p>
					</div>
				</div>
			</div>

			<!-- Nezaplacené objednávky -->
			<div class="bg-red-50 border border-red-200 rounded-lg p-4">
				<div class="flex items-center">
					<div class="flex-shrink-0">
						<div class="w-8 h-8 bg-red-100 rounded-md flex items-center justify-center">
							<svg class="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z" />
							</svg>
						</div>
					</div>
					<div class="ml-4">
						<p class="text-sm font-medium text-red-600">Nezaplacené</p>
						<p class="text-lg font-bold text-red-900">{stats.unpaidOrders} ({formatPrice(stats.unpaidAmount, true)})</p>
					</div>
				</div>
			</div>
		</div>

		<!-- Dodatečné informace -->
		{#if stats.firstOrderDate || stats.lastOrderDate}
			<div class="mt-6 pt-6 border-t border-gray-200">
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
					{#if stats.firstOrderDate}
						<div>
							<span class="font-medium">První objednávka:</span>
							{formatDateToCzechShort(stats.firstOrderDate)}
						</div>
					{/if}
					{#if stats.lastOrderDate}
						<div>
							<span class="font-medium">Poslední objednávka:</span>
							{formatDateToCzechShort(stats.lastOrderDate)}
						</div>
					{/if}
				</div>
			</div>
		{/if}
	</div>

	<!-- Historie objednávek -->
	<div class="mt-8 bg-white rounded-lg shadow-md p-6">
		<h2 class="text-xl font-semibold mb-4">Objednávky</h2>
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
										{formatDateTimeToCzechShort(order.created_at)}
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
</AdminPageLayout>