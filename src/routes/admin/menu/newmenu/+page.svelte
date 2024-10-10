<script lang="ts">
	import { goto } from "$app/navigation";
	import { fade, fly } from "svelte/transition";
	import MenuItemDetail from "../MenuItemDetail.svelte";
	import type { PageData } from "./$types";
	import type { Menu } from "$lib/types/menu";
	import type { Database } from "$lib/database.types";

	export let data: PageData;
	let { session, supabase, allAllergens, allIngredients } = data;
	$: ({ session, supabase, allAllergens, allIngredients } = data);

	let loading = false;
	let updateMessage = "";
	let errorMessage = "";

	let newMenu: Menu = {
		id: "",
		date: "",
		soup: "",
		active: false,
		notes: "",
		type: "",
		nutri: "",
		allergens: [],
		ingredients: [],
		variants: [
			{ id: "", description: "", price: 0, allergens: [], ingredients: [] },
			{ id: "", description: "", price: 0, allergens: [], ingredients: [] },
			{ id: "", description: "", price: 0, allergens: [], ingredients: [] }
		]
	};

	async function createMenu() {
		try {
			loading = true;
			errorMessage = "";
			updateMessage = "";

			if (!newMenu.date) {
				errorMessage = "Datum je povinné";
				return;
			}

			const { data: existingMenu, error: checkError } = await supabase
				.from("menus")
				.select("id")
				.eq("date", newMenu.date)
				.maybeSingle();

			if (checkError) throw checkError;

			if (existingMenu) {
				errorMessage = "Menu pro toto datum již existuje";
				return;
			}

			const { data: createdMenu, error: menuError } = await supabase
				.from("menus")
				.insert([{
					date: newMenu.date,
					soup: newMenu.soup,
					active: newMenu.active,
					notes: newMenu.notes,
					type: newMenu.type,
					nutri: newMenu.nutri
				}])
				.select()
				.single();

			if (menuError) throw menuError;

			for (const variant of newMenu.variants) {
				if (variant.description) {
					const { error: variantError } = await supabase
						.from("menu_variants")
						.insert([{
							menu_id: createdMenu.id,
							description: variant.description,
							price: variant.price
						}]);

					if (variantError) throw variantError;
				}
			}

			// Vložení alergenů
			for (const allergen of newMenu.allergens) {
				await supabase.from('menu_allergens').insert({
					menu_id: createdMenu.id,
					allergen_id: allergen.id
				});
			}

			// Vložení ingrediencí
			for (const ingredient of newMenu.ingredients) {
				await supabase.from('menu_ingredients').insert({
					menu_id: createdMenu.id,
					ingredient_id: ingredient.id
				});
			}

			updateMessage = "Nové menu úspěšně vytvořeno!";
			await goto("/admin/menu", { replaceState: true });
		} catch (error) {
			console.error("Chyba při vytváření menu:", error);
			errorMessage = "Nastala chyba při vytváření menu";
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
		<div class="flex gap-2">
			<button disabled={loading} on:click={createMenu} class="btn btn-outline">
				{loading ? "Vytváří se..." : "Vytvořit menu"}
			</button>
		</div>
	</div>

	<div class="divider"></div>

	<div class="rounded-xl p-4 md:p-10 bg-neutral-200 ">
		<h2 class="text-2xl font-bold mb-6">Nové menu</h2>
		<MenuItemDetail
			bind:menu={newMenu}
			{allAllergens}
			{allIngredients}
		/>
	</div>
</div>

<style>
</style>