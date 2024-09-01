<script lang="ts">
	import { goto } from "$app/navigation";
	import { fade, fly } from "svelte/transition";
	import MenuItemDetail from "../MenuItemDetail.svelte";
	import type { PageData } from "./$types";
	import type { Menu } from "$lib/types/menu";
	import type { Database } from "$lib/database.types";

	export let data: PageData;

	let { supabase } = data;
	$: ({ menu, allAllergens, allIngredients } = data);

	let loading = false;
	let updateMessage = "";
	let errorMessage = "";
	let editedMenu: Menu;

	/*function handleChange(event: CustomEvent<Menu>) {
		editedMenu = event.detail;
		console.log("Aktualizované menu:", editedMenu);
	}*/

	function handleSave(event: CustomEvent<Menu>) {
		editedMenu = event.detail;
		updateMenu();
	}

	async function updateMenu() {
		console.log("updateMenu called", editedMenu);
		if (!editedMenu) return;

		try {
			loading = true;
			errorMessage = "";
			updateMessage = "";

			console.log("Začátek aktualizace menu:", editedMenu);

			// Aktualizace hlavního menu
			const { data: updatedMenuData, error: menuError } = await supabase
				.from("menus")
				.update({
					date: editedMenu.date,
					soup: editedMenu.soup,
					active: editedMenu.active,
					notes: editedMenu.notes,
					type: editedMenu.type,
					nutri: editedMenu.nutri
				})
				.eq("id", editedMenu.id)
				.select();

			console.log("Hlavní menu aktualizováno:", updatedMenuData);

			if (menuError) {
				throw menuError;
			}

			console.log("Aktualizace variant");
// Aktualizace variant
			for (const variant of editedMenu.variants) {
				const { error: variantError } = await supabase
					.from('menu_variants')
					.upsert({
						menu_id: editedMenu.id,
						id: variant.id,
						variant_number: variant.variant_number,
						description: variant.description,
						price: variant.price
					}, {
						onConflict: 'id'
					});

				if (variantError) {
					throw variantError;
				}
			}

			// Aktualizace alergenů menu
			await supabase.from('menu_allergens').delete().eq('menu_id', editedMenu.id);
			for (const allergen of editedMenu.allergens) {
				await supabase.from('menu_allergens').insert({
					menu_id: editedMenu.id,
					allergen_id: allergen.id
				});
			}

			// Aktualizace ingrediencí menu
			await supabase.from('menu_ingredients').delete().eq('menu_id', editedMenu.id);
			for (const ingredient of editedMenu.ingredients) {
				await supabase.from('menu_ingredients').insert({
					menu_id: editedMenu.id,
					ingredient_id: ingredient.id
				});
			}

			updateMessage = "Menu upraveno!";
			console.log("Menu upraveno!");
			menu = editedMenu; // Aktualizujte lokální menu po úspěšném uložení
		} catch (error) {
			console.error("Chyba při aktualizaci menu:", error);
			errorMessage = "Chyba při úpravě menu";
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
				.eq("menu_id", menu.id);

			if (variantError) throw variantError;

			const { error: menuError } = await supabase
				.from("menus")
				.delete()
				.eq("id", menu.id);

			if (menuError) throw menuError;

			await goto("/admin/menu", { replaceState: true });
		} catch (error) {
			console.error("Error deleting menu:", error);
			errorMessage = "Chyba při mazání menu";
		} finally {
			loading = false;
		}
	}

	async function back() {
		await goto("/admin/menu");
	}
</script>

<div class="relative p-5 overflow-x-auto shadow-md sm:rounded-lg" in:fly="{{ y: 50, duration: 500 }}">
	<div class="flex justify-between items-center mb-4">
		<button on:click={back} class="btn btn-outline">Zpět</button>
		{#if updateMessage}
			<div transition:fade class="bg-green-200 text-green-800 rounded p-2">
				<span>{updateMessage}</span>
			</div>
		{/if}
		{#if errorMessage}
			<div transition:fade class="bg-red-200 text-red-800 rounded p-2">
				<span>{errorMessage}</span>
			</div>
		{/if}
		<div class="flex flex-col gap-2 md:flex-row">
			<button
				disabled={loading}
				on:click={updateMenu}
				class="btn btn-outline">
				{loading ? 'Ukládá se...' : 'Uložit změny'}
			</button>
			<button
				class="btn btn-outline btn-error"
				disabled={loading}
				on:click={deleteMenu}>
				{loading ? 'Maže se...' : 'Smazat menu'}
			</button>
		</div>
	</div>
	<div class="divider"></div>

	<div class="bg-base-100 rounded-xl p-4 md:p-10 colorMenuBg">
		<h2 class="text-2xl font-bold mb-6">Upravit Menu</h2>
		<MenuItemDetail
			bind:menu={editedMenu}
			{allAllergens}
			{allIngredients}
			on:change={handleSave}
		/>
	</div>
</div>

<style>
    .colorMenuBg {
        background-color: #929da5;
    }
</style>