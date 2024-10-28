<script lang="ts">
	import { goto } from "$app/navigation";
	import { fly } from "svelte/transition";
	import { ROUTES } from "$lib/stores/store";

	export let data;
	let { supabase, customers } = data;
	$: ({ supabase, customers } = data);
	console.log("customersId:", customers);

	// State variables
	let loading = false;
	let updateMessage = "";

	// Editable customer data fields
	let first_name: string = customers?.first_name ?? "";
	let last_name: string = customers?.last_name ?? "";
	let telephone: string = customers?.telephone ?? "";
	let street: string = customers?.street ?? "";
	let city: string = customers?.city ?? "";
	let street_number: string = customers?.street_number ?? "";
	let zip_code: string = customers?.zip_code ?? "";
	let ico: string = customers?.ico ?? "";
	let dic: string = customers?.dic ?? "";
	let company: string = customers?.company ?? "";
	let website: string = customers?.website ?? "";
	let username: string = customers?.username ?? "";

	const customerId: string = customers?.id;
	const email: string = customers?.email ?? "";

	// Update customer data in Supabase
	async function updateCustomer() {
		try {
			loading = true;
			const update = {
				first_name,
				last_name,
				telephone,
				street,
				city,
				street_number,
				zip_code,
				email,
				ico,
				dic,
				company,
				website,
				username
			};

			console.log("Zákazník se ukládá s těmito daty:", update);
			console.log("customerID:", customerId);

			const { error } = await supabase
				.from("customers")
				.update(update)
				.eq("id", customerId)
				.select();
			if (error) {
				console.error("Chyba ukládání:", error);
				throw error;
			} else {
				console.log("Zákazník úspěšně uložen!");
				updateMessage = "Zákazník úspěšně uložen!";
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

	// Navigate back to customer list
	async function back() {
		goto($ROUTES.ADMIN.CUSTOMER.LIST);
	}

	// Delete customer from Supabase
	async function deleteCustomer() {
		try {
			loading = true;
			const { error } = await supabase
				.from("customers")
				.delete()
				.eq("id", customerId);
			if (error) {
				console.error("Error deleting customer:", error);
				throw error;
			} else {
				console.log("Customer deleted successfully!");
				await goto("/customer", { replaceState: true });
			}
		} catch (error) {
			if (error instanceof Error) {
				console.error("Error in Delete customer:", error);
				alert(error.message);
			}
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>LEO - Zákazník</title>
</svelte:head>

<div
	class="relative p-5 overflow-x-auto shadow-md sm:rounded-lg border border-zinc-200">
	<div class="antialiased bg-white sans-serif">
		<div class="md:py-6 md:px-4">
			<div class="flex justify-between">
				<h2 class="pb-2 mb-6 text-2xl font-bold tracking-wider uppercase">
					Zákazník
				</h2>
				<div />
			</div>

			<div class="flex justify-between">
				<div>
					<button on:click={back} class="btn btn-outline"> Zpět </button>
				</div>
				{#if updateMessage}
					<div class="p-2 my-2 text-green-800 bg-green-200 rounded">
						{updateMessage}
					</div>
				{/if}
				<div class="flex flex-col gap-2 md:flex-row">
					<div>
						<button
							value={loading ? "Nahrává se..." : "Změněno"}
							disabled={loading}
							type="submit"
							on:click={updateCustomer}
							class="btn btn-outline">
							Upravit
						</button>
					</div>
					<div>
						<button
							class="invisible w-full p-4 px-5 border rounded-xl hover:bg-slate-100"
							value={loading ? "Nahrává se..." : "Update"}
							disabled={loading}
							type="submit"
							on:click={deleteCustomer}>
							Smazat
						</button>
					</div>
				</div>
			</div>

			<hr class="h-px my-8 bg-gray-200 border-0 dark:bg-gray-700" />

			<div in:fly={{ x: -50, duration: 500, delay: 200 }}>
				<div class="mb-8 max-w-3xl mx-auto">
					<div
						class="collapse collapse-plus bg-base-200 p-10 border-slate-300 border">
						<input type="radio" name="my-accordion-3" checked="checked" />
						<div class="collapse-title text-xl font-medium">Osobní údaje</div>
						<div class="collapse-content">
							<label class="form-control w-full max-w-xs">
								<div class="label">
									<span class="label-text">Email</span>
								</div>
								<input
									type="text"
									value={email}
									placeholder="Zadejte email"
									class="input input-bordered w-full max-w-xs !border-white !text-stone-700"
									readonly
									disabled />
							</label>

							<label class="form-control w-full max-w-xs">
								<div class="label">
									<span class="label-text">Jméno</span>
								</div>
								<input
									type="text"
									bind:value={first_name}
									placeholder="Zadejte jméno"
									class="input input-bordered w-full max-w-xs" />
							</label>

							<label class="form-control w-full max-w-xs">
								<div class="label">
									<span class="label-text">Příjmení</span>
								</div>
								<input
									type="text"
									bind:value={last_name}
									placeholder="Zadejte příjmení"
									class="input input-bordered w-full max-w-xs" />
							</label>

							<label class="form-control w-full max-w-xs">
								<div class="label">
									<span class="label-text">Telefon</span>
								</div>
								<input
									type="text"
									bind:value={telephone}
									placeholder="Zadejte telefon"
									class="input input-bordered w-full max-w-xs" />
							</label>
						</div>
					</div>

					<div
						class="collapse collapse-plus bg-base-200 p-10 border-slate-300 border">
						<input type="radio" name="my-accordion-3" />
						<div class="collapse-title text-xl font-medium">Adresa</div>
						<div class="collapse-content">
							<label class="form-control w-full max-w-xs">
								<div class="label">
									<span class="label-text">Ulice a číslo</span>
								</div>
								<input
									type="text"
									bind:value={street}
									placeholder="Zadejte ulici a číslo"
									class="input input-bordered w-full max-w-xs" />
							</label>

							<label class="form-control w-full max-w-xs">
								<div class="label">
									<span class="label-text">Město</span>
								</div>
								<input
									type="text"
									bind:value={city}
									placeholder="Zadejte město"
									class="input input-bordered w-full max-w-xs" />
							</label>

							<label class="form-control w-full max-w-xs">
								<div class="label">
									<span class="label-text">PSČ</span>
								</div>
								<input
									type="text"
									bind:value={zip_code}
									placeholder="Zadejte PSČ"
									class="input input-bordered w-full max-w-xs" />
							</label>
						</div>
					</div>

					<div
						class="collapse collapse-plus bg-base-200 p-10 border-slate-300 border">
						<input type="radio" name="my-accordion-3" />
						<div class="collapse-title text-xl font-medium">Firemní údaje</div>
						<div class="collapse-content">
							<label class="form-control w-full max-w-xs">
								<div class="label">
									<span class="label-text">IČO</span>
								</div>
								<input
									type="text"
									bind:value={ico}
									placeholder="Zadejte IČO"
									class="input input-bordered w-full max-w-xs" />
							</label>

							<label class="form-control w-full max-w-xs">
								<div class="label">
									<span class="label-text">DIČ</span>
								</div>
								<input
									type="text"
									bind:value={dic}
									placeholder="Zadejte DIČ"
									class="input input-bordered w-full max-w-xs" />
							</label>

							<label class="form-control w-full max-w-xs">
								<div class="label">
									<span class="label-text">Společnost</span>
								</div>
								<input
									type="text"
									bind:value={company}
									placeholder="Zadejte společnost"
									class="input input-bordered w-full max-w-xs" />
							</label>

							<label class="form-control w-full max-w-xs">
								<div class="label">
									<span class="label-text">Web</span>
								</div>
								<input
									type="text"
									bind:value={website}
									placeholder="Zadejte web"
									class="input input-bordered w-full max-w-xs" />
							</label>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
