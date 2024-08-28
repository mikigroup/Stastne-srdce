<script lang="ts">
	import { goto } from "$app/navigation";
	import { fade, fly } from "svelte/transition";
	import MenuItemDetail from "../MenuItemDetail.svelte";
	import type { MenuItem } from "../MenuItemDetail.svelte";

	export let data;
	let { session, supabase } = data;
	$: ({ session, supabase } = data);
	let loading = false;
	let menuItem: MenuItem = {
		date: "",
		soup: "",
		price: 0,
		active: false,
		notes: "",
		type: "",
		nutri: "",
		variants: {
			1: "",
			2: "",
			3: ""
		}
	};
	let menuId: string = "";

	let updateMessage = "";
	async function createMenu() {
		try {
			loading = true;

			const { data: createdMenu, error: menuError } = await supabase
				.from("menus")
				.insert(menuItem)
				.select()
				.single();

			if (menuError) throw menuError;

			menuId = createdMenu.id;

			for (const [variantNumber, description] of Object.entries(menuItem.variants)) {
				const { error: variantError } = await supabase
					.from("menu_variants")
					.insert({
						menu_id: menuId,
						variant_number: parseInt(variantNumber),
						description
					});

				if (variantError) throw variantError;
			}

			console.log("Menu a varianty úspěšně vytvořeny!");
			updateMessage = "Menu a varianty úspěšně vytvořeny!";

			await goto("/admin/menu", { replaceState: true });
		} catch (error) {
			if (error instanceof Error) {
				console.error("Chyba při vytváření:", error);
				alert(error.message);
			}
		} finally {
			loading = false;
		}
	}

	async function back() {
		await goto("/admin/menu");
	}

	function handleMenuItemUpdate(updatedItem: MenuItem) {
		menuItem = updatedItem;
	}
</script>

<div class="relative p-5 overflow-x-auto shadow-md sm:rounded-lg" in:fly="{{ y: 50, duration: 500 }}">
	<div class="flex justify-between items-center mb-4">
		<button on:click={back} class="btn btn-outline">Zpět</button>
		{#if updateMessage}
			<div class="alert alert-success shadow-lg" transition:fade>
				<div>
					<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 flex-shrink-0 stroke-current" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
					<span>{updateMessage}</span>
				</div>
			</div>
		{/if}
		<div class="flex gap-2">
			<button value={loading ? "Nahrává se..." : "Vytvořit"} disabled={loading} type="submit" on:click={createMenu} class="btn btn-outline">Vytvoř</button>
		</div>
	</div>
	<div class="divider"></div>
	<div class="bg-base-100">
		<div class="py-6 px-4">
			<h2 class="text-2xl font-bold mb-6">Menu</h2>

			<MenuItemDetail item={menuItem} onUpdate={handleMenuItemUpdate} />
		</div>
	</div>
</div>