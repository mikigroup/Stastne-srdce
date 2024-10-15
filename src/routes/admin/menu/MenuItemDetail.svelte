<script lang="ts">
	import TagSelector from './TagSelector.svelte';
	import type { Menu } from '$lib/types/menu';
	import type { Database } from '$lib/database.types';

	export let menu: Menu;
	export let allAllergens: Database['public']['Tables']['allergens']['Row'][];
	export let allIngredients: Database['public']['Tables']['ingredients']['Row'][];


	// console.log("Komponenta:", menu)

	function updateAllergens(selectedAllergens) {
		menu.allergens = selectedAllergens;
	}

	function updateIngredients(selectedIngredients) {
		menu.ingredients = selectedIngredients;
	}

/*
	function updateAllergens(allergens: Database['public']['Tables']['allergens']['Row'][]) {
		editedMenu.allergens = allergens;
	}

	function updateIngredients(ingredients: Database['public']['Tables']['ingredients']['Row'][]) {
		editedMenu.ingredients = ingredients;
	}

	function updateVariantAllergens(variantIndex: number, allergens: Database['public']['Tables']['allergens']['Row'][]) {
		editedMenu.variants[variantIndex].allergens = allergens;
	}

	function updateVariantIngredients(variantIndex: number, ingredients: Database['public']['Tables']['ingredients']['Row'][]) {
		editedMenu.variants[variantIndex].ingredients = ingredients;
	}*/
</script>

<div class="grid grid-cols-1 md:grid-cols-2 gap-6 menuWrap mt-10">
	<div>
		<div class="form-control w-full mb-2">
			<label class="label">
				<span class="label-text">Datum</span>
			</label>
			<input
				type="date"
				class="input input-bordered w-full"
				bind:value={menu.date}
			/>
		</div>

		<div class="form-control w-full mb-2">
			<label class="label">
				<span class="label-text">Aktivní</span>
			</label>
			<select
				class="select select-bordered w-full"
				bind:value={menu.active}
			>
				<option value={false}>NE</option>
				<option value={true}>Ano</option>
			</select>
		</div>

		<div class="form-control w-full mb-2">
			<label class="label">
				<span class="label-text">Alergeny</span>
			</label>
			<TagSelector
				selectedTags={menu.allergens}
				availableTags={allAllergens}
				onUpdate={updateAllergens}
			/>
		</div>

		<div class="form-control w-full mb-2">
			<label class="label">
				<span class="label-text">Ingredience</span>
			</label>
			<TagSelector
				selectedTags={menu.ingredients}
				availableTags={allIngredients}
				onUpdate={updateIngredients}
			/>
		</div>
	</div>

	<div>
		<div class="form-control w-full mb-2">
			<label class="label">
				<span class="label-text">Polévka</span>
			</label>
			<input
				type="text"
				class="input input-bordered w-full"
				bind:value={menu.soup}
			/>
		</div>

		<div class="form-control w-full mb-2 border rounded-xl mt-5">
			<label class="label">
				<span class="label-text">Hlavní chod</span>
			</label>
			<div class="grid grid-rows-3 gap-2">
				{#each menu.variants as variant, index}
					<div class="variant-container mb-10 border rounded-xl p-5 border-gray-400 bg-neutral-100">
                        <textarea
													class="textarea textarea-bordered w-full"
													placeholder={`Menu ${index + 1}`}
													rows="4"
													bind:value={variant.description}
												></textarea>
						<div class="mt-2">
							<label class="label">
								<span class="label-text">Cena varianty</span>
							</label>
							<input
								type="number"
								class="input input-bordered w-full"
								bind:value={variant.price}
							/>
						</div>

						<div class="flex-row flex">
							<div class="mt-2 w-full">
								<label class="label">
									<span class="label-text">Alergeny varianty</span>
								</label>
								<TagSelector
									selectedTags={variant.allergens}
									availableTags={allAllergens}

								/>
							</div>
							<div class="mt-2 w-full">
								<label class="label">
									<span class="label-text">Ingredience varianty</span>
								</label>
								<TagSelector
									selectedTags={variant.ingredients}
									availableTags={allIngredients}
								/>
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>

	<div class="form-control w-full mb-2">
		<label class="label">
			<span class="label-text">Poznámky</span>
		</label>
		<textarea
			class="textarea textarea-bordered"

		></textarea>
	</div>
</div>

<div class="mt-4">
	<div class="form-control w-full mb-2">
		<label class="label">
			<span class="label-text">Nutriční info</span>
		</label>
		<input
			type="text"
			class="input input-bordered w-full"

		/>
	</div>
	<div class="form-control w-full mb-2">
		<label class="label">
			<span class="label-text">Typ</span>
		</label>
		<input
			type="text"
			class="input input-bordered w-full"

		/>
	</div>
</div>
<style>
    input {
				border: solid 1px;
				border-radius: 20px;
		}
</style>