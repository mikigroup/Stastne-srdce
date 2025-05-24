<script lang="ts">
	import { goto } from "$app/navigation";
	import { fade, fly } from "svelte/transition";
	import MenuItemDetail from "../MenuItemDetail.svelte";
	import type { PageData } from "./$types";
	import type { Menu } from "$lib/types/menu";
	import type { Database } from "$lib/types/database.types";
	import {
		createMenuVersion,
		updateMenuAllergens,
		createMenuVariant,
		updateVariantAllergens,
		updateVariantIngredients,
		loadMenu
	} from "$lib/services/menuService";

	export let data: PageData;
	let { session, supabase, menu, allAllergens, allIngredients } = data;
	$: ({ session, supabase, menu, allAllergens, allIngredients } = data);

	// Přidejte kód pro zobrazení dat v konzoli
	console.log("Menu data:", menu);
	console.log("Menu variants:", menu.variants);

	let loading = false;
	let updateMessage = "";
	let errorMessage = "";

	async function updateMenu() {
		try {
			// Explicitní kopie menu objektu pro ukládání
			const menuToSave = JSON.parse(JSON.stringify(menu));

			loading = true;
			errorMessage = "";
			updateMessage = "";

			// Inicializace undefined polí jako prázdná pole
			if (!menuToSave.allergens) menuToSave.allergens = [];
			for (const variant of menuToSave.variants) {
				if (!variant.allergens) variant.allergens = [];
				if (!variant.ingredients) variant.ingredients = [];
			}

			// 1. Vytvořit novou verzi menu
			const menuVersionId = await createMenuVersion(supabase, {
				id: menuToSave.id,
				date: menuToSave.date,
				soup: menuToSave.soup,
				active: menuToSave.active,
				notes: menuToSave.notes,
				type: menuToSave.type,
				nutri: menuToSave.nutri
			});

			console.log("Vytvořena nová verze menu s ID:", menuVersionId);

			// 2. Aktualizace alergenů polévky
			await updateMenuAllergens(
				supabase,
				menuToSave.id,
				menuToSave.allergens.map((a: any) => a.id)
			);

			// 3. Vytvoření nových variant pro novou verzi menu
			for (const variant of menuToSave.variants) {
				// Vytvoříme novou variantu pro novou verzi
				const insertedVariant = await createMenuVariant(supabase, {
					menu_id: menuToSave.id,
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

			updateMessage = "Menu úspěšně upraveno";

			// Načteme aktualizované menu pro zobrazení
			const refreshedMenu = await loadMenu(supabase, menuToSave.id);
			menu = refreshedMenu;

		} catch (error) {
			console.error("Chyba při aktualizaci menu:", error);
			errorMessage = "Chyba při úpravě menu: " + (error instanceof Error ? error.message : "Neznámá chyba");
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

	// Formátovací funkce pro datum
	function formatDate(dateString: string | null): string {
		if (!dateString) return 'N/A';
		return new Date(dateString).toLocaleDateString('cs-CZ');
	}
</script>

<div class="bg-white rounded-lg shadow-md p-6" in:fly={{ y: 50, duration: 500 }}>
	<!-- Header -->
	<div class="flex items-center justify-between mb-6">
		<h2 class="text-xl font-semibold">
			Detail menu <span class="text-lg text-gray-600">{formatDate(menu?.date)}</span>
		</h2>
		<div class="flex gap-2">
			<button 
				on:click={back} 
				class="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors">
				Zpět
			</button>
			<button
				disabled={loading}
				on:click={updateMenu}
				class="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors">
				{loading ? 'Ukládá se...' : 'Uložit změny'}
			</button>
			<button
				disabled={loading}
				on:click={softDeleteMenu}
				class="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 transition-colors">
				{loading ? 'Maže se...' : 'Smazat menu'}
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
		bind:menu
		{allAllergens}
		{allIngredients} />
</div>