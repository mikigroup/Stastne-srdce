<script lang="ts">
	import TagSelector from "./TagSelector.svelte";
	import type { Menu } from "$lib/types/menu";
	import type { Database } from "$lib/types/database.types";
	import { page } from "$app/stores";
	import type { MenuAllergen, MenuIngredient } from "$lib/services/menuService";
	import type { ProductsSettings } from "$lib/constants/defaultSettings";
	import type { SupabaseClient } from "@supabase/supabase-js";

	export let menu: Menu;
	export let allAllergens: MenuAllergen[];
	export let allIngredients: MenuIngredient[];
	export let productsSettings: ProductsSettings;
	export let generalSettings: any;
	export let supabase: SupabaseClient;
	export let isNewMenu: boolean = false;

	// Funkce pro přidání nové varianty
	function addVariant() {
		const newVariant = {
			id: crypto.randomUUID(),
			menu_id: menu.id,
			menu_version_id: null,
			variant_number: (menu.variants.length + 1).toString(),
			description: '',
			price: null,
			currency: generalSettings?.currencies?.[0] || 'N/A',
			vegetarian: false,
			allergens: [],
			ingredients: [],
			created_at: null,
			updated_at: null
		};
		
		menu.variants = [...menu.variants, newVariant];
		// Trigger reactivity
		menu = { ...menu };
	}
	
	// Funkce pro kontrolu, jestli varianta má existující objednávky
	async function hasExistingOrders(variantId: string): Promise<boolean> {
		if (!variantId || variantId.startsWith('temp_')) {
			return false; // Nové varianty nemají objednávky
		}
		
		try {
			const { data, error } = await supabase
				.from('order_items')
				.select('id')
				.eq('variant_id', variantId)
				.limit(1);
			
			if (error) {
				return true; // V případě chyby raději nechráníme
			}
			
			return (data && data.length > 0);
		} catch (error) {
			return true;
		}
	}
	
	// Funkce pro odstranění varianty s ochranou
	async function removeVariant(index: number) {
		if (menu.variants.length <= (productsSettings?.minVariants || 1)) {
			alert('Nelze smazat variantu - minimální počet variant je ' + (productsSettings?.minVariants || 1));
			return;
		}
		
		const variant = menu.variants[index];
		
		// Kontrola existujících objednávek
		const hasOrders = await hasExistingOrders(variant.id);
		if (hasOrders) {
			alert('Nelze smazat variantu - existují objednávky, které na ni odkazují. Místo toho můžete variantu deaktivovat.');
			return;
		}
		
		// Potvrzení mazání
		if (!confirm(`Opravdu chcete smazat variantu ${variant.variant_number}?`)) {
			return;
		}
		
		menu.variants = menu.variants.filter((_, i) => i !== index);
		// Přečíslování variant
		menu.variants = menu.variants.map((variant, i) => ({
			...variant,
			variant_number: (i + 1).toString()
		}));
		// Trigger reactivity
		menu = { ...menu };
	}

	// Inicializace variant byla přesunuta do parent komponenty (newmenu)
	// aby se předešlo nekonečné smyčce v reactive statements
</script>

