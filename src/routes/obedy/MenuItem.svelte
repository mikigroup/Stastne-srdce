<script lang="ts">
	import { CartItemsStore, type CartItem } from "$lib/stores/store";
	import { page } from "$app/stores";
	import type { Menu } from "$lib/types/menu";
	import type { Database } from "$lib/types/database.types";

	type Allergen = Database["public"]["Tables"]["allergens"]["Row"];

	export let menu: Menu;
	export let productsSettings: any = {};


	
	function formatDate(dateString: string | null): string {
		if (!dateString) return "";
		const date = new Date(dateString);
		return date.toLocaleDateString("cs-CZ", {
			weekday: "long",
			year: "numeric",
			month: "long",
			day: "numeric"
		});
	}

	function formatAllergens(allergens: (Allergen | null)[]): string {
		if (!allergens || allergens.length === 0) return "Žádné alergeny";

		// Seřadíme alergeny podle čísla a odfiltrujeme null hodnoty - pouze čísla
		const sortedAllergens = allergens
			.filter((a): a is Allergen => a !== null && a.number !== null && a.name !== null)
			.sort((a, b) => (a.number || 0) - (b.number || 0));

		if (sortedAllergens.length === 0) return "Žádné alergeny";

		// Zobrazíme pouze čísla oddělená čárkami
		return sortedAllergens.map(a => a.number).join(", ");
	}

	function getAllergenTooltip(allergens: (Allergen | null)[]): string {
		if (!allergens || allergens.length === 0) return "";

		return allergens
			.filter((a): a is Allergen => a !== null && a.number !== null && a.name !== null)
			.sort((a, b) => (a.number || 0) - (b.number || 0))
			.map(a => `${a.number}. ${a.name}`)
			.join("\n");
	}

	function addToCart(variant: (typeof menu.variants)[0]) {
		if ($page.data.session) {
			const cartItem: CartItem = {
				id: menu.id,
				date: menu.date || "",
				soup: menu.soup || "",
				variants: [
					{
						id: variant.id,
						variant_number: variant.variant_number,
						description: variant.description,
						price: variant.price || 0,
						quantity: 1
					}
				]
			};

			CartItemsStore.addItem(cartItem);
		}
	}
</script>

<div class="p-2 my-3 border rounded-lg bg-stone-100 border-gray-500">
	<div class="py-1 bg-green-800 rounded-lg shadow-md sm:py-3 mt-5">
		<p class="pl-3 text-2xl font-bold tracking-tight text-gray-200">
			{formatDate(menu.date)}
		</p>
	</div>

	<div class="my-3 border border-gray-400 rounded-lg shadow-md md:p-8">
		<p class="text-lg p-2">Polévka</p>
		<div class="p-5 border rounded-2xl border-gray-400 bg-white">
			<p class="p-2 text-lg">{menu.soup}</p>
									{#if productsSettings?.showAllergens && menu.allergens && menu.allergens.length > 0}
				<div class="mt-2 p-2">
					<p class="text-xs text-gray-600">
						Alergeny: 
						<span 
							title={productsSettings?.showAllergensTooltip ? getAllergenTooltip(menu.allergens) : ''}
							class="font-medium {productsSettings?.showAllergensTooltip ? 'cursor-help' : ''}">
							{formatAllergens(menu.allergens)}
						</span>
					</p>
				</div>
			{/if}
		</div>

		<div class="py-2 text-lg rounded-2xl">
			<p class="text-lg mt-5 p-2">Hlavní jídlo</p>
			{#each menu.variants as variant (variant.id)}
				<div class="border rounded-2xl p-5 mb-4 border-gray-400 bg-white">
					<!--<div
						class="rounded-3xl border w-3 px-4.5 py-1 flex justify-center bg-white mb-2">
							{variant.variant_number}
						</div>-->
					<div class="p-2 text-lg">
						<div class="flex col-2 items-start">
							<div class="border rounded-3xl py-1 px-3 bg-slate-200">{variant.variant_number}</div>
							<div class="ml-4 flex items-center gap-2">
								{variant.description}
								{#if variant.vegetarian}
									<span class="inline-flex items-center px-2 py-2 rounded-full text-xs font-medium bg-green-100 text-green-800">
										🌱
									</span>
								{/if}
							</div>
						</div>
						{#if productsSettings?.showAllergens && variant.allergens && variant.allergens.length > 0}
							<div class="mt-3">
								<p class="text-xs text-gray-600">
									Alergeny: 
									<span 
										title={productsSettings?.showAllergensTooltip ? getAllergenTooltip(variant.allergens) : ''}
										class="font-medium {productsSettings?.showAllergensTooltip ? 'cursor-help' : ''}">
										{formatAllergens(variant.allergens)}
									</span>
								</p>
							</div>
						{/if}
					</div>
					{#if !$page.data.session}
						<a href="/auth/login" class="flex justify-end pt-2">
							<div
								class="py-4 px-8 border rounded-lg shadow-md hover:bg-white hover:shadow-xl transition duration-150 ease-in-out">
								<div class="text-base">Přihlaš se</div>
							</div>
						</a>
					{:else}
						<div
							class="flex justify-end pt-2"
							role="button"
							on:click={() => addToCart(variant)}
							on:keydown={(e) => e.key === "Enter" && addToCart(variant)}
							tabindex="0">
							<div
								class="py-2 px-4 border rounded-lg shadow-md hover:bg-green-800 hover:text-white hover:shadow-xl transition-all duration-300 ease-in-out cursor-pointer active:bg-white border-gray-400 bg-stone-100">
								<div class="">
									{#if productsSettings?.showPrices}
										<p class="text-base justify-end flex">{variant.price} Kč</p>
									{/if}
									<p class="text-sm uppercase">Do košíku</p>
								</div>
							</div>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	</div>
</div>