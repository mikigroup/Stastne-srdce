<script lang="ts">
	import { goto } from "$app/navigation";
	import { fade, fly } from 'svelte/transition';

	export let data;
	let { session, supabase } = data;
	$: ({ session, supabase } = data);
	let loading = false;
	let date: string = menus?.date ?? "";
	let soup: string = menus?.soup ?? "";
	let price: number = menus?.price ?? 0;
	let variants: any = menus?.variants ?? {
		1: "",
		2: "",
		3: ""
	};
	let active: boolean = menus?.active;
	let notes: string = menus?.notes ?? "";
	let type: string = menus?.type ?? "";
	let nutri: string = menus?.nutri ?? "";
	let menuId: string = menus?.id;
	let formattedDate = date ? formatSupabaseDate(date) : "";

	let updateMessage = "";
	async function createMenu() {
		try {
			loading = true;

			const menuData = {
				date: date ? new Date(date).toISOString() : null,
				soup,
				price,
				active,
				notes,
				type,
				nutri
			};

			const { data: menuData, error: menuError } = await supabase
				.from("menus")
				.insert(menuData)
				.select()
				.single();

			if (menuError) throw menuError;

			menuId = menuData.id;

			for (const [variantNumber, description] of Object.entries(variants)) {
				const { error: variantError } = await supabase
					.from("menu_variants")
					.insert({
						menu_id: menuId,
						variant_number: parseInt(variantNumber),
						description
					});

				if (variantError) throw variantError;
			}

			console.log("Menu a varianty úspěšně vytvořeny!");
			updateMessage = "Menu a varianty úspěšně vytvořeny!";

			await goto("/menu", { replaceState: true });
		} catch (error) {
			if (error instanceof Error) {
				console.error("Chyba při vytváření:", error);
				alert(error.message);
			}
		} finally {
			loading = false;
		}
	}

	async function deleteMenu() {
		try {
			loading = true;

			const { error: variantError } = await supabase
				.from("menu_variants")
				.delete()
				.eq("menu_id", menuId);

			if (variantError) throw variantError;

			const { error: menuError } = await supabase
				.from("menus")
				.delete()
				.eq("id", menuId);

			if (menuError) throw menuError;

			console.log("Menu a varianty úspěšně smazány!");
			await goto("/menu", { replaceState: true });
		} catch (error) {
			if (error instanceof Error) {
				console.error("Chyba při mazání menu:", error);
				alert(error.message);
			}
		} finally {
			loading = false;
		}
	}

	let isValidDate: boolean = true;
	let isEditingDate = false;

	function handleDateInput(event) {
		const enteredDate = event.target.value;
		const isValid = validateDate(enteredDate);

		if (isValid) {
			date = formatDateForSupabase(enteredDate);
			isValidDate = true;
		} else {
			isValidDate = false;
		}
		isEditingDate = true;
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
		const [year, month, day] = inputDate.split("-");
		return `${day.padStart(2, "0")}-${month.padStart(2, "0")}-${year}`;
	}

	async function back() {
		await goto("/admin/menu");
	}

	let showAdvanced = false;
	function toggleAdvanced() {
		showAdvanced = !showAdvanced;
	}
</script>
<div class="relative p-5 overflow-x-auto shadow-md sm:rounded-lg" in:fly="{{ y: 50, duration: 500 }}">
	<div class="flex justify-between items-center mb-4">
		<button on:click={back} class="btn btn-outline">Zpět</button>
		{#if updateMessage}
			<div class="alert alert-success shadow-lg" transition:fade>
				<div>
					<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 flex-shrink-0 stroke-current" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
					<span>{updateMessage}</span>
				</div>
			</div>
		{/if}
		<div class="flex gap-2">
			<button value={loading ? "Nahrává se..." : "Upraveno"} disabled={loading} type="submit" on:click={updateMenu} class="btn btn-outline">Vytvoř</button>
			<button class="btn btn-outline btn-error" value={loading ? "Nahrává se..." : "Update"} disabled={loading} type="submit" on:click={deleteMenu}>Smazat</button>
		</div>
	</div>
	<div class="divider"></div>
	<div class="bg-base-100">
		<div class="py-6 px-4">
			<h2 class="text-2xl font-bold mb-6">Menu</h2>

			<div class="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
				<div in:fly="{{ x: -50, duration: 500, delay: 200 }}">

					<div class="form-control w-full mb-2">
						<label class="label">
							<span class="label-text">Datum</span>
						</label>
						<input type="text" placeholder="DD-MM-YYYY" autocomplete="off" class="input input-bordered w-full" class:input-error={!isValidDate} bind:value={formattedDate} on:input={handleDateInput} />
					</div>

					<div class="form-control w-full mb-2">
						<label class="label">
							<span class="label-text">Cena</span>
						</label>
						<input type="number" placeholder="" autocomplete="off" class="input input-bordered w-full" bind:value={price} />
					</div>
					<div class="form-control w-full mb-2">
						<label class="label">
							<span class="label-text">Aktivní</span>
						</label>
						<select class="select select-bordered w-full" bind:value={active}>
							<option value={false}>NE</option>
							<option value={true}>Ano</option>
						</select>
					</div>
				</div>


				<div in:fly="{{ x: 50, duration: 500, delay: 400 }}">

					<div class="form-control w-full mb-2">
						<label class="label">
							<span class="label-text">Polévka</span>
						</label>
						<input type="text" placeholder="" autocomplete="off" class="input input-bordered w-full" bind:value={soup} />
					</div>


					<div class="form-control w-full mb-2">
						<label class="label">
							<span class="label-text">Hlavní chod</span>
						</label>
						<div class="grid grid-rows-3 gap-2">
							<textarea class="textarea textarea-bordered" rows="4" bind:value={variants[1]}></textarea>
							<textarea class="textarea textarea-bordered" rows="4" bind:value={variants[2]}></textarea>
							<textarea class="textarea textarea-bordered" rows="4" bind:value={variants[3]}></textarea>
						</div>
					</div>

					<div class="form-control w-full mb-2">
						<label class="label">
							<span class="label-text">Poznámky</span>
						</label>
						<textarea class="textarea textarea-bordered" bind:value={notes}></textarea>
					</div>
				</div>
			</div>

			<div class="text-center">
				<button class="btn btn-link" on:click={toggleAdvanced}>
					{#if showAdvanced}
						Skrýt pokročilé
					{:else}
						Zobrazit pokročilé
					{/if}
				</button>
			</div>

			{#if showAdvanced}
				<div class="mt-8" transition:fade>
					<div class="form-control w-full mb-2">
						<label class="label">
							<span class="label-text">Nutriční info</span>
						</label>
						<input type="text" class="input input-bordered w-full" bind:value={nutri} />
					</div>
				</div>
				<div class="form-control w-full mb-2">
					<label class="label">
						<span class="label-text">Typ</span>
					</label>
					<input type="text" placeholder="" autocomplete="off" class="input input-bordered w-full" bind:value={type} />
				</div>
			{/if}
		</div>
	</div>
</div>