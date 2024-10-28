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

	$: orderData = processOrderData(orders);
	$: customerData = processCustomerData(customers);
	$: currentMonthOrders = orders.length;
	$: currentMonthCustomers = customers.length;

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
				borderColor: "rgb(37,50,17)",
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
	<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
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
				<h2 class="card-title">Celkový počet zákazníků</h2>
				<p class="text-4xl font-bold">{currentMonthCustomers}</p>
				<p class="text-sm text-gray-500">K dnešnímu dni</p>
			</div>
		</div>
	</div>
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
