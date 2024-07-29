<script lang="ts">
	import { goto } from "$app/navigation";

	export let data;
	let { session, supabase, menus } = data;
	$: ({ session, supabase, menus } = data);

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
	async function updateMenu() {
		try {
			loading = true;

			const update = {
				updated_at: new Date().toISOString(),
				date: date ? new Date(date).toISOString() : null,
				soup,
				price,
				variants,
				active,
				notes,
				type,
				nutri
			};

			console.log("Menu se ukládá s těmito daty:", update);

			const { data, error } = await supabase
				.from("menus")
				.update(update)
				.eq("id", menuId)
				.select("*");
			if (error) {
				console.error("Chyba ukládání:", error);
				throw error;
			} else {
				console.log("Menu úspěšně uložena!");
				updateMessage = "Menu úspěšně uložena!";
			}
		} catch (error) {
			if (error instanceof Error) {
				console.error("Chyba ukládání:", error);
				alert(error.message);
			}
		} finally {
			loading = false;
		}
	}
	
	async function deleteMenu() {
		try {
			loading = true;
			const { error } = await supabase.from("menus").delete().eq("id", menuId);

			if (error) {
				console.error("Error deleting menu:", error);
				throw error;
			} else {
				console.log("Menu deleted successfully!");
				await goto("/menu", { replaceState: true });
			}
		} catch (error) {
			if (error instanceof Error) {
				console.error("Error in Delete menu:", error);
				alert(error.message);
			}
		} finally {
			loading = false;
		}
	}

	// Datum
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

	// Datum - Validace
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
		await goto("/menu");
	}

	// Testy
	// console.log("Meny:", menus);

	// ---------------
</script>

