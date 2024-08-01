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

	let { session, supabase, menus, profileTableSettings } = data;
	$: ({ session, supabase, menus, profileTableSettings } = data);

	function editMenu(id: any) {
		selectedMenu = id;
		console.log("Selected Menu ID:", selectedMenu);
	}

	function newMenuPage() {
		goto("/admin/menu/newmenu");
	}

	function formatDateToCzech(date: any) {
		if (!date) return ""; // Return empty string if date is null or undefined
		const parts = date.split("-");
		if (parts.length !== 3) {
			return date; // Return the original date if it"s not in the expected format
		}
		const [year, month, day] = parts;
		return `${day}.${month}.${year}`;
	}

	const columnNames: Record<string, string> = {
		date: "Datum",
		soup: "Polévka",
		price: "Cena",
		variants: "Varianty",
		active: "Aktivní",
		notes: "Poznámky",
		type: "Typ",
		nutri: "Nutriční informace"
	};

	const columnOrder = Object.keys(columnNames);

	let visibleColumns = profileTableSettings?.table_settings_menus ?? columnOrder.reduce((obj, column) => {
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
			.update({ table_settings_menus: orderedSettings })
			.eq("id", session.user.id);

		if (error) {
			console.error("Chyba při ukládání nastavení filtrů:", error);
		}
	}

	visibleColumnsStore.subscribe(saveTableSettings);

	let filterDate = "";
	let filterActive = "";
	let searchQuery = "";

	$: filteredMenus = menus?.filter((menu) =>
		filterDate
			? menu.date === filterDate
			: filterActive
				? menu.active === (filterActive === "true")
				: searchQuery
					? Object.values(menu).some((value) =>
						value?.toString().toLowerCase().includes(searchQuery.toLowerCase())
					)
					: true
	);

	$: columns = columnOrder
		.filter(key => $visibleColumnsStore[key])
		.map(key => ({
			accessorKey: key,
			header: columnNames[key],
			cell: ({ getValue }) => {
				const value = getValue();
				if (key === "date") {
					return formatDateToCzech(value);
				} else if (key === "variants") {
					return Object.entries(value).map(([k, v], i) => `${i + 1}. ${v}`).join("<br>");
				} else if (key === "active") {
					return value ? "ANO" : "NE";
				}
				return value;
			},
		}));

	$: options = writable<TableOptions<typeof menus[0]>>({
		data: filteredMenus,
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
console.log(menus);
</script>
<svelte:head>
<title>LEO - Menu</title>
</svelte:head>
<div class="flex justify-between">
		<div class="flex flex-col gap-2 md:flex-row">
			<div>
				<button
					on:click={newMenuPage}
					class="btn btn-outline">
					Vytvořit menu
				</button>
			</div>

				<div>
				<input
					type="date"
					bind:value={filterDate}
					class="btn btn-outline">
				</div>
				<div>
				<select bind:value={filterActive} class="select select-bordered w-full max-w-xs border-black">
					<option value="">Všechny aktivity</option>
					<option value="true">Aktivní</option>
					<option value="false">Neaktivní</option>
				</select>
				</div>
				<div>
				<input
					type="text"
					placeholder="Hledat..."
					class="input input-bordered input-md w-full max-w-xs border-black"
					bind:value={searchQuery} />
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
		<div class="hidden w-full gap-4 p-2 px-5 my-2 border border-gray-300 md:grid rounded-xl" style="grid-template-columns: repeat({columnOrder.filter((col) => $visibleColumnsStore[col]).length + 1}, 1fr); grid-auto-flow: column;">
			{#each columnOrder.filter((col) => $visibleColumnsStore[col]) as column}
				<div class={column === "variants" ? "md:col-span-2" : ""}>
					{columnNames[column]}
				</div>
			{/each}
			<div class="text-right">Editovat</div>
		</div>
		{#if filteredMenus && filteredMenus.length > 0}
			{#each $table.getRowModel().rows as row}
				<div class="w-full gap-4 p-2 px-5 my-2 border border-gray-300 md:grid rounded-xl hover:bg-slate-100" style="grid-template-columns: repeat({columnOrder.filter((col) => $visibleColumnsStore[col]).length + 1}, 1fr); grid-auto-flow: column;">
					{#each columnOrder.filter((col) => $visibleColumnsStore[col]) as column}
						<div class={column === "variants" ? "md:col-span-2" : ""} title={row.getValue(column) ?? ""}>
							{#if column === "variants"}
								{#if typeof row.original[column] === "string"}
									{#each JSON.parse(row.original[column]) as variant, i}
										{variant.key}. {variant.value}<br />
									{/each}
								{:else if typeof row.original[column] === "object"}
									{#each Object.entries(row.original[column]) as [key, value], i}
										{key}. {value}<br />
									{/each}
								{/if}
							{:else}
								{@html row.getValue(column) ?? ""}
							{/if}
						</div>
					{/each}
					<div>
						<a
						href="/admin/menu/{row.original.id}"
						data-sveltekit-preload-data
						class="flex justify-end font-medium text-blue-600 dark:text-blue-500 hover:underline"
						>
						Upravit
						</a>
					</div>
				</div>
			{/each}
		{:else}
			<p>Žádná menu</p>
		{/if}
	</div>
