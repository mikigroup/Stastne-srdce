<script lang="ts">
	import { createEventDispatcher, onMount } from "svelte";
	import { goto } from "$app/navigation";
	import { writable } from "svelte/store";
	import {
		createSvelteTable,
		flexRender,
		getCoreRowModel,
	} from "@tanstack/svelte-table";
	import type { ColumnDef, TableOptions } from "@tanstack/svelte-table";

	export let data;

	let { supabase, session, customers, profileTableSettings } = data;
	$: ({ supabase, session, customers, profileTableSettings } = data);

	const columnNames = {
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

	let visibleColumns = columnOrder.reduce((obj, column) => {
		obj[column] = true;
		return obj;
	}, {});

	const visibleColumnsStore = writable(visibleColumns);

	function toggleColumn(column) {
		visibleColumnsStore.update((cols) => ({
			...cols,
			[column]: !cols[column]
		}));
	}

	async function saveTableSettings() {
		if (session?.user.id == undefined) {
			console.error("Uživatel není přihlášen");
			return;
		}

		const updatedSettings = columnOrder.reduce((obj, column) => {
			obj[column] = $visibleColumnsStore[column];
			return obj;
		}, {});

		// Přeskupení vlastností podle columnOrder
		const orderedSettings = columnOrder.reduce((obj, column) => {
			obj[column] = updatedSettings[column];
			return obj;
		}, {});

		const { data, error } = await supabase
			.from("profiles")
			.update({ table_settings_customers: orderedSettings })
			.eq("id", session.user.id);

		if (error) {
			console.error("Chyba při ukládání nastavení filtrů:", error);
		}
	}

	visibleColumnsStore.subscribe(saveTableSettings);

	const columns: ColumnDef<typeof customers[0]>[] = columnOrder.map(key => ({
		accessorKey: key,
		header: columnNames[key],
		cell: ({ getValue }) => getValue(),
	}));

	const options = writable<TableOptions<typeof customers[0]>>({
		data: customers,
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

	const table = createSvelteTable(options);
</script>

<svelte:head>
	<title>LEO - Zákazníci</title>
</svelte:head>

<div class="relative p-5 shadow-md sm:rounded-lg">
	<div class="flex justify-between">
		<div class="flex flex-col gap-2 md:flex-row">
			<div>
				<button
					on:click={() => goto("/customer/newcustomer")}
					class="w-full p-4 px-5 border rounded-xl hover:bg-slate-100">
					Vytvořit zákazníka
				</button>
			</div>
		</div>
	</div>
	<hr class="h-px my-8 bg-gray-200 border-0 dark:bg-gray-700" />
	<div class="flex justify-end dropdown">
		<button class="m-1 btn" tabindex="0">Filtry</button>
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
	<div class="flex flex-wrap">
		<div class="hidden w-full gap-4 p-2 px-5 my-2 border border-gray-300 md:flex rounded-xl">
			{#each columnOrder.filter((col) => $visibleColumnsStore[col]) as column, index}
				<div class="w-full lg:w-1/8 xl:w-1/8 {column !== columnOrder.filter((col) => $visibleColumnsStore[col]).pop() ? 'border-r-2' : ''}">
					{columnNames[column]}
				</div>
			{/each}
			<div class="flex justify-end w-full lg:w-1/6 xl:w-1/6">Editovat</div>
		</div>
		{#if customers.length > 0}
			{#each $table.getRowModel().rows as row}
				<div class="w-full gap-4 p-2 px-5 my-2 border border-gray-300 md:flex rounded-xl hover:bg-slate-100">
					{#each row.getVisibleCells() as cell}
						<div class="w-full lg:w-1/8 xl:w-1/8">
							{#if typeof cell.getValue() === 'function'}
								{cell.getValue()()}
							{:else}
								{cell.getValue()}
							{/if}
						</div>
					{/each}
					<div class="w-full lg:w-1/6 xl:w-1/6">
						<a
						href="/customer/{row.original.id}"
						data-sveltekit-preload-data
						class="flex justify-end font-medium text-blue-600 dark:text-blue-500 hover:underline"
						>
						Upravit
						</a>
					</div>
				</div>
			{/each}
		{:else}
			<p>Žádní zákazníci</p>
		{/if}
	</div>
</div>