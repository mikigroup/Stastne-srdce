<script lang="ts">
	import { goto } from "$app/navigation";
	import { writable } from "svelte/store";
	import {
		createSvelteTable,
		getCoreRowModel,
		getSortedRowModel
	} from "@tanstack/svelte-table";
	import type {
		ColumnDef,
		TableOptions,
		VisibilityState,
		OnChangeFn,
		SortingState
	} from "@tanstack/svelte-table";
	import { BarLoader } from "svelte-loading-spinners";
	import { navigating } from "$app/stores";
	import { fade, fly } from "svelte/transition";
	import { ROUTES } from "$lib/stores/store";
	import { formatDateToCzech, formatDateToCzechShort } from "$lib/utils/formatting";

	export let data;

	// Destructure and reactive reassign data properties
	let {
		session,
		supabase,
		menus,
		profileTableSettings,
		currentPage,
		totalPages,
		totalItems,
		itemsOnCurrentPage,
		itemsPerPage,
		searchQuery,
		sort
	} = data;
	$: ({
		session,
		supabase,
		menus,
		profileTableSettings,
		currentPage,
		totalPages,
		totalItems,
		itemsOnCurrentPage,
		itemsPerPage,
		searchQuery,
		sort
	} = data);

	let loading = false;
	let searchInput = searchQuery;
	let transitionKey = 0;

	// Možnosti pro počet položek na stránce
	const itemsPerPageOptions = [10, 25, 50, 100];
	let selectedItemsPerPage = itemsPerPage;

	// Navigate to new menu page
	function newMenuPage() {
		goto($ROUTES.ADMIN.MENU.NEW);
	}

	// Převede pole variant na jednoduchý textový řetězec
	function formatVariantsText(variants) {
		if (!Array.isArray(variants) || variants.length === 0) {
			return ["Žádné varianty"];
		}

		return variants
			.sort((a, b) => parseInt(a.variant_number) - parseInt(b.variant_number))
			.map(v => `${v.variant_number}. ${v.description}`);
	}

	// Define column names and order
	const columnNames: Record<string, string> = {
		date: "Datum",
		soup: "Polévka",
		variants: "Hlavní jídla",
		active: "Aktivní",
		notes: "Poznámky",
		type: "Typ",
		nutri: "Nutriční informace",
	};

	const columnOrder = [
		"date",
		"soup",
		"variants",
		"active",
		"notes",
		"type",
		"nutri",
	];

	// Initialize visible columns based on profile settings or default to all columns
	let visibleColumns: VisibilityState =
		profileTableSettings?.table_settings_menus ??
		columnOrder.reduce((obj, column) => {
			obj[column] = true;
			return obj;
		}, {});

	// Callback funkce pro aktualizaci viditelnosti sloupců
	const setColumnVisibility: OnChangeFn<VisibilityState> = updater => {
		if (updater instanceof Function) {
			visibleColumns = updater(visibleColumns);
		} else {
			visibleColumns = updater;
		}
		options.update(old => ({
			...old,
			state: {
				...old.state,
				columnVisibility: visibleColumns,
			},
		}));
		saveTableSettings(visibleColumns);
	};

	// Save table settings to user profile
	async function saveTableSettings(columnVisibility: VisibilityState) {
		if (session?.user.id == undefined) {
			console.error("Uživatel není přihlášen");
			return;
		}

		const { error } = await supabase
			.from("profiles")
			.update({ table_settings_menus: columnVisibility })
			.eq("id", session.user.id);

		if (error) {
			console.error("Chyba při ukládání nastavení filtrů:", error);
		}
	}

	// Define table columns with TanStack column definition
	const columns: ColumnDef<any>[] = columnOrder.map(key => ({
		accessorKey: key,
		id: key,
		header: columnNames[key],
		size: key === 'variants' ? 400 :
			key === 'soup' ? 150 :
				key === 'date' ? 100 :
					key === 'active' ? 80 : 100,
		enableSorting: false, // Vypnuto, protože řadíme na serveru
		cell: info => {
			const value = info.getValue();
			if (key === "date") {
				return formatDateToCzechShort(String(value ?? ''));
			} else if (key === "variants") {
				return value;
			}
			return value ?? "";
		}
	}));


	// Přidáme sloupec "Upravit"
	columns.push({
		id: 'actions',
		header: 'Editovat',
		size: 80,
		enableSorting: false,
		cell: info => {
			return {
				id: info.row.original.id,
			};
		}
	});

	// Create table options
	const options = writable<TableOptions<any>>({
		data: menus || [],
		columns,
		state: {
			columnVisibility: visibleColumns,
		},
		onColumnVisibilityChange: setColumnVisibility,
		getCoreRowModel: getCoreRowModel(),
		enableColumnResizing: true,
		columnResizeMode: 'onChange',
		debugTable: false,
	});

	// Create Svelte table
	$: table = createSvelteTable(options);

	// Update data when it changes
	$: if (menus) {
		options.update(opts => ({
			...opts,
			data: menus,
		}));
	}

	// Navigate to previous page
	async function previousPage() {
		try {
			loading = true;
			if (currentPage > 1) {
				transitionKey++;
				await goto(`?page=${currentPage - 1}&search=${searchQuery}&itemsPerPage=${selectedItemsPerPage}&sort=${sort}`);
			}
		} catch (error) {
			console.error("Chyba při načítání předchozí stránky:", error);
		} finally {
			loading = false;
		}
	}

	// Navigate to next page
	async function nextPage() {
		try {
			loading = true;
			if (currentPage < totalPages) {
				transitionKey++;
				await goto(`?page=${currentPage + 1}&search=${searchQuery}&itemsPerPage=${selectedItemsPerPage}&sort=${sort}`);
			}
		} catch (error) {
			console.error("Chyba při načítání další stránky:", error);
		} finally {
			loading = false;
		}
	}

	// Handle search
	async function handleSearch() {
		loading = true;
		try {
			await goto(`?search=${searchInput}&page=1&itemsPerPage=${selectedItemsPerPage}&sort=${sort}`);
		} catch (error) {
			console.error("Chyba při vyhledávání:", error);
		} finally {
			loading = false;
		}
	}

	// Handle change of items per page
	async function handleItemsPerPageChange() {
		loading = true;
		try {
			// Reset to first page when changing items per page
			await goto(`?search=${searchQuery}&page=1&itemsPerPage=${selectedItemsPerPage}&sort=${sort}`);
		} catch (error) {
			console.error("Chyba při změně počtu položek na stránce:", error);
		} finally {
			loading = false;
		}
	}

	// Handle sort change
	function handleSort() {
		const newSort = sort === 'date_desc' ? 'date_asc' : 'date_desc';
		goto(`?search=${searchQuery}&page=1&itemsPerPage=${selectedItemsPerPage}&sort=${newSort}`);
	}
	
