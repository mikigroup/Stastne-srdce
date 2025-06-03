<script lang="ts">
	import { goto } from "$app/navigation";
	import { fade, fly } from "svelte/transition";
	import OrderItemDetail from "../OrderItemDetail.svelte";

	export let data;
	let { session, supabase } = data;
	$: ({ session, supabase } = data);

	let loading = false;
	let date = "";
	let order_number = 0;
	let currency = "";
	let formattedDate = "";
	let selectedPaymentMethod = "";
	let paymentMethodOptions = ["Hotově", "Online", "Dobírka"];
	let selectedOrderState = "";
	let orderStateOptions = ["Nová", "Expedovaná", "Fakturovaná", "Stornovaná"];
	let selectedCurrency = "";
	let currencyOptions = ["CZK", "EUR", "USD"];
	let selectedShippingMethod = "";
	let shippingMethodOptions = ["Osobní odběr", "Kurýr", "Česká pošta"];
	let isPaid = false;

	let isValidDate = true;

	function formatDateForSupabase(inputDate: string): string {
		const [day, month, year] = inputDate.split("-");
		return `${year}-${month}-${day}`;
	}

	function back() {
		goto("/admin/order");
	}

	async function createOrder() {
		try {
			loading = true;

			const createOrderData = {
				created_at: new Date().toISOString(),
				date: date ? new Date(date).toISOString() : null,
				currency,
				shipping_method: selectedShippingMethod,
				pay_method: selectedPaymentMethod,
				state: selectedOrderState,
				pay_state: isPaid,
				user_id: session?.user?.id
			};

			console.log(createOrderData);

			let { error } = await supabase.from("orders").insert(createOrderData);
			if (error) throw error;
			console.log("Order created successfully!");
			goto("/order", { replaceState: true });
		} catch (error) {
			if (error instanceof Error) {
				alert(error.message);
			}
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>LEO - Nová objednávka</title>
</svelte:head>

<div
	class="relative p-5 overflow-x-auto shadow-lg sm:rounded-lg border"
	in:fly={{ y: 50, duration: 500 }}>
	<section>
		<div class="flex justify-between items-center mb-4">
			<button on:click={back} class="btn btn-outline">Zpět</button>
			<div class="flex flex-col gap-2 md:flex-row">
				<div>
					<button
						value={loading ? "Tvořím..." : "Vytvořeno"}
						disabled={loading}
						type="submit"
						on:click={createOrder}
						class="btn btn-outline">
						Vytvoř
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
						order={{}}
						{formattedDate}
						{date}
						{isValidDate}
						{selectedPaymentMethod}
						{selectedOrderState}
						{selectedCurrency}
						{selectedShippingMethod}
						{isPaid} />
				</div>
			</div>
		</div>
	</section>
</div>
