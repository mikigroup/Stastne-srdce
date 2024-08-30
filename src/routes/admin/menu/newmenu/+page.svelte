<script lang="ts">
	import { goto } from "$app/navigation";
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
		alergens: string[];
		ingredients: string[];
		variants: {
			[key: string]: {
				description: string;
				price: number;
				alergens: string[];
				ingredients: string[];
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
		alergens: [],
		ingredients: [],
		variants: {
			1: { description: "", price: 0, alergens: [], ingredients: [] },
			2: { description: "", price: 0, alergens: [], ingredients: [] },
			3: { description: "", price: 0, alergens: [], ingredients: [] }
		}
	};

	const commonAlergens = ["lepek", "mléko", "vejce", "ořechy", "sója", "ryby", "korýši", "celer", "hořčice", "sezam"];
	const commonIngredients = ["maso", "zelenina", "ovoce", "těstoviny", "rýže", "brambory", "luštěniny", "sýr", "máslo", "olej"];

	let updateMessage = "";
	let errorMessage = "";

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
				errorMessage = "Datum je povinné";
				return;
			}

			const dateExists = await checkDateExists(menuItem.date);
			if (dateExists) {
				errorMessage = "Menu pro toto datum již existuje";
				return;
			}

			const menuData = {
				date: menuItem.date,
				soup: menuItem.soup,
				price: menuItem.price,
				active: menuItem.active,
				notes: menuItem.notes,
				type: menuItem.type,
				nutri: menuItem.nutri,
				alergen: menuItem.alergens.join(","),
				ingredient: menuItem.ingredients.join(",")
			};

			const { data: createdMenu, error: menuError } = await supabase
				.from("menus")
				.insert([menuData])
				.select()
				.single();

			if (menuError) throw menuError;

			for (const [variantNumber, variant] of Object.entries(menuItem.variants)) {
				if (variant.description) {
					const variantData = {
						menu_id: createdMenu.id,
						variant_number: parseInt(variantNumber),
						description: variant.description,
						price: variant.price,
						alergen: variant.alergens.join(","),
						ingredient: variant.ingredients.join(",")
					};

					const { error: variantError } = await supabase
						.from("menu_variants")
						.insert([variantData]);

					if (variantError) {
						console.error(`Chyba při vytváření varianty ${variantNumber}:`, variantError);
					}
				}
			}

			updateMessage = "Menu a varianty úspěšně vytvořeny!";
			await goto("/admin/menu", { replaceState: true });
		} catch (error) {
			if (error instanceof Error) {
				console.error("Chyba při vytváření menu:", error);
				errorMessage = "Nastala chyba při vytváření menu";
			}
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
		<div class="flex gap-2">
			<button disabled={loading} on:click={createMenu} class="btn btn-outline">
				{loading ? "Vytváří se..." : "Vytvořit menu"}
			</button>
		</div>
	</div>

	<div class="divider"></div>

	<div class="bg-base-100 rounded-xl p-4 md:p-10 colorMenuBg">
		<h2 class="text-2xl font-bold mb-6">Nové menu</h2>
		<MenuItemDetail
			item={menuItem}
			onUpdate={handleMenuItemUpdate}
			{commonAlergens}
			{commonIngredients}
		/>
	</div>
</div>