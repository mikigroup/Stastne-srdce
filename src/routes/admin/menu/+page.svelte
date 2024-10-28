<script lang="ts">
	import { goto } from "$app/navigation";
	import { writable } from "svelte/store";
	import { createSvelteTable, getCoreRowModel } from "@tanstack/svelte-table";
	import type { TableOptions } from "@tanstack/svelte-table";
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

	// Define column names and order
	const columnNames: Record<string, string> = {
		date: "Datum",
		soup: "Polévka",
		variants: "Varianty",
		active: "Aktivní",
		notes: "Poznámky",
		type: "Typ",
		nutri: "Nutriční informace",
		edit: "Editovat"
	};

	const columnOrder = [
		"date",
		"soup",
		"variants",
		"active",
		"notes",
		"type",
		"nutri",
		"edit"
	];

	// Initialize visible columns based on profile settings or default to all columns
	let visibleColumns =
		profileTableSettings?.table_settings_menus ??
		columnOrder.reduce((obj, column) => {
			obj[column] = true;
			return obj;
		}, {});

	const visibleColumnsStore = writable(visibleColumns);

	// Toggle column visibility
	function toggleColumn(column) {
		visibleColumnsStore.update((cols) => ({
			...cols,
			[column]: !cols[column]
		}));
	}

	// Save table settings to user profile
	async function saveTableSettings() {
		if (session?.user.id == undefined) {
			console.error("Uživatel není přihlášen");
			return; // Exit if user is not logged in
		}

		const updatedSettings = columnOrder.reduce((obj, column) => {
			obj[column] = $visibleColumnsStore[column];
			return obj;
		}, {});

		const orderedSettings = columnOrder.reduce((obj, column) => {
			obj[column] = updatedSettings[column];
			return obj;
		}, {});

		const { error } = await supabase
			.from("profiles")
			.update({ table_settings_menus: orderedSettings })
			.eq("id", session.user.id);

		if (error) {
			console.error("Chyba při ukládání nastavení filtrů:", error);
		}
	}

	visibleColumnsStore.subscribe(saveTableSettings);

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

	// Define table columns
	$: columns = columnOrder
		.filter((key) => $visibleColumnsStore[key])
		.map((key) => ({
			accessorKey: key,
			header: columnNames[key],
			cell: ({ getValue, row }) => {
				const value = getValue();
				if (key === "date") {
					return formatDateToCzech(value);
				} else if (key === "variants") {
					return Object.entries(value)
						.map(([k, v], i) => `${i + 1}. ${v.description}`)
						.join("<br>");
				} else if (key === "active") {
					return value ? "ANO" : "NE";
				} else if (key === "edit") {
					return `<a href="/admin/menu/${row.original.id}" data-sveltekit-preload-data class="font-medium hover:underline">Upravit</a>`;
				}
				return value;
			}
		}));

	// Create table options
	$: options = writable<TableOptions<(typeof menus)[0]>>({
		data: filteredMenus,
		columns,
		getCoreRowModel: getCoreRowModel()
	});

	// Update table when visible columns change
	$: visibleColumnsStore.subscribe((value) => {
		options.update((options) => ({
			...options,
			columns: columns.filter((column) => value[column.accessorKey])
		}));
	});

	// Create Svelte table
	$: table = createSvelteTable(options);

	let transitionKey = 0;

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

<div class="flex justify-between">
	<div class="flex flex-col gap-2 md:flex-row items-center">
		<button on:click={newMenuPage} class="btn btn-outline">
			Vytvořit menu
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

<section>
	<div class="flex flex-wrap">
		<!-- Nadpis -->
		<div
			class="hidden w-full gap-4 p-2 px-5 my-2 border border-gray-300 md:flex rounded-xl bg-gray-400">
			{#each columnOrder.filter((col) => $visibleColumnsStore[col]) as column, index}
				<div
					class="w-full {column === 'variants' || column === 'soup'
						? 'md:w-1/4'
						: 'md:w-1/6 lg:w-1/6 xl:w-1/6'} {index >
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
		<!-- Nadpis -->

		{#key transitionKey}
			<div in:fade={{ duration: 300 }} out:fade={{ duration: 300 }}>
				{#if $navigating || loading}
					<div transition:fade={{ duration: 300 }} class="loading-overlay">
						<BarLoader size="120" color="black" unit="px" duration="1s" />
					</div>
				{:else if filteredMenus && filteredMenus.length > 0}
					{#each $table.getRowModel().rows as row, index}
						<div
							in:fly={{ y: 50, duration: 300, delay: index * 50 }}
							class="w-full gap-4 p-2 px-5 my-1 border border-gray-300 md:flex rounded-xl hover:bg-cyan-700 hover:text-white row {index %
								2 ===
							0
								? 'bg-gray-100'
								: 'bg-gray-200'}">
							{#each row.getVisibleCells() as cell}
								<div
									class="w-full truncate-cell flex items-center {cell.column
										.id === 'variants' || cell.column.id === 'soup'
										? 'md:w-1/4'
										: cell.column.id === 'edit'
											? 'md:w-1/6 lg:w-1/6 xl:w-1/6 justify-end'
											: 'md:w-1/6 lg:w-1/6 xl:w-1/6'}"
									title={cell.getValue() ?? ""}>
									{#if cell.column.id === "variants"}
										{#if Array.isArray(cell.getValue()) && cell.getValue().length > 0}
											<div class="pl-4">
												{#each cell
													.getValue()
													.sort((a, b) => a.variant_number - b.variant_number) as variant}
													<div class="mb-1">
														<span class="font-medium"
															>{variant.variant_number}.</span>
														{variant.description}
													</div>
												{/each}
											</div>
										{:else}
											<span class="text-gray-400">Žádné varianty</span>
										{/if}
									{:else if cell.column.id === "active"}
										{cell.getValue() ? "Ano" : "Ne"}
									{:else if cell.column.id === "date"}
										{formatDateToCzech(cell.getValue())}
									{:else if cell.column.id === "edit"}
										{@html cell.getValue()}
									{:else}
										{cell.getValue() ?? ""}
									{/if}
								</div>
							{/each}
							<div
								class="w-full md:w-1/6 lg:w-1/6 xl:w-1/6 flex items-center justify-end">
								<a
									href="/admin/menu/{row.original.id}"
									data-sveltekit-preload-data
									class="font-medium hover:underline">
									Upravit
								</a>
							</div>
						</div>
					{/each}
				{:else}
					<p>Žádná menu</p>
				{/if}
			</div>
		{/key}
	</div>
</section>
