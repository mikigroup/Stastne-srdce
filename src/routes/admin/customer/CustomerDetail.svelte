<script lang="ts">
	import { goto } from "$app/navigation";
	import { fly } from "svelte/transition";
	import { ROUTES } from "$lib/stores/store";
	import type { Database } from "$lib/database.types";

	// Definice typů pro data zákazníka
	type Customer = Database["public"]["Tables"]["profiles"]["Row"];

	// Definice typů pro vlastnosti komponenty
	interface ComponentProps {
		data: {
			supabase: any; // Ideálně by zde mělo být SupabaseClient<Database>
			session: {
				user: {
					id: string;
					email: string;
				};
			} | null;
		};
		customer?: Customer | null;
	}

	// Definice typů pro chyby při ukládání
	interface ApiError {
		message: string;
		code?: string;
		details?: string;
	}

	// Props a explicitní typizace
	export let data: ComponentProps["data"];
	export let customer: ComponentProps["customer"] = null; // If null, we're creating a new customer

	let { supabase, session } = data;
	$: ({ supabase, session } = data);

	// State variables s typizací
	let loading = false;
	let updateMessage = "";

	// Customer data fields - initialize with existing customer data or empty strings
	let first_name: string = customer?.first_name ?? "";
	let last_name: string = customer?.last_name ?? "";
	let telephone: string = customer?.telephone ?? "";
	let street: string = customer?.street ?? "";
	let city: string = customer?.city ?? "";
	let street_number: string = customer?.street_number ?? "";
	let zip_code: string = customer?.zip_code ?? "";
	let ico: string = customer?.ico ?? "";
	let dic: string = customer?.dic ?? "";
	let company: string = customer?.company ?? "";
	let website: string = customer?.website ?? "";
	let username: string = customer?.username ?? "";
	let email: string = customer?.email ?? "";
	let allergies: "yes" | "no" = customer?.allergies === true ? "yes" : "no";
	let allergies_description: string = customer?.allergies_description || "";
	let delivery_method: string = customer?.delivery_method || "";
	let payment_method: string = customer?.payment_method || "";

	// Definice typu pro customerData
	type CustomerData = {
		first_name: string;
		last_name: string;
		telephone: string;
		street: string;
		city: string;
		street_number: string;
		zip_code: string;
		email: string;
		ico: string;
		dic: string;
		company: string;
		website: string;
		username: string;
		allergies: boolean;
		allergies_description: string | null;
		delivery_method: string;
		payment_method: string;
	};

	async function saveCustomer(): Promise<void> {
		try {
			loading = true;
			const customerData: CustomerData = {
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
				username,
				allergies: allergies === "yes",
				allergies_description: allergies === "yes" ? allergies_description : null,
				delivery_method,
				payment_method
			};

			if (customer) {
				// Update existing customer
				const { error } = await supabase
					.from("profiles")
					.update(customerData)
					.eq("id", customer.id)
					.select();

				if (error) throw error;
				updateMessage = "Zákazník úspěšně uložen!";
			} else {
				// Create new customer
				if (!session?.user?.id) {
					throw new Error("Uživatel není přihlášen");
				}

				const { error } = await supabase
					.from("customers")
					.insert({
						...customerData,
						id: session.user.id
					});

				if (error) throw error;
				goto($ROUTES.ADMIN.CUSTOMER.LIST, { replaceState: true });
			}
		} catch (error) {
			const apiError = error as ApiError;
			console.error("Chyba při ukládání:", apiError);
			alert(apiError.message || "Došlo k chybě při ukládání zákazníka");
		} finally {
			loading = false;
		}
	}

	async function deleteCustomer(): Promise<void> {
		if (!customer?.id) return;

		try {
			loading = true;
			const { error } = await supabase
				.from("customers")
				.delete()
				.eq("id", customer.id);

			if (error) throw error;
			await goto($ROUTES.ADMIN.CUSTOMER.LIST, { replaceState: true });
		} catch (error) {
			const apiError = error as ApiError;
			console.error("Error deleting customer:", apiError);
			alert(apiError.message || "Došlo k chybě při mazání zákazníka");
		} finally {
			loading = false;
		}
	}

	function back(): void {
		goto($ROUTES.ADMIN.CUSTOMER.LIST);
	}
</script>

