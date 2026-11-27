<script lang="ts">
	import { enhance } from "$app/forms";
	import type { PageData } from "./$types";
	import { goto } from "$app/navigation";

	import { ROUTES } from "$lib/constants/routes";

	interface Props {
		data: PageData;
		form?: {
		first_name?: string;
		last_name?: string;
		street?: string;
		street_number?: string;
		city?: string;
		zip_code?: string;
		telephone?: string;
		separate_delivery?: string;
		delivery_first_name?: string;
		delivery_last_name?: string;
		delivery_telephone?: string;
		delivery_street?: string;
		delivery_street_number?: string;
		delivery_city?: string;
		delivery_zip_code?: string;
		allergies?: boolean;
		allergies_description?: string;
		delivery_method?: string;
		payment_method?: string;
		message?: {
			success: boolean;
			display: string;
		};
		company?: string;
		ico?: string;
		dic?: string;
	};
	}

	let { data, form = {} }: Props = $props();

	let loading = $state(false);
	let first_name = $state(form?.first_name ?? data.profile?.first_name ?? "");
	let last_name = $state(form?.last_name ?? data.profile?.last_name ?? "");
	let street = $state(form?.street ?? data.profile?.street ?? "");
	let street_number = $state(form?.street_number ?? data.profile?.street_number ?? "");
	let city = $state(form?.city ?? data.profile?.city ?? "");
	let zip_code = $state(form?.zip_code ?? data.profile?.zip_code ?? "");
	let telephone = $state(form?.telephone ?? data.profile?.telephone ?? "");
	let separateDelivery = $state(
		form?.separate_delivery === "yes" || Boolean(form?.delivery_street ?? data.profile?.delivery_street)
	);
	let delivery_first_name = $state(form?.delivery_first_name ?? data.profile?.delivery_first_name ?? "");
	let delivery_last_name = $state(form?.delivery_last_name ?? data.profile?.delivery_last_name ?? "");
	let delivery_telephone = $state(form?.delivery_telephone ?? data.profile?.delivery_telephone ?? "");
	let delivery_street = $state(form?.delivery_street ?? data.profile?.delivery_street ?? "");
	let delivery_street_number = $state(
		form?.delivery_street_number ?? data.profile?.delivery_street_number ?? ""
	);
	let delivery_city = $state(form?.delivery_city ?? data.profile?.delivery_city ?? "");
	let delivery_zip_code = $state(form?.delivery_zip_code ?? data.profile?.delivery_zip_code ?? "");
	let company = form?.company ?? data.profile?.company ?? "";
	let ico = form?.ico ?? data.profile?.ico ?? "";
	let dic = form?.dic ?? data.profile?.dic ?? "";
	let allergies = $state(form?.allergies ? "yes" : data.profile?.allergies ? "yes" : "no");
	let allergiesDescription = $state(form?.allergies_description ?? data.profile?.allergies_description ?? "");
	let deliveryMethod = $state(form?.delivery_method ?? data.profile?.delivery_method ?? "");
	let paymentMethod = $state(form?.payment_method ?? data.profile?.payment_method ?? "");

	// Delivery i payment options jsou načteny z databáze v +page.server.ts
	// (site_settings je zdroj pravdy). Žádný hardcode fallback – při chybějících
	// datech radši nezobrazíme žádnou volbu, než abychom nabízeli neaktuální metody.
	let deliveryMethodOptions = $derived((data as any).deliveryMethodOptions || []);
	let paymentMethodOptions = $derived((data as any).paymentMethodOptions || []);

	function toggleAllergies(value: string) {
		allergies = value;
	}

	function handleSubmit() {
		loading = true;
		return async ({ result }: { result: any }) => {
			
			// Zjednodušená kontrola - pokud není failure, považujeme za úspěch
			if (result.type !== 'failure') {
				await goto(ROUTES.MAIN.PROFILE);
			}
			loading = false;
		};
	}
</script>

