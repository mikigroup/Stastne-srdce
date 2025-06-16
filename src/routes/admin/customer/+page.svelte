<script lang="ts">
	import { onMount } from "svelte";
	import { goto } from "$app/navigation";
	import { fade, fly } from "svelte/transition";
	import { page } from "$app/stores";
	import {
		createTable,
		createRender,
		Render,
		Subscribe,
		getCoreRowModel,
		getFilteredRowModel,
		getPaginationRowModel,
		getSortedRowModel
	} from "@tanstack/svelte-table";
	import type { TableOptions, ColumnDef } from "@tanstack/svelte-table";
	import type { PageData } from "./$types";
	import type { Profile } from "$lib/types/profile";
	import { writable } from "svelte/store";
	import { ROUTES } from "$lib/stores/store";
	import { formatDateToCzech } from "$lib/date";
	import { BarLoader } from "svelte-loading-spinners";
	import { navigating } from "$app/stores";

	export let data;

	let {
		supabase,
		session,
		customers,
		profileTableSettings,
		currentPage,
		totalPages,
		totalItems,
		itemsOnCurrentPage,
		searchQuery
	} = data;
	$: ({
		supabase,
		session,
		customers,
		profileTableSettings,
		currentPage,
		totalPages,
		totalItems,
		itemsOnCurrentPage,
		searchQuery
	} = data);

	// State variables
	let loading = false;
	let searchInput = searchQuery;
	let transitionKey: number = 0;

	// Výchozí stav řazení
	let sorting: SortingState = [
		{ id: 'created_at', desc: true } // Výchozí řazení podle data registrace sestupně
	];

	// Column definitions
	const columnNames: Record<string, string> = {
		created_at: "Registrace",
		first_name: "Jméno",
		last_name: "Příjmení",
		email: "E-mail",
		telephone: "Telefon",
		street: "Ulice",
		city: "Město",
		street_number: "Číslo popisné",
		zip_code: "PSČ"
	};

	const columnOrder: string[] = Object.keys(columnNames);

	// Initialize visible columns based on profile settings or default to all columns
	let visibleColumns: VisibilityState =
		profileTableSettings?.table_settings_customers ??
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

	// Save table settings to DB profile setting of logged in user
	async function saveTableSettings(columnVisibility: VisibilityState) {
		if (session?.user.id == undefined) {
			console.error("Uživatel není přihlášen");
			return;
		}

		const { error } = await supabase
			.from("profiles")
			.update({ table_settings_customers: columnVisibility })
			.eq("id", session.user.id);

		if (error) {
			console.error("Chyba při ukládání nastavení filtrů:", error);
		}
	}

	// Filter customers based on search
	$: filteredCustomers = customers?.filter((customer) =>
		searchQuery
			? Object.values(customer).some((value) =>
				value?.toString().toLowerCase().includes(searchQuery.toLowerCase()))
			: true
	);

	// Define table columns
	const columns: ColumnDef<any>[] = columnOrder.map(key => ({
		accessorKey: key,
		id: key,
		header: columnNames[key],
		// Nastavení velikostí sloupců
		size: key === 'email' ? 200 :
			key === 'created_at' ? 150 :
				key === 'telephone' ? 120 : 100,
		// Nastavení řazení
		enableSorting: true,
		sortingFn: key === 'created_at' ? 'datetime' : 'alphanumeric',
		cell: info => {
			const value = info.getValue();
			if (key === "created_at") {
				return formatDateToCzech(value);
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
		data: filteredCustomers || [],
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
	$: if (filteredCustomers) {
		options.update(opts => ({
			...opts,
			data: filteredCustomers,
		}));
	}

	// Navigation functions
	async function previousPage() {
		try {
			loading = true;
			if (currentPage > 1) {
				transitionKey++;
				await goto(`?page=${currentPage - 1}&search=${searchQuery}`);
			}
		} catch (error) {
			console.error("Chyba při načítání předchozí stránky:", error);
		} finally {
			loading = false;
		}
	}

	async function nextPage() {
		try {
			loading = true;
			if (currentPage < totalPages) {
				transitionKey++;
				await goto(`?page=${currentPage + 1}&search=${searchQuery}`);
			}
		} catch (error) {
			console.error("Chyba při načítání další stránky:", error);
		} finally {
			loading = false;
		}
	}

	// Search function
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
	<title>LEO - Zákazníci</title>
</svelte:head>

<section>
	<div class="flex">
		<div class="flex flex-col gap-2 md:flex-row items-center">
			<div>
				<button
					on:click={() => goto($ROUTES.ADMIN.CUSTOMER.NEW)}
					class="invisible w-full p-4 px-5 btn btn-outline">
					Vytvořit zákazníka
				</button>
			</div>
			<div class="flex gap-4">
				<input
					type="text"
					placeholder="Hledat..."
					class="input input-bordered input-md w-full max-w-xs border-black pr-10"
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
	<div class="join flex my-10 justify-center w-full">
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

	<div
		class="flex flex-col md:flex-row justify-between items-center w-full my-4">
		<p>Celkový počet zákazníků: {totalItems}</p>
		<p>Stránka {currentPage} z {totalPages}</p>
		<p>Zobrazeno {itemsOnCurrentPage} z {totalItems} zákazníků</p>
	</div>
</section>
<section id="page-top">
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
</section>

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
				{:else if filteredCustomers && filteredCustomers.length > 0}
					{#each $table.getRowModel().rows as row, index}
						<tr
							class="hover:bg-cyan-700 hover:text-white transition-colors {index % 2 === 0 ? 'bg-gray-100' : 'bg-gray-200'}"
							in:fly={{ y: 50, duration: 300, delay: index * 50 }}
						>
							{#each row.getVisibleCells() as cell}
								<td
									class="px-4 py-3 {cell.column.id === 'email' ? 'truncate max-w-xs' : ''}"
									style="width: {cell.column.getSize()}px;"
									title={cell.column.id === 'email' ? cell.getValue() : ''}
								>
									{#if cell.column.id === "created_at"}
										{formatDateToCzech(cell.getValue())}
									{:else if cell.column.id === "actions"}
										<div class="flex justify-end">
											<a href="/admin/customer/{row.original.id}" data-sveltekit-preload-data class="font-medium hover:underline">
												Upravit
											</a>
										</div>
									{:else}
										{cell.getValue() ?? ""}
									{/if}
								</td>
							{/each}
						</tr>
					{/each}
				{:else}
					<tr>
						<td colspan={$table.getVisibleLeafColumns().length} class="px-6 py-4 text-center">
							Žádní zákazníci
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