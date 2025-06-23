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
	import { ROUTES } from "$lib/stores/store";
	import { page } from "$app/stores";
	import { formatCurrency, formatDateTimeToCzechShort } from "$lib/utils/formatting";

	Chart.register(
		Title,
		Tooltip,
		LineElement,
		LinearScale,
		PointElement,
		CategoryScale
	);

	export let data;

	// Data from server (last 24 hours)
	$: allOrders = data.orders;
	$: allCustomers = data.customers;
	$: last24hOrders = data.last24hOrders || [];
	$: last24hOrdersCount = data.last24hOrdersCount || 0;
	$: last24hOrdersTotal = data.last24hOrdersTotal || 0;



	function getStatusColor(status: string) {
		switch(status) {
			case 'Nová': return 'bg-blue-100 text-blue-800';
			case 'Zpracovává se': return 'bg-yellow-100 text-yellow-800';
			case 'Dokončená': return 'bg-green-100 text-green-800';
			case 'Zrušená': return 'bg-red-100 text-red-800';
			default: return 'bg-gray-100 text-gray-800';
		}
	}

	function viewOrderDetail(orderId: string) {
		goto(`/admin/order/${orderId}`);
	}

	// Process data for chart (group by hour)
	$: hourlyOrderData = last24hOrders.reduce((acc, order) => {
		const date = new Date(order.created_at);
		const hour = `${date.getHours()}:00`;
		const existingHour = acc.find((item) => item.hour === hour);

		if (existingHour) {
			existingHour.count++;
		} else {
			acc.push({ hour, count: 1 });
		}
		return acc;
	}, []).sort((a, b) => a.hour.localeCompare(b.hour));

	$: orderChartData = {
		labels: hourlyOrderData.map((d) => d.hour),
		datasets: [
			{
				label: "Objednávky za hodinu",
				data: hourlyOrderData.map((d) => d.count),
				fill: false,
				borderColor: "rgb(75, 192, 192)",
				tension: 0.1
			}
		]
	};
</script>

<svelte:head>
	<title>LEO - Dashboard</title>
</svelte:head>

<div class="p-4">
	<h2 class="text-2xl font-bold mb-4">Dashboard</h2>

	<!-- Statistiky -->
	<div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
		<div class="card bg-base-100 shadow-xl">
			<div class="card-body">
				<h2 class="card-title">Objednávky</h2>
				<p class="text-4xl font-bold">{last24hOrdersCount}</p>
			</div>
		</div>

		<div class="card bg-base-100 shadow-xl">
			<div class="card-body">
				<h2 class="card-title">Tržby</h2>
				<p class="text-4xl font-bold">{formatCurrency(last24hOrdersTotal)}</p>
			</div>
		</div>

		<div class="card bg-base-100 shadow-xl">
			<div class="card-body">
				<h2 class="card-title">Noví zákazníci</h2>
				<p class="text-4xl font-bold">{allCustomers.length}</p>
			</div>
		</div>
	</div>

	<!-- Graf objednávek po hodinách -->
<!--	<div class="card bg-base-100 shadow-xl mb-8">
		<div class="card-body">
			<h2 class="card-title">Objednávky po hodinách</h2>
			{#if hourlyOrderData.length > 0}
				<Line data={orderChartData} />
			{:else}
				<div class="alert alert-info">
					Žádné objednávky v posledních 24 hodinách
				</div>
			{/if}
		</div>
	</div>-->

	<!-- Seznam objednávek -->
	<div class="card bg-base-100 shadow-xl">
		<div class="card-body">
			<h2 class="card-title">Poslední objednávky</h2>

			{#if last24hOrdersCount > 0}
				<div class="overflow-x-auto">
					<table class="table table-zebra">
						<thead>
						<tr>
							<th>Číslo</th>
							<th>Čas</th>
							<th>Zákazník</th>
							<th>Celkem</th>
							<th>Stav</th>
							<th>Akce</th>
						</tr>
						</thead>
						<tbody>
						{#each last24hOrders as order}
							<tr>
								<td>#{order.order_number}</td>
								<td>{formatDateTimeToCzechShort(order.created_at)}</td>
								<td>{order.customer_first_name} {order.customer_last_name}</td>
								<td>{formatCurrency(order.total_price)}</td>
								<td>
                                        <span class="badge {getStatusColor(order.state)}">
                                            {order.state}
                                        </span>
								</td>
								<td>
									<button on:click={() => viewOrderDetail(order.id)} class="btn btn-xs">
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
					Žádné objednávky v posledních 24 hodinách
				</div>
			{/if}
		</div>
	</div>
</div>