</script>

<svelte:head>
	<title>LEO - Menu</title>
</svelte:head>

<div class="flex justify-between mb-4">
	<div class="flex flex-col gap-2 md:flex-row items-center">
		<button on:click={newMenuPage} class="btn btn-outline">
			Vytvořit
		</button>

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

<hr class="h-px my-8 bg-gray-200 border-0 dark:bg-gray-700" />

<section>
	<div class="join flex my-10 justify-center w-full ">
		<button
			class="join-item btn btn-outline w-1/3"
			on:click={previousPage}
			disabled={currentPage === 1}>
			Předchozí stránka
		</button>
		<button
			class="join-item btn btn-outline w-1/3"
			on:click={nextPage}
			disabled={currentPage === totalPages}>
			Další stránka
		</button>
	</div>
	<div class="flex flex-col md:flex-row justify-between items-center w-full my-4 gap-4">
		<p>Celkový počet menu: {totalItems}</p>

		<div class="flex items-center gap-2 text-nowrap">
			<span>Položek na stránce:</span>
			<select
				class="select select-bordered select-sm"
				bind:value={selectedItemsPerPage}
				on:change={handleItemsPerPageChange}
			>
				{#each itemsPerPageOptions as option}
					<option value={option}>{option}</option>
				{/each}
			</select>
		</div>

		<p>Stránka {currentPage} z {totalPages}</p>
		<p>Zobrazeno {itemsOnCurrentPage} z {totalItems} menu</p>
	</div>
</section>

<div class="flex justify-end dropdown mb-4">
	<button class="btn btn-outline" tabindex="0">Sloupce</button>
	<ul
		tabindex="0"
		class="p-2 shadow dropdown-content menu bg-base-100 rounded-box w-52">
		{#each $table.getAllLeafColumns() as column}
			{#if column.id !== 'actions'}
				<li>
					<label>
						<input
							type="checkbox"
							checked={column.getIsVisible()}
							on:change={column.getToggleVisibilityHandler()}
						/>
						{columnNames[column.id] || column.id}
					</label>
				</li>
			{/if}
		{/each}
	</ul>
</div>

{#key transitionKey}
	<section in:fade={{ duration: 300 }} out:fade={{ duration: 150 }}>
		<div class="overflow-x-auto border border-gray-500 rounded-xl shadow-sm">
			<table class="min-w-full divide-y divide-gray-200">
				<thead class="bg-gray-300 border-b-gray-700 border">
				{#each $table.getHeaderGroups() as headerGroup}
					<tr>
						{#each headerGroup.headers as header}
							<th
								class="px-4 py-3 uppercase tracking-wider {header.column.id === 'actions' ? 'text-right' : 'text-left'}"
								style="width: {header.getSize()}px; position: relative;"
							>
								{#if header.column.id === 'date'}
									<div
										class="flex {header.column.id === 'actions' ? 'justify-end' : 'items-center'} cursor-pointer select-none"
										on:click={handleSort}
										role="button"
										title="Seřadit podle data"
									>
										{header.column.columnDef.header}
										<span class="ml-2">
											{#if sort === 'date_asc'}
												<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-up"><path d="m18 15-6-6-6 6"/></svg>
											{:else}
												<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down"><path d="m6 9 6 6 6-6"/></svg>
											{/if}
										</span>
									</div>
								{:else}
									<div class="flex {header.column.id === 'actions' ? 'justify-end' : 'items-center'}">
										{header.column.columnDef.header}
									</div>
								{/if}

								{#if header.column.getCanResize()}
									<div
										class="resizer"
										on:mousedown={header.getResizeHandler()}
										on:touchstart={header.getResizeHandler()}
										class:isResizing={header.column.getIsResizing()}
									></div>
								{/if}
							</th>
						{/each}
					</tr>
				{/each}
				</thead>
				<tbody class="bg-white divide-y divide-gray-200">
				{#if $navigating || loading}
					<tr>
						<td colspan={$table.getVisibleLeafColumns().length} class="px-6 py-4">
							<div class="loading-overlay flex justify-center">
								<BarLoader size="120" color="black" unit="px" duration="1s" />
							</div>
						</td>
					</tr>
				{:else if menus && menus.length > 0}
					{#each $table.getRowModel().rows as row, index}
						<tr
							class="hover:bg-cyan-700 hover:text-white transition-colors {index % 2 === 0 ? 'bg-gray-100' : 'bg-gray-200'}"
							in:fly={{ y: 50, duration: 300, delay: index * 50 }}
						>
							{#each row.getVisibleCells() as cell}
								<td
									class="px-4 py-3"
									style="width: {cell.column.getSize()}px;"
								>
									{#if cell.column.id === "variants"}
										<div class="variants-container">
											{#each formatVariantsText(cell.getValue()) as variant, index}
												<div class="variant-item">
													{variant}{#if index < formatVariantsText(cell.getValue()).length - 1}<br>{/if}
												</div>
											{/each}
										</div>
									{:else if cell.column.id === "date"}
										{formatDateToCzechShort(String(cell.getValue() ?? ''))}
									{:else if cell.column.id === "active"}
										{cell.getValue() ? "ANO" : "NE"}  <!-- Přidáno speciální formátování -->
									{:else if cell.column.id === "actions"}
										<div class="flex justify-end">
											<a href="/admin/menu/{row.original.id}" data-sveltekit-preload-data class="font-medium hover:underline">
												Upravit
											</a>
										</div>
									{:else}
										{cell.getValue()}
									{/if}
								</td>
							{/each}
						</tr>
					{/each}
				{:else}
					<tr>
						<td colspan={$table.getVisibleLeafColumns().length} class="px-6 py-4 text-center">
							Žádná menu
						</td>
					</tr>
				{/if}
				</tbody>
			</table>
		</div>
	</section>
{/key}

<style>
    .truncate {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .resizer {
        position: absolute;
        right: 0;
        top: 0;
        height: 100%;
        width: 5px;
        background: rgba(0, 0, 0, 0.1);
        cursor: col-resize;
        user-select: none;
        touch-action: none;
    }

    .resizer.isResizing {
        background: rgba(0, 0, 0, 0.2);
        opacity: 1;
    }

    @media (hover: hover) {
        .resizer {
            opacity: 0;
        }

        *:hover > .resizer {
            opacity: 1;
        }
    }

    @media (max-width: 768px) {
        :global(.loading-overlay) {
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 2rem;
        }

        /* Responzivní úpravy pro mobilní zobrazení */
        table {
            display: block;
            overflow-x: auto;
        }
    }
</style>