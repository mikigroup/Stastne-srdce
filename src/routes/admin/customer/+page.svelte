<script lang="ts">
	import { goto } from "$app/navigation";
	import { ROUTES } from "$lib/stores/store";
	import { formatDateToCzech, formatDateTimeToCzech, formatDateTimeToCzechShort } from "$lib/utils/formatting";
	import AdminTable from "$lib/component/AdminTable.svelte";
	import type { ColumnDef, SortingState, VisibilityState } from "@tanstack/svelte-table";

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
		columnOrder.reduce((obj: Record<string, boolean>, column) => {
			obj[column] = true;
			return obj;
		}, {} as Record<string, boolean>);

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
		sortingFn: key === 'created_at' ? 'datetime' : 'alphanumeric'
	}));

	// Přidáme sloupec "Upravit"
	columns.push({
		id: 'actions',
		header: 'Editovat',
		size: 80,
		enableSorting: false
	});

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

<AdminTable
	data={filteredCustomers}
	{columns}
	{columnNames}
	{loading}
	{transitionKey}
	bind:visibleColumns
	bind:sorting
	{session}
	{supabase}
	tableSettingsKey="table_settings_customers"
	emptyMessage="Žádní zákazníci"
>
	<svelte:fragment slot="cell" let:cell let:row>
		{#if cell.column.id === "created_at"}
			{@const value = cell.getValue()}
			{formatDateTimeToCzechShort(String(value ?? ''))}
		{:else if cell.column.id === "actions"}
			<div class="flex justify-end">
				<a href="/admin/customer/{row.original.id}" data-sveltekit-preload-data class="font-medium hover:underline">
					Upravit
				</a>
			</div>
		{:else if cell.column.id === "email"}
			<div class="truncate max-w-xs" title={String(cell.getValue() ?? '')}>
				{cell.getValue() ?? ""}
			</div>
		{:else}
			{cell.getValue() ?? ""}
		{/if}
	</svelte:fragment>
</AdminTable>

<style>
    .truncate {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
</style>