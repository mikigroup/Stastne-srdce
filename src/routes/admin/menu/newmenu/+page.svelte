<script lang="ts">
	import { goto } from "$app/navigation";
	import { replaceState } from "$app/navigation";
	import { fade, fly } from "svelte/transition";
	import MenuItemDetail from "../MenuItemDetail.svelte";

	export let data;
	let { session, supabase } = data;
	$: ({ session, supabase } = data);

	type MenuItem = {
		date: string;
		soup: string;
		price: number;
		active: boolean;
		notes: string;
		type: string;
		nutri: string;
		alergens: string[]; // Změněno z 'alergen' na 'alergens'
		ingredients: string[]; // Změněno z 'ingredient' na 'ingredients'
		variants: {
			[key: string]: {
				description: string;
				price: number;
				alergens: string[]; // Změněno z 'alergen' na 'alergens'
				ingredients: string[]; // Změněno z 'ingredient' na 'ingredients'
			}
		};
	};

	let loading = false;
	let menuItem: MenuItem = {
		date: "",
		soup: "",
		price: 0,
		active: false,
		notes: "",
		type: "",
		nutri: "",
		selectedAlergens: "",
		selectedIngredients: "",
		variants: {
			1: { description: "", price: 0, selectedAlergens: "", selectedIngredients: "" },
			2: { description: "", price: 0, selectedAlergens: "", selectedIngredients: "" },
			3: { description: "", price: 0, selectedAlergens: "", selectedIngredients: "" }
		}
	};


	const commonAlergens = ["lepek", "mléko", "vejce", "ořechy", "sója", "ryby", "korýši", "celer", "hořčice", "sezam"];
	const commonIngredients = ["maso", "zelenina", "ovoce", "těstoviny", "rýže", "brambory", "luštěniny", "sýr", "máslo", "olej"];

	let updateMessage = "";
	let errorMessage = "";

	// Reaktivní blok pro sledování změn v menuItem
	$: {
		console.log("menuItem updated", menuItem);
	}

	async function checkDateExists(date: string) {
		const { data, error } = await supabase
			.from("menus")
			.select("id")
			.eq("date", date)
			.maybeSingle();

		if (error) {
			console.error("Error checking date:", error);
			throw error;
		}

		return !!data;
	}

	async function createMenu() {
		try {
			loading = true;
			errorMessage = "";
			updateMessage = "";

			if (!menuItem.date) {
				throw new Error("Datum je povinné");
			}

			console.log("Creating menu with data:", menuItem);

			const menuData = {
				date: new Date(menuItem.date).toISOString().split('T')[0],
				soup: menuItem.soup || null,
				active: menuItem.active || false,
				notes: menuItem.notes || null,
				type: menuItem.type || null,
				nutri: menuItem.nutri || null,
				alergen: menuItem.selectedAlergens || null,
				ingredient: menuItem.selectedIngredients || null
			};

			const { data: createdMenu, error } = await supabase
				.from('menus')
				.insert([menuData])
				.select()
				.single();

			if (error) throw error;

			console.log("Created menu:", createdMenu);

			for (const [variantNumber, variant] of Object.entries(menuItem.variants)) {
				if (variant.description) {
					const variantData = {
						menu_id: createdMenu.id,
						variant_number: variantNumber,
						description: variant.description,
						price: variant.price || null,
						alergen: variant.selectedAlergens || null,
						ingredient: variant.selectedIngredients || null
					};

					const { error: variantError } = await supabase
						.from('menu_variants')
						.insert([variantData]);

					if (variantError) {
						console.error(`Error creating variant ${variantNumber}:`, variantError);
					}
				}
			}

			updateMessage = "Menu a varianty úspěšně vytvořeny!";
			await replaceState({}, "/admin/menu");
		} catch (error) {
			if (error instanceof Error) {
				console.error("Error creating menu:", error);
				errorMessage = error.message;
			} else {
				errorMessage = "Nastala neočekávaná chyba";
			}
		} finally {
			loading = false;
		}
	}

	async function back() {
		await goto("/admin/menu");
	}

	function handleMenuItemUpdate(updatedItem: MenuItem) {
		console.log("Updating menuItem", updatedItem);
		menuItem = { ...updatedItem };
	}
</script>

<div class="relative p-5 overflow-x-auto shadow-md sm:rounded-lg" in:fly="{{ y: 50, duration: 500 }}">
	<div class="flex justify-between items-center mb-4">
		<button on:click={back} class="btn btn-outline">Zpět</button>
		{#if updateMessage}
			<div class="p-2 text-green-800 bg-green-200 rounded">
				<span>{updateMessage}</span>
			</div>
		{/if}
		{#if errorMessage}
			<div class="p-2 text-red-800 bg-red-200 rounded">
				<span>{errorMessage}</span>
			</div>
		{/if}
		<div class="flex gap-2">
			<button disabled={loading} type="submit" on:click={createMenu} class="btn btn-outline">
				{loading ? "Nahrává se..." : "Vytvořit"}
			</button>
		</div>
	</div>
	<div class="divider"></div>
	<div class="bg-base-100">
		<div class="py-6 px-4 colorMenuBg rounded-xl">
			<h2 class="text-2xl font-bold mb-6 colorMenuBg">Menu</h2>

			{#key menuItem.date}
				<MenuItemDetail
					item={menuItem}
					onUpdate={handleMenuItemUpdate}
					{commonAlergens}
					{commonIngredients}
				/>
			{/key}
		</div>
	</div>
</div>

<style>
    .colorMenuBg {
        background-color: #929da5;
    }
</style>