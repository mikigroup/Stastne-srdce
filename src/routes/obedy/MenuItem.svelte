<script lang="ts">
	import { CartItemsStore, type CartItem } from "$lib/stores/store";
	import { page } from "$app/state";
	import type { Menu } from "$lib/types/menu";
	import type { Database } from "$lib/types/database.types";
	import { ROUTES } from "$lib/constants/routes";
	import { prefersReducedMotion } from "svelte/motion";
	import { cubicOut } from "svelte/easing";
	import { flip } from "svelte/animate";
	import { menuEnter, menuSlide } from "./menu-motion";

	type Allergen = Database["public"]["Tables"]["allergens"]["Row"];

	interface Props {
		menu: Menu;
		productsSettings?: any;
		animate?: boolean;
	}

	let { menu, productsSettings = {}, animate = false }: Props = $props();
	let reducedMotion = $derived(prefersReducedMotion.current);
	let motion = $derived(animate && !reducedMotion);
	const actionButtonClass =
		"inline-flex items-center gap-1.5 py-1 px-2.5 mt-1.5 border rounded-lg shadow-sm hover:bg-green-800 hover:text-white hover:shadow-md transition-all duration-300 ease-in-out cursor-pointer active:bg-white border-gray-400 bg-stone-100 sm:mt-4 sm:gap-2 sm:py-1.5 sm:px-3 sm:shadow-md";


	
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
		if (page.data.session) {
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

<div class="p-1.5 my-2 border rounded-lg bg-stone-100 border-gray-500 sm:p-2 sm:my-3">
	<div class="py-1 bg-green-800 rounded-lg shadow-md sm:mt-5 sm:py-3">
		<p class="pl-3 text-base font-bold tracking-tight text-gray-200 sm:text-2xl">
			{formatDate(menu.date)}
		</p>
	</div>

	<div class="my-2 border border-gray-400 rounded-lg shadow-md sm:my-3 md:p-8">
		<p class="p-2 text-sm sm:text-lg">Polévka</p>
		<div class="mx-2 mb-2 p-2.5 border rounded-2xl border-gray-400 bg-white sm:m-0 sm:p-5">
			<p class="text-sm leading-snug sm:p-2 sm:text-lg sm:leading-normal">{menu.soup}</p>
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

		<div class="py-1 text-base rounded-2xl sm:py-2 sm:text-lg">
			<p class="mt-3 p-2 text-base sm:mt-5 sm:text-lg">Hlavní jídlo</p>
			{#each menu.variants as variant, index (variant.id)}
				<div
					class="mx-2 border rounded-2xl p-3 mb-2 border-gray-400 bg-white sm:mx-0 sm:mb-4 sm:p-5"
					animate:flip={{ duration: motion ? 420 : 0, easing: cubicOut }}
					in:menuEnter={{
						delay: motion ? Math.min(index, 3) * 55 : 0,
						duration: motion ? 460 : 0
					}}
					out:menuSlide={{ duration: reducedMotion ? 0 : 280 }}>
					<!--<div
						class="rounded-3xl border w-3 px-4.5 py-1 flex justify-center bg-white mb-2">
							{variant.variant_number}
						</div>-->
					<div class="text-sm leading-snug sm:p-2 sm:text-lg sm:leading-normal">
						<div class="flex items-start gap-2">
							<div class="shrink-0 border rounded-3xl py-0.5 px-2 text-sm bg-slate-200 sm:py-1 sm:px-3 sm:text-base">{variant.variant_number}</div>
							<div class="flex min-w-0 items-start gap-1.5">
								{variant.description}
								{#if variant.vegetarian}
									<span class="inline-flex shrink-0 items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 sm:px-2 sm:py-1">
										🌱
									</span>
								{/if}
							</div>
						</div>
						{#if productsSettings?.showAllergens && variant.allergens && variant.allergens.length > 0}
							<div class="mt-1.5 sm:mt-3">
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
					{#if !page.data.session}
						<a href={ROUTES.AUTH.LOGIN} class="flex justify-end pt-1 sm:pt-2">
							<div class={actionButtonClass}>
								{#if productsSettings?.showPrices}
									<p class="text-xs font-medium sm:text-sm">{variant.price} Kč</p>
								{/if}
								<span class="text-xs sm:text-sm">Přihlaš se</span>
							</div>
						</a>
					{:else}
						<div
							class="flex justify-end pt-1 sm:pt-2"
							role="button"
							onclick={() => addToCart(variant)}
							onkeydown={(e) => e.key === "Enter" && addToCart(variant)}
							tabindex="0">
							<div class={actionButtonClass}>
								<p class="text-xs font-medium sm:text-sm">{variant.price} Kč</p>
								<span class="text-xs uppercase sm:text-sm">Do košíku</span>
							</div>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	</div>
</div>