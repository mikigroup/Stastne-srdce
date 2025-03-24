<script lang="ts">
	import { goto } from "$app/navigation";
	import { writable } from "svelte/store";
	import {
		createSvelteTable,
		getCoreRowModel,
		getSortedRowModel,
		flexRender
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
		searchQuery
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
		searchQuery
	} = data);

	let loading = false;
	let searchInput = searchQuery;
	let transitionKey = 0; // Pro klíčované přechody

	// Výchozí stav řazení - řadíme podle data
	let sorting: SortingState = [
		{ id: 'date', desc: true } // Výchozí řazení podle data sestupně
	];

	// Navigate to new menu page
	function newMenuPage() {
		goto($ROUTES.ADMIN.MENU.NEW);
	}

	// Format date to Czech format (DD.MM.YYYY)
	function formatDateToCzech(date: any) {
		if (!date) return ""; // Return empty string if date is null or undefined
		const parts = date.split("-");
		if (parts.length !== 3) {
			return date; // Return original date if it's not in the expected format
		}
		const [year, month, day] = parts;
		return `${day}.${month}.${year}`;
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

	// Callback funkce pro aktualizaci řazení
	const setSorting: OnChangeFn<SortingState> = updater => {
		if (updater instanceof Function) {
			sorting = updater(sorting);
		} else {
			sorting = updater;
		}
		options.update(old => ({
			...old,
			state: {
				...old.state,
				sorting,
			},
		}));
	};

	// Save table settings to user profile
	async function saveTableSettings(columnVisibility: VisibilityState) {
		if (session?.user.id == undefined) {
			console.error("Uživatel není přihlášen");
			return; // Exit if user is not logged in
		}

		const { error } = await supabase
			.from("profiles")
			.update({ table_settings_menus: columnVisibility })
			.eq("id", session.user.id);

		if (error) {
			console.error("Chyba při ukládání nastavení filtrů:", error);
		}
	}

	// Filter menus based on search query
	$: filteredMenus = menus?.filter(
		(menu) =>
			searchQuery
				? Object.values(menu).some((value) =>
					// Check if any menu property includes the search query
					value?.toString().toLowerCase().includes(searchQuery.toLowerCase())
				) ||
				menu.variants.some((variant) =>
					// Check if any variant description includes the search query
					variant.description
						.toLowerCase()
						.includes(searchQuery.toLowerCase())
				)
				: true // If no search query, return all menus
	);

	// Define table columns with TanStack column definition
	const columns: ColumnDef<any>[] = columnOrder.map(key => ({
		accessorKey: key,
		id: key,
		header: columnNames[key],
		// Nastavení velikostí sloupců - variants bude nejširší
		size: key === 'variants' ? 400 :
			key === 'soup' ? 150 :
				key === 'date' ? 100 :
					key === 'active' ? 80 : 100,
		// Pro některé sloupce budeme používat speciální řazení
		enableSorting: key !== 'variants', // Zakážeme řazení pro sloupce, které jsou pole
		sortingFn: key === 'date'
			? (rowA, rowB, columnId) => {
				const dateA = new Date(rowA.original.currentVersion?.date || rowA.original.date);
				const dateB = new Date(rowB.original.currentVersion?.date || rowB.original.date);
				return dateA.getTime() - dateB.getTime();
			}
			: 'alphanumeric',
		cell: info => {
			const value = info.getValue();
			if (key === "date") {
				return formatDateToCzech(value);
			} else if (key === "variants") {
				return value; // Zpracujeme v template
			} else if (key === "active") {
				return value ? "ANO" : "NE";
			}
			return value ?? "";
		}
	}));

	// Přidáme sloupec "Upravit"
	columns.push({
		id: 'actions',
		header: 'Editovat',
		size: 80,
		enableSorting: false, // Zakážeme řazení pro sloupec akcí
		cell: info => {
			return {
				id: info.row.original.id,
			};
		}
	});

	// Create table options
	const options = writable<TableOptions<any>>({
		data: filteredMenus || [],
		columns,
		state: {
			columnVisibility: visibleColumns,
			sorting, // Přidáme výchozí stav řazení
		},
		onColumnVisibilityChange: setColumnVisibility,
		onSortingChange: setSorting, // Přidáme handler pro změnu řazení
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(), // Přidáme model pro řazení
		enableColumnResizing: true,
		columnResizeMode: 'onChange',
		debugTable: false,
	});

	// Create Svelte table
	$: table = createSvelteTable(options);

	// Update data when it changes
	$: if (filteredMenus) {
		options.update(opts => ({
			...opts,
			data: filteredMenus,
		}));
	}

	// Navigate to previous page
	async function previousPage() {
		try {
			loading = true;
			if (currentPage > 1) {
				// Check if we're not on the first page
				transitionKey++;
				await goto(`?page=${currentPage - 1}&search=${searchQuery}`);
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
				// Check if we're not on the last page
				transitionKey++;
				await goto(`?page=${currentPage + 1}&search=${searchQuery}`);
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
			await goto(`?search=${searchInput}&page=1`);
		} catch (error) {
			console.error("Chyba při vyhledávání:", error);
		} finally {
			loading = false;
		}
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
		<p>Celkový počet menu: {totalItems}</p>
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
		<!-- Sémantická tabulka používající TanStack Table -->
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
								{#if !header.isPlaceholder && header.column.getCanSort()}
									<!-- Řaditelné hlavičky -->
									<div
										class="flex {header.column.id === 'actions' ? 'justify-end' : 'items-center'} cursor-pointer select-none"
										on:click={header.column.getToggleSortingHandler()}
										role="button"
										title="Seřadit podle {header.column.columnDef.header}"
									>
										{header.column.columnDef.header}
										<!-- Indikátor řazení -->
										<span class="ml-2">
										{#if header.column.getIsSorted() === "asc"}
											<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-up"><path d="m18 15-6-6-6 6"/></svg>
										{:else if header.column.getIsSorted() === "desc"}
											<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down"><path d="m6 9 6 6 6-6"/></svg>
										{:else}
											<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-up-down opacity-20"><path d="m21 16-4 4-4-4"/><path d="M17 20V4"/><path d="m3 8 4-4 4 4"/><path d="M7 4v16"/></svg>
										{/if}
									</span>
									</div>
								{:else}
									<!-- Neřaditelné hlavičky -->
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
				{:else if filteredMenus && filteredMenus.length > 0}
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
										{formatDateToCzech(cell.getValue())}
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
<div class="justify-end flex text-sm">Max. 50 itemů na stránce</div>

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