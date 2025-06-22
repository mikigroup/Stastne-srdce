<script lang="ts">
	import { CartItemsStore, type CartItem } from "$lib/stores/store";
	import { page } from "$app/stores";
	import type { Menu } from "$lib/types/menu";
	import type { Database } from "$lib/types/database.types";

	type Allergen = Database["public"]["Tables"]["allergens"]["Row"];

	export let menu: Menu;


	
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

	function formatAllergens(allergens: Allergen[]): string {
		if (!allergens || allergens.length === 0) return "Žádné alergeny";

		// Seřadíme alergeny podle čísla a zobrazíme pouze čísla oddělená čárkou
		return allergens
			.sort((a, b) => (a.number || 0) - (b.number || 0))
			.map(a => a.number)
			.filter(Boolean) // Odstranění null hodnot
			.join(", ");
	}

	function getAllergenTooltip(allergens: Allergen[]): string {
		if (!allergens || allergens.length === 0) return "";

		return allergens
			.sort((a, b) => (a.number || 0) - (b.number || 0))
			.filter(a => a.number && a.name) // Jen alergeny s číslem a názvem
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
			<!--<div class="mt-2 p-2">
				<p class="text-xs text-gray-600">
					Alergeny: <span title={getAllergenTooltip(menu.allergens)} class="font-medium cursor-help">{formatAllergens(menu.allergens)}</span>
				</p>
			</div>-->
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
							<div class="border rounded-3xl py-1 px-3 bg-slate-200">{variant.variant_number}</div><div class="ml-4"> {variant.description}</div>
						</div>
				<!--		<div class="mt-4">
							<p class="text-xs text-gray-600">
								Alergeny: <span title={getAllergenTooltip(variant.allergens)} class="font-medium cursor-help">{formatAllergens(variant.allergens)}</span>
							</p>
						</div>-->
					</div>
					{#if !$page.data.session}
						<a href="/login" class="flex justify-end pt-2">
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
									<p class="text-base justify-end flex">{variant.price} Kč</p>
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