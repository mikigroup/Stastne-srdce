<script lang="ts">
	import { goto } from "$app/navigation";
	import { fade, fly } from "svelte/transition";
	import MenuItemDetail from "../MenuItemDetail.svelte";
	import type { PageData } from "./$types";
	import type { Menu } from "$lib/types/menu";
	import { ROUTES } from "$lib/stores/store";

	export let data: PageData;
	let { supabase, allAllergens, allIngredients } = data;
	$: ({ supabase, allAllergens, allIngredients } = data);

	console.log(allAllergens);

	let loading = false;
	let updateMessage = "";
	let errorMessage = "";

	// Initialize new menu object with default values
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

			console.log(
				"Starting menu creation. newMenu content:",
				JSON.stringify(newMenu, null, 2)
			);

			// Check if date is provided (required field)
			if (!newMenu.date) {
				errorMessage = "Datum je povinné";
				return;
			}

			// 1. Create basic menu
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

			console.log("Basic menu created:", JSON.stringify(createdMenu, null, 2));

			// 2. Add variants and their allergens
			if (newMenu.variants && newMenu.variants.length > 0) {
				console.log(
					"Adding variants:",
					JSON.stringify(newMenu.variants, null, 2)
				);
				for (let variant of newMenu.variants) {
					const { data: createdVariant, error: variantError } = await supabase
						.from("menu_variants")
						.insert({
							menu_id: createdMenu.id,
							variant_number: (
								newMenu.variants.indexOf(variant) + 1
							).toString(),
							description: variant.description,
							price: variant.price
						})
						.select()
						.single();

					if (variantError) throw variantError;

					// Add allergens for this variant
					if (variant.allergens && variant.allergens.length > 0) {
						const { error: variantAllergensError } = await supabase
							.from("variant_allergens")
							.insert(
								variant.allergens.map((a) => ({
									variant_id: createdVariant.id,
									allergen_id: a.id
								}))
							);

						if (variantAllergensError) throw variantAllergensError;
					}
				}
				console.log("Variants and their allergens successfully added");
			}

			// 3. Add allergens
			if (newMenu.allergens && newMenu.allergens.length > 0) {
				console.log(
					"Adding allergens:",
					JSON.stringify(newMenu.allergens, null, 2)
				);
				const { data: createdAllergens, error: allergensError } = await supabase
					.from("menu_allergens")
					.insert(
						newMenu.allergens.map((a) => ({
							// Map each allergen to a new object linking it to the menu
							menu_id: createdMenu.id,
							allergen_id: a.id
						}))
					)
					.select();

				if (allergensError) throw allergensError;
				console.log(
					"Allergens successfully added:",
					JSON.stringify(createdAllergens, null, 2)
				);
			} else {
				console.log("No allergens to add.");
			}

			// 4. Add ingredients
			if (newMenu.ingredients && newMenu.ingredients.length > 0) {
				console.log(
					"Adding ingredients:",
					JSON.stringify(newMenu.ingredients, null, 2)
				);
				const { data: createdIngredients, error: ingredientsError } =
					await supabase
						.from("menu_ingredients")
						.insert(
							newMenu.ingredients.map((i) => ({
								// Map each ingredient to a new object linking it to the menu
								menu_id: createdMenu.id,
								ingredient_id: i.id
							}))
						)
						.select();

				if (ingredientsError) throw ingredientsError;
				console.log(
					"Ingredients successfully added:",
					JSON.stringify(createdIngredients, null, 2)
				);
			} else {
				console.log("No ingredients to add.");
			}

			updateMessage = "Nové menu úspěšně vytvořeno!";
			console.log("Menu successfully created. Redirecting to /admin/menu");
			await goto($ROUTES.ADMIN.MENU.LIST, { replaceState: true });
		} catch (error) {
			console.error("Error creating menu:", error);
			errorMessage = "Nastala chyba při vytváření menu";
		} finally {
			loading = false;
		}
	}

	// Navigate back to menu list
	async function back() {
		await goto($ROUTES.ADMIN.MENU.LIST);
	}

	// Handle update events from MenuItemDetail component
	function handleUpdate(event: CustomEvent<Menu>) {
		console.log(
			"handleUpdate called with:",
			JSON.stringify(event.detail, null, 2)
		);
		newMenu = event.detail;
		console.log("newMenu after update:", JSON.stringify(newMenu, null, 2));
	}
</script>

<div
	class="relative p-5 overflow-x-auto shadow-md sm:rounded-lg border border-zinc-200"
	in:fly={{ y: 50, duration: 500 }}>
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

	<div class="rounded-xl p-4 md:p-10 bg-neutral-200">
		<h2 class="text-2xl font-bold mb-6">Nové menu</h2>
		<MenuItemDetail
			bind:menu={newMenu}
			{allAllergens}
			{allIngredients}
			on:update={handleUpdate} />
	</div>
</div>

<style>
</style>