<div class="relative overflow-x-auto shadow-md sm:rounded-lg border border-zinc-200 ">
	<div class="antialiased bg-white">
		<div class="p-2 md:p-6">
			<div class="flex justify-between">
				<h2 class="pb-2 mb-6 text-2xl font-bold tracking-wider uppercase">
					{customer ? 'Zákazník' : 'Nový zákazník'}
				</h2>
			</div>

			<div class="flex justify-between">
				<div>
					<button on:click={back} class="btn btn-outline">Zpět</button>
				</div>
				{#if updateMessage}
					<div class="p-2 my-2 text-green-800 bg-green-200 rounded">
						{updateMessage}
					</div>
				{/if}
				<div class="flex flex-col gap-2 md:flex-row">
					<button
						value={loading ? "Nahrává se..." : customer ? "Změněno" : "Vytvořeno"}
						disabled={loading}
						on:click={saveCustomer}
						class="btn btn-outline">
						{customer ? 'Upravit' : 'Vytvořit'}
					</button>
					{#if customer}
						<button
							class="btn btn-outline btn-error"
							value={loading ? "Nahrává se..." : "Smazáno"}
							disabled={loading}
							on:click={deleteCustomer}>
							Smazat
						</button>
					{/if}
				</div>
			</div>

			<hr class="h-px my-8 bg-gray-200 border-0 dark:bg-gray-700" />

			<div in:fly={{ x: -50, duration: 500, delay: 200 }}>
				<div class="max-w-3xl mx-auto">
					<!-- Personal Information -->
					<div class="collapse collapse-plus bg-base-200 border-slate-300 border p-4 md:p-10">
						<input type="radio" name="my-accordion-3" checked="checked" />
						<div class="collapse-title text-xl font-medium">Osobní údaje</div>
						<div class="collapse-content">
							<label class="form-control w-full">
								<div class="label">
									<span class="label-text">Email</span>
								</div>
								<input
									type="text"
									bind:value={email}
									placeholder="Zadejte email"
									class="input input-bordered w-full"
									readonly={!!customer}
									disabled={!!customer} />
							</label>

							<label class="form-control w-full">
								<div class="label">
									<span class="label-text">Jméno</span>
								</div>
								<input
									type="text"
									bind:value={first_name}
									placeholder="Zadejte jméno"
									class="input input-bordered w-full" />
							</label>

							<label class="form-control w-full">
								<div class="label">
									<span class="label-text">Příjmení</span>
								</div>
								<input
									type="text"
									bind:value={last_name}
									placeholder="Zadejte příjmení"
									class="input input-bordered w-full" />
							</label>

							<label class="form-control w-full">
								<div class="label">
									<span class="label-text">Telefon</span>
								</div>
								<input
									type="text"
									bind:value={telephone}
									placeholder="Zadejte telefon"
									class="input input-bordered w-full" />
							</label>
						</div>
					</div>

					<!-- Address -->
					<div class="collapse collapse-plus bg-base-200 border-slate-300 border p-4 md:p-10">
						<input type="radio" name="my-accordion-3" />
						<div class="collapse-title text-xl font-medium">Adresa</div>
						<div class="collapse-content">
							<label class="form-control w-full">
								<div class="label">
									<span class="label-text">Ulice</span>
								</div>
								<input
									type="text"
									bind:value={street}
									placeholder="Zadejte ulici"
									class="input input-bordered w-full" />
							</label>

							<label class="form-control w-full">
								<div class="label">
									<span class="label-text">Číslo</span>
								</div>
								<input
									type="text"
									bind:value={street_number}
									placeholder="Zadejte číslo"
									class="input input-bordered w-full" />
							</label>

							<label class="form-control w-full">
								<div class="label">
									<span class="label-text">Město</span>
								</div>
								<input
									type="text"
									bind:value={city}
									placeholder="Zadejte město"
									class="input input-bordered w-full" />
							</label>

							<label class="form-control w-full">
								<div class="label">
									<span class="label-text">PSČ</span>
								</div>
								<input
									type="text"
									bind:value={zip_code}
									placeholder="Zadejte PSČ"
									class="input input-bordered w-full" />
							</label>
						</div>
					</div>

					<!-- Company Information -->
					<div class="collapse collapse-plus bg-base-200 border-slate-300 border p-4 md:p-10">
						<input type="radio" name="my-accordion-3" />
						<div class="collapse-title text-xl font-medium">Firemní údaje</div>
						<div class="collapse-content">
							<label class="form-control w-full">
								<div class="label">
									<span class="label-text">IČO</span>
								</div>
								<input
									type="text"
									bind:value={ico}
									placeholder="Zadejte IČO"
									class="input input-bordered w-full" />
							</label>

							<label class="form-control w-full">
								<div class="label">
									<span class="label-text">DIČ</span>
								</div>
								<input
									type="text"
									bind:value={dic}
									placeholder="Zadejte DIČ"
									class="input input-bordered w-full" />
							</label>

							<label class="form-control w-full">
								<div class="label">
									<span class="label-text">Společnost</span>
								</div>
								<input
									type="text"
									bind:value={company}
									placeholder="Zadejte společnost"
									class="input input-bordered w-full" />
							</label>

							<label class="form-control w-full">
								<div class="label">
									<span class="label-text">Web</span>
								</div>
								<input
									type="text"
									bind:value={website}
									placeholder="Zadejte web"
									class="input input-bordered w-full" />
							</label>
						</div>
					</div>

					<!-- Preferences -->
					<div class="collapse collapse-plus bg-base-200 border-slate-300 border p-4 md:p-10">
						<input type="radio" name="my-accordion-3" />
						<div class="collapse-title text-xl font-medium">Preference</div>
						<div class="collapse-content">
							<!-- Allergies -->
							<div class="mb-6">
								<div class="w-full">
									<div class="label">
										<span class="label-text">Alergie</span>
									</div>
									<div class="flex gap-4 mb-2">
										<label class="flex items-center">
											<input
												type="radio"
												name="allergies"
												value="no"
												bind:group={allergies}
												class="mr-2"
											/>
											Ne
										</label>
										<label class="flex items-center">
											<input
												type="radio"
												name="allergies"
												value="yes"
												bind:group={allergies}
												class="mr-2"
											/>
											Ano
										</label>
									</div>
									{#if allergies === "yes"}
										<div class="flex flex-col w-full">
                      <textarea
												bind:value={allergies_description}
												maxlength="300"
												placeholder="Popište alergie (max 300 znaků)"
												class="textarea textarea-bordered w-full h-24"
												rows="3"
											></textarea>
											<span class="text-sm text-gray-500 mt-1">
                        Zbývá {300 - (allergies_description?.length || 0)} znaků
                      </span>
										</div>
									{/if}
								</div>
							</div>

							<!-- Delivery Method -->
							<div class="mb-6">
								<div class="w-full">
									<div class="label">
										<span class="label-text">Způsob dodání</span>
									</div>
									<div class="flex flex-col gap-2">
										<label class="flex items-center">
											<input
												type="radio"
												name="deliveryMethod"
												value="own"
												bind:group={delivery_method}
												class="mr-2"
											/>
											Vlastní nosič
										</label>
										<label class="flex items-center">
											<input
												type="radio"
												name="deliveryMethod"
												value="reBox"
												bind:group={delivery_method}
												class="mr-2"
											/>
											REkrabička (záloha 160 Kč za set/80 Kč za jednu)
										</label>
										<label class="flex items-center">
											<input
												type="radio"
												name="deliveryMethod"
												value="menuBox"
												bind:group={delivery_method}
												class="mr-2"
											/>
											Menu Box (12 Kč/kus)
										</label>
									</div>
								</div>
							</div>

							<!-- Payment Method -->
							<div class="mb-6">
								<div class="w-full">
									<div class="label">
										<span class="label-text">Způsob platby</span>
									</div>
									<div class="flex flex-col gap-2">
										<label class="flex items-center">
											<input
												type="radio"
												name="paymentMethod"
												value="cash"
												bind:group={payment_method}
												class="mr-2"
											/>
											Hotově
										</label>
										<label class="flex items-center">
											<input
												type="radio"
												name="paymentMethod"
												value="bankNoInvoice"
												bind:group={payment_method}
												class="mr-2"
											/>
											Na účet bez faktury
										</label>
										<label class="flex items-center">
											<input
												type="radio"
												name="paymentMethod"
												value="bankWithInvoice"
												bind:group={payment_method}
												class="mr-2"
											/>
											Na účet s fakturou
										</label>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>