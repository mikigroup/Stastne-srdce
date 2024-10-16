<script lang="ts">
	import { goto } from "$app/navigation";
	import { fade, fly } from "svelte/transition";
	import MenuItemDetail from "../MenuItemDetail.svelte";
	import type { PageData } from "./$types";
	import type { Menu } from "$lib/types/menu";
	import type { Database } from "$lib/database.types";

	export let data: PageData;
	let { supabase, allAllergens, allIngredients } = data;
	$: ({ supabase, allAllergens, allIngredients } = data);

	console.log(allAllergens)

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

			console.log("Začátek vytváření menu. Obsah newMenu:", JSON.stringify(newMenu, null, 2));

			if (!newMenu.date) {
				errorMessage = "Datum je povinné";
				return;
			}

			// 1. Vytvořit základní menu
			const { data: createdMenu, error: menuError } = await supabase
				.from("menus")
				.insert({
					date: newMenu.date,
					soup: newMenu.soup,
					active: newMenu.active,
					notes: newMenu.notes,
					type: newMenu.type,
					nutri: newMenu.nutri,
					deleted: false
				})
				.select()
				.single();

			if (menuError) throw menuError;

			console.log("Základní menu vytvořeno:", JSON.stringify(createdMenu, null, 2));

			// 2. Přidat varianty
			if (newMenu.variants && newMenu.variants.length > 0) {
				console.log("Přidávání variant:", JSON.stringify(newMenu.variants, null, 2));
				const { data: createdVariants, error: variantsError } = await supabase
					.from("menu_variants")
					.insert(newMenu.variants.map((v, index) => ({
						menu_id: createdMenu.id,
						variant_number: (index + 1).toString(),
						description: v.description,
						price: v.price
					})))
					.select();

				if (variantsError) throw variantsError;
				console.log("Varianty úspěšně přidány:", JSON.stringify(createdVariants, null, 2));
			}

			// 3. Přidat alergeny
			if (newMenu.allergens && newMenu.allergens.length > 0) {
				console.log("Přidávání alergenů:", JSON.stringify(newMenu.allergens, null, 2));
				const { data: createdAllergens, error: allergensError } = await supabase
					.from("menu_allergens")
					.insert(newMenu.allergens.map(a => ({
						menu_id: createdMenu.id,
						allergen_id: a.id
					})))
					.select();

				if (allergensError) throw allergensError;
				console.log("Alergeny úspěšně přidány:", JSON.stringify(createdAllergens, null, 2));
			} else {
				console.log("Žádné alergeny k přidání.");
			}

			// 4. Přidat ingredience
			if (newMenu.ingredients && newMenu.ingredients.length > 0) {
				console.log("Přidávání ingrediencí:", JSON.stringify(newMenu.ingredients, null, 2));
				const { data: createdIngredients, error: ingredientsError } = await supabase
					.from("menu_ingredients")
					.insert(newMenu.ingredients.map(i => ({
						menu_id: createdMenu.id,
						ingredient_id: i.id
					})))
					.select();

				if (ingredientsError) throw ingredientsError;
				console.log("Ingredience úspěšně přidány:", JSON.stringify(createdIngredients, null, 2));
			} else {
				console.log("Žádné ingredience k přidání.");
			}

			updateMessage = "Nové menu úspěšně vytvořeno!";
			console.log("Menu úspěšně vytvořeno. Přesměrování na /admin/menu");
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

	function handleUpdate(event: CustomEvent<Menu>) {
		console.log("handleUpdate called with:", JSON.stringify(event.detail, null, 2));
		newMenu = event.detail;
		console.log("newMenu after update:", JSON.stringify(newMenu, null, 2));
	}
</script>

<div class="relative p-5 overflow-x-auto shadow-md sm:rounded-lg border border-zinc-200" in:fly="{{ y: 50, duration: 500 }}">
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
			on:update={handleUpdate}
		/>
	</div>
</div>

<style>
</style>