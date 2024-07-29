<script lang="ts">
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import { writable } from "svelte/store";
  export let data;

  let { session, supabase, orders, profileTableSettings } = data;
  $: ({ session, supabase, orders, profileTableSettings } = data);

  let selectedOrder = null;

  function editOrder(id) {
    selectedOrder = id;
    console.log("Selected Order number:", selectedOrder);
  }

  function newOrderPage() {
    goto("/order/neworder");
  }

function formatDateToCzech(date) {
  if (!date) return ''; // Return empty string if date is null or undefined
  const parts = date.split("-");
  if (parts.length !== 3) {
    return date; // Return the original date if it's not in the expected format
  }
  const [year, month, day] = parts;
  return `${day}.${month}.${year}`;
}

let visibleColumns = profileTableSettings?.table_settings_orders ?? {
  order_number: true,
  date: true,
  state: true,  
  currency: true,
  pay_method: true,
  pay_state: true,
  shipping_method: true, 
  customer_first_name: true,
  customer_last_name: true,
  customer_street: true,
  customer_street_number: true,
  customer_city: true,
  customer_zip_code: true,
  customer_telephone: true,
  customer_email: true,
  delivery_street: true,
  delivery_street_number: true,
  delivery_zip_code: true,
  delivery_first_name: true,
  delivery_last_name: true,
  delivery_telephone: true,
  delivery_city: true,
};

const columnNames = {
  state: "Stav",
  date: "Datum",    
  customer_first_name: "Jméno",
  customer_last_name: "Příjmení",
  customer_street: "Ulice",
  customer_street_number: "Číslo domu",
  customer_city: "Město",
  customer_zip_code: "PSČ",
  customer_telephone: "Telefon",
  customer_email: "E-mail",
  delivery_street: "D-Ulice",
  delivery_street_number: "D-Číslo domu",
  delivery_zip_code: "D-PSČ",
  delivery_first_name: "D-Jméno příjemce",
  delivery_last_name: "D-Příjmení příjemce",
  delivery_telephone: "D-Telefon",
  pay_state: "Stav platby",
  delivery_city: "D-Město",
  currency: "Měna",
  order_number: "Objednávka",
  shipping_method: "Způsob dopravy",
  pay_method: "Platební metoda",
};

  const visibleColumnsStore = writable(visibleColumns);

  function toggleColumn(column) {
    visibleColumnsStore.update(cols => ({ ...cols, [column]: !cols[column] }));
  }

  async function saveTableSettings() {
    const { error } = await supabase
      .from("profiles")
      .update({ table_settings_orders: $visibleColumnsStore })
      .eq("id", session?.user.id);

    if (error) {
      console.error("Chyba při ukládání nastavení tabulky:", error);
    }
  }

  $: {
    saveTableSettings();
  }

  visibleColumnsStore.subscribe(saveTableSettings);

  function  formatPayState(pay_state:boolean) {
    return pay_state ? "Ano" : "Ne";
  }
</script>

<svelte:head>
	<title>LEO - Objednávky</title>
</svelte:head>

<div class="relative p-5 shadow-md sm:rounded-lg">
	<div class="flex justify-between">
		<div class="flex flex-col gap-2 md:flex-row">
			<div>
				<button
					on:click={newOrderPage}
					class="w-full p-4 px-5 border rounded-xl hover:bg-slate-100"
					>Vytvořit objednávku</button>
			</div>
		</div>
	</div>
	<hr class="h-px my-8 bg-gray-200 border-0 dark:bg-gray-700" />

	<div class="flex justify-end dropdown">
		 	<button class="m-1 btn" tabindex="0">Filtry</button>
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

		{#if orders.length > 0}
			{#each orders as order (order.id)}
				<div
					class="w-full gap-4 p-2 px-5 my-2 border border-gray-300 md:flex rounded-xl hover:bg-slate-100">
					{#each Object.keys($visibleColumnsStore).filter((col) => $visibleColumnsStore[col]) as column}
						<div class="w-full lg:w-1/6 xl:w-1/6">
							{#if column === "date"}
								{formatDateToCzech(order[column])}
							{:else if column === "pay_state"}
								{formatPayState(order[column])}
							{:else}
								{order[column]}
							{/if}
						</div>
					{/each}
					<div class="flex justify-end w-full lg:w-1/6 xl:w-1/6">
						<a
							href="/order/{order.id}"
							data-sveltekit-preload-data
							class="font-medium text-blue-600 dark:text-blue-500 hover:underline"
							on:click={editOrder.bind(this, order.id)}>Upravit</a>
					</div>
				</div>
			{/each}
		{:else}
			<p>Žádné objednávky</p>
		{/if}
	</div>
</div>
