<script lang="ts">
	/**
	 * POZNÁMKY K IMPLEMENTACI:
	 * 
	 * PROBLÉM: Při prvním načtení stránky se zobrazoval pouze přihlášený uživatel místo všech zákazníků.
	 * 
	 * PŘÍČINA: Duplicitní načítání dat v Svelte komponentě:
	 * - První načtení: let { ... } = data; (řádky 12-22)
	 * - Druhé načtení: $: ({ ... } = data); (řádky 23-33)
	 * 
	 * ŘEŠENÍ: 
	 * 1. Odstraněno duplicitní načítání - ponechán pouze reaktivní blok $:
	 * 2. visibleColumns musí být let proměnná (kvůli bind:visibleColumns v AdminTable)
	 * 3. Přidán reaktivní blok pro aktualizaci visibleColumns při změně profileTableSettings
	 * 
	 * DŮLEŽITÉ: Reaktivní proměnné ($:) nelze bindovat, proto visibleColumns musí být let
	 * s reaktivním blokem pro aktualizaci.
	 */

	import { goto } from "$app/navigation";
	import { ROUTES } from "$lib/stores/store";
	import { formatDateToCzech, formatDateTimeToCzech, formatDateTimeToCzechShort } from "$lib/utils/formatting";
	import { validateProfileForInvoicing } from "$lib/utils/profileValidation";
	import { getRegistrationStatusMessage, getRegistrationStatusStyles } from "$lib/services/registrationStatusService";
	import AdminTable from "$lib/component/AdminTable.svelte";
	import type { ColumnDef, SortingState, VisibilityState } from "@tanstack/svelte-table";

	export let data;

	$: ({
		supabase,
		session,
		customers,
		profileTableSettings,
		currentPage,
		totalPages,
		totalItems,
		itemsOnCurrentPage,
		searchQuery,
		itemsPerPage
	} = data);

	// State variables
	let loading = false;
	let searchInput = searchQuery;
	let transitionKey: number = 0;

	// Možnosti pro počet položek na stránce
	const itemsPerPageOptions = [10, 25, 50, 100];
	let selectedItemsPerPage = itemsPerPage;

	// Výchozí stav řazení
	let sorting: SortingState = [
		{ id: "created_at", desc: true } // Výchozí řazení podle data registrace sestupně
	];

	// Column definitions
	const columnNames: Record<string, string> = {
		created_at: "Registrace",
		first_name: "Jméno",
		last_name: "Příjmení",
		email: "E-mail",
		telephone: "Telefon",
		registration_status: "Status",
		street: "Ulice",
		city: "Město",
		street_number: "Číslo popisné",
		zip_code: "PSČ"
	};

	const columnOrder: string[] = Object.keys(columnNames);

	// Initialize visible columns based on profile settings or default to all columns
	let visibleColumns: VisibilityState = columnOrder.reduce((obj: Record<string, boolean>, column) => {
		obj[column] = true;
		return obj;
	}, {} as Record<string, boolean>);

	// Update visible columns when profile settings change
	$: if (profileTableSettings?.table_settings_customers) {
		visibleColumns = profileTableSettings.table_settings_customers as VisibilityState;
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
		size: key === "email" ? 200 :
			key === "created_at" ? 150 :
				key === "registration_status" ? 130 :
				key === "telephone" ? 120 : 100,
		// Nastavení řazení
		enableSorting: true,
		sortingFn: key === "created_at" ? "datetime" : "alphanumeric"
	}));

	// Přidáme sloupec "Upravit"
	columns.push({
		id: "actions",
		header: "Editovat",
		size: 80,
		enableSorting: false
	});

	// Navigation functions
	async function previousPage() {
		try {
			loading = true;
			if (currentPage > 1) {
				transitionKey++;
				await goto(`?page=${currentPage - 1}&search=${searchQuery}&itemsPerPage=${selectedItemsPerPage}`);
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
				await goto(`?page=${currentPage + 1}&search=${searchQuery}&itemsPerPage=${selectedItemsPerPage}`);
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
			await goto(`?search=${searchInput}&page=1&itemsPerPage=${selectedItemsPerPage}`);
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
			await goto(`?search=${searchQuery}&page=1&itemsPerPage=${selectedItemsPerPage}`);
		} catch (error) {
			console.error("Chyba při změně počtu položek na stránce:", error);
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

	<div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-center w-full my-4">
		<div class="text-center md:text-left">
			<p>Celkový počet zákazníků: {totalItems}</p>
		</div>

		<div class="flex items-center justify-center gap-2 text-nowrap">
			<span>Položek na stránce:</span>
			<select
				class="select select-bordered select-sm"
				style="line-height: 2; padding-top: 0; padding-bottom: 0;"
				bind:value={selectedItemsPerPage}
				on:change={handleItemsPerPageChange}
			>
				{#each itemsPerPageOptions as option}
					<option value={option}>{option}</option>
				{/each}
			</select>
		</div>

		<div class="text-center">
			<p>Stránka {currentPage} z {totalPages}</p>
		</div>
		
		<div class="text-center md:text-right">
			<p>Zobrazeno {itemsOnCurrentPage} z {totalItems} zákazníků</p>
		</div>
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
		{formatDateTimeToCzechShort(String(value ?? ""))}
		{:else if cell.column.id === "registration_status"}
			{@const customer = row.original}
			{@const validationResult = validateProfileForInvoicing(customer)}
					{@const actualStatus = validationResult.isComplete ? "completed" : 
			customer.registration_status === "completed" ? "incomplete_data" : "pending"}
			{@const statusStyles = getRegistrationStatusStyles(actualStatus)}
			<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {statusStyles.badge}">
				{getRegistrationStatusMessage(actualStatus)}
			</span>
		{:else if cell.column.id === "actions"}
			<div class="flex justify-end">
				<a href="/admin/customer/{row.original.id}" data-sveltekit-preload-data class="font-medium hover:underline">
					Upravit
				</a>
			</div>
		{:else if cell.column.id === "email"}
					<div class="truncate max-w-xs" title={String(cell.getValue() ?? "")}>
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