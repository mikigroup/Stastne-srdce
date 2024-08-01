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

	let visibleColumns = profileTableSettings?.table_settings_customers ?? columnOrder.reduce((obj, column) => {
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

	let searchQuery = "";

	$: filteredCustomers = customers?.filter((customer) =>
		Object.values(customer).some((value) =>
			value?.toString().toLowerCase().includes(searchQuery.toLowerCase())
		)
	);

	$: columns = columnOrder
		.filter(key => $visibleColumnsStore[key])
		.map(key => ({
			accessorKey: key,
			header: columnNames[key],
			cell: ({ getValue }) => getValue(),
		}));

	$: options = writable<TableOptions<typeof customers[0]>>({
		data: filteredCustomers,
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

	$: visibleColumnsStore.subscribe(value => {
		options.update(options => ({
			...options,
			columns: columns.filter(column => value[column.accessorKey]),
		}));
	});

	$: table = createSvelteTable(options);

</script>
<svelte:head>
<title>LEO - Zákazníci</title>
</svelte:head>

	<div class="flex">
		<div class="flex flex-col gap-2 md:flex-row items-center">
			<div>
				<button
					on:click={() => goto("/customer/newcustomer")}
					class="invisible w-full p-4 px-5 btn btn-outline">
					Vytvořit zákazníka
				</button>
			</div>
			<div>
				<input
					type="text"
					placeholder="Hledat..."
					class="input input-bordered input-md w-full max-w-xs border-black"
					bind:value={searchQuery}
				/>
			</div>
		</div>
	</div>
	<hr class="h-px my-8 bg-gray-200 border-0 dark:bg-gray-700" />
	<div class="flex justify-end dropdown">
		<button class="m-1 btn" tabindex="0">Sloupce</button>
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
		<div class="hidden w-full gap-4 p-2 px-5 my-2 border border-gray-300 md:grid rounded-xl" style="grid-template-columns: repeat({columnOrder.filter((col) => $visibleColumnsStore[col]).length}, 1fr) 1fr; grid-auto-flow: column;">
			{#each columnOrder.filter((col) => $visibleColumnsStore[col]) as column}
				<div class={column === 'email' ? 'md:col-span-2' : ''}>
					{columnNames[column]}
				</div>
			{/each}
			<div class="text-right">Editovat</div>
		</div>
		{#if filteredCustomers && filteredCustomers.length > 0}
			{#each $table.getRowModel().rows as row}
				<div class="w-full gap-4 p-2 px-5 my-2 border border-gray-300 md:grid rounded-xl hover:bg-slate-100" style="grid-template-columns: repeat({columnOrder.filter((col) => $visibleColumnsStore[col]).length}, 1fr) 1fr; grid-auto-flow: column;">
					{#each columnOrder.filter((col) => $visibleColumnsStore[col]) as column}
						<div class={column === 'email' ? 'md:col-span-2 truncate-cell' : 'truncate-cell'} title={row.getValue(column) ?? ''}>
							{row.getValue(column) ?? ''}
						</div>
					{/each}
					<div>
						<a
						href="/admin/customer/{row.original.id}"
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
<style>
    /*    .truncate-cell {
						max-width: 150px;
						white-space: nowrap;
						overflow: hidden;
						text-overflow: ellipsis;
				}*/
</style>