<script lang="ts">
	import { goto } from "$app/navigation";
	import { fade, fly } from "svelte/transition";
	import MenuItemDetail from "../MenuItemDetail.svelte";
	import type { PageData } from "./$types";
	import type { Menu } from "$lib/types/menu";
	import type { Database } from "$lib/database.types";

	export let data: PageData;
	let { session, supabase, menu, allAllergens, allIngredients } = data;
	$: ({ session, supabase, menu, allAllergens, allIngredients } = data);

	//console.log("Zde je page.svelte:", menu)

	let loading = false;
	let updateMessage = "";
	let errorMessage = "";

	/*function handleChange(event: CustomEvent<Menu>) {
		editedMenu = event.detail;
		console.log("Aktualizované menu:", editedMenu);
	}*/

	async function updateMenu() {
		try {
			loading = true;
			errorMessage = "";
			updateMessage = "";

			console.log("Začátek aktualizace menu:", menu);

			// Aktualizace hlavního menu
			const { data: updatedMenuData, error: menuError } = await supabase
				.from("menus")
				.update({
					date: menu.date,
					soup: menu.soup,
					active: menu.active,
					notes: menu.notes,
					type: menu.type,
					nutri: menu.nutri
				})
				.eq("id", menu.id)
				.select();

			if (menuError) throw menuError;

			console.log("Hlavní menu aktualizováno:", updatedMenuData);

			// Aktualizace variant
			for (const variant of menu.variants) {
				const { error: variantError } = await supabase
					.from('menu_variants')
					.upsert({
						menu_id: menu.id,
						id: variant.id,
						variant_number: variant.variant_number,
						description: variant.description,
						price: variant.price
					}, {
						onConflict: 'id'
					});

				if (variantError) throw variantError;
			}

			// Aktualizace alergenů menu
			await supabase.from('menu_allergens').delete().eq('menu_id', menu.id);
			for (const allergen of menu.allergens) {
				await supabase.from('menu_allergens').insert({
					menu_id: menu.id,
					allergen_id: allergen.id
				});
			}

			// Aktualizace ingrediencí menu
			await supabase.from('menu_ingredients').delete().eq('menu_id', menu.id);
			for (const ingredient of menu.ingredients) {
				await supabase.from('menu_ingredients').insert({
					menu_id: menu.id,
					ingredient_id: ingredient.id
				});
			}

			updateMessage = "Menu upraveno!";
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

			const { data, error } = await supabase
				.rpc('delete_menu', { p_menu_id: menu.id });

			if (error) throw error;

			updateMessage = "Menu bylo úspěšně smazáno";
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

	<div class="bg-base-100 rounded-xl p-4 md:p-10 bg-neutral-200">
		<h2 class="text-2xl font-bold mb-6">Upravit Menu</h2>
		<MenuItemDetail
			bind:menu
			{allAllergens}
			{allIngredients}
		/>
	</div>
</div>

<style>
</style>