<section>
	<div class="footer_fix mt-5">
		<div class="flex flex-col max-w-md px-4 mx-auto rounded-lg shadow p-10 sm:px-6 md:px-8 lg:px-10 border border-gray-300 bg-stone-100">
			<div class="self-center mb-6 text-3xl font-light text-gray-800 sm:text-2xl">
				Dokončení registrace
			</div>

			{#if !data.session}
				<!-- Zobrazení pro uživatele bez session -->
				<div class="text-center space-y-4">
					<div class="p-4 bg-blue-50 border border-blue-200 rounded-lg">
						<p class="text-blue-800">
							<span class="font-medium">Registrace byla úspěšná!</span><br>
							Pro dokončení registrace se prosím přihlaste.
						</p>
					</div>
					
					<div class="space-y-3">
						<a 
							href={ROUTES.AUTH.LOGIN} 
							class="w-full px-4 py-2 text-base font-semibold text-center text-white transition duration-200 ease-in-out transform bg-green-800 rounded-lg shadow-md hover:scale-105"
						>
							Přihlásit se
						</a>
						
						<p class="text-sm text-gray-600">
							Po přihlášení budete přesměrováni na dokončení registrace.
						</p>
					</div>
				</div>
			{:else}
				<!-- Zobrazení pro přihlášené uživatele -->

				<form method="POST" action="?/complete" use:enhance={handleSubmit} class="space-y-4">
				<!-- Osobní údaje -->
				<div class="space-y-4 pt-5">
					<h3 class="text-lg font-medium">Osobní údaje</h3>

					<div class="flex flex-col">
						<input
							bind:value={first_name}
							type="text"
							id="first_name"
							name="first_name"
							class="w-full px-4 py-2 text-base text-gray-700 placeholder-gray-400 bg-white border border-gray-300 rounded-lg shadow-sm appearance-none focus:outline-none focus:border-green-600"
							placeholder="Jméno"
							required
						/>
					</div>

					<div class="flex flex-col">
						<input
							bind:value={last_name}
							type="text"
							id="last_name"
							name="last_name"
							class="w-full px-4 py-2 text-base text-gray-700 placeholder-gray-400 bg-white border border-gray-300 rounded-lg shadow-sm appearance-none focus:outline-none focus:border-green-600"
							placeholder="Příjmení"
							required
						/>
					</div>
				</div>
				
				<div class="space-y-4">
					<h3 class="text-lg font-medium">Fakturační adresa</h3>
					<p class="text-xs text-gray-500">Toto je zároveň výchozí doručovací adresa.</p>

					<div class="flex flex-col">
						<input
							bind:value={street}
							type="text"
							id="street"
							name="street"
							class="w-full px-4 py-2 text-base text-gray-700 placeholder-gray-400 bg-white border border-gray-300 rounded-lg shadow-sm appearance-none focus:outline-none focus:border-green-600"
							placeholder="Ulice"
							required
						/>
					</div>

					<div class="flex flex-col">
						<input
							bind:value={street_number}
							type="text"
							id="street_number"
							name="street_number"
							class="w-full px-4 py-2 text-base text-gray-700 placeholder-gray-400 bg-white border border-gray-300 rounded-lg shadow-sm appearance-none focus:outline-none focus:border-green-600"
							placeholder="Číslo popisné"
							required
						/>
					</div>

					<div class="flex flex-col">
						<input
							bind:value={city}
							type="text"
							id="city"
							name="city"
							class="w-full px-4 py-2 text-base text-gray-700 placeholder-gray-400 bg-white border border-gray-300 rounded-lg shadow-sm appearance-none focus:outline-none focus:border-green-600"
							placeholder="Město"
							required
						/>
					</div>

					<div class="flex flex-col">
						<input
							bind:value={zip_code}
							type="text"
							id="zip_code"
							name="zip_code"
							class="w-full px-4 py-2 text-base text-gray-700 placeholder-gray-400 bg-white border border-gray-300 rounded-lg shadow-sm appearance-none focus:outline-none focus:border-green-600"
							placeholder="PSČ"
							required
						/>
					</div>

					<div class="flex flex-col">
						<input
							bind:value={telephone}
							type="tel"
							id="telephone"
							name="telephone"
							class="w-full px-4 py-2 text-base text-gray-700 placeholder-gray-400 bg-white border border-gray-300 rounded-lg shadow-sm appearance-none focus:outline-none focus:border-green-600"
							placeholder="Telefon"
							required
						/>
					</div>
				</div>

				<details class="rounded-lg border border-gray-300 bg-white px-4 py-3" bind:open={separateDelivery}>
					<summary class="cursor-pointer text-lg font-medium text-gray-800">Jiná dodací adresa</summary>
					<p class="mt-2 text-sm text-gray-600">Volitelné. Vyplňte ji, jen když se obědy vozí jinam než na fakturační adresu.</p>
					{#if separateDelivery}
						<input type="hidden" name="separate_delivery" value="yes" />
						<div class="mt-4 space-y-4">
							<input bind:value={delivery_first_name} name="delivery_first_name" type="text" autocomplete="shipping name" placeholder="Jméno příjemce" class="w-full px-4 py-2 text-base text-gray-700 placeholder-gray-400 bg-white border border-gray-300 rounded-lg shadow-sm appearance-none focus:outline-none focus:border-green-600" />
							<input bind:value={delivery_last_name} name="delivery_last_name" type="text" autocomplete="shipping family-name" placeholder="Příjmení příjemce" class="w-full px-4 py-2 text-base text-gray-700 placeholder-gray-400 bg-white border border-gray-300 rounded-lg shadow-sm appearance-none focus:outline-none focus:border-green-600" />
							<input bind:value={delivery_telephone} name="delivery_telephone" type="tel" autocomplete="shipping tel" placeholder="Telefon příjemce" class="w-full px-4 py-2 text-base text-gray-700 placeholder-gray-400 bg-white border border-gray-300 rounded-lg shadow-sm appearance-none focus:outline-none focus:border-green-600" />
							<input bind:value={delivery_street} name="delivery_street" type="text" autocomplete="shipping address-line1" placeholder="Ulice" class="w-full px-4 py-2 text-base text-gray-700 placeholder-gray-400 bg-white border border-gray-300 rounded-lg shadow-sm appearance-none focus:outline-none focus:border-green-600" />
							<input bind:value={delivery_street_number} name="delivery_street_number" type="text" autocomplete="shipping address-line2" placeholder="Číslo popisné" class="w-full px-4 py-2 text-base text-gray-700 placeholder-gray-400 bg-white border border-gray-300 rounded-lg shadow-sm appearance-none focus:outline-none focus:border-green-600" />
							<input bind:value={delivery_city} name="delivery_city" type="text" autocomplete="shipping address-level2" placeholder="Město" class="w-full px-4 py-2 text-base text-gray-700 placeholder-gray-400 bg-white border border-gray-300 rounded-lg shadow-sm appearance-none focus:outline-none focus:border-green-600" />
							<input bind:value={delivery_zip_code} name="delivery_zip_code" type="text" autocomplete="shipping postal-code" inputmode="numeric" placeholder="PSČ" class="w-full px-4 py-2 text-base text-gray-700 placeholder-gray-400 bg-white border border-gray-300 rounded-lg shadow-sm appearance-none focus:outline-none focus:border-green-600" />
						</div>
					{/if}
				</details>
			
				<div class="space-y-4 py-5">
					<h3 class="text-lg font-medium">Alergie <span class="text-red-500">*</span></h3>
					<div class="flex gap-4">
						<label class="flex items-center">
							<input
								type="radio"
								name="allergies"
								value="no"
								checked={allergies === "no"}
								onchange={() => toggleAllergies("no")}
								class="mr-2"
								required
							/>
							Ne
						</label>
						<label class="flex items-center">
							<input
								type="radio"
								name="allergies"
								value="yes"
								checked={allergies === "yes"}
								onchange={() => toggleAllergies("yes")}
								class="mr-2"
								required
							/>
							Ano
						</label>
					</div>

					{#if allergies === "yes"}
						<div class="flex flex-col">
							<textarea
								name="allergies_description"
								bind:value={allergiesDescription}
								maxlength="300"
								placeholder="Popište vaše alergie (max 300 znaků)"
								class="w-full px-4 py-2 text-base text-gray-700 placeholder-gray-400 bg-white border border-gray-300 rounded-lg shadow-sm appearance-none focus:outline-none focus:border-green-600"
								rows="3"
							></textarea>
							<span class="text-sm text-gray-500 mt-1">
								Zbývá {300 - allergiesDescription.length} znaků
							</span>
						</div>
					{/if}
				</div>
				
				<div class="space-y-4">
					<h3 class="text-lg font-medium">Způsob dodání</h3>
					<div class="flex flex-col gap-2">
						{#each deliveryMethodOptions as option}
							<label class="flex items-center">
								<input
									type="radio"
									name="delivery_method"
									value={option.value}
									bind:group={deliveryMethod}
									class="mr-2"
									required
								/>
								{option.label}
							</label>
						{/each}
					</div>
				</div>
				
				<div class="space-y-4 py-5">
					<h3 class="text-lg font-medium">Způsob platby</h3>
					<div class="flex flex-col gap-2">
						{#each paymentMethodOptions as option}
							<label class="flex items-center">
								<input
									type="radio"
									name="payment_method"
									value={option.value}
									bind:group={paymentMethod}
									class="mr-2"
									required
								/>
								{option.label}
							</label>
						{/each}
					</div>
				</div>
				
				<div class="flex w-full mt-8">
					<button
						type="submit"
						class="w-full px-4 py-2 text-base font-semibold text-center text-white transition duration-200 ease-in-out transform bg-green-800 rounded-lg shadow-md hover:scale-105 disabled:opacity-50"
						disabled={loading}
					>
						{loading ? "Ukládám..." : "Dokončit registraci"}
					</button>
				</div>

				{#if form?.message}
					<div class="rounded-md p-4" class:bg-red-50={!form.message.success} class:bg-green-50={form.message.success}>
						<p class="text-sm" class:text-red-700={!form.message.success} class:text-green-700={form.message.success}>
							{form.message.display}
						</p>
					</div>
				{/if}
				</form>
			{/if}
		</div>
	</div>
</section>