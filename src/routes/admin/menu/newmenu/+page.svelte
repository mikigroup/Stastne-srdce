<script lang="ts">
	import { onMount } from "svelte";
	import { createEventDispatcher } from "svelte";
	import { goto } from "$app/navigation";

	export let data;
	let { session, supabase } = data;
	$: ({ session, supabase } = data);

	let loading = false;
	let date: string = new Date().toISOString().slice(0, 10);
	let soup: string = "";
	let price: number = 0;
	let variants: any = {
		1: "",
		2: "",
		3: ""
	};

	let active: boolean = false;
	let notes: string = "";
	let type: string = "";
	let nutri: string = "";

	let formattedDate: string = "";

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
		return `${day}-${month}-${year}`;
	}

	function back() {
		goto("/menu");
	}

	async function createMenu() {
		try {
			loading = true;
			const { user } = session;

			const createMenuData = {
				created_at: new Date().toISOString(),
				date: date ? new Date(date).toISOString() : null,
				soup,
				price,
				variants,
				active,
				notes,
				type,
				nutri
			};

			console.log(createMenuData);

			let { error } = await supabase.from("menus").insert(createMenuData);
			if (error) throw error;
			console.log("Menu created successfully!");
			goto("/menu", { replaceState: true });
		} catch (error) {
			if (error instanceof Error) {
				alert(error.message);
			}
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>LEO - Nové menu</title>
</svelte:head>
<div class="relative p-5 overflow-x-auto shadow-md sm:rounded-lg">
	<div class="flex justify-between">
		<div>
			<button
				value={loading ? "Tvořím..." : "Vytvořeno"}
				disabled={loading}
				type="submit"
				on:click={back}
				class="w-full p-4 px-5 border rounded-xl hover:bg-slate-100"
				>Zpět</button>
		</div>
		<div class="flex flex-col gap-2 md:flex-row">
			<div>
				<button
					value={loading ? "Tvořím..." : "Vytvořeno"}
					disabled={loading}
					type="submit"
					on:click={createMenu}
					class="w-full p-4 px-5 border rounded-xl hover:bg-slate-100"
					>Vytvoř</button>
			</div>
		</div>
	</div>
	<hr class="h-px my-8 bg-gray-200 border-0 dark:bg-gray-700" />

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
						<span class="hidden mr-4 md:inline-block">:</span>
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
								<option value={false}>Ne</option>
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
					<div>Napadlo me, italske jidlo, ceske, atd. dalsi tagy.</div>
				</div>
			</div>
		</div>
	</div>
</div>
