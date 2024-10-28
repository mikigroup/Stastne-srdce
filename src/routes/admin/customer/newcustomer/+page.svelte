<script lang="ts">
	import { goto } from "$app/navigation";
	import { ROUTES } from "$lib/stores/store";

	export let data;
	let { session, supabase } = data;
	$: ({ session, supabase } = data);

	let loading = false;
	let first_name = "";
	let last_name = "";
	let telephone = "";
	let username = "";
	let street = "";
	let city = "";
	let street_number = "";
	let zip_code = "";

	function back() {
		goto($ROUTES.ADMIN.CUSTOMER.LIST);
	}

	async function createCustomer() {
		try {
			loading = true;
			const { user } = session;

			const createCustomerData = {
				first_name,
				last_name,
				telephone,
				username,
				street,
				city,
				street_number,
				zip_code,
				id: user?.id
			};

			console.log(createCustomerData);

			let { error } = await supabase
				.from("customers")
				.insert(createCustomerData);
			if (error) throw error;
			console.log("Customer created successfully!");
			goto($ROUTES.ADMIN.CUSTOMER.LIST, { replaceState: true });
		} catch (error) {
			if (error instanceof Error) {
				alert(error.message);
			}
		} finally {
			loading = false;
		}
	}
</script>

<!-- Zbytek kódu zůstává stejný -->

<svelte:head>
	<title>LEO - Nový zákazník</title>
</svelte:head>
<div class="relative p-5 overflow-x-auto shadow-md sm:rounded-lg">
	<div class="flex justify-between">
		<div>
			<button
				value={loading ? "Tvořím..." : "Vytvořeno"}
				disabled={loading}
				type="submit"
				on:click={back}
				class="w-full p-4 px-5 border rounded-xl hover:bg-slate-100"
				>Zpět</button>
		</div>
		<div class="flex flex-col gap-2 md:flex-row">
			<div>
				<button
					value={loading ? "Tvořím..." : "Vytvořeno"}
					disabled={loading}
					type="submit"
					on:click={createCustomer}
					class="w-full p-4 px-5 border rounded-xl hover:bg-slate-100"
					>Vytvoř</button>
			</div>
		</div>
	</div>
	<hr class="h-px my-8 bg-gray-200 border-0 dark:bg-gray-700" />

	<div class="antialiased bg-white sans-serif">
		<div class="md:py-6 md:px-4">
			<div class="flex justify-between">
				<h2 class="pb-2 mb-6 text-2xl font-bold tracking-wider uppercase">
					Nový zákazník
				</h2>
				<div />
			</div>

			<div class="mb-8 md:flex md:flex-wrap md:justify-between">
				<div class="w-full mb-2 md:w-1/2 md:mb-0">
					<input
						class="w-full px-4 py-2 mb-1 leading-tight text-gray-700 bg-gray-200 border-2 border-gray-200 rounded appearance-none focus:outline-none focus:bg-white"
						type="text"
						bind:value={first_name}
						placeholder="Jméno" />
					<input
						class="w-full px-4 py-2 mb-1 leading-tight text-gray-700 bg-gray-200 border-2 border-gray-200 rounded appearance-none focus:outline-none focus:bg-white"
						type="text"
						bind:value={last_name}
						placeholder="Příjmení" />
					<input
						class="w-full px-4 py-2 mb-1 leading-tight text-gray-700 bg-gray-200 border-2 border-gray-200 rounded appearance-none focus:outline-none focus:bg-white"
						type="text"
						bind:value={street}
						placeholder="Ulice" />
					<input
						class="w-full px-4 py-2 mb-1 leading-tight text-gray-700 bg-gray-200 border-2 border-gray-200 rounded appearance-none focus:outline-none focus:bg-white"
						type="text"
						bind:value={street_number}
						placeholder="Číslo" />
					<input
						class="w-full px-4 py-2 mb-1 leading-tight text-gray-700 bg-gray-200 border-2 border-gray-200 rounded appearance-none focus:outline-none focus:bg-white"
						type="text"
						bind:value={city}
						placeholder="Město" />
				</div>
				<div class="w-full md:w-1/2">
					<input
						class="w-full px-4 py-2 mb-1 leading-tight text-gray-700 bg-gray-200 border-2 border-gray-200 rounded appearance-none focus:outline-none focus:bg-white"
						type="text"
						bind:value={zip_code}
						placeholder="PSČ" />
					<input
						class="w-full px-4 py-2 mb-1 leading-tight text-gray-700 bg-gray-200 border-2 border-gray-200 rounded appearance-none focus:outline-none focus:bg-white"
						type="text"
						bind:value={telephone}
						placeholder="Telefon" />
				</div>
			</div>
		</div>
	</div>
</div>
