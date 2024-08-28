<script lang="ts">
	export interface MenuItem {
		date: string;
		soup: string;
		price: number;
		active: boolean;
		notes: string;
		type: string;
		nutri: string;
		variants: {
			1: string;
			2: string;
			3: string;
		};
	}

	export let item: MenuItem;
	export let onUpdate: (updatedItem: MenuItem) => void;

	let formattedDate = "";
	let isValidDate = true;
	let isEditingDate = false;

	$: {
		if (item.date && !isEditingDate) {
			formattedDate = formatSupabaseDate(item.date);
		}
	}

	function handleDateInput(event) {
		const enteredDate = event.target.value;
		const isValid = validateDate(enteredDate);

		if (isValid) {
			item.date = formatDateForSupabase(enteredDate);
			isValidDate = true;
		} else {
			isValidDate = false;
		}
		isEditingDate = true;
		onUpdate(item);
	}

	function validateDate(inputDate: string): boolean {
		const datePattern = /^(0[1-9]|[12]\d|3[01])-(0[1-9]|1[0-2])-\d{4}$/;
		return datePattern.test(inputDate);
	}

	function formatDateForSupabase(inputDate: string): string {
		const [day, month, year] = inputDate.split("-");
		return `${year}-${month}-${day}`;
	}

	function formatSupabaseDate(inputDate: string) {
		if (!inputDate) return "";
		const [year, month, day] = inputDate.split("T")[0].split("-");
		return `${day.padStart(2, "0")}-${month.padStart(2, "0")}-${year}`;
	}

	function updateItem() {
		onUpdate(item);
	}
</script>

<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
	<div>
		<div class="form-control w-full mb-2">
			<label class="label">
				<span class="label-text">Datum</span>
			</label>
			<input
				type="text"
				placeholder="DD-MM-YYYY"
				autocomplete="off"
				class="input input-bordered w-full"
				class:input-error={!isValidDate}
				bind:value={formattedDate}
				on:input={handleDateInput}
			/>
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
				on:input={updateItem}
			/>
		</div>

		<div class="form-control w-full mb-2">
			<label class="label">
				<span class="label-text">Aktivní</span>
			</label>
			<select
				class="select select-bordered w-full"
				bind:value={item.active}
				on:change={updateItem}
			>
				<option value={false}>NE</option>
				<option value={true}>Ano</option>
			</select>
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
				on:input={updateItem}
			/>
		</div>

		<div class="form-control w-full mb-2">
			<label class="label">
				<span class="label-text">Hlavní chod</span>
			</label>
			<div class="grid grid-rows-3 gap-2">
        <textarea
					class="textarea textarea-bordered"
					placeholder="Menu 1"
					rows="4"
					bind:value={item.variants[1]}
					on:input={updateItem}
				></textarea>
				<textarea
					class="textarea textarea-bordered"
					placeholder="Menu 2"
					rows="4"
					bind:value={item.variants[2]}
					on:input={updateItem}
				></textarea>
				<textarea
					class="textarea textarea-bordered"
					placeholder="Menu 3"
					rows="4"
					bind:value={item.variants[3]}
					on:input={updateItem}
				></textarea>
			</div>
		</div>

		<div class="form-control w-full mb-2">
			<label class="label">
				<span class="label-text">Poznámky</span>
			</label>
			<textarea
				class="textarea textarea-bordered"
				bind:value={item.notes}
				on:input={updateItem}
			></textarea>
		</div>
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
			on:input={updateItem}
		/>
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
			on:input={updateItem}
		/>
	</div>
</div>