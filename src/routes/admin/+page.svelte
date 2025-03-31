<script lang="ts">
	import { Line } from "svelte-chartjs";
	import {
		Chart,
		Title,
		Tooltip,
		LineElement,
		LinearScale,
		PointElement,
		CategoryScale
	} from "chart.js";
	import { goto } from "$app/navigation";
	import DateRangeSelector from "$lib/component/DateRangeSelector.svelte";
	import { onMount } from "svelte";
	import { ROUTES } from "$lib/stores/store";

	Chart.register(
		Title,
		Tooltip,
		LineElement,
		LinearScale,
		PointElement,
		CategoryScale
	);

	export let data;

	// All data from the server
	$: allOrders = data.orders;
	$: allCustomers = data.customers;
	$: todayOrders = data.todayOrders || [];
	$: todayOrdersCount = data.todayOrdersCount || 0;
	$: todayOrdersTotal = data.todayOrdersTotal || 0;

	// Filtered data based on selected date range
	let filteredOrders = [];
	let filteredCustomers = [];
	let currentDateRange = '';
	let startDate: string;
	let endDate: string;

	onMount(() => {
		// Default to current month on initial load
		const now = new Date();
		startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
		endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999).toISOString();
		filterDataByDateRange();
	});

	function handleRangeChange(event) {
		const { startDate: start, endDate: end, formattedRange } = event.detail;
		startDate = start;
		endDate = end;
		currentDateRange = formattedRange;
		filterDataByDateRange();
	}

	function filterDataByDateRange() {
		// Filter orders by date range
		filteredOrders = allOrders.filter(order => {
			const orderDate = new Date(order.created_at);
			return orderDate >= new Date(startDate) && orderDate <= new Date(endDate);
		});

		// Filter customers by date range (customers who registered in the period)
		filteredCustomers = allCustomers.filter(customer => {
			const customerDate = new Date(customer.created_at);
			return customerDate >= new Date(startDate) && customerDate <= new Date(endDate);
		});
	}

	// Process data for charts
	$: orderData = processOrderData(filteredOrders);
	$: customerData = processCustomerData(filteredCustomers);
	$: currentRangeOrders = filteredOrders.length;
	$: currentRangeCustomers = filteredCustomers.length;
	$: currentRangeRevenue = filteredOrders.reduce((sum, order) => sum + (order.total_price || 0), 0);

	function processOrderData(orders) {
		return orders.reduce((acc, order) => {
			const date = new Date(order.created_at).toISOString().split("T")[0];
			const existingDate = acc.find((item) => item.date === date);
			if (existingDate) {
				existingDate.count++;
			} else {
				acc.push({ date, count: 1 });
			}
			return acc;
		}, []).sort((a, b) => a.date.localeCompare(b.date));
	}

	function processCustomerData(customers) {
		return customers.reduce((acc, customer, index) => {
			const date = new Date(customer.created_at).toISOString().split("T")[0];
			acc.push({ date, count: index + 1 });
			return acc;
		}, []).sort((a, b) => a.date.localeCompare(b.date));
	}

	function formatCurrency(value) {
		return new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK' }).format(value);
	}

	function formatDateTime(dateString) {
		return new Date(dateString).toLocaleString('cs-CZ', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function getStatusColor(status) {
		switch(status) {
			case 'Nová': return 'bg-blue-100 text-blue-800';
			case 'Zpracovává se': return 'bg-yellow-100 text-yellow-800';
			case 'Dokončená': return 'bg-green-100 text-green-800';
			case 'Zrušená': return 'bg-red-100 text-red-800';
			default: return 'bg-gray-100 text-gray-800';
		}
	}

	function getPaymentStatusColor(status) {
		return status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
	}

	function viewOrderDetail(orderId) {
		goto(`/admin/order/${orderId}`);
	}

	$: orderChartData = {
		labels: orderData.map((d) => d.date),
		datasets: [
			{
				label: "Počet objednávek",
				data: orderData.map((d) => d.count),
				fill: false,
				borderColor: "rgb(75, 192, 192)",
				tension: 0.1
			}
		]
	};

	$: customerChartData = {
		labels: customerData.map((d) => d.date),
		datasets: [
			{
				label: "Počet zákazníků",
				data: customerData.map((d) => d.count),
				fill: false,
				borderColor: "rgb(37, 50, 17)",
				tension: 0.1
			}
		]
	};


</script>

<svelte:head>
	<title>Dashboard</title>
</svelte:head>

<div class="p-4">
	<h2 class="text-2xl font-bold mb-4">Dashboard</h2>

	<!-- Date Range Selector -->
	<DateRangeSelector on:rangeChange={handleRangeChange} />

	<!-- Horní statistické karty -->
	<div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
		<div class="card bg-base-100 shadow-xl border border-gray-300 hover:transform hover:scale-103 transition-transform duration-300">
			<a href="{$ROUTES.ADMIN.ORDER.LIST}" class="">
			<div class="card-body">
				<h2 class="card-title">Objednávky</h2>
				<p class="text-4xl font-bold">{currentRangeOrders}</p>
				<p class="text-sm text-gray-500">
					{currentDateRange || "Aktuální měsíc"}
				</p>
			</div>
			</a>
		</div>

		<div class="card bg-base-100 shadow-xl border border-gray-300">
			<div class="card-body">
				<h2 class="card-title">Tržby</h2>
				<p class="text-4xl font-bold">{formatCurrency(currentRangeRevenue)}</p>
				<p class="text-sm text-gray-500">
					{currentDateRange || "Aktuální měsíc"}
				</p>
			</div>
		</div>

		<a href="{$ROUTES.ADMIN.CUSTOMER.LIST}" class="">
		<div class="card bg-base-100 shadow-xl border border-gray-300 hover:transform hover:scale-103 transition-transform duration-300">
			<div class="card-body">
				<h2 class="card-title">Noví zákazníci</h2>
				<p class="text-4xl font-bold">{currentRangeCustomers}</p>
				<p class="text-sm text-gray-500">
					{currentDateRange || "Aktuální měsíc"}
				</p>
			</div>
		</div>
		</a>
	</div>

	<!-- Sekce dnešních objednávek -->
	<div class="card bg-base-100 shadow-xl mb-8 border border-gray-300">
		<div class="card-body">
			<div class="flex justify-between items-center mb-4">
				<h2 class="card-title">Objednávky za dnešní den</h2>
				<div class="stats shadow bg-gray-200 border border-gray-300">
					<div class="stat">
						<div class="stat-title">Počet</div>
						<div class="stat-value">{todayOrdersCount}</div>
					</div>
					<div class="stat">
						<div class="stat-title">Celkem</div>
						<div class="stat-value !divide-blue-300">{formatCurrency(todayOrdersTotal)}</div>
					</div>
				</div>
			</div>

			{#if todayOrdersCount > 0}
				<div class="overflow-x-auto">
					<table class="table table-zebra w-full">
						<thead>
						<tr>
							<th>Číslo</th>
							<th>Čas</th>
							<th>Zákazník</th>
							<th>Kontakt</th>
							<th>Položek</th>
							<th>Celkem</th>
							<th>Stav</th>
							<th>Platba</th>
							<th>Akce</th>
						</tr>
						</thead>
						<tbody>
						{#each todayOrders as order}
							<tr class="hover">
								<td>#{order.order_number}</td>
								<td>{formatDateTime(order.created_at)}</td>
								<td>{order.customer_first_name} {order.customer_last_name}</td>
								<td>
									<div class="flex flex-col">
										<span class="text-xs">{order.customer_email}</span>
										<span class="text-xs">{order.customer_telephone}</span>
									</div>
								</td>
								<td>{order.total_pieces}</td>
								<td>{formatCurrency(order.total_price)}</td>
								<td>
										<span class="px-2 py-1 text-xs font-semibold rounded-full {getStatusColor(order.state)}">
											{order.state}
										</span>
								</td>
								<td>
										<span class="px-2 py-1 text-xs font-semibold rounded-full {getPaymentStatusColor(order.pay_state)}">
											{order.pay_state ? 'Zaplaceno' : 'Nezaplaceno'}
										</span>
								</td>
								<td>
									<button
										class="btn btn-xs btn-primary"
										on:click={() => viewOrderDetail(order.id)}
									>
										Detail
									</button>
								</td>
							</tr>
						{/each}
						</tbody>
					</table>
				</div>
			{:else}
				<div class="alert">
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
					</svg>
					<span>Dnes zatím nebyly vytvořeny žádné objednávky.</span>
				</div>
			{/if}
		</div>
	</div>

	<!-- Grafy -->
	<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
		<div class="card bg-base-100 shadow-xl border border-gray-300">
			<div class="card-body">
				<h2 class="card-title">Vývoj objednávek</h2>
				{#if orderData.length > 0}
					<Line data={orderChartData} options={{ responsive: true }} />
				{:else}
					<div class="alert mt-4">
						<span>Žádná data pro zobrazení v tomto období.</span>
					</div>
				{/if}
			</div>
		</div>
		<div class="card bg-base-100 shadow-xl border border-gray-300">
			<div class="card-body">
				<h2 class="card-title">Růst zákazníků</h2>
				{#if customerData.length > 0}
					<Line data={customerChartData} options={{ responsive: true }} />
				{:else}
					<div class="alert mt-4">
						<span>Žádná data pro zobrazení v tomto období.</span>
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>