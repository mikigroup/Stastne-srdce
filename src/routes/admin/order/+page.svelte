<script lang="ts">
	import { goto } from "$app/navigation";
	import { onMount } from "svelte";
	import { writable } from "svelte/store";
	import {
		createSvelteTable,
		flexRender,
		getCoreRowModel,
	} from "@tanstack/svelte-table";
	import type { ColumnDef, TableOptions } from "@tanstack/svelte-table";

	export let data;

	let { session, supabase, orders, profileTableSettings } = data;
	$: ({ session, supabase, orders, profileTableSettings } = data);

	let selectedOrder = null;

	function editOrder(id) {
		selectedOrder = id;
		console.log("Selected Order number:", selectedOrder);
	}

	function newOrderPage() {
		goto("/admin/order/neworder");
	}

	function formatDateToCzech(date) {
		if (!date) return ''; //
		const parts = date.split("-");
		if (parts.length !== 3) {
			return date;
		}
		const [year, month, day] = parts;
		return `${day}.${month}.${year}`;
	}

	const columnNames = {
		order_number: "Objednávka",
		date: "Datum",
		state: "Stav",
		shipping_method: "Způsob dopravy",
		pay_method: "Platební metoda",
		// currency: "Měna",
		customer_first_name: "Jméno",
		customer_last_name: "Příjmení",
		pay_state: "Stav platby",
		/*customer_street: "Ulice",
		customer_street_number: "Číslo domu",
		customer_city: "Město",
		customer_zip_code: "PSČ", */
		customer_email: "E-mail",
		// customer_telephone: "Telefon",
	/*	delivery_street: "D-Ulice",
		delivery_street_number: "D-Číslo domu",
		delivery_zip_code: "D-PSČ",
		delivery_first_name: "D-Jméno příjemce",
		delivery_last_name: "D-Příjmení příjemce",
		delivery_telephone: "D-Telefon",*/
		// delivery_city: "D-Město",
	};

	const columnOrder = Object.keys(columnNames);

	let visibleColumns = profileTableSettings?.table_settings_orders ?? columnOrder.reduce((obj, column) => {
		obj[column] = true;
		return obj;
	}, {});

	const visibleColumnsStore = writable(visibleColumns);

	function toggleColumn(column) {
		visibleColumnsStore.update(cols => ({ ...cols, [column]: !cols[column] }));
	}

	async function saveTableSettings() {
		if (session?.user.id == undefined) {
			console.error("Uživatel není přihlášen");
			return;
		}

		const updatedSettings = columnOrder.reduce((obj, column) => {
			obj[column] = $visibleColumnsStore[column];
			return obj;
		}, {});

		const orderedSettings = columnOrder.reduce((obj, column) => {
			obj[column] = updatedSettings[column];
			return obj;
		}, {});

		const { data, error } = await supabase
			.from("profiles")
			.update({ table_settings_orders: orderedSettings })
			.eq("id", session.user.id);

		if (error) {
			console.error("Chyba při ukládání nastavení filtrů:", error);
		} else {
			console.log("Nastavení filtrů úspěšně uloženo:", data);
		}
	}

	visibleColumnsStore.subscribe(saveTableSettings);

	const columns: ColumnDef<typeof orders[0]>[] = columnOrder
		.filter(key => $visibleColumnsStore[key])
		.map(key => ({
			accessorKey: key,
			header: columnNames[key],
			cell: ({ getValue }) => {
				if (key === "date") {
					return formatDateToCzech(getValue());
				} else if (key === "pay_state") {
					return formatPayState(getValue());
				}
				return getValue();
			},
		}));

	const options = writable<TableOptions<typeof orders[0]>>({
		data: orders,
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

	visibleColumnsStore.subscribe(value => {
		options.update(options => ({
			...options,
			columns: columns.filter(column => value[column.accessorKey]),
		}));
	});

	const table = createSvelteTable(options);

	function formatPayState(pay_state: boolean) {
		return pay_state ? "Ano" : "Ne";
	}
</script>
<svelte:head>
	<title>LEO - Objednávky</title>
</svelte:head>
<section>
	<div class="flex justify-between">
		<div class="flex flex-col gap-2 md:flex-row">
			<div>
				<button
					on:click={newOrderPage}
					class="btn btn-outline">
					Vytvořit objednávku
				</button>
			</div>
		</div>
	</div>
</section>

<hr class="h-px my-8 bg-gray-200 border-0 dark:bg-gray-700" />

<section>
	<div class="flex justify-end dropdown">
		<button class="m-1 btn" tabindex="0">Sloupce</button>
		<ul tabindex="0" class="p-2 shadow dropdown-content menu bg-base-100 rounded-box w-52">
			{#each Object.keys(visibleColumns) as column}
				<li>
					<label>
						<input
							type="checkbox"
							checked={$visibleColumnsStore[column]}
							on:change={() => toggleColumn(column)} />
						{columnNames[column]}
					</label>
				</li>
			{/each}
		</ul>
	</div>
</section>

<section>
	<div class="flex flex-wrap">
		<div class="hidden w-full gap-4 p-2 px-5 my-2 border border-gray-300 md:flex rounded-xl">
			{#each columnOrder.filter((col) => $visibleColumnsStore[col]) as column, index}
				<div class="w-full lg:w-1/6 xl:w-1/6 {column !== columnOrder.filter((col) => $visibleColumnsStore[col]).pop() ? 'border-r-2' : ''}">
					{columnNames[column]}
				</div>
			{/each}
			<div class="flex justify-end w-full lg:w-1/6 xl:w-1/6">Editovat</div>
		</div>

		{#if orders && orders.length > 0}
			{#each $table.getRowModel().rows as row}
				<div class="w-full gap-4 p-2 px-5 my-2 border border-gray-300 md:flex rounded-xl hover:bg-slate-100">
					{#each row.getVisibleCells() as cell}
						<div class="w-full lg:w-1/6 xl:w-1/6 truncate-cell" title={cell.getValue() ?? ''}>
							{cell.column.id === 'date' ? formatDateToCzech(cell.getValue()) : cell.getValue() ?? ''}
						</div>
					{/each}
					<div class="w-full lg:w-1/6 xl:w-1/6">
						<a
						href="/admin/order/{row.original.id}"
						data-sveltekit-preload-data
						class="flex justify-end font-medium text-blue-600 dark:text-blue-500 hover:underline">
						Upravit
						</a>
					</div>
				</div>
			{/each}
		{:else}
			<p>Žádné objednávky</p>
		{/if}
	</div>
</section>
<style>
/*    .truncate-cell {
        max-width: 300px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }*/
</style>