<div class="relative p-5 overflow-x-auto shadow-md sm:rounded-lg">
	<div class="flex justify-between">
		<div>
			<button
				on:click={back}
				class="w-full p-4 px-5 border rounded-xl hover:bg-slate-100"
				>Zpět</button>
		</div>
		{#if updateMessage}
			<div class="p-2 my-2 text-green-800 bg-green-200 rounded">
				{updateMessage}
			</div>
		{/if}
		<div class="flex flex-col gap-2 md:flex-row">
			<div>
				<button
					value={loading ? "Nahrává se..." : "Upraveno"}
					disabled={loading}
					type="submit"
					on:click={updateMenu}
					class="w-full p-4 px-5 border rounded-xl hover:bg-slate-100"
					>Upravit</button>
			</div>
			<div>
				<button
					class="w-full p-4 px-5 border rounded-xl hover:bg-slate-100"
					value={loading ? "Nahrává se..." : "Update"}
					disabled={loading}
					type="submit"
					on:click={deleteMenu}>Smazat</button>
			</div>
		</div>
	</div>
	<hr class="h-px my-8 bg-gray-200 border-0 dark:bg-gray-700" />
	<!-- --- -->

	<div class="antialiased bg-white sans-serif">
		<div class="md:py-6 md:px-4">
			<div class="flex justify-between">
				<h2 class="pb-2 mb-6 text-2xl font-bold tracking-wider uppercase">
					Menu
				</h2>
				<div />
			</div>

			<div class="antialiased bg-white sans-serif">
				<div class="md:py-6 md:px-4">
					<div class="flex justify-between">
						<h2 class="pb-2 mb-6 text-2xl font-bold tracking-wider uppercase">
							Menu
						</h2>
						<div />
					</div>

					<div class="justify-between mb-8 md:flex">
						<div class="md:w-2/4">
							<div class="items-center mb-2 md:mb-1 md:flex">
								<!-- svelte-ignore a11y-label-has-associated-control -->
								<label
									class="block w-full text-sm font-bold tracking-wide text-gray-800 uppercase md:w-32"
									>Datum</label>
								<span class="hidden block mr-4 md:inline-block">:</span>
								<div class="flex-1">
									<input
										class="w-full px-4 py-2 leading-tight text-gray-700 bg-gray-200 border-2 border-gray-200 rounded appearance-none md:w-48 focus:outline-none focus:bg-white"
										type="text"
										placeholder="DD-MM-YYYY"
										autocomplete="off"
										bind:value={formattedDate}
										on:input={handleDateInput}
										class:invalid={!isValidDate} />
								</div>
							</div>

							<div class="items-center mb-2 md:mb-1 md:flex">
								<!-- svelte-ignore a11y-label-has-associated-control -->
								<label
									class="block w-full text-sm font-bold tracking-wide text-gray-800 uppercase md:w-32"
									>Polévka</label>
								<span class="hidden mr-4 md:inline-block">:</span>
								<div class="flex-2">
									<input
										class="w-full px-4 py-2 leading-tight text-gray-700 bg-gray-200 border-2 border-gray-200 rounded appearance-none md:w-48 focus:outline-none focus:bg-white"
										type="text"
										placeholder=""
										autocomplete="off"
										bind:value={soup} />
								</div>
							</div>

							<div class="items-center mb-2 md:mb-1 md:flex">
								<!-- svelte-ignore a11y-label-has-associated-control -->
								<label
									class="block w-full text-sm font-bold tracking-wide text-gray-800 uppercase md:w-32"
									>Cena</label>
								<span class="hidden mr-4 md:inline-block">:</span>
								<div class="flex-2">
									<input
										class="w-full px-4 py-2 leading-tight text-gray-700 bg-gray-200 border-2 border-gray-200 rounded appearance-none md:w-48 focus:outline-none focus:bg-white"
										type="number"
										placeholder=""
										autocomplete="off"
										bind:value={price} />
								</div>
							</div>

							<div class="items-center mb-2 md:mb-1 md:flex">
								<!-- svelte-ignore a11y-label-has-associated-control -->
								<label
									class="block w-full text-sm font-bold tracking-wide text-gray-800 uppercase md:w-32"
									>Aktivní</label>
								<span class="hidden mr-4 md:inline-block">:</span>
								<div class="flex-2">
									<select
										class="w-full px-4 py-2 leading-tight text-gray-700 bg-gray-200 border-2 border-gray-200 rounded appearance-none md:w-48 focus:outline-none focus:bg-white"
										bind:value={active}>
										<option value={false}>NE</option>
										<option value={true}>Ano</option>
									</select>
								</div>
							</div>
						</div>
						<div class="md:w-2/4">
							<div class="items-center mb-2 md:mb-1 md:flex">
								<!-- svelte-ignore a11y-label-has-associated-control -->
								<label
									class="block w-full text-sm font-bold tracking-wide text-gray-800 uppercase md:w-32"
									>Poznámky</label>
								<span class="hidden mr-4 md:inline-block">:</span>
								<div class="flex-1">
									<textarea
										class="w-full px-4 py-2 leading-tight text-gray-700 bg-gray-200 border-2 border-gray-200 rounded appearance-none md:w-48 focus:outline-none focus:bg-white"
										bind:value={notes}></textarea>
								</div>
							</div>
							<div class="items-center mb-2 md:mb-1 md:flex">
						<!-- svelte-ignore a11y-label-has-associated-control -->
						<label
							class="block w-full text-sm font-bold tracking-wide text-gray-800 uppercase md:w-32"
							>Hlavní chod</label>
						<span class="hidden mr-4 md:inline-block">:</span>
						<div class="flex-1">
							<textarea
								class="w-full px-4 py-2 leading-tight text-gray-700 bg-gray-200 border-2 border-gray-200 rounded appearance-none md:w-48 focus:outline-none focus:bg-white"
								rows="4"
								bind:value={variants[1]} />
						</div>
						<div class="flex-1">
							<textarea
								class="w-full px-4 py-2 leading-tight text-gray-700 bg-gray-200 border-2 border-gray-200 rounded appearance-none md:w-48 focus:outline-none focus:bg-white"
								rows="4"
								bind:value={variants[2]} />
						</div>
						<div class="flex-1">
							<textarea
								class="w-full px-4 py-2 leading-tight text-gray-700 bg-gray-200 border-2 border-gray-200 rounded appearance-none md:w-48 focus:outline-none focus:bg-white"
								rows="4"
								bind:value={variants[3]} />
						</div>
					</div>

							<div class="items-center mb-2 md:mb-1 md:flex">
								<!-- svelte-ignore a11y-label-has-associated-control -->
								<label
									class="block w-full text-sm font-bold tracking-wide text-gray-800 uppercase md:w-32"
									>Nutriční info</label>
								<span class="hidden mr-4 md:inline-block">:</span>
								<div class="flex-1">
									<input
										class="w-full px-4 py-2 leading-tight text-gray-700 bg-gray-200 border-2 border-gray-200 rounded appearance-none md:w-48 focus:outline-none focus:bg-white"
										type="text"
										bind:value={nutri} />
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	.date-input .pika-select-month,
	.date-input .pika-select-year {
		display: inline-block;
		border: 1px solid #ddd;
		color: #444;
		background-color: #fff;
		border-radius: 10px;
		font-size: 0.9rem;
		padding-left: 0.5em;
		padding-right: 0.5em;
		padding-top: 0.25em;
		padding-bottom: 0.25em;
		appearance: none;
	}
	.date-input .pika-select-month:focus,
	.date-input .pika-select-year:focus {
		border-color: #cbd5e0;
		outline: none;
	}
	.date-input table td button {
		width: 1.8em;
		height: 1.8em;
		text-align: center;
		color: #555;
		border-radius: 10px;
	}
	.date-input table td button:hover {
		background-color: #bee3f8;
	}
	.date-input table td.is-today button {
		background-color: #ebf8ff;
	}
	.date-input table td.is-selected button {
		background-color: #3182ce;
	}
	.date-input table td.is-selected button {
		color: white;
	}
	.date-input table td.is-selected button:hover {
		color: white;
	}
</style>
