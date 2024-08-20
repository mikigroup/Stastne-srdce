<script lang="ts">
	import { goto } from "$app/navigation";
	import { onMount } from "svelte";
	import { writable } from "svelte/store";
	import {
		createSvelteTable,
		flexRender,
		getCoreRowModel,
		getSortedRowModel
	} from "@tanstack/svelte-table";
	import type {
		ColumnDef,
		OnChangeFn,
		SortingState,
		TableOptions,
	} from "@tanstack/svelte-table";

	export let data;

	let {
		session,
		supabase,
		orders,
		profileTableSettings,
		currentPage,
		totalPages,
		totalItems,
		itemsOnCurrentPage,
		itemsPerPage
	} = data;
	$: ({
		session,
		supabase,
		orders,
		profileTableSettings,
		currentPage,
		totalPages,
		totalItems,
		itemsOnCurrentPage,
		itemsPerPage
	} = data);

	let selectedOrder = null;

	let sorting: SortingState = [];

	const setSorting: OnChangeFn<SortingState> = (updater) => {
		if (updater instanceof Function) {
			sorting = updater(sorting);
		} else {
			sorting = updater;
		}
		options.update((old) => ({
			...old,
			state: {
				...old.state,
				sorting
			}
		}));
	};

	function editOrder(id) {
		selectedOrder = id;
		console.log("Selected Order number:", selectedOrder);
	}

	function newOrderPage() {
		goto("/admin/order/neworder");
	}

	function formatDateToCzech(date) {
		if (!date) return ""; //
		const parts = date.split("-");
		if (parts.length !== 3) {
			return date;
		}
		const [year, month, day] = parts;
		return `${day}.${month}.${year}`;
	}

	const columnNames = {
		id: "ID",
		created_at: "Vytvořeno",
		updated_at: "Aktualizováno",
		state: "Stav",
		date: "Datum",
		customer_first_name: "Jméno",
		customer_last_name: "Příjmení",
		customer_street: "Ulice",
		customer_street_number: "Číslo popisné",
		customer_city: "Město",
		customer_zip_code: "PSČ",
		customer_telephone: "Telefon",
		customer_email: "Email",
		delivery_street: "Ulice doručení",
		delivery_street_number: "Číslo doručení",
		delivery_zip_code: "PSČ doručení",
		delivery_first_name: "Jméno",
		delivery_last_name: "Příjmení",
		delivery_telephone: "Telefon",
		pay_state: "Stav platby",
		delivery_city: "Město",
		currency: "Měna",
		order_number: "Číslo objednávky",
		user_id: "ID uživatele",
		shipping_method: "Způsob dopravy",
		pay_method: "Způsob platby",
		note: "Poznámka",
		total_pieces: "Kusů celkem",
		total_price: "Cena celkem"
	};

	const columnOrder = Object.keys(columnNames);

	let visibleColumns =
		profileTableSettings?.table_settings_orders ??
		columnOrder.reduce((obj, column) => {
			obj[column] = true;
			return obj;
		}, {});

	const visibleColumnsStore = writable(visibleColumns);

	function toggleColumn(column) {
		visibleColumnsStore.update((cols) => ({
			...cols,
			[column]: !cols[column]
		}));
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

	const columns: ColumnDef<(typeof orders)[0]>[] = columnOrder
		.filter((key) => $visibleColumnsStore[key])
		.map((key) => ({
			accessorKey: key,
			header: columnNames[key],
			cell: ({ getValue }) => {
				if (key === "date") {
					return formatDateToCzech(getValue());
				} else if (key === "pay_state") {
					return formatPayState(getValue());
				} else if (key === "created_at" || key === "updated_at") {
					return formatDateToCzech(getValue());
				}
				return getValue();
			}
		}));

	const options = writable<TableOptions<(typeof orders)[0]>>({
		data: orders,
		columns,
		state: {
			sorting
		},
		onSortingChange: setSorting,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel()
	});

	visibleColumnsStore.subscribe((value) => {
		options.update((options) => ({
			...options,
			columns: columns.filter((column) => value[column.accessorKey])
		}));
	});

	$: table = createSvelteTable(options);

	function formatPayState(pay_state: boolean) {
		return pay_state ? "Zaplaceno" : "Nezaplaceno";
	}

	function previousPage() {
		if (currentPage > 1) {
			goto(`?page=${currentPage - 1}`);
		}
	}

	function nextPage() {
		if (currentPage < totalPages) {
			goto(`?page=${currentPage + 1}`);
		}
	}


</script>

<svelte:head>
	<title>LEO - Objednávky</title>
</svelte:head>
<section>
	<div class="flex justify-between">
		<div class="flex flex-col gap-2 md:flex-row">
			<div>
				<button on:click={newOrderPage} class="btn btn-outline">
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
		<ul
			tabindex="0"
			class="p-2 shadow dropdown-content menu bg-base-100 rounded-box w-52">
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
				<div
					class="w-full lg:w-1/5 xl:w-1/5 cursor-pointer select-none {column !== columnOrder.filter((col) => $visibleColumnsStore[col]).pop() ? 'border-r-2' : ''}"
					on:click={$table.getColumn(column).getToggleSortingHandler()}
				>
					<div class="flex items-center">
						{columnNames[column]}
						{#if $table.getColumn(column).getIsSorted()}
							<i class="ml-1 fas fa-sort-{$table.getColumn(column).getIsSorted() === 'desc' ? 'down' : 'up'}"></i>
						{/if}
					</div>
				</div>
			{/each}
			<div class="flex justify-end w-full lg:w-1/5 xl:w-1/5">Editovat</div>
		</div>

		{#if orders && orders.length > 0}
			{#each $table.getRowModel().rows as row}
				<div class="w-full gap-4 p-2 px-5 my-2 border border-gray-300 md:flex rounded-xl hover:bg-slate-100">
					{#each row.getVisibleCells() as cell}
						<div
							class="w-full lg:w-1/5 xl:w-1/5 truncate-cell"
							title={cell.getValue() ?? ""}
						>
							{#if cell.column.id === "date" || cell.column.id === "created_at" || cell.column.id === "updated_at"}
								{formatDateToCzech(cell.getValue())}
							{:else if cell.column.id === "pay_state"}
								{formatPayState(cell.getValue())}
							{:else}
								{cell.getValue() ?? ""}
							{/if}
						</div>
					{/each}
					<div class="w-full lg:w-1/5 xl:w-1/5">
						<a
							href="/admin/order/{row.original.id}"
							data-sveltekit-preload-data
							class="flex justify-end font-medium text-blue-600 dark:text-blue-500 hover:underline"
						>
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

<div class="flex flex-col md:flex-row justify-between items-center w-full my-4">
	<p>Celkový počet objednávek: {totalItems}</p>
	<p>Stránka {currentPage} z {totalPages}</p>
	<p>Zobrazeno {itemsOnCurrentPage} z {totalItems} objednávek</p>
</div>

<div class="join grid grid-cols-2 w-1/2 mx-auto my-10">
	<button
		class="join-item btn btn-outline"
		on:click={previousPage}
		disabled={currentPage === 1}>
		Předchozí stránka
	</button>
	<button
		class="join-item btn btn-outline"
		on:click={nextPage}
		disabled={currentPage === totalPages}>
		Další stránka
	</button>
</div>

<style>
    /*    .truncate-cell {
					max-width: 300px;
					white-space: nowrap;
					overflow: hidden;
					text-overflow: ellipsis;
			}*/
</style>
