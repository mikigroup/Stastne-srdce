<script lang="ts">
	import { writable } from "svelte/store";
	import { fade, fly } from "svelte/transition";
	import { navigating } from "$app/stores";
	import { BarLoader } from "svelte-loading-spinners";
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

	// Props
	export let data: any[] = [];
	export let columns: ColumnDef<any>[] = [];
	export let columnNames: Record<string, string> = {};
	export let loading: boolean = false;
	export let transitionKey: number = 0;
	export let visibleColumns: VisibilityState = {};
	export let sorting: SortingState = [];
	export let enableSorting: boolean = true;
	export let enableColumnResizing: boolean = true;
	export let emptyMessage: string = "Žádná data";
	export let session: any = null;
	export let supabase: any = null;
	export let tableSettingsKey: string = "";

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
		if (tableSettingsKey) {
			saveTableSettings(visibleColumns);
		}
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
		if (!session?.user.id || !supabase || !tableSettingsKey) {
			return;
		}

		const { error } = await supabase
			.from("profiles")
			.update({ [tableSettingsKey]: columnVisibility })
			.eq("id", session.user.id);

		if (error) {
			console.error("Chyba při ukládání nastavení tabulky:", error);
		}
	}

	// Create table options
	const options = writable<TableOptions<any>>({
		data: data || [],
		columns,
		state: {
			columnVisibility: visibleColumns,
			sorting: enableSorting ? sorting : [],
		},
		onColumnVisibilityChange: setColumnVisibility,
		onSortingChange: enableSorting ? setSorting : undefined,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
		enableColumnResizing,
		columnResizeMode: 'onChange',
		debugTable: false,
	});

	// Create Svelte table
	$: table = createSvelteTable(options);

	// Update data when it changes
	$: if (data) {
		options.update(opts => ({
			...opts,
			data: data,
		}));
	}
</script>

<!-- Column visibility dropdown -->
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
										tabindex="0"
										on:keydown={(e) => e.key === 'Enter' && header.column.getToggleSortingHandler()()}
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
										on:mousedown={header.column.getResizeHandler()}
										on:touchstart={header.column.getResizeHandler()}
										class:isResizing={header.column.getIsResizing()}
										role="separator"
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
				{:else if data && data.length > 0}
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
									<slot name="cell" {cell} {row} {index}>
										{cell.getValue() ?? ""}
									</slot>
								</td>
							{/each}
						</tr>
					{/each}
				{:else}
					<tr>
						<td colspan={$table.getVisibleLeafColumns().length} class="px-6 py-4 text-center">
							{emptyMessage}
						</td>
					</tr>
				{/if}
				</tbody>
			</table>
		</div>
	</section>
{/key}

<style>
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