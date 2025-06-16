<script lang="ts">
	import { goto } from "$app/navigation";
	import MenuItemDetail from "../MenuItemDetail.svelte";
	import type { PageData } from "./$types";
	import type { Menu } from "$lib/types/menu";
	import AdminPageLayout from "$lib/component/AdminPageLayout.svelte";
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
			},
			{
				id: "",
				variant_number: "3",
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

	function handleUpdate(event: CustomEvent<Menu>) {
		console.log(
			"handleUpdate called with:",
			JSON.stringify(event.detail, null, 2)
		);
		newMenu = event.detail;
		console.log("newMenu after update:", JSON.stringify(newMenu, null, 2));
	}

	// Definice akcí pro AdminPageLayout
	$: actions = [
		{
			label: loading ? 'Vytváří se...' : 'Vytvořit menu',
			onClick: createMenu,
			variant: 'primary' as const,
			loading,
			disabled: loading
		}
	];
</script>

<AdminPageLayout
	title="Nové menu"
	backUrl="/admin/menu"
	{actions}
	successMessage={updateMessage}
	errorMessage={errorMessage}
	{loading}>

	<!-- Menu content -->
	<MenuItemDetail
		bind:menu={newMenu}
		{allAllergens}
		{allIngredients}
		on:update={handleUpdate} />
</AdminPageLayout>

<style>
</style>
