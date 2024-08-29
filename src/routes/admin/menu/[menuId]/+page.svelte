<script lang="ts">
	import { goto } from "$app/navigation";
	import { fade, fly } from "svelte/transition";
	import MenuItemDetail from "../MenuItemDetail.svelte";
	import type MenuItem  from "../MenuItemDetail.svelte";

	export let data;
	let { session, supabase, menu, variants } = data;
	$: ({ session, supabase, menu, variants } = data);

	let loading = false;
	let updateMessage = "";

	let menuItem: MenuItem = {
		id: menu.id,
		date: menu.date,
		soup: menu.soup,
		price: menu.price,
		active: menu.active,
		notes: menu.notes,
		type: menu.type,
		nutri: menu.nutri,
		variants: variants
	};

	async function updateMenu() {
		try {
			loading = true;

			const update = {
				updated_at: new Date().toISOString(),
				...menuItem,
				variants: undefined // Remove variants from the main menu update
			};

			console.log("Menu update data:", update);
			console.log("Menu ID:", menuItem.id);

			const { data: updatedMenu, error: menuError } = await supabase
				.from("menus")
				.update(update)
				.eq("id", menuItem.id)
				.single();

			if (menuError) {
				console.error("Error updating menu:", menuError);
				throw menuError;
			}

			const updatedVariants = Object.entries(menuItem.variants).map(([variantNumber, description]) => ({
				menu_id: menuItem.id,
				variant_number: parseInt(variantNumber),
				description,
			}));

			const { data: updatedVariantsData, error: updateVariantsError } = await supabase
				.from("menu_variants")
				.upsert(updatedVariants)
				.eq("menu_id", menuItem.id);

			if (updateVariantsError) {
				console.error("Chyba při úpravě variant menu:", updateVariantsError);
				throw updateVariantsError;
			}

			console.log("Menu upraveno!");
			updateMessage = "Menu upraveno!";
		} catch (error) {
			if (error instanceof Error) {
				console.error("Error updating menu:", error);
				alert(error.message);
			}
		} finally {
			loading = false;
		}
	}

	async function deleteMenu() {
		try {
			loading = true;

			const { error: variantError } = await supabase
				.from("menu_variants")
				.delete()
				.eq("menu_id", menuItem.id);

			if (variantError) throw variantError;

			const { error: menuError } = await supabase
				.from("menus")
				.delete()
				.eq("id", menuItem.id);

			if (menuError) throw menuError;

			console.log("Menu a varianty úspěšně smazány!");
			await goto("/admin/menu", { replaceState: true });
		} catch (error) {
			if (error instanceof Error) {
				console.error("Chyba při mazání menu:", error);
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

<div
	class="relative p-5 overflow-x-auto shadow-md sm:rounded-lg"
	in:fly={{ y: 50, duration: 500 }}>
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
		<div class="flex flex-col gap-2 md:flex-row">
			<button
				value={loading ? "Nahrává se..." : "Upravit"}
				disabled={loading}
				type="submit"
				on:click={updateMenu}
				class="btn btn-outline">
				Upravit
			</button>
			<button
				class="btn btn-outline btn-error"
				value={loading ? "Maže se..." : "Smazat"}
				disabled={loading}
				type="submit"
				on:click={deleteMenu}>
				Smazat
			</button>
		</div>
	</div>
	<div class="divider"></div>

	<div class="bg-base-100">
		<div class="py-6 px-4">
			<h2 class="text-2xl font-bold mb-6">Upravit Menu</h2>

			<MenuItemDetail item={menuItem} onUpdate={handleMenuItemUpdate} />
		</div>
	</div>
</div>