<script lang="ts">
	import { enhance } from "$app/forms";
	import type { PageData } from "./$types";
	import { goto } from "$app/navigation";
	import { validateProfileForInvoicing, getProfileValidationMessage } from '$lib/utils/profileValidation';

	export let data: PageData;
	export let form: {
		first_name?: string;
		last_name?: string;
		street?: string;
		street_number?: string;
		city?: string;
		zip_code?: string;
		telephone?: string;
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
	} = {};

	let loading = false;
	let first_name = form?.first_name ?? data.profile?.first_name ?? "";
	let last_name = form?.last_name ?? data.profile?.last_name ?? "";
	let street = form?.street ?? data.profile?.street ?? "";
	let street_number = form?.street_number ?? data.profile?.street_number ?? "";
	let city = form?.city ?? data.profile?.city ?? "";
	let zip_code = form?.zip_code ?? data.profile?.zip_code ?? "";
	let telephone = form?.telephone ?? data.profile?.telephone ?? "";
	let company = form?.company ?? data.profile?.company ?? "";
	let ico = form?.ico ?? data.profile?.ico ?? "";
	let dic = form?.dic ?? data.profile?.dic ?? "";
	let allergies = form?.allergies ? "yes" : data.profile?.allergies ? "yes" : "no";
	let allergiesDescription = form?.allergies_description ?? data.profile?.allergies_description ?? "";
	let deliveryMethod = form?.delivery_method ?? data.profile?.delivery_method ?? "";
	let paymentMethod = form?.payment_method ?? data.profile?.payment_method ?? "";
	let profileValidationMessage = '';

	function toggleAllergies(value: string) {
		allergies = value;
	}

	function handleSubmit() {
		loading = true;
		return async ({ result }: { result: { type: string } }) => {
			if (result.type === 'success') {
				await goto('/profile');
			}
			loading = false;
		};
	}

	const { generalSettings } = data;

	$: {
		const validationResult = validateProfileForInvoicing({
			first_name,
			last_name,
			street,
			street_number,
			city,
			zip_code,
			email: data.session?.user?.email,
			company,
			ico,
			dic
		});
		profileValidationMessage = getProfileValidationMessage(validationResult);
	}
</script>

<svelte:head>
	<title>{generalSettings?.shopName ?? 'Dokončení registrace'}</title>
	<meta name="description" content="Dokončení registrace" />
</svelte:head>

<section>
	<div class="footer_fix mt-5">
		<div class="flex flex-col max-w-md px-4 mx-auto rounded-lg shadow p-10 sm:px-6 md:px-8 lg:px-10 border border-gray-300 bg-stone-100">
			<div class="self-center mb-6 text-3xl font-light text-gray-800 sm:text-2xl">
				Dokončení registrace
			</div>

			{#if profileValidationMessage}
				<div class="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
					<p class="text-yellow-800">
						<span class="font-medium">Upozornění:</span> {profileValidationMessage}
					</p>
				</div>
			{/if}

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

				<!-- Dodací adresa -->
				<div class="space-y-4">
					<h3 class="text-lg font-medium">Dodací adresa</h3>

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

				<!-- Alergie -->
				<div class="space-y-4 py-5">
					<h3 class="text-lg font-medium">Alergie</h3>
					<div class="flex gap-4">
						<label class="flex items-center">
							<input
								type="radio"
								name="allergies"
								value="no"
								checked={allergies === "no"}
								on:change={() => toggleAllergies("no")}
								class="mr-2"
							/>
							Ne
						</label>
						<label class="flex items-center">
							<input
								type="radio"
								name="allergies"
								value="yes"
								checked={allergies === "yes"}
								on:change={() => toggleAllergies("yes")}
								class="mr-2"
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

				<!-- Způsob dodání -->
				<div class="space-y-4">
					<h3 class="text-lg font-medium">Způsob dodání</h3>
					<div class="flex flex-col gap-2">
						{#each [
							['own', 'Vlastní nosič'],
							['reBox', 'REkrabička (záloha 160 Kč za set/80 Kč za jednu)'],
							['menuBox', 'Menu Box (12 Kč/kus)']
						] as [value, label]}
							<label class="flex items-center">
								<input
									type="radio"
									name="delivery_method"
									value={value}
									bind:group={deliveryMethod}
									class="mr-2"
									required
								/>
								{label}
							</label>
						{/each}
					</div>
				</div>

				<!-- Způsob platby -->
				<div class="space-y-4 py-5">
					<h3 class="text-lg font-medium">Způsob platby</h3>
					<div class="flex flex-col gap-2">
						{#each [
							['cash', 'Hotově'],
							['bankNoInvoice', 'Na účet bez faktury'],
							['bankWithInvoice', 'Na účet s fakturou']
						] as [value, label]}
							<label class="flex items-center">
								<input
									type="radio"
									name="payment_method"
									value={value}
									checked={paymentMethod === value}
									class="mr-2"
									required
								/>
								{label}
							</label>
						{/each}
					</div>
				</div>

				<!-- Submit button -->
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
		</div>
	</div>
</section>