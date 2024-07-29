<script lang="ts">
	import { goto } from "$app/navigation";
	import { onMount } from "svelte";
	import { writable } from "svelte/store";
	export let data;

	let { session, supabase, menus, profileTableSettings } = data;
	$: ({ session, supabase, menus, profileTableSettings } = data);

	let selectedMenu = null;

	function editMenu(id: any) {
		selectedMenu = id;
		console.log("Selected Menu ID:", selectedMenu);
	}

	function newMenuPage() {
		goto("/menu/newmenu");
	}

	function formatDateToCzech(date: any) {
		if (!date) return ""; // Return empty string if date is null or undefined
		const parts = date.split("-");
		if (parts.length !== 3) {
			return date; // Return the original date if it's not in the expected format
		}
		const [year, month, day] = parts;
		return `${day}.${month}.${year}`;
	}
	console.log(menus);
	let visibleColumns = profileTableSettings?.table_settings_menus ?? {
		date: true,
		active: true,
		price: true,
		soup: true,
		variants: true,
		notes: true,
		type: true,
		nutri: true
	};

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

	const visibleColumnsStore = writable(visibleColumns);

	function toggleColumn(column: any) {
		visibleColumnsStore.update((cols) => ({
			...cols,
			[column]: !cols[column]
		}));
	}

	async function saveTableSettings() {
		const { error } = await supabase
			.from("profiles")
			.update({ table_settings_menus: $visibleColumnsStore })
			.eq("id", session?.user.id);

		if (error) {
			console.error("Chyba při ukládání nastavení tabulky:", error);
		}
	}

	$: {
		saveTableSettings();
	}

	visibleColumnsStore.subscribe(saveTableSettings);

	let filterDate = "";
	let filterActive = "";
	let filterSoup = "";
	let searchQuery = "";

	$: filteredMenus = menus?.length
		? menus.filter((menu) => {
				const matchesDate = !filterDate || menu.date === filterDate;
				const matchesActive =
					!filterActive || menu.active === (filterActive === "true");
				const matchesSearch =
					!searchQuery ||
					menu.soup?.toLowerCase().includes(searchQuery.toLowerCase()) ||
					menu.price
						?.toString()
						.toLowerCase()
						.includes(searchQuery.toLowerCase()) ||
					Object.values(menu.variants)?.some((variants) =>
						variants.toLowerCase().includes(searchQuery.toLowerCase())
					) ||
					menu.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
					menu.type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
					menu.nutri
						?.toString()
						.toLowerCase()
						.includes(searchQuery.toLowerCase());
				return matchesDate && matchesActive && matchesSearch;
			})
		: [];

	const searchMenus = async () => {
		if (!searchQuery) {
			filteredMenus = menus?.filter((menu) => {
				const matchesDate = !filterDate || menu.date === filterDate;
				const matchesActive =
					!filterActive || menu.active === (filterActive === "true");
				return matchesDate && matchesActive;
			});
			return;
		}

		const { data: searchResults, error } = await supabase
			.from("menus")
			.textSearch("fulltext", searchQuery, {
				config: "english"
			});

		if (error) {
			console.error("Error searching menus:", error);
		} else {
			filteredMenus = searchResults?.filter((menu) => {
				const matchesDate = !filterDate || menu.date === filterDate;
				const matchesActive =
					!filterActive || menu.active.toString() === filterActive;
				const matchesType = !filterType || menu.type === filterType;
				const matchesSearch =
					!searchQuery ||
					menu.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
					menu.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
					menu.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
					Object.values(menu.variants)?.some((variant) =>
						variant.toLowerCase().includes(searchQuery.toLowerCase())
					);
				return matchesDate && matchesActive && matchesType && matchesSearch;
			});
		}
	};

	$: filteredMenus = searchMenus();
</script>

<svelte:head>
	<title>LEO - Menu</title>
</svelte:head>
<div class="relative p-5 shadow-md sm:rounded-lg">
	<div class="flex justify-between">
		<div class="flex flex-col gap-2 md:flex-row">
			<div>
				<button
					on:click={newMenuPage}
					class="w-full p-4 px-5 border rounded-xl hover:bg-slate-100"
					>Vytvořit menu</button>
			</div>

			<div class="flex gap-2">
				<input
					type="date"
					bind:value={filterDate}
					class="px-3 py-2 border rounded-lg" />
				<select bind:value={filterActive} class="px-3 py-2 border rounded-lg">
					<option value="">Všechny aktivity</option>
					<option value="true">Aktivní</option>
					<option value="false">Neaktivní</option>
				</select>
				<input
					type="text"
					placeholder="Hledat menu..."
					data-tip="hello"
					class="px-3 py-2 border rounded-lg lg:tooltip"
					bind:value={searchQuery} />
			</div>
		</div>
	</div>
	<hr class="h-px my-8 bg-gray-200 border-0 dark:bg-gray-700" />
	<div class="flex justify-end dropdown">
		<button class="m-1 btn" tabindex="0">Sloupce</button>
		<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
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
		<div
			class="items-center hidden w-full gap-4 p-2 px-5 my-2 border border-gray-300 md:flex rounded-xl">
			{#each Object.keys($visibleColumnsStore).filter((col) => $visibleColumnsStore[col]) as column}
				<div
					class="w-full lg:w-1/6 xl:w-1/6 {column !==
					Object.keys($visibleColumnsStore)
						.filter((col) => $visibleColumnsStore[col])
						.pop()
						? 'border-r-2'
						: ''}">
					{columnNames[column]}
				</div>
			{/each}
			<div class="flex justify-end w-full lg:w-1/6 xl:w-1/6">Editovat</div>
		</div>
		{#if filteredMenus.length > 0}
			{#each filteredMenus as menu (menu.id)}
				<div
					class="w-full gap-4 p-2 px-5 my-2 border border-gray-300 md:flex rounded-xl hover:bg-slate-100">
					{#each Object.keys($visibleColumnsStore).filter((col) => $visibleColumnsStore[col]) as column}
						<div class="w-full lg:w-1/6 xl:w-1/6">
							{#if column === "date"}
								{formatDateToCzech(menu[column])}
							{:else if column === "variants"}
								{#each Object.entries(menu[column]) as [key, value], i}
									{i + 1}. {value}<br />
								{/each}
							{:else if column === "active"}
								{menu[column] ? "ANO" : "NE"}
							{:else}
								{menu[column]}
							{/if}
						</div>
					{/each}
					<div class="flex justify-end w-full lg:w-1/6 xl:w-1/6">
						<a
							href="/menu/{menu.id}"
							data-sveltekit-preload-data
							class="font-medium text-blue-600 dark:text-blue-500 hover:underline"
							on:click={editMenu.bind(this, menu.id)}>Upravit</a>
					</div>
				</div>
			{/each}
		{:else}
			<p>Žádná menu</p>
		{/if}
	</div>
</div>

<style>
	.question-bubble {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 16px;
		height: 16px;
		background-color: #9ca3af; /* šedá barva */
		color: white;
		border-radius: 50%;
		font-size: 12px;
		font-weight: bold;
		cursor: help;
	}
</style>
