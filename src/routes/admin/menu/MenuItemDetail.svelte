<script lang="ts">
	import TagSelector from './TagSelector.svelte';

	export interface MenuItem {
		id: string;
		date: string;
		soup: string;
		price: number;
		active: boolean;
		notes: string;
		type: string;
		nutri: string;
		alergen: string[];
		ingredient: string[];
		variants: {
			[key: string]: {
				description: string;
				price: number;
				alergen: string[];
				ingredient: string[];
			} | undefined;
		};
	}

	export let item: MenuItem;
	export let onUpdate: (updatedItem: MenuItem) => void;
	export let commonAlergens: string[] = [
		"lepek", "mléko", "vejce", "ořechy", "sója", "ryby", "korýši", "celer", "hořčice", "sezam"
	];
	export let commonIngredients: string[] = [
		"maso", "zelenina", "ovoce", "těstoviny", "rýže", "brambory", "luštěniny", "sýr", "máslo", "olej"
	];

	let formattedDate = "";
	let isValidDate = true;

	$: {
		if (item.date) {
			formattedDate = formatSupabaseDate(item.date);
		}
	}

	function handleDateInput(event) {
		const enteredDate = event.target.value;
		item.date = enteredDate;
		isValidDate = true;
		onUpdate(item);
	}

	function formatSupabaseDate(inputDate: string) {
		if (!inputDate) return "";
		return inputDate.split("T")[0];
	}

	function updateItem() {
		onUpdate(item);
	}

	function updateAlergens(alergens: string[]) {
		item.alergen = alergens;
		updateItem();
	}

	function updateIngredients(ingredients: string[]) {
		item.ingredient = ingredients;
		updateItem();
	}

	function updateVariantAlergens(variantNumber: string, alergens: string[]) {
		if (!item.variants[variantNumber]) {
			item.variants[variantNumber] = { description: '', price: 0, alergen: [], ingredient: [] };
		}
		item.variants[variantNumber]!.alergen = alergens;
		updateItem();
	}

	function updateVariantIngredients(variantNumber: string, ingredients: string[]) {
		if (!item.variants[variantNumber]) {
			item.variants[variantNumber] = { description: '', price: 0, alergen: [], ingredient: [] };
		}
		item.variants[variantNumber]!.ingredient = ingredients;
		updateItem();
	}

	function getVariantProperty(variantNumber: string, property: keyof MenuItem['variants'][string]) {
		return item.variants[variantNumber] ? item.variants[variantNumber][property] : '';
	}

	function setVariantProperty(variantNumber: string, property: keyof MenuItem['variants'][string], value: any) {
		if (!item.variants[variantNumber]) {
			item.variants[variantNumber] = { description: '', price: 0, alergen: [], ingredient: [] };
		}
		item.variants[variantNumber][property] = value;
		updateItem();
	}
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
				bind:value={item.date}
				on:input={handleDateInput} />
		</div>

		<div class="form-control w-full mb-2">
			<label class="label">
				<span class="label-text">Cena</span>
			</label>
			<input
				type="number"
				placeholder=""
				autocomplete="off"
				class="input input-bordered w-full"
				bind:value={item.price}
				on:input={updateItem} />
		</div>

		<div class="form-control w-full mb-2">
			<label class="label">
				<span class="label-text">Aktivní</span>
			</label>
			<select
				class="select select-bordered w-full"
				bind:value={item.active}
				on:change={updateItem}>
				<option value={false}>NE</option>
				<option value={true}>Ano</option>
			</select>
		</div>

		<div class="form-control w-full mb-2">
			<label class="label">
				<span class="label-text">Alergeny</span>
			</label>
			<TagSelector
				selectedTags={item.alergen}
				availableTags={commonAlergens}
				onUpdate={updateAlergens}
			/>
		</div>

		<div class="form-control w-full mb-2">
			<label class="label">
				<span class="label-text">Ingredience</span>
			</label>
			<TagSelector
				selectedTags={item.ingredient}
				availableTags={commonIngredients}
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
				placeholder=""
				autocomplete="off"
				class="input input-bordered w-full"
				bind:value={item.soup}
				on:input={updateItem} />
		</div>

		<div class="form-control w-full mb-2 border rounded-xl p-5 mt-5">
			<label class="label">
				<span class="label-text">Hlavní chod</span>
			</label>
			<div class="grid grid-rows-3 gap-2">
				{#each ['1', '2', '3'] as variantNumber}
					<div class="variant-container mb-10 border rounded-xl">
                <textarea
									class="textarea textarea-bordered w-full"
									placeholder={`Menu ${variantNumber}`}
									rows="4"
									bind:value={item.variants[variantNumber].description}
									on:input={(e) => setVariantProperty(variantNumber, 'description', e.target.value)}
								></textarea>
						<div class="mt-2">
							<label class="label">
								<span class="label-text">Cena varianty</span>
							</label>
							<input
								type="number"
								class="input input-bordered w-full"
								bind:value={item.variants[variantNumber].price}
								on:input={(e) => setVariantProperty(variantNumber, 'price', parseFloat(e.target.value))}
							/>
						</div>

						<div class="flex-row flex">
							<div class="mt-2 w-full">
								<label class="label">
									<span class="label-text">Alergeny varianty</span>
								</label>
								<TagSelector
									selectedTags={item.variants[variantNumber]?.alergen || []}
									availableTags={commonAlergens}
									onUpdate={(alergens) => updateVariantAlergens(variantNumber, alergens)}
								/>
							</div>
							<div class="mt-2 w-full">
								<label class="label">
									<span class="label-text">Ingredience varianty</span>
								</label>
								<TagSelector
									selectedTags={item.variants[variantNumber]?.ingredient || []}
									availableTags={commonIngredients}
									onUpdate={(ingredients) => updateVariantIngredients(variantNumber, ingredients)}
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
			bind:value={item.notes}
			on:input={updateItem}></textarea>
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
			bind:value={item.nutri}
			on:input={updateItem} />
	</div>
	<div class="form-control w-full mb-2">
		<label class="label">
			<span class="label-text">Typ</span>
		</label>
		<input
			type="text"
			placeholder=""
			autocomplete="off"
			class="input input-bordered w-full"
			bind:value={item.type}
			on:input={updateItem} />
	</div>
</div>

<style>
    .menuWrap span {
        font-size: 1.1em;
    }
</style>