<script lang="ts">
	import { goto } from "$app/navigation";
	import { fade, fly } from "svelte/transition";
	import MenuItemDetail from "../MenuItemDetail.svelte";
	import type { PageData } from "./$types";
	import type { Menu } from "$lib/types/menu";
	import {
		createMenuVersion,
		updateMenuAllergens,
		createMenuVariant,
		updateVariantAllergens,
		updateVariantIngredients
	} from "$lib/services/menuService";

	export let data: PageData;
	let { session, supabase, allAllergens, allIngredients } = data;
	$: ({ session, supabase, allAllergens, allIngredients } = data);

	let loading = false;
	let updateMessage = "";
	let errorMessage = "";

	// Inicializace nového menu
	let newMenu: Menu = {
		id: "",
		date: "",
		soup: "",
		active: true,
		notes: "",
		type: "",
		nutri: "",
		allergens: [],
		variants: [
			{
				id: "",
				variant_number: "1",
				description: "",
				price: 0,
				allergens: [],
				ingredients: []
			},
			{
				id: "",
				variant_number: "2",
				description: "",
				price: 0,
				allergens: [],
				ingredients: []
			}
		]
	};

	async function createMenu() {
		try {
			loading = true;
			errorMessage = "";
			updateMessage = "";

			// Validace základních údajů
			if (!newMenu.date || !newMenu.soup) {
				throw new Error("Datum a polévka jsou povinné údaje");
			}

			// Vytvoření základního menu záznamu
			const { data: menuData, error: menuError } = await supabase
				.from("menus")
				.insert({
					date: newMenu.date,
					soup: newMenu.soup,
					active: newMenu.active,
					notes: newMenu.notes,
					type: newMenu.type,
					nutri: newMenu.nutri
				})
				.select()
				.single();

			if (menuError) throw menuError;

			const menuId = menuData.id;

			// 1. Vytvořit novou verzi menu
			const menuVersionId = await createMenuVersion(supabase, {
				id: menuId,
				date: newMenu.date,
				soup: newMenu.soup,
				active: newMenu.active,
				notes: newMenu.notes,
				type: newMenu.type,
				nutri: newMenu.nutri
			});

			// 2. Aktualizace alergenů polévky
			await updateMenuAllergens(
				supabase,
				menuId,
				newMenu.allergens.map((a: any) => a.id)
			);

			// 3. Vytvoření variant pro novou verzi menu
			for (const variant of newMenu.variants) {
				if (variant.description && variant.price > 0) {
					// Vytvoříme novou variantu pro novou verzi
					const insertedVariant = await createMenuVariant(supabase, {
						menu_id: menuId,
						menu_version_id: menuVersionId,
						variant_number: variant.variant_number,
						description: variant.description,
						price: variant.price
					});

					// Přidání alergenů k nové variantě
					await updateVariantAllergens(
						supabase,
						insertedVariant.id,
						variant.allergens.map((a: any) => a.id)
					);

					// Přidání ingrediencí k nové variantě
					await updateVariantIngredients(
						supabase,
						insertedVariant.id,
						variant.ingredients.map((i: any) => i.id)
					);
				}
			}

			updateMessage = "Menu úspěšně vytvořeno";
			
			// Přesměrování na seznam menu
			setTimeout(() => {
				goto("/admin/menu", { replaceState: true });
			}, 1500);

		} catch (error) {
			console.error("Chyba při vytváření menu:", error);
			errorMessage = "Chyba při vytváření menu: " + (error instanceof Error ? error.message : "Neznámá chyba");
		} finally {
			loading = false;
		}
	}

	async function back() {
		await goto("/admin/menu");
	}

	function handleUpdate(event: CustomEvent<Menu>) {
		console.log(
			"handleUpdate called with:",
			JSON.stringify(event.detail, null, 2)
		);
		newMenu = event.detail;
		console.log("newMenu after update:", JSON.stringify(newMenu, null, 2));
	}
</script>

<div class="bg-white rounded-lg shadow-md p-6" in:fly={{ y: 50, duration: 500 }}>
	<!-- Header -->
	<div class="flex items-center justify-between mb-6">
		<h2 class="text-xl font-semibold">
			Nové menu
		</h2>
		<div class="flex gap-2">
			<button 
				on:click={back} 
				class="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors">
				Zpět
			</button>
			<button
				disabled={loading}
				on:click={createMenu}
				class="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors">
				{loading ? 'Vytváří se...' : 'Vytvořit menu'}
			</button>
		</div>
	</div>

	{#if updateMessage}
		<div class="mb-4 p-3 bg-green-100 border border-green-200 text-green-800 rounded">
			{updateMessage}
		</div>
	{/if}

	{#if errorMessage}
		<div class="mb-4 p-3 bg-red-100 border border-red-200 text-red-800 rounded">
			{errorMessage}
		</div>
	{/if}

	<!-- Menu content -->
	<MenuItemDetail
		bind:menu={newMenu}
		{allAllergens}
		{allIngredients}
		on:update={handleUpdate} />
</div>

<style>
</style>
