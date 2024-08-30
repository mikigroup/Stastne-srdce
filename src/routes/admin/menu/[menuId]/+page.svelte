<script lang="ts">
	import { goto } from "$app/navigation";
	import { fade, fly } from "svelte/transition";
	import MenuItemDetail from "../MenuItemDetail.svelte";
	import type { MenuItem } from "../MenuItemDetail.svelte";

	export let data;
	let { session, supabase, menu, variants } = data;
	$: ({ session, supabase, menu, variants } = data);

	let loading = false;
	let updateMessage = "";
	let errorMessage = "";

	let menuItem: MenuItem = {
		id: menu.id,
		date: menu.date,
		soup: menu.soup,
		price: menu.price,
		active: menu.active,
		notes: menu.notes,
		type: menu.type,
		nutri: menu.nutri,
		alergen: menu.alergen?.split(",") || [],
		ingredient: menu.ingredient?.split(",") || [],
		variants: Object.entries(variants || {}).reduce((acc, [key, value]) => {
			acc[key] = {
				description: value.description || '',
				price: value.price || 0,
				alergen: value.alergen?.split(",") || [],
				ingredient: value.ingredient?.split(",") || []
			};
			return acc;
		}, {})
	};

	const commonAlergens = ["lepek", "mléko", "vejce", "ořechy", "sója", "ryby", "korýši", "celer", "hořčice", "sezam"];
	const commonIngredients = ["maso", "zelenina", "ovoce", "těstoviny", "rýže", "brambory", "luštěniny", "sýr", "máslo", "olej"];

	async function updateMenu() {
		try {
			loading = true;
			errorMessage = "";
			updateMessage = "";

			// Aktualizace hlavního menu
			const menuUpdate = {
				updated_at: new Date().toISOString(),
				date: menuItem.date,
				soup: menuItem.soup,
				price: menuItem.price,
				active: menuItem.active,
				notes: menuItem.notes,
				type: menuItem.type,
				nutri: menuItem.nutri,
				alergen: menuItem.alergen.join(","),
				ingredient: menuItem.ingredient.join(",")
			};

			const { error: menuError } = await supabase
				.from("menus")
				.update(menuUpdate)
				.eq("id", menuItem.id);

			if (menuError) throw menuError;

			// Aktualizace variant
			for (const [variantNumber, variant] of Object.entries(menuItem.variants)) {
				if (variant.description || variant.price || variant.alergen.length || variant.ingredient.length) {
					const variantData = {
						menu_id: menuItem.id,
						variant_number: variantNumber,
						description: variant.description,
						price: variant.price,
						alergen: variant.alergen.join(','),
						ingredient: variant.ingredient.join(',')
					};

					const { error: upsertError } = await supabase
						.from('menu_variants')
						.upsert(variantData, {
							onConflict: 'menu_id,variant_number'
						});

					if (upsertError) throw upsertError;
				}
			}

			// Odstranění nepoužívaných variant
			const { data: existingVariants, error: fetchError } = await supabase
				.from("menu_variants")
				.select("id, variant_number")
				.eq("menu_id", menuItem.id);

			if (fetchError) throw fetchError;

			const variantsToDelete = existingVariants.filter(
				v => !menuItem.variants[v.variant_number] ||
					(!menuItem.variants[v.variant_number].description &&
						!menuItem.variants[v.variant_number].price &&
						!menuItem.variants[v.variant_number].alergen.length &&
						!menuItem.variants[v.variant_number].ingredient.length)
			);

			if (variantsToDelete.length > 0) {
				const { error: deleteError } = await supabase
					.from("menu_variants")
					.delete()
					.in("id", variantsToDelete.map(v => v.id));

				if (deleteError) throw deleteError;
			}

			updateMessage = "Menu upraveno!";
		} catch (error) {
			console.error("Error updating menu:", error);
			errorMessage = "Chyba při úpravě menu";
		} finally {
			loading = false;
		}
	}

	async function deleteMenu() {
		try {
			loading = true;

			const { error: variantError } = await supabase
				.from("menu_variants")
				.delete()
				.eq("menu_id", menuItem.id);

			if (variantError) throw variantError;

			const { error: menuError } = await supabase
				.from("menus")
				.delete()
				.eq("id", menuItem.id);

			if (menuError) throw menuError;

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

	function handleMenuItemUpdate(updatedItem: MenuItem) {
		menuItem = updatedItem;
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

	<div class="bg-base-100 rounded-xl p-4 md:p-10 colorMenuBg">
		<h2 class="text-2xl font-bold mb-6">Upravit Menu</h2>
		<MenuItemDetail
			item={menuItem}
			onUpdate={handleMenuItemUpdate}
			{commonAlergens}
			{commonIngredients}
		/>
	</div>
</div>