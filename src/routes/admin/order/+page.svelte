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

	let {
		session,
		supabase,
		orders,
		profileTableSettings,
		currentPage,
		totalPages,
		totalItems,
		itemsOnCurrentPage,
		itemsPerPage,
		searchQuery,
		dateQuery,
		orderSettings
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
		itemsPerPage,
		searchQuery,
		dateQuery,
		orderSettings
	} = data);

	let loading = false;
	let searchInput = searchQuery || "";
	let dateInput = dateQuery || "";
	let selectedState = ""; // Lokální proměnná pro filtrování
	let transitionKey = 0;

	// Výchozí stav řazení
	let sorting: SortingState = [
		{ id: 'order_number', desc: true } // Výchozí řazení sestupně podle čísla objednávky
	];

	// Lokální filtrování objednávek podle vybraného stavu
	$: filteredOrders = orders?.filter((order) => {
		// Filtr podle stavu
		if (selectedState && order.state !== selectedState) {
			return false;
		}
		
		return true;
	}) || [];

	// Získáme unikátní stavy z načtených objednávek
	$: availableStates = [...new Set(orders?.map(order => order.state).filter(state => state))];

	// Funkce pro získání barvy stavu z orderSettings
	function getStateColor(stateName: string) {
		if (!orderSettings?.orderStates) return '#9ca3af';
		const state = orderSettings.orderStates.find((s: any) => s.name === stateName);
		return state ? state.color : '#9ca3af';
	}

	// Funkce pro získání barvy stavu objednávky v tabulce
	function getStatusColor(status: string) {
		if (!orderSettings?.orderStates) {
			// Výchozí barvy pro základní stavy když nejsou v nastavení
			const defaultColors: Record<string, string> = {
				'Nová': '#0284c7',
				'Expedovaná': '#eab308', 
				'Fakturovaná': '#16a34a',
				'Stornovaná': '#dc2626'
			};
			const color = defaultColors[status] || '#9ca3af';
			return {
				background: lightenColor(color, 0.85),
				text: color
			};
		}
		
		const orderState = orderSettings.orderStates.find((state: any) => state.name === status);
		if (!orderState) {
			// Fallback pro neznámé stavy
			return {
				background: '#f3f4f6',
				text: '#6b7280'
			};
		}
		
		// Vygenerujeme světlejší odstín barvy pro pozadí
		const hexColor = orderState.color;
		return {
			background: `${lightenColor(hexColor, 0.85)}`,
			text: hexColor
		};
	}

	// Pomocná funkce pro zesvětlení barvy
	function lightenColor(hex: string, factor: number) {
		// Převedeme hex na RGB
		const r = parseInt(hex.slice(1, 3), 16);
		const g = parseInt(hex.slice(3, 5), 16);
		const b = parseInt(hex.slice(5, 7), 16);
		
		// Aplikujeme faktor zesvětlení
		const r2 = Math.round(r + (255 - r) * factor);
		const g2 = Math.round(g + (255 - g) * factor);
		const b2 = Math.round(b + (255 - b) * factor);
		
		// Převedeme zpět na hex
		return `#${r2.toString(16).padStart(2, '0')}${g2.toString(16).padStart(2, '0')}${b2.toString(16).padStart(2, '0')}`;
	}

	// Funkce pro změnu filtru stavu (lokálně)
	function handleStateFilter(state: string) {
		selectedState = state;
		// Zavřeme dropdown po výběru
		const dropdown = document.activeElement as HTMLElement;
		if (dropdown) {
			dropdown.blur();
		}
	}

	// Navigate to previous page - s oběma parametry
	async function previousPage() {
		try {
			loading = true;
			if (currentPage > 1) {
				transitionKey++;
				const params = new URLSearchParams();
				params.set('page', (currentPage - 1).toString());
				if (searchQuery) params.set('search', searchQuery);
				if (dateQuery) params.set('date', dateQuery);
				await goto(`?${params.toString()}`);
			}
		} catch (error) {
			console.error("Chyba při načítání předchozí stránky:", error);
		} finally {
			loading = false;
		}
	}

	// Navigate to next page - s oběma parametry  
	async function nextPage() {
		try {
			loading = true;
			if (currentPage < totalPages) {
				transitionKey++;
				const params = new URLSearchParams();
				params.set('page', (currentPage + 1).toString());
				if (searchQuery) params.set('search', searchQuery);
				if (dateQuery) params.set('date', dateQuery);
				await goto(`?${params.toString()}`);
			}
		} catch (error) {
			console.error("Chyba při načítání další stránky:", error);
		} finally {
			loading = false;
		}
	}

	// Handle search podle textu
	async function handleSearch() {
		loading = true;
		try {
			const params = new URLSearchParams();
			params.set('page', '1');
			if (searchInput) params.set('search', searchInput);
			if (dateQuery) params.set('date', dateQuery);
			await goto(`?${params.toString()}`);
		} catch (error) {
			console.error("Chyba při vyhledávání:", error);
		} finally {
			loading = false;
		}
	}

	// Handle search podle data
	async function handleDateSearch() {
		loading = true;
		try {
			const params = new URLSearchParams();
			params.set('page', '1');
			if (dateInput) params.set('date', dateInput);
			if (searchQuery) params.set('search', searchQuery);
			await goto(`?${params.toString()}`);
		} catch (error) {
			console.error("Chyba při vyhledávání podle data:", error);
		} finally {
			loading = false;
		}
	}

	function newOrderPage() {
		goto("/admin/order/new");
	}

	function formatPayState(pay_state: boolean) {
		return pay_state ? "Zaplaceno" : "Nezaplaceno";
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

	// Initialize visible columns based on profile settings or default to all columns
	let visibleColumns: VisibilityState =
		profileTableSettings?.table_settings_orders ??
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
			.update({ table_settings_orders: columnVisibility })
			.eq("id", session.user.id);

		if (error) {
			console.error("Chyba při ukládání nastavení filtrů:", error);
		}
	}

	// Define table columns with TanStack column definition
	let columns: ColumnDef<any>[] = columnOrder.map(key => ({
		accessorKey: key,
		id: key,
		header: columnNames[key],
		// Nastavení velikostí sloupců
		size: key === 'customer_email' ? 200 :
			key === 'order_number' ? 100 :
				key === 'note' ? 150 : 120,
		// Nastavení řazení podle typu sloupce
		enableSorting: true,
		sortingFn: key === 'date' ? 'datetime' :
			key === 'order_number' ? 'basic' :
				'alphanumeric',
		cell: info => {
			const value = info.getValue();
			if (key === "date" || key === "created_at" || key === "updated_at") {
				return formatDateToCzech(value);
			} else if (key === "pay_state") {
				return formatPayState(value);
			}
			return value ?? "";
		}
	}));

	// Upravíme sloupec se stavem objednávky, aby používal barvy
	columns = columns.map(column => {
		if (column.id === 'state') {
			return {
				...column,
				cell: info => {
					const value = info.getValue();
					return {
						value,
						color: getStatusColor(value)
					};
				}
			};
		}
		
		// Pro měnu a způsob platby můžeme také použít nastavení z e-shopu
		if (column.id === 'currency') {
			return {
				...column,
				cell: info => {
					const code = info.getValue();
					if (!orderSettings?.currencies) return code;
					
					const currency = orderSettings.currencies.find((c: any) => c.code === code);
					return currency ? `${currency.name} (${currency.symbol})` : code;
				}
			};
		}
		
		if (column.id === 'shipping_method') {
			return {
				...column, 
				cell: info => {
					const method = info.getValue();
					if (!orderSettings?.shippingMethods) return method;
					
					const shippingMethod = orderSettings.shippingMethods.find((m: any) => m.name === method);
					return shippingMethod ? method : method;
				}
			};
		}
		
		return column;
	});

	// Přidáme sloupec "Upravit"
	columns.push({
		id: 'actions',
		header: 'Editovat',
		size: 80,
		enableSorting: false, // Zakázeme řazení pro sloupec akcí
		cell: info => {
			return {
				id: info.row.original.id,
			};
		}
	});

	// Create table options
	const options = writable<TableOptions<any>>({
		data: filteredOrders || [],
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
	$: if (filteredOrders) {
		options.update(opts => ({
			...opts,
			data: filteredOrders,
		}));
	}
</script>

<svelte:head>
	<title>LEO - Objednávky</title>
</svelte:head>

<section>
	<div class="flex justify-between">
		<div class="flex flex-col gap-2 md:flex-row items-center">
			<!--<div>
				<button on:click={newOrderPage} class="btn btn-outline" disabled>
					Vytvořit objednávku
				</button>
			</div>-->
			<div>
				<input 
					type="date" 
					bind:value={dateInput} 
					on:change={handleDateSearch}
					class="input input-bordered border-black" 
					placeholder="Filtrovat podle data"
				/>
			</div>
			<div class="flex gap-2">
				<input
					type="text"
					placeholder="Hledat..."
					class="input input-bordered input-md w-full max-w-xs border-black"
					bind:value={searchInput} 
					on:keydown={(e) => {
						if (e.key === 'Enter') {
							handleSearch();
						}
					}}
				/>
				<button
					class="btn btn-outline min-w-40"
					on:click={handleSearch}
					disabled={loading}>
					{loading ? "Vyhledávám..." : "Vyhledat"}
				</button>
			</div>
			<!-- Dropdown pro filtrování podle stavu -->
			<div class="dropdown dropdown-end">
				<label tabindex="0" class="btn btn-outline min-w-40">
					{selectedState ? `Stav: ${selectedState}` : 'Filtr podle stavu'}
				</label>
				<ul tabindex="0" class="p-2 shadow dropdown-content menu bg-base-100 rounded-box w-52 z-10">
					<li>
						<button 
							type="button"
							on:click={() => handleStateFilter('')}
							class="text-left"
						>
							Všechny stavy
						</button>
					</li>
					{#if availableStates}
						{#each availableStates as state}
							<li>
								<button 
									type="button"
									on:click={() => handleStateFilter(state)}
									class="flex items-center gap-2 text-left"
								>						
									{state}
								</button>
							</li>
						{/each}
					{/if}
				</ul>
			</div>
		</div>
	</div>
</section>

<hr class="h-px my-8 bg-gray-200 border-0 dark:bg-gray-700" />

<section>
	<div class="join flex my-10 justify-center w-full ">
		<button
			class="join-item btn btn-outline w-1/3 "
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
		<p>Celkový počet objednávek: {totalItems}</p>
		<p>Stránka {currentPage} z {totalPages}</p>
		<p>Zobrazeno {itemsOnCurrentPage} z {totalItems} objednávek</p>
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
				{:else if filteredOrders && filteredOrders.length > 0}
					{#each $table.getRowModel().rows as row, index}
						<tr
							class="hover:bg-cyan-700 hover:text-white transition-colors {index % 2 === 0 ? 'bg-gray-100' : 'bg-gray-200'}"
							in:fly={{ y: 50, duration: 300, delay: index * 50 }}
						>
							{#each row.getVisibleCells() as cell}
								<td
									class="px-4 py-3 {cell.column.id === 'note' ? 'truncate max-w-xs' : ''}"
									style="width: {cell.column.getSize()}px;"
									title={cell.column.id === 'note' ? cell.getValue() : ''}
								>
									{#if cell.column.id === "date" || cell.column.id === "created_at" || cell.column.id === "updated_at"}
										{formatDateToCzechShort(String(cell.getValue() ?? ''))}
									{:else if cell.column.id === "pay_state"}
										{formatPayState(cell.getValue())}
									{:else if cell.column.id === "actions"}
										<div class="flex justify-end">
											<a href="/admin/order/{row.original.id}" data-sveltekit-preload-data class="font-medium hover:underline">
												Upravit
											</a>
										</div>
									{:else if cell.column.id === "state"}
										{#if cell.getValue() && cell.getValue().value}
											<span 
												class="px-2 py-1 rounded-full text-sm font-medium" 
												style="background-color: {cell.getValue().color.background}; color: {cell.getValue().color.text};"
											>
												{cell.getValue().value}
											</span>
										{:else}
											{cell.getValue() ?? ""}
										{/if}
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
							Žádné objednávky
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