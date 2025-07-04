<script lang="ts">
	import { goto } from "$app/navigation";
	import { fade, fly } from "svelte/transition";
	import MenuItemDetail from "../MenuItemDetail.svelte";
	import type { PageData } from "./$types";
	import type { Menu } from "$lib/types/menu";
	import type { Database } from "$lib/types/database.types";
	import AdminPageLayout from "$lib/component/AdminPageLayout.svelte";
	import { formatDateToCzechShort } from "$lib/utils/formatting";
	import {
		createMenuVersion,
		updateMenuAllergens,
		createMenuVariant,
		updateVariantAllergens,
		updateVariantIngredients,
		loadMenu
	} from "$lib/services/menuService";

	export let data: PageData;
	let { session, supabase, menu, allAllergens, allIngredients, productsSettings, generalSettings, navigation } = data;
	$: ({ session, supabase, menu, allAllergens, allIngredients, productsSettings, generalSettings, navigation } = data);
	
	// Zajistíme, že máme všechna potřebná pole pro varianty
	$: enhancedProductsSettings = {
		...productsSettings,
		menuVariantsCount: productsSettings?.menuVariantsCount ?? 3,
		allowVariableVariants: productsSettings?.allowVariableVariants ?? true,
		minVariants: productsSettings?.minVariants ?? 1,
		maxVariants: productsSettings?.maxVariants ?? 10
	};

	let loading = false;
	let updateMessage = "";
	let errorMessage = "";

	// Navigační funkce
	async function goToPreviousMenu() {
		if (navigation?.prevMenuId) {
			await goto(`/admin/menu/${navigation.prevMenuId}`);
		}
	}

	async function goToNextMenu() {
		if (navigation?.nextMenuId) {
			await goto(`/admin/menu/${navigation.nextMenuId}`);
		}
	}

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
					price: variant.price,
					vegetarian: variant.vegetarian || false
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
		return formatDateToCzechShort(dateString);
	}

	// Definice akcí pro AdminPageLayout
	$: actions = [
		{
			label: loading ? 'Ukládá se...' : 'Uložit změny',
			onClick: updateMenu,
			variant: 'primary' as const,
			loading,
			disabled: loading
		},
		{
			label: loading ? 'Maže se...' : 'Smazat menu',
			onClick: softDeleteMenu,
			variant: 'danger' as const,
			loading,
			disabled: loading
		}
	];
</script>

<AdminPageLayout
	title="Detail menu"
	subtitle="{formatDate(menu?.date)}"
	backUrl="/admin/menu"
	{actions}
	successMessage={updateMessage}
	errorMessage={errorMessage}
	{loading}>

	<!-- Navigační šipky -->
	{#if navigation?.prevMenuId || navigation?.nextMenuId}
		<div class="flex justify-between items-center mb-6 px-4 py-2 bg-gray-50 rounded-lg border">
			<button
				on:click={goToPreviousMenu}
				disabled={!navigation?.prevMenuId}
				class="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
				title="Předchozí menu (←)">
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
				</svg>
				Předchozí
			</button>
			

			<button
				on:click={goToNextMenu}
				disabled={!navigation?.nextMenuId}
				class="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
				title="Následující menu (→)">
				Následující
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
				</svg>
			</button>
		</div>
	{/if}

	<!-- Menu content -->
	<MenuItemDetail
		bind:menu
		{allAllergens}
		{allIngredients}
		productsSettings={enhancedProductsSettings}
		{generalSettings}
		{supabase}
		isNewMenu={false} />
</AdminPageLayout>