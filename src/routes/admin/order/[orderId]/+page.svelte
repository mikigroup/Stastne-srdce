<script lang="ts">
	import { goto } from "$app/navigation";
	import { fly } from "svelte/transition";
	import OrderItemDetail from "../OrderItemDetail.svelte";
	import { ROUTES } from "$lib/stores/store";

	export let data;
	let { session, supabase, order } = data;
	$: ({ session, supabase, order } = data);

	let loading = false;
	let date: string = order?.date ?? "";
	let orderId: string = order?.id;
	let formattedDate = date ? formatSupabaseDate(date) : "";
	let selectedPaymentMethod: string = order?.pay_method;
	let selectedOrderState: string = order?.state;
	let selectedCurrency: string = order?.currency;
	let selectedShippingMethod: string = order?.shipping_method;
	let isPaid: boolean = order?.pay_state || false;
	let note: string = order?.note ?? "";

	let updateMessage = "";

	async function updateOrder() {
		try {
			loading = true;

			const update = {
				updated_at: new Date().toISOString(),
				date: date ? new Date(date).toISOString() : null,
				state: selectedOrderState,
				pay_state: isPaid,
				currency: selectedCurrency,
				shipping_method: selectedShippingMethod,
				pay_method: selectedPaymentMethod,
				note
			};

			const { data, error } = await supabase
				.from("orders")
				.update(update)
				.eq("id", orderId)
				.select("*");

			if (error) {
				console.error("Error saving:", error);
				throw error;
			} else {
				console.log("Order saved successfully!");
				updateMessage = "Objednávka úspěšně uložena !";
			}
		} catch (error) {
			if (error instanceof Error) {
				console.error("Error saving:", error);
				alert(error.message);
			}
		} finally {
			loading = false;
		}
	}

	async function deleteOrder() {
		try {
			loading = true;
			const { error } = await supabase.from("orders").delete().eq("id", orderId);

			if (error) {
				console.error("Error deleting order:", error);
				throw error;
			} else {
				console.log("Order deleted successfully!");
				await goto("/order", { replaceState: true });
			}
		} catch (error) {
			if (error instanceof Error) {
				console.error("Error in Delete order:", error);
				alert(error.message);
			}
		} finally {
			loading = false;
		}
	}

	let isValidDate: boolean = true;

	function formatSupabaseDate(inputDate: string) {
		if (!inputDate) return "";
		const [year, month, day] = inputDate.split("-");
		return `${day.padStart(2, "0")}-${month.padStart(2, "0")}-${year}`;
	}

	async function back() {
		await goto($ROUTES.ADMIN.ORDER.LIST);
	}
</script>

<div
	class="relative p-5 overflow-x-auto shadow-lg sm:rounded-lg border"
	in:fly={{ y: 50, duration: 500 }}>
	<section>
		<div class="flex justify-between items-center mb-4">
			<button on:click={back} class="btn btn-outline">Zpět</button>
			{#if updateMessage}
				<div class="p-2 my-2 text-green-800 bg-green-200 rounded">
					{updateMessage}
				</div>
			{/if}
			<div class="flex flex-col gap-2 md:flex-row">
				<div>
					<button
						value={loading ? "Nahrává se..." : "Změněno"}
						disabled={loading}
						type="submit"
						on:click={updateOrder}
						class="btn btn-outline">
						Upravit
					</button>
				</div>
				<div>
					<button
						class="invisible w-full p-4 px-5 border rounded-xl hover:bg-slate-100"
						value={loading ? "Nahrává se..." : "Update"}
						disabled={loading}
						type="submit"
						on:click={deleteOrder}>
						Smazat
					</button>
				</div>
			</div>
		</div>
	</section>

	<div class="divider"></div>

	<section>
		<div class="bg-base-100">
			<div class="py-6 px-4">
				<h2 class="text-2xl font-bold mb-6">Objednávka</h2>

				<div class="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
					<OrderItemDetail
						{order}
						{formattedDate}
						date={order?.date}
						isValidDate={isValidDate}
						{selectedPaymentMethod}
						{selectedOrderState}
						{selectedCurrency}
						{selectedShippingMethod}
						{isPaid}
					/>
				</div>

				<!--Položky:-->
				<div class="border-black p-4 border shadow-xl rounded-lg">
					<div class="font-medium text-lg mb-4">Položky objednávky</div>

					<div class="overflow-x-auto">
						<table class="table table-zebra w-full">
							<thead>
							<tr class="grid grid-cols-12 gap-4">
								<th>Výběr</th>
								<th>Pořadí</th>
								<th class="col-span-9">Název</th>
								<th>Množství</th>
							</tr>
							</thead>
							<tbody>
							{#each order.order_items as item, i}
								<tr class="hover grid grid-cols-12 gap-4">
									<td>
										<label>
											<input type="checkbox" class="checkbox" />
										</label>
									</td>
									<td>
										{i + 1}
									</td>
									<td class="col-span-9">
										<div class="flex items-center space-x-3">
											<div>
												<div class="font-bold">{item.variant_id.description}</div>
												<div class="text-sm opacity-50">{item.variant_id.menu_id.type}</div>
											</div>
										</div>
									</td>
									<td>{item.quantity}</td>
								</tr>
							{/each}
							</tbody>
							<tfoot>
							<tr class="grid grid-cols-3 gap-4">
								<th colspan="4"></th>
								<th class="text-right">Cena {order.order_items.reduce((sum, item) => sum + item.quantity * item.price, 0)} CZK a množství {order.order_items.reduce((sum, item) => sum + item.quantity,0)} </th>
							</tr>
							</tfoot>
						</table>
					</div>

					<div class="mt-4">
						<div class="text-sm text-gray-500">Počet položek: {order.order_items.length}</div>
					</div>
				</div>

			</div>
		</div>
	</section>
</div>