<div class="gap-6 menuWrap mt-10">
	<div class="grid grid-cols-1 md:grid-cols-2 gap-6 pb-10">
		<div class="">
			<div class="form-control w-full mb-2">
				<label class="label">
					<span class="label-text">Datum</span>
				</label>
				<input
					type="date"
					class="input border border-black !rounded-md w-full"
					bind:value={menu.date} />
			</div>
		</div>
		<div class="form-control w-full mb-2">
			<label class="label">
				<span class="label-text">Aktivní</span>
			</label>
			<select class="select border border-black !rounded-md w-full" bind:value={menu.active}>
				<option value={false}>NE</option>
				<option value={true}>Ano</option>
			</select>
		</div>
	</div>

	<div class="max-w-2xl mx-auto mt-5">
		<label class="label">
			<span class="label-text text-lg">Polévka</span>
		</label>
		<div class="border rounded-xl p-5 border-gray-400 bg-neutral-100">
			<div class="form-control w-full mb-2">
				<textarea					
					class="textarea textarea-bordered w-full"				
					bind:value={menu.soup}></textarea>
			</div>
			<div class="form-control w-full mb-2">
				<label class="label">
					<span class="label-text">Alergeny</span>
				</label>
				<TagSelector
					bind:selectedTags={menu.allergens}
					availableTags={allAllergens}
					on:tagsChanged={(e) => {
						// Explicitně aktualizujte menu
						menu = {
							...menu,
							allergens: e.detail
						};
					}} />
			</div>
		</div>

		<div class="form-control w-full mb-2 rounded-xl mt-5">
			<div class="flex justify-between items-center mb-3">
				<label class="label">
					<span class="label-text text-lg">Hlavní chod</span>
				</label>
				
				<!-- Tlačítka pro správu variant - pouze pro nové menu -->
				{#if isNewMenu && productsSettings?.allowVariableVariants}
					<div class="flex gap-2">
						<button 
							type="button"
							class="btn btn-sm btn-outline btn-primary"
							on:click={addVariant}
							disabled={menu.variants.length >= (productsSettings?.maxVariants || 10)}
							title="Přidat novou variantu"
						>
							➕ Přidat variantu
						</button>
					</div>
				{/if}
			</div>
			<div class="grid gap-2">
				{#each menu.variants as variant, index}
					<div
						class="variant-container mb-10 border rounded-xl p-5 border-gray-400 bg-neutral-100">
						<div class="flex justify-between items-center mb-2">
							<div
								class="rounded-full border w-3 px-5 py-1 flex justify-center bg-slate-200 text-lg">
								{variant.variant_number}
							</div>
							
							<!-- Tlačítko pro odstranění varianty - pouze pro nové menu -->
							{#if isNewMenu && productsSettings?.allowVariableVariants && menu.variants.length > (productsSettings?.minVariants || 1)}
								<button 
									type="button"
									class="btn btn-sm btn-error btn-outline"
									on:click={() => removeVariant(index)}
									title="Odstranit tuto variantu"
								>
									🗑️ Odstranit
								</button>
							{/if}
						</div>
						<textarea
							class="textarea textarea-bordered w-full"
							placeholder={`Menu ${index + 1}`}
							rows="4"
							bind:value={variant.description}></textarea>
						<div class="grid grid-cols-2 gap-2 mt-2">
							<div>
								<label class="label">
									<span class="label-text">Cena</span>
								</label>
								<input
									type="number"
									class="input input-bordered w-full"
									bind:value={variant.price} />
							</div>
							<div>
								<label class="label">
									<span class="label-text">Měna</span>
								</label>
								<input
									type="text"
									class="input input-bordered w-full text-black"
									value={generalSettings?.currencies?.[0] || 'N/A'}
									disabled
								/>
							</div>
						</div>
						<div class="mt-2">
							<label class="label cursor-pointer justify-start gap-2">
								<input 
									type="checkbox" 
									class="checkbox checkbox-primary" 
									bind:checked={variant.vegetarian}
								/>
								<span class="label-text">🌱 Vege</span>
							</label>
						</div>
						<div class="flex-row flex">
							<div class="mt-2 w-full">
								<label class="label">
									<span class="label-text">Alergeny:</span>
								</label>
								<TagSelector
									bind:selectedTags={variant.allergens}
									availableTags={allAllergens}
									on:tagsChanged={(e) => {
										// Explicitně aktualizujte variantu
										variant.allergens = e.detail;
										// A pak menu pro jistotu
										menu = { ...menu };
									}} />
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>
</div>

<div class="mt-4 max-w-2xl mx-auto">
	<div class="form-control w-full mb-2">
		<label class="label block">
			<span class="label-text">Poznámky</span>
		</label>
		<textarea
			class="textarea textarea-bordered w-full border border-black !rounded-md"
			rows="4"
			bind:value={menu.notes}></textarea>
	</div>
	<!--<div class="form-control w-full mb-2">
		<label class="label">
			<span class="label-text">Nutriční info</span>
		</label>
		<input
			type="text"
			class="input input-bordered w-full"
			bind:value={menu.nutri} />
	</div>
	<div class="form-control w-full mb-2">
		<label class="label">
			<span class="label-text">Typ</span>
		</label>
		<input
			type="text"
			class="input input-bordered w-full"
			bind:value={menu.type} />
	</div>-->
</div>

<style>
    input, textarea, select {
        border: solid 1px;
        border-radius: 20px;
    }

    .textarea {
        min-height: 100px;
    }

    .label {
        display: block;
        margin-bottom: 0.5rem;
    }
</style>