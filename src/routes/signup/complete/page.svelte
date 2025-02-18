<script lang="ts">
	import { enhance } from "$app/forms";
	import type { PageData } from "./$types";

	export let data: PageData;
	export let form;

	let loading = false;
	let allergies = form?.data?.allergies === true ? "yes" : "no";
	let allergiesDescription = form?.data?.allergies_description || "";
	let deliveryMethod = form?.data?.delivery_method || "";
	let paymentMethod = form?.data?.payment_method || "";

	function handleSubmit() {
		loading = true;
		return async () => {
			loading = false;
		};
	}
</script>

<svelte:head>
	<title>Šťastné srdce - Dokončení registrace</title>
	<meta name="description" content="Dokončení registrace" />
</svelte:head>

<section>
	<div class="footer_fix">
		<div class="flex flex-col max-w-md px-4 pb-2 mx-auto bg-white rounded-lg shadow pt-7 sm:px-6 md:px-8 lg:px-10">
			<div class="self-center mb-6 text-3xl font-light text-gray-800 sm:text-2xl">
				Dokončení registrace
			</div>

			<form method="POST" action="?/complete" use:enhance={handleSubmit} class="space-y-4">
				<!-- Osobní údaje -->
				<div class="space-y-4">
					<h3 class="text-lg font-medium">Osobní údaje</h3>

					<div class="flex flex-col">
						<input
							value={form?.data?.first_name ?? ""}
							type="text"
							id="name"
							name="name"
							class="input-field"
							placeholder="Jméno"
							required
						/>
					</div>

					<div class="flex flex-col">
						<input
							value={form?.data?.last_name ?? ""}
							type="text"
							id="surname"
							name="surname"
							class="input-field"
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
							value={form?.data?.street ?? ""}
							type="text"
							id="street"
							name="street"
							class="input-field"
							placeholder="Ulice"
							required
						/>
					</div>

					<div class="flex flex-col">
						<input
							value={form?.data?.street_number ?? ""}
							type="text"
							id="street_number"
							name="street_number"
							class="input-field"
							placeholder="Číslo popisné"
							required
						/>
					</div>

					<div class="flex flex-col">
						<input
							value={form?.data?.city ?? ""}
							type="text"
							id="city"
							name="city"
							class="input-field"
							placeholder="Město"
							required
						/>
					</div>

					<div class="flex flex-col">
						<input
							value={form?.data?.zip_code ?? ""}
							type="text"
							id="zip"
							name="zip"
							class="input-field"
							placeholder="PSČ"
							required
						/>
					</div>

					<div class="flex flex-col">
						<input
							value={form?.data?.telephone ?? ""}
							type="tel"
							id="telephone"
							name="telephone"
							class="input-field"
							placeholder="Telefon"
							required
						/>
					</div>
				</div>

				<!-- Alergie -->
				<div class="space-y-4">
					<h3 class="text-lg font-medium">Alergie</h3>
					<div class="flex gap-4">
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
						<div class="flex flex-col">
              <textarea
								name="allergiesDescription"
								bind:value={allergiesDescription}
								maxlength="300"
								placeholder="Popište vaše alergie (max 300 znaků)"
								class="input-field"
								rows="3"
							></textarea>
							<span class="text-sm text-gray-500 mt-1">
                Zbývá {300 - (allergiesDescription?.length || 0)} znaků
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
									name="deliveryMethod"
									{value}
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
				<div class="space-y-4">
					<h3 class="text-lg font-medium">Způsob platby</h3>
					<div class="flex flex-col gap-2">
						{#each [
							['cash', 'Hotově'],
							['bankNoInvoice', 'Na účet bez faktury'],
							['bankWithInvoice', 'Na účet s fakturou']
						] as [value,