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

	// Visible columns management
	let visibleColumns: Record<string, boolean> =
		profileTableSettings?.table_settings_customers ??
		columnOrder.reduce((obj, column) => {
			obj[column] = true;
			return obj;
		}, {});

	const visibleColumnsStore = writable<Record<string, boolean>>(visibleColumns);

	// Column visibility toggle
	function toggleColumn(column: string) {
		visibleColumnsStore.update((cols) => {
			const newCols = { ...cols, [column]: !cols[column] };
			return columnOrder.reduce((obj, col) => {
				obj[col] = newCols[col] ?? true;
				return obj;
			}, {});
		});
	}

	// Save table settings to DB profile setting of logged in user
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

	// Subscribe to changes and save settings
	visibleColumnsStore.subscribe(saveTableSettings);

	// Filter customers based on search
	$: filteredCustomers = customers?.filter((customer) =>
		Object.values(customer).some((value) =>
			value?.toString().toLowerCase().includes(searchQuery.toLowerCase())
		)
	);

	// Define table columns
	$: columns = columnOrder
		.filter((key) => $visibleColumnsStore[key])
		.map((key) => ({
			accessorKey: key,
			header: columnNames[key],
			cell: ({ getValue }) => {
				if (key === "created_at") {
					return formatDateToCzech(getValue<string>());
				}
				return getValue<string>();
			}
		}));

	// Create table options
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

	// Create table instance
	$: table = createSvelteTable(options);

	// Helper function: Format date to Czech format
	function formatDateToCzech(date: string) {
		if (!date) return ""; //
		const dateObj = new Date(date);
		const day = dateObj.getDate().toString().padStart(2, "0");
		const month = (dateObj.getMonth() + 1).toString().padStart(2, "0");
		const year = dateObj.getFullYear();
		const hours = dateObj.getHours().toString().padStart(2, "0");
		const minutes = dateObj.getMinutes().toString().padStart(2, "0");
		return `${day}.${month}.${year} ${hours}:${minutes}`;
	}

	// Navigation functions
	async function previousPage() {
		try {
			loading = true;
			if (currentPage > 1) {
				transitionKey++; // Inkrementujeme klíč pro novou animaci
				await goto(`?page=${currentPage - 1}`);
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
				transitionKey++; // Inkrementujeme klíč pro novou animaci
				await goto(`?page=${currentPage + 1}`);
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
		<p>Celkový počet zákazníků: {totalItems}</p>
		<p>Stránka {currentPage} z {totalPages}</p>
		<p>Zobrazeno {itemsOnCurrentPage} z {totalItems} zákazníků</p>
	</div>
</section>
<section id="page-top">
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

	{#key transitionKey}
		<div in:fade={{ duration: 300 }} out:fade={{ duration: 300 }}>
			{#if $navigating || loading}
				<div transition:fade={{ duration: 300 }} class="loading-overlay">
					<BarLoader size="120" color="black" unit="px" duration="1s" />
				</div>
			{:else if filteredCustomers && filteredCustomers.length > 0}
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
									.id === 'email'
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
								class="font-medium hover:underline">
								Upravit
							</a>
						</div>
					</div>
				{/each}
			{:else}
				<p>Žádní zákazníci</p>
			{/if}
		</div>
	{/key}
</section>

<style>
	/*    .truncate-cell {
						max-width: 150px;
						white-space: nowrap;
						overflow: hidden;
						text-overflow: ellipsis;
				}*/
</style>
