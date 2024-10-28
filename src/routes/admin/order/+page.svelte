<script lang="ts">
	import { goto } from "$app/navigation";
	import { writable } from "svelte/store";
	import {
		createSvelteTable,
		flexRender,
		getCoreRowModel
	} from "@tanstack/svelte-table";
	import type { ColumnDef, TableOptions } from "@tanstack/svelte-table";

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

	let loading = false;
	let filterDate = "";
	let filterActive = "";
	let searchQuery = "";
	let searchInput = searchQuery;

	function newOrderPage() {
		const route = {
			NEW_ORDER: "/admin/order/neworder"
		} as const;

		goto(route.NEW_ORDER);
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
		date: "Datum",
		order_number: "Objednávka",
		state: "Stav",
		customer_first_name: "Jméno",
		customer_last_name: "Příjmení",
		customer_email: "Email",
		pay_state: "Stav platby",
		currency: "Měna",
		pay_method: "Způsob platby",
		note: "Poznámka"
	} as const;

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
			.update({ table_settings_orders: $visibleColumnsStore })
			.eq("id", session.user.id);

		if (error) {
			console.error("Chyba při ukládání nastavení filtrů:", error);
		}
	}

	visibleColumnsStore.subscribe(saveTableSettings);

	$: filteredOrders = orders?.filter((order) =>
		Object.values(order).some((value) =>
			value?.toString().toLowerCase().includes(searchQuery.toLowerCase())
		)
	);

	$: columns = columnOrder
		.filter((key) => $visibleColumnsStore[key])
		.map((key) => ({
			accessorKey: key,
			header: columnNames[key],
			cell: ({ getValue }) => {
				if (key === "date" || key === "created_at" || key === "updated_at") {
					return formatDateToCzech(getValue());
				} else if (key === "pay_state") {
					return formatPayState(getValue());
				}
				return getValue();
			}
		}));

	$: options = writable<TableOptions<(typeof customers)[0]>>({
		data: filteredOrders,
		columns,
		getCoreRowModel: getCoreRowModel()
	});

	$: visibleColumnsStore.subscribe((value) => {
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

	async function handleSearch() {
		loading = true;
		try {
			await goto(`?search=${searchInput}&page=1`);
		} catch (error) {
			console.error("Chyba při vyhledávání:", error);
		} finally {
			loading = false;
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
				<button on:click={newOrderPage} class="btn btn-outline" disabled>
					Vytvořit objednávku
				</button>
			</div>
			<div>
				<input type="date" bind:value={filterDate} class="btn btn-outline" />
			</div>
			<div>
				<select
					bind:value={filterActive}
					class="select select-bordered w-full max-w-xs border-black">
					<option value="">Všechny aktivity</option>
					<option value="true">Aktivní</option>
					<option value="false">Neaktivní</option>
				</select>
			</div>
			<div class="flex gap-2">
				<input
					type="text"
					placeholder="Hledat..."
					class="input input-bordered input-md w-full max-w-xs border-black"
					bind:value={searchInput} />
				<button
					class="btn btn-outline"
					on:click={handleSearch}
					disabled={loading}>
					{loading ? "Vyhledávám..." : "Vyhledat"}
				</button>
			</div>
		</div>
	</div>
</section>

<hr class="h-px my-8 bg-gray-200 border-0 dark:bg-gray-700" />

<section>
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

	<div
		class="flex flex-col md:flex-row justify-between items-center w-full my-4">
		<p>Celkový počet objednávek: {totalItems}</p>
		<p>Stránka {currentPage} z {totalPages}</p>
		<p>Zobrazeno {itemsOnCurrentPage} z {totalItems} objednávek</p>
	</div>
</section>

<section>
	<div class="flex justify-end dropdown">
		<button class="btn btn-outline" tabindex="0">Sloupce</button>
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
		<div
			class="hidden w-full gap-4 p-2 px-5 my-2 border border-gray-300 md:flex rounded-xl bg-gray-400">
			{#each columnOrder.filter((col) => $visibleColumnsStore[col]) as column, index}
				<div
					class="w-full {column === 'email'
						? 'md:w-1/3'
						: 'md:w-1/6 lg:w-1/6 xl:w-1/6'} {index <
					columnOrder.filter((col) => $visibleColumnsStore[col]).length - 1
						? 'border-r-2'
						: ''}">
					{columnNames[column]}
				</div>
			{/each}
			<div class="flex justify-end w-full md:w-1/6 lg:w-1/6 xl:w-1/6">
				Editovat
			</div>
		</div>

		{#if filteredOrders && filteredOrders.length > 0}
			{#each $table.getRowModel().rows as row, index}
				<div
					class="w-full gap-4 p-2 px-5 my-1 border border-gray-300 md:flex rounded-xl hover:bg-cyan-700 hover:text-white row {index %
						2 ===
					0
						? 'bg-gray-100'
						: 'bg-gray-200'}">
					{#each row.getVisibleCells() as cell}
						<div
							class="w-full lg:w-1/6 xl:w-1/6 truncate-cell"
							title={cell.getValue() ?? ""}>
							{#if cell.column.id === "date" || cell.column.id === "created_at" || cell.column.id === "updated_at"}
								{formatDateToCzech(cell.getValue())}
							{:else if cell.column.id === "pay_state"}
								{formatPayState(cell.getValue())}
							{:else}
								{cell.getValue() ?? ""}
							{/if}
						</div>
					{/each}
					<div
						class="w-full md:w-1/6 lg:w-1/6 xl:w-1/6 flex items-center justify-end">
						<a
							href="/admin/order/{row.original.id}"
							data-sveltekit-preload-data
							class="font-medium hover:underline">
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
