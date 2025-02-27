<script lang="ts">
	import { goto } from "$app/navigation";
	import { fade, fly } from "svelte/transition";
	import MenuItemDetail from "../MenuItemDetail.svelte";
	import type { PageData } from "./$types";
	import type { Menu } from "$lib/types/menu";
	import type { Database } from "$lib/database.types";
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
				menuToSave.allergens.map(a => a.id)
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
					variant.allergens.map(a => a.id)
				);

				// Přidání ingrediencí k nové variantě
				await updateVariantIngredients(
					supabase,
					insertedVariant.id,
					variant.ingredients.map(i => i.id)
				);
			}

			updateMessage = "Menu úspěšně upraveno";

			// Načteme aktualizované menu pro zobrazení
			const refreshedMenu = await loadMenu(supabase, menuToSave.id);
			menu = refreshedMenu;

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