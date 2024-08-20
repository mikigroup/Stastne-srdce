<script lang="ts">
	import { createEventDispatcher, onMount } from "svelte";
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
		supabase,
		session,
		customers,
		profileTableSettings,
		currentPage,
		totalPages,
		totalItems,
		itemsOnCurrentPage
	} = data;
	$: ({
		supabase,
		session,
		customers,
		profileTableSettings,
		currentPage,
		totalPages,
		totalItems,
		itemsOnCurrentPage
	} = data);

	const columnNames = {
		created_at: "Datum vytvoření",
		first_name: "Jméno",
		last_name: "Příjmení",
		email: "E-mail",
		telephone: "Telefon",
		street: "Ulice",
		city: "Město",
		street_number: "Číslo popisné",
		zip_code: "PSČ"
	};

	const columnOrder = Object.keys(columnNames);

	let visibleColumns =
		profileTableSettings?.table_settings_customers ??
		columnOrder.reduce((obj, column) => {
			obj[column] = true;
			return obj;
		}, {});

	const visibleColumnsStore = writable(visibleColumns);

	function toggleColumn(column) {
		visibleColumnsStore.update((cols) => {
			const newCols = { ...cols, [column]: !cols[column] };
			return columnOrder.reduce((obj, col) => {
				obj[col] = newCols[col] ?? true;
				return obj;
			}, {});
		});
	}

	async function saveTableSettings() {
		if (session?.user.id == undefined) {
			console.error("Uživatel není přihlášen");
			return;
		}

		const { data, error } = await supabase
			.from("profiles")
			.update({ table_settings_customers: $visibleColumnsStore })
			.eq("id", session.user.id);

		if (error) {
			console.error("Chyba při ukládání nastavení filtrů:", error);
		}
	}

	visibleColumnsStore.subscribe(saveTableSettings);

	let searchQuery = "";

	$: filteredCustomers = customers?.filter((customer) =>
		Object.values(customer).some((value) =>
			value?.toString().toLowerCase().includes(searchQuery.toLowerCase())
		)
	);

	$: columns = columnOrder
		.filter((key) => $visibleColumnsStore[key])
		.map((key) => ({
			accessorKey: key,
			header: columnNames[key],
			cell: ({ getValue }) => {
				if (key === "created_at") {
					return formatDateToCzech(getValue());
				}
				return getValue();
			}
		}));

	$: options = writable<TableOptions<(typeof customers)[0]>>({
		data: filteredCustomers,
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

	function formatDateToCzech(date) {
		if (!date) return ""; //
		const dateObj = new Date(date);
		const day = dateObj.getDate().toString().padStart(2, "0");
		const month = (dateObj.getMonth() + 1).toString().padStart(2, "0");
		const year = dateObj.getFullYear();
		const hours = dateObj.getHours().toString().padStart(2, "0");
		const minutes = dateObj.getMinutes().toString().padStart(2, "0");
		return `${day}.${month}.${year} ${hours}:${minutes}`;
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
	<title>LEO - Zákazníci</title>
</svelte:head>
<section>
	<div class="flex">
		<div class="flex flex-col gap-2 md:flex-row items-center">
			<div>
				<button
					on:click={() => goto("/customer/newcustomer")}
					class="invisible w-full p-4 px-5 btn btn-outline">
					Vytvořit zákazníka
				</button>
			</div>
			<div>
				<input
					type="text"
					placeholder="Hledat..."
					class="input input-bordered input-md w-full max-w-xs border-black"
					bind:value={searchQuery} />
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
		<div
			class="hidden w-full gap-4 p-2 px-5 my-2 border border-gray-300 md:flex rounded-xl">
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
		{#if filteredCustomers && filteredCustomers.length > 0}
			{#each $table.getRowModel().rows as row}
				<div
					class="w-full gap-4 p-2 px-5 my-2 border border-gray-300 md:flex rounded-xl hover:bg-slate-100">
					{#each row.getVisibleCells() as cell}
						<div
							class="w-full truncate-cell flex items-center {cell.column.id ===
							'email'
								? 'md:w-1/3'
								: 'md:w-1/6 lg:w-1/6 xl:w-1/6'}"
							title={cell.getValue() ?? ""}>
							{#if cell.column.id === "created_at"}
								{formatDateToCzech(cell.getValue())}
							{:else}
								{cell.getValue() ?? ""}
							{/if}
						</div>
					{/each}
					<div
						class="w-full md:w-1/6 lg:w-1/6 xl:w-1/6 flex items-center justify-end">
						<a
							href="/admin/customer/{row.original.id}"
							data-sveltekit-preload-data
							class="font-medium text-blue-600 dark:text-blue-500 hover:underline">
							Upravit
						</a>
					</div>
				</div>
			{/each}
		{:else}
			<p>Žádní zákazníci</p>
		{/if}
	</div>
	<div
		class="flex flex-col md:flex-row justify-between items-center w-full my-4">
		<p>Celkový počet zákazníků: {totalItems}</p>
		<p>Stránka {currentPage} z {totalPages}</p>
		<p>Zobrazeno {itemsOnCurrentPage} z {totalItems} zákazníků</p>
	</div>

	<div class="join grid grid-cols-2 w-1/2 mx-auto my-10">
		<button
			class="join-item btn btn-outline"
			on:click={previousPage}
			disabled={currentPage === 1}>
			Previous page
		</button>
		<button
			class="join-item btn btn-outline"
			on:click={nextPage}
			disabled={currentPage === totalPages}>
			Next page
		</button>
	</div>
</section>

<style>
	/*    .truncate-cell {
						max-width: 150px;
						white-space: nowrap;
						overflow: hidden;
						text-overflow: ellipsis;
				}*/
</style>
