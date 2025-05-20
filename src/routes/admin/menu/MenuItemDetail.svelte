<script lang="ts">
	import TagSelector from "./TagSelector.svelte";
	import type { Menu } from "$lib/types/menu";
	import type { Database } from "$lib/types/database.types";
	import { page } from "$app/stores";
	import type { Menu, MenuAllergen, MenuIngredient } from "$lib/services/menuService";

	export let menu: Menu;
	export let allAllergens: MenuAllergen[];
	export let allIngredients: MenuIngredient[];


	// Inicializace variant s čísly pokud je nové menu
	$: if ($page.url.pathname === "/admin/menu/newmenu" && menu.variants) {
		menu.variants = menu.variants.map((variant, index) => ({
			...variant,
			variant_number: (index + 1).toString()
		}));
	}
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
			<span class="label-text">Polévka</span>
		</label>
		<div class="border rounded-xl p-5 border-gray-400 bg-neutral-100">
			<div class="form-control w-full mb-2">
				<input
					type="text"
					class="input input-bordered w-full"
					bind:value={menu.soup} />
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
			<label class="label">
				<span class="label-text">Hlavní chod</span>
			</label>
			<div class="grid grid-rows-3 gap-2">
				{#each menu.variants as variant, index}
					<div
						class="variant-container mb-10 border rounded-xl p-5 border-gray-400 bg-neutral-100">
						<div
							class="rounded-2xl border w-3 px-4 py-1 flex justify-center bg-white mb-2">
							{variant.variant_number}
						</div>
						<textarea
							class="textarea textarea-bordered w-full"
							placeholder={`Menu ${index + 1}`}
							rows="4"
							bind:value={variant.description}></textarea>
						<div class="mt-2">
							<label class="label">
								<span class="label-text">Cena varianty</span>
							</label>
							<input
								type="number"
								class="input input-bordered w-full"
								bind:value={variant.price} />
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