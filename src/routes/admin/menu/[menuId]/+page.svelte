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

	let loading = false;
	let updateMessage = "";
	let errorMessage = "";

	async function updateMenu() {
		try {
			// Explicitní kopie menu objektu pro ukládání - zajistí nejnovější stav všech změn
			const menuToSave = JSON.parse(JSON.stringify(menu));

			loading = true;
			errorMessage = "";
			updateMessage = "";

			// Diagnostické výpisy
			console.log("Menu před ukládáním:", menuToSave);
			console.log("Alergeny polévky před ukládáním:", menuToSave.allergens);

			for (const variant of menuToSave.variants) {
				console.log(`Alergeny varianty ${variant.variant_number} před ukládáním:`, variant.allergens);
			}

			// Inicializace undefined polí jako prázdná pole
			if (!menuToSave.allergens) menuToSave.allergens = [];
			for (const variant of menuToSave.variants) {
				if (!variant.allergens) variant.allergens = [];
				if (!variant.ingredients) variant.ingredients = [];
			}

			// Aktualizace hlavního menu
			const { data: updatedMenuData, error: menuError } = await supabase
				.from("menus")
				.update({
					date: menuToSave.date,
					soup: menuToSave.soup,
					active: menuToSave.active,
					notes: menuToSave.notes,
					type: menuToSave.type,
					nutri: menuToSave.nutri
				})
				.eq("id", menuToSave.id)
				.select();

			if (menuError) {
				console.error("Chyba při aktualizaci hlavního menu:", menuError);
				throw menuError;
			}

			console.log("Hlavní menu aktualizováno:", updatedMenuData);

			// Aktualizace alergenů polévky (menu)
			console.log("Aktualizace alergenů polévky:", menuToSave.allergens);

			// 1. Nejprve smažeme všechny existující alergeny polévky
			const { error: deleteAllergensError } = await supabase
				.from("menu_allergens")
				.delete()
				.eq("menu_id", menuToSave.id);

			if (deleteAllergensError) {
				console.error("Chyba při mazání alergenů polévky:", deleteAllergensError);
				throw deleteAllergensError;
			}

			// 2. Poté vložíme všechny nové alergeny polévky najednou
			if (menuToSave.allergens && menuToSave.allergens.length > 0) {
				const allergensToInsert = menuToSave.allergens.map(allergen => ({
					menu_id: menuToSave.id,
					allergen_id: allergen.id
				}));

				console.log("Vkládané alergeny polévky:", allergensToInsert);

				const { error: insertAllergensError } = await supabase
					.from("menu_allergens")
					.insert(allergensToInsert);

				if (insertAllergensError) {
					console.error("Chyba při vkládání alergenů polévky:", insertAllergensError);
					throw insertAllergensError;
				}
			}

			console.log("Alergeny polévky aktualizovány");

			// Aktualizace variant
			for (const variant of menuToSave.variants) {
				const { data: updatedVariant, error: variantError } = await supabase
					.from("menu_variants")
					.upsert(
						{
							menu_id: menuToSave.id,
							id: variant.id,
							variant_number: variant.variant_number,
							description: variant.description,
							price: variant.price
						},
						{
							onConflict: "id"
						}
					)
					.select()
					.single();

				if (variantError) {
					console.error("Chyba při aktualizaci varianty:", variantError);
					throw variantError;
				}

				console.log("Varianta aktualizována:", updatedVariant);

				// Aktualizace alergenů varianty - hromadné vkládání
				const { error: deleteVariantAllergensError } = await supabase
					.from("variant_allergens")
					.delete()
					.eq("variant_id", variant.id);

				if (deleteVariantAllergensError) {
					console.error("Chyba při mazání alergenů varianty:", deleteVariantAllergensError);
					throw deleteVariantAllergensError;
				}

				if (variant.allergens && variant.allergens.length > 0) {
					const variantAllergensToInsert = variant.allergens.map(allergen => ({
						variant_id: variant.id,
						allergen_id: allergen.id
					}));

					console.log("Vkládané alergeny varianty:", variantAllergensToInsert);

					const { error: insertVariantAllergensError } = await supabase
						.from("variant_allergens")
						.insert(variantAllergensToInsert);

					if (insertVariantAllergensError) {
						console.error("Chyba při vkládání alergenů varianty:", insertVariantAllergensError);
						throw insertVariantAllergensError;
					}
				}

				// Aktualizace ingrediencí varianty - hromadné vkládání
				const { error: deleteVariantIngredientsError } = await supabase
					.from("variant_ingredients")
					.delete()
					.eq("variant_id", variant.id);

				if (deleteVariantIngredientsError) {
					console.error("Chyba při mazání ingrediencí varianty:", deleteVariantIngredientsError);
					throw deleteVariantIngredientsError;
				}

				if (variant.ingredients && variant.ingredients.length > 0) {
					const variantIngredientsToInsert = variant.ingredients.map(ingredient => ({
						variant_id: variant.id,
						ingredient_id: ingredient.id
					}));

					const { error: insertVariantIngredientsError } = await supabase
						.from("variant_ingredients")
						.insert(variantIngredientsToInsert);

					if (insertVariantIngredientsError) {
						console.error("Chyba při vkládání ingrediencí varianty:", insertVariantIngredientsError);
						throw insertVariantIngredientsError;
					}
				}
			}

			updateMessage = "Menu úspěšně upraveno!";
		} catch (error) {
			console.error("Chyba při aktualizaci menu:", error);
			errorMessage = "Chyba při úpravě menu: " + (error.message || "Neznámá chyba");
		} finally {
			loading = false;
		}
	}

	async function softDeleteMenu() {
		try {
			loading = true;

			const { data, error } = await supabase.rpc("soft_delete_menu", {
				p_menu_id: menu.id
			});

			if (error) throw error;

			updateMessage = "Menu bylo úspěšně označeno jako smazané";
			await goto("/admin/menu", { replaceState: true });
		} catch (error) {
			console.error("Error soft-deleting menu:", error);
			errorMessage = "Chyba při označování menu jako smazané";
		} finally {
			loading = false;
		}
	}

	async function back() {
		await goto("/admin/menu");
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
		<div class="flex flex-col gap-2 md:flex-row">
			<button disabled={loading} on:click={updateMenu} class="btn btn-outline">
				{loading ? "Ukládá se..." : "Uložit změny"}
			</button>
			<button
				class="btn btn-outline btn-error"
				disabled={loading}
				on:click={softDeleteMenu}>
				{loading ? "Maže se..." : "Smazat menu"}
			</button>
		</div>
	</div>
	<div class="divider"></div>

	<div class="rounded-xl p-4 md:p-10 bg-neutral-200">
		<h2 class="text-2xl font-bold mb-6">Upravit Menu</h2>
		<MenuItemDetail
			bind:menu
			{allAllergens}
			{allIngredients} />
	</div>
</div>

<style>
</style>