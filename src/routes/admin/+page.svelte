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

	Chart.register(
		Title,
		Tooltip,
		LineElement,
		LinearScale,
		PointElement,
		CategoryScale
	);

	export let data;

	$: orders = data.orders;
	$: customers = data.customers;
	$: todayOrders = data.todayOrders || [];
	$: todayOrdersCount = data.todayOrdersCount || 0;
	$: todayOrdersTotal = data.todayOrdersTotal || 0;
	$: orderData = processOrderData(orders);
	$: customerData = processCustomerData(customers);
	$: currentMonthOrders = orders.length;
	$: currentMonthCustomers = customers.length;
	$: currentMonthRevenue = orders.reduce((sum, order) => sum + (order.total_price || 0), 0);

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
		}, []);
	}

	function processCustomerData(customers) {
		return customers.reduce((acc, customer, index) => {
			const date = new Date(customer.created_at).toISOString().split("T")[0];
			acc.push({ date, count: index + 1 });
			return acc;
		}, []);
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
	<title>Dashboard - Šťastné srdce</title>
</svelte:head>

<div class="p-4">
	<h2 class="text-2xl font-bold mb-4">Dashboard</h2>

	<!-- Horní statistické karty -->
	<div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
		<div class="card bg-base-100 shadow-xl">
			<div class="card-body">
				<h2 class="card-title">Objednávky tento měsíc</h2>
				<p class="text-4xl font-bold">{currentMonthOrders}</p>
				<p class="text-sm text-gray-500">
					{new Date().toLocaleDateString("cs-CZ", {
						month: "long",
						year: "numeric"
					})}
				</p>
			</div>
		</div>

		<div class="card bg-base-100 shadow-xl">
			<div class="card-body">
				<h2 class="card-title">Tržby tento měsíc</h2>
				<p class="text-4xl font-bold">{formatCurrency(currentMonthRevenue)}</p>
				<p class="text-sm text-gray-500">
					{new Date().toLocaleDateString("cs-CZ", {
						month: "long",
						year: "numeric"
					})}
				</p>
			</div>
		</div>

		<div class="card bg-base-100 shadow-xl">
			<div class="card-body">
				<h2 class="card-title">Celkový počet zákazníků</h2>
				<p class="text-4xl font-bold">{currentMonthCustomers}</p>
				<p class="text-sm text-gray-500">K dnešnímu dni</p>
			</div>
		</div>
	</div>

	<!-- Sekce dnešních objednávek -->
	<div class="card bg-base-100 shadow-xl mb-8">
		<div class="card-body">
			<div class="flex justify-between items-center mb-4">
				<h2 class="card-title">Objednávky za dnešní den</h2>
				<div class="stats shadow">
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
				<div class="alert alert-info">
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
		<div class="card bg-base-100 shadow-xl">
			<div class="card-body">
				<h2 class="card-title">Vývoj objednávek</h2>
				<Line data={orderChartData} options={{ responsive: true }} />
			</div>
		</div>
		<div class="card bg-base-100 shadow-xl">
			<div class="card-body">
				<h2 class="card-title">Růst zákazníků</h2>
				<Line data={customerChartData} options={{ responsive: true }} />
			</div>
		</div>
	</div>
</div>