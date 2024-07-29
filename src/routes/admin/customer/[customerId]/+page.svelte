<script lang="ts">
  import { onMount } from "svelte";
  import { createEventDispatcher } from "svelte";
  import { goto } from "$app/navigation";

  export let data;
  let { session, supabase, customers } = data;
  $: ({ session, supabase, customers } = data);
  console.log("customersId:", customers);

  let loading = false;  
  let first_name: string = customers?.first_name ?? "";
  let last_name: string = customers?.last_name ?? "";
  let telephone: string = customers?.telephone ?? "";
  let street: string = customers?.street ?? "";
  let city: string = customers?.city ?? "";
  let street_number: string = customers?.street_number ?? "";
  let zip_code: string = customers?.zip_code ?? "";
  let email: string = customers?.email ?? "";
  let customerId: string = customers?.id;

  const dispatch = createEventDispatcher();
  
  let updateMessage = "";
  async function updateCustomer() {
    try {
      loading = true;
      // const { user } = session;
      const update = {
        first_name, last_name, telephone, street, city, street_number, zip_code, email
      };

      console.log("Zákazník se ukládá s těmito daty:", update);
      
console.log("customerID:", customerId);
      const { error } = await supabase
        .from("customers")
        .update(update)
        .eq("id", customerId)
        .select();
      if (error) {
        console.error("Chyba ukládání:", error);
        throw error;
      } else {
        console.log("Zákazník úspěšně uložen!");
        updateMessage = "Zákazník úspěšně uložen!";
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error("Chyba ukládání:", error);
        alert(error.message);
      }
    } finally {
      loading = false;
    }
  }

  async function back() {
    goto("/customer");
  }

  function closeModal() {
    loading = false;
  }

  async function deleteCustomer() {
    try {
      loading = true;      
      const { error } = await supabase.from("customers").delete().eq("id", customerId);
      if (error) {
        console.error("Error deleting customer:", error);
        throw error;
      } else {
        console.log("Customer deleted successfully!");
        await goto("/customer", { replaceState: true });
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error in Delete customer:", error);
        alert(error.message);
      }
    } finally {
      loading = false;
    }
  }
	let isValidDate: boolean = true;
	let isEditingDate = false;

	

  console.log("customers:", customers);
  console.log(customerId);
</script>

<svelte:head>
  <title>LEO - Zákazník</title>
</svelte:head>

<div class="relative p-5 overflow-x-auto shadow-md sm:rounded-lg">
<div class="antialiased bg-white sans-serif">
	<div class="md:py-6 md:px-4">
		<div class="flex justify-between">
			<h2 class="pb-2 mb-6 text-2xl font-bold tracking-wider uppercase">
				Zákazník
			</h2>
			<div />
		</div>

      <div class="flex justify-between">
    <div>
      <button
        on:click={back}
        class="w-full p-4 px-5 border rounded-xl hover:bg-slate-100"
        >Zpět</button
      >
    </div>
    {#if updateMessage}
      <div class="p-2 my-2 text-green-800 bg-green-200 rounded">
        {updateMessage}
      </div>
    {/if}
    <div class="flex flex-col gap-2 md:flex-row">
      <div>
        <button
          value={loading ? "Nahrává se..." : "Změněno"}
          disabled={loading}
          type="submit"
          on:click={updateCustomer}
          class="w-full p-4 px-5 border rounded-xl hover:bg-slate-100"
          >Upravit</button
        >
      </div>
      <div>
        <button
          class="invisible w-full p-4 px-5 border rounded-xl hover:bg-slate-100"
          value={loading ? "Nahrává se..." : "Update"}
          disabled={loading}
          type="submit"
          on:click={deleteCustomer}>Smazat</button
        >
      </div>
    </div>
  </div>
  <hr class="h-px my-8 bg-gray-200 border-0 dark:bg-gray-700" />

		<div class="mb-8 md:flex md:flex-wrap md:justify-between">
			<div class="w-full mb-2 md:w-1/2 md:mb-0">
				<input
					class="w-full px-4 py-2 mb-1 leading-tight text-gray-700 bg-gray-200 border-2 border-gray-200 rounded appearance-none focus:outline-none focus:bg-white"
					type="text"
					bind:value={first_name}
					placeholder="Jméno"
				/>
				<input
					class="w-full px-4 py-2 mb-1 leading-tight text-gray-700 bg-gray-200 border-2 border-gray-200 rounded appearance-none focus:outline-none focus:bg-white"
					type="text"
					bind:value={last_name}
					placeholder="Příjmení"
				/>
				<input
					class="w-full px-4 py-2 mb-1 leading-tight text-gray-700 bg-gray-200 border-2 border-gray-200 rounded appearance-none focus:outline-none focus:bg-white"
					type="text"
					bind:value={street}
					placeholder="Ulice"
				/>
				<input
					class="w-full px-4 py-2 mb-1 leading-tight text-gray-700 bg-gray-200 border-2 border-gray-200 rounded appearance-none focus:outline-none focus:bg-white"
					type="text"
					bind:value={street_number}
					placeholder="Číslo"
				/>
				<input
					class="w-full px-4 py-2 mb-1 leading-tight text-gray-700 bg-gray-200 border-2 border-gray-200 rounded appearance-none focus:outline-none focus:bg-white"
					type="text"
					bind:value={city}
					placeholder="Město"
				/>
			</div>
			<div class="w-full md:w-1/2">
				<input
					class="w-full px-4 py-2 mb-1 leading-tight text-gray-700 bg-gray-200 border-2 border-gray-200 rounded appearance-none focus:outline-none focus:bg-white"
					type="text"
					bind:value={zip_code}
					placeholder="PSČ"
				/>
				<input
					class="w-full px-4 py-2 mb-1 leading-tight text-gray-700 bg-gray-200 border-2 border-gray-200 rounded appearance-none focus:outline-none focus:bg-white"
					type="text"
					bind:value={telephone}
					placeholder="Telefon"
				/>
      <input
        class="w-full px-4 py-2 mb-1 leading-tight text-gray-700 bg-gray-200 border-2 border-gray-200 rounded appearance-none focus:outline-none focus:bg-white"
        type="text" 
        bind:value={email}
        placeholder="Email"
      />
			</div>
		</div>
	</div>
</div>
</div>

<style>
  .my-custom-class :global(.svelte-tags-input-tag) {
    border-style: solid;
    border-width: 10px;
  }

  .my-custom-class :global(.svelte-tags-input-layout) {
    border-style: solid;
    border-width: 10px;
  }
  .my-custom-class :global(.svelte-tags-input-tag.hover),
  .my-custom-class :global(.svelte-tags-input:focus) {
    border-color: blue;
  }
</style>
