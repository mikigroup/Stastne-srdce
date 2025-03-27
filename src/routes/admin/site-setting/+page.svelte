<script lang="ts">
	import { writable } from 'svelte/store';
	import { fade, fly } from "svelte/transition";
	import type { PageData } from './$types';

	export let data: PageData;

	// Debug - check what data contains
	console.log('Page data:', data);

	// Access supabase from data
	const { supabase, settings } = data;

	// State management
	let loading = false;
	let activeTab = 'general';
	let saveMessage = '';
	let saveMessageType: 'success'|'error'|'info' = 'success';
	let showMessage = false;

	// Structure the settings for easier editing
	function structureSettings(settingsData: any) {
		const structured: Record<string, any> = {};
		if (!settingsData) return structured;

		settingsData.forEach((item: any) => {
			try {
				// Check if value is already an object
				if (typeof item.value === 'object' && item.value !== null) {
					structured[item.key] = item.value;
				}
				// Check if value is a JSON string
				else if (typeof item.value === 'string') {
					structured[item.key] = item.value ? JSON.parse(item.value) : {};
				}
				// Fallback for other cases
				else {
					structured[item.key] = {};
				}
			} catch (e) {
				console.error(`Error processing ${item.key} settings:`, e);
				structured[item.key] = {};
			}
		});

		return structured;
	}

	// Initialize editable settings
	let editableSettings = writable(structureSettings(settings));

	// Watch for changes in data
	$: if (settings) {
		editableSettings.set(structureSettings(settings));
	}

	// Tabs configuration
	const tabs = [
		{ id: 'general', label: 'Obecné', icon: 'fa-solid fa-gear' },
		{ id: 'seo', label: 'SEO', icon: 'fa-solid fa-magnifying-glass' },
		{ id: 'contact', label: 'Kontakt', icon: 'fa-solid fa-address-book' },
		{ id: 'social', label: 'Sociální sítě', icon: 'fa-solid fa-share-nodes' },
		{ id: 'appearance', label: 'Vzhled', icon: 'fa-solid fa-palette' },
		{ id: 'business', label: 'Firemní údaje', icon: 'fa-solid fa-building' },
		{ id: 'email', label: 'Šablony e-mailů', icon: 'fa-solid fa-envelope' },
		{ id: 'integrations', label: 'Integrace', icon: 'fa-solid fa-plug' }
	];

	// Set active tab
	function setActiveTab(tabId: string) {
		activeTab = tabId;
	}

	// Save settings
	async function saveSettings() {
		loading = true;
		saveMessage = '';
		showMessage = false;

		try {
			// Save each settings category
			for (const [key, value] of Object.entries($editableSettings)) {
				const settingData = {
					key,
					value: JSON.stringify(value),
					updated_at: new Date().toISOString()
				};

				const { error } = await supabase
					.from('site_settings')
					.upsert(settingData)  // Changed from update to upsert
					.eq('key', key);

				if (error) throw error;
			}

			saveMessage = 'Nastavení byla úspěšně uložena';
			saveMessageType = 'success';
			showMessage = true;

			// Hide message after 3 seconds
			setTimeout(() => {
				showMessage = false;
			}, 3000);
		} catch (error) {
			console.error('Error saving settings:', error);
			saveMessage = 'Chyba při ukládání nastavení';
			saveMessageType = 'error';
			showMessage = true;
		} finally {
			loading = false;
		}
	}

	// Add opening hours entry
	function addOpeningHoursDay() {
		if (!$editableSettings.contact?.openingHours) {
			$editableSettings.contact = { ...$editableSettings.contact, openingHours: {} };
		}
		$editableSettings.contact.openingHours['newDay'] = '';
		$editableSettings = $editableSettings;
	}

	// Remove opening hours entry
	function removeOpeningHoursDay(day: string) {
		if ($editableSettings.contact?.openingHours?.[day]) {
			delete $editableSettings.contact.openingHours[day];
			$editableSettings = $editableSettings;
		}
	}

	// Add payment method
	function addPaymentMethod() {
		if (!$editableSettings.business?.paymentMethods) {
			$editableSettings.business = { ...$editableSettings.business, paymentMethods: [] };
		}
		$editableSettings.business.paymentMethods.push('');
		$editableSettings = $editableSettings;
	}

	// Remove payment method
	function removePaymentMethod(index: number) {
		if ($editableSettings.business?.paymentMethods && $editableSettings.business.paymentMethods.length > index) {
			$editableSettings.business.paymentMethods.splice(index, 1);
			$editableSettings = $editableSettings;
		}
	}

	// Add delivery option
	function addDeliveryOption() {
		if (!$editableSettings.business?.deliveryOptions) {
			$editableSettings.business = { ...$editableSettings.business, deliveryOptions: [] };
		}
		$editableSettings.business.deliveryOptions.push('');
		$editableSettings = $editableSettings;
	}

	// Remove delivery option
	function removeDeliveryOption(index: number) {
		if ($editableSettings.business?.deliveryOptions && $editableSettings.business.deliveryOptions.length > index) {
			$editableSettings.business.deliveryOptions.splice(index, 1);
			$editableSettings = $editableSettings;
		}
	}

	// Reset settings to defaults
	function resetSettings() {
		if (confirm('Opravdu chcete obnovit výchozí nastavení? Všechny změny budou ztraceny.')) {
			editableSettings.set(structureSettings(settings));
			saveMessage = 'Nastavení byla obnovena na původní hodnoty';
			saveMessageType = 'info';
			showMessage = true;

			setTimeout(() => {
				showMessage = false;
			}, 3000);
		}
	}
</script>

<svelte:head>
	<title>LEO - Nastavení webu</title>
</svelte:head>

<div class="p-5 bg-white rounded-lg shadow-md border border-gray-300">
	<h1 class="text-2xl font-bold mb-6">Nastavení webu</h1>

	<!-- Notification Message -->
	{#if showMessage}
		<div
			in:fade={{ duration: 300 }}
			out:fade={{ duration: 200 }}
			class="mb-4 p-4 rounded-lg border {saveMessageType === 'success' ? 'bg-green-50 border-green-300 text-green-800' : saveMessageType === 'error' ? 'bg-red-50 border-red-300 text-red-800' : 'bg-blue-50 border-blue-300 text-blue-800'}"
		>
			{saveMessage}
		</div>
	{/if}

	<!-- Tabs and Content -->
	<div class="flex flex-col md:flex-row gap-6">
		<!-- Tab Navigation -->
		<div class="md:w-1/4">
			<div class="bg-gray-100 rounded-lg p-2">
				<ul>
					{#each tabs as tab}
						<li class="mb-1">
							<button
								on:click={() => setActiveTab(tab.id)}
								class="w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center gap-2 {activeTab === tab.id ? 'bg-cyan-700 text-white' : 'hover:bg-gray-200'}"
							>
								<i class="{tab.icon}"></i>
								<span>{tab.label}</span>
							</button>
						</li>
					{/each}
				</ul>

				<!-- Action Buttons -->
				<div class="mt-6 p-4 border-t border-gray-300 space-y-3">
					<button
						on:click={saveSettings}
						disabled={loading}
						class="w-full btn btn-primary bg-green-800 text-white hover:bg-green-700"
					>
						{loading ? 'Ukládání...' : 'Uložit změny'}
					</button>

					<button
						on:click={resetSettings}
						class="w-full btn btn-outline"
					>
						Obnovit výchozí
					</button>
				</div>
			</div>
		</div>

		<!-- Tab Content -->
		<div class="md:w-3/4">
			<div class="bg-gray-50 rounded-lg p-6 border border-gray-300">
				<!-- General Settings -->
				{#if activeTab === 'general' && $editableSettings.general}
					<div in:fade={{ duration: 300 }}>
						<h2 class="text-xl font-semibold mb-4">Obecné nastavení</h2>

						<div class="space-y-4">
							<div class="form-control">
								<label class="label">
									<span class="label-text">Název obchodu</span>
								</label>
								<input
									type="text"
									bind:value={$editableSettings.general.shopName}
									class="input input-bordered w-full"
								/>
							</div>

							<div class="form-control">
								<label class="label">
									<span class="label-text">Právní název</span>
								</label>
								<input
									type="text"
									bind:value={$editableSettings.general.legalName}
									class="input input-bordered w-full"
								/>
							</div>

							<div class="form-control">
								<label class="label">
									<span class="label-text">Krátký název</span>
								</label>
								<input
									type="text"
									bind:value={$editableSettings.general.shortName}
									class="input input-bordered w-full"
								/>
							</div>

							<div class="form-control">
								<label class="label">
									<span class="label-text">Slogan</span>
								</label>
								<input
									type="text"
									bind:value={$editableSettings.general.slogan}
									class="input input-bordered w-full"
								/>
							</div>
						</div>
					</div>
				{/if}

				<!-- SEO Settings -->
				{#if activeTab === 'seo' && $editableSettings.seo}
					<div in:fade={{ duration: 300 }}>
						<h2 class="text-xl font-semibold mb-4">SEO nastavení</h2>

						<div class="space-y-4">
							<div class="form-control">
								<label class="label">
									<span class="label-text">Meta titulek</span>
								</label>
								<input
									type="text"
									bind:value={$editableSettings.seo.metaTitle}
									class="input input-bordered w-full"
								/>
							</div>

							<div class="form-control">
								<label class="label">
									<span class="label-text">Meta popis</span>
								</label>
								<textarea
									bind:value={$editableSettings.seo.metaDescription}
									class="textarea textarea-bordered w-full h-24"
								></textarea>
							</div>

							<div class="form-control">
								<label class="label">
									<span class="label-text">Meta klíčová slova</span>
								</label>
								<textarea
									bind:value={$editableSettings.seo.metaKeywords}
									class="textarea textarea-bordered w-full h-24"
									placeholder="Klíčová slova oddělená čárkami"
								></textarea>
							</div>

							<div class="form-control">
								<label class="label">
									<span class="label-text">OG obrázek (URL)</span>
								</label>
								<input
									type="text"
									bind:value={$editableSettings.seo.ogImage}
									class="input input-bordered w-full"
								/>
							</div>

							<div class="form-control">
								<label class="label">
									<span class="label-text">Google Analytics ID</span>
								</label>
								<input
									type="text"
									bind:value={$editableSettings.seo.googleAnalyticsId}
									class="input input-bordered w-full"
									placeholder="např. G-XXXXXXXXXX"
								/>
							</div>
						</div>
					</div>
				{/if}

				<!-- Contact Settings -->
				{#if activeTab === 'contact' && $editableSettings.contact}
					<div in:fade={{ duration: 300 }}>
						<h2 class="text-xl font-semibold mb-4">Kontaktní údaje</h2>

						<div class="space-y-4">
							<div class="form-control">
								<label class="label">
									<span class="label-text">E-mail</span>
								</label>
								<input
									type="email"
									bind:value={$editableSettings.contact.email}
									class="input input-bordered w-full"
								/>
							</div>

							<div class="form-control">
								<label class="label">
									<span class="label-text">Telefon</span>
								</label>
								<input
									type="tel"
									bind:value={$editableSettings.contact.phone}
									class="input input-bordered w-full"
								/>
							</div>

							<div class="form-control">
								<label class="label">
									<span class="label-text">Adresa</span>
								</label>
								<textarea
									bind:value={$editableSettings.contact.address}
									class="textarea textarea-bordered w-full"
								></textarea>
							</div>

							<div class="form-control">
								<label class="label">
									<span class="label-text">Souřadnice na mapě</span>
								</label>
								<div class="grid grid-cols-2 gap-4">
									<div>
										<label class="label">
											<span class="label-text">Zeměpisná šířka (Lat)</span>
										</label>
										<input
											type="number"
											step="0.000001"
											bind:value={$editableSettings.contact.mapCoordinates.lat}
											class="input input-bordered w-full"
										/>
									</div>
									<div>
										<label class="label">
											<span class="label-text">Zeměpisná délka (Lng)</span>
										</label>
										<input
											type="number"
											step="0.000001"
											bind:value={$editableSettings.contact.mapCoordinates.lng}
											class="input input-bordered w-full"
										/>
									</div>
								</div>
							</div>

							<div class="form-control">
								<label class="label mb-2">
									<span class="label-text">Otevírací doba</span>
								</label>

								{#if $editableSettings.contact.openingHours}
									{#each Object.entries($editableSettings.contact.openingHours) as [day, hours]}
										<div class="flex gap-2 items-center mb-2">
											<input
												type="text"
												bind:value={day}
												class="input input-bordered w-1/3"
												placeholder="Den"
											/>
											<input
												type="text"
												bind:value={$editableSettings.contact.openingHours[day]}
												class="input input-bordered w-2/3"
												placeholder="Hodiny (např. 8:00-16:00)"
											/>
											<button
												on:click={() => removeOpeningHoursDay(day)}
												class="btn btn-circle btn-sm btn-error"
												type="button"
											>
												<i class="fas fa-trash"></i>
											</button>
										</div>
									{/each}
								{/if}

								<button
									on:click={addOpeningHoursDay}
									class="btn btn-outline btn-sm mt-2"
									type="button"
								>
									<i class="fas fa-plus mr-2"></i> Přidat den
								</button>
							</div>
						</div>
					</div>
				{/if}

				<!-- Social Media Settings -->
				{#if activeTab === 'social' && $editableSettings.social}
					<div in:fade={{ duration: 300 }}>
						<h2 class="text-xl font-semibold mb-4">Sociální sítě</h2>

						<div class="space-y-4">
							<div class="form-control">
								<label class="label">
									<span class="label-text">Facebook URL</span>
								</label>
								<input
									type="url"
									bind:value={$editableSettings.social.facebook}
									class="input input-bordered w-full"
									placeholder="https://facebook.com/vasestanka"
								/>
							</div>

							<div class="form-control">
								<label class="label">
									<span class="label-text">Instagram URL</span>
								</label>
								<input
									type="url"
									bind:value={$editableSettings.social.instagram}
									class="input input-bordered w-full"
									placeholder="https://instagram.com/vasestanka"
								/>
							</div>

							<div class="form-control">
								<label class="label">
									<span class="label-text">Twitter URL</span>
								</label>
								<input
									type="url"
									bind:value={$editableSettings.social.twitter}
									class="input input-bordered w-full"
									placeholder="https://twitter.com/vasestanka"
								/>
							</div>

							<div class="form-control">
								<label class="label">
									<span class="label-text">LinkedIn URL</span>
								</label>
								<input
									type="url"
									bind:value={$editableSettings.social.linkedin}
									class="input input-bordered w-full"
									placeholder="https://linkedin.com/company/vasestanka"
								/>
							</div>

							<div class="form-control">
								<label class="label">
									<span class="label-text">YouTube URL</span>
								</label>
								<input
									type="url"
									bind:value={$editableSettings.social.youtube}
									class="input input-bordered w-full"
									placeholder="https://youtube.com/c/vasestanka"
								/>
							</div>
						</div>
					</div>
				{/if}

				<!-- Appearance Settings -->
				{#if activeTab === 'appearance' && $editableSettings.appearance}
					<div in:fade={{ duration: 300 }}>
						<h2 class="text-xl font-semibold mb-4">Vzhled</h2>

						<div class="space-y-4">
							<div class="form-control">
								<label class="label">
									<span class="label-text">Logo URL</span>
								</label>
								<input
									type="text"
									bind:value={$editableSettings.appearance.logo}
									class="input input-bordered w-full"
								/>
								{#if $editableSettings.appearance.logo}
									<div class="mt-2">
										<img
											src={$editableSettings.appearance.logo}
											alt="Logo"
											class="h-16 object-contain"
										/>
									</div>
								{/if}
							</div>

							<div class="form-control">
								<label class="label">
									<span class="label-text">Favicon URL</span>
								</label>
								<input
									type="text"
									bind:value={$editableSettings.appearance.favicon}
									class="input input-bordered w-full"
								/>
								{#if $editableSettings.appearance.favicon}
									<div class="mt-2">
										<img
											src={$editableSettings.appearance.favicon}
											alt="Favicon"
											class="h-8 object-contain"
										/>
									</div>
								{/if}
							</div>

							<div class="form-control">
								<label class="label">
									<span class="label-text">Text v patičce</span>
								</label>
								<input
									type="text"
									bind:value={$editableSettings.appearance.footerText}
									class="input input-bordered w-full"
								/>
							</div>

							<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div class="form-control">
									<label class="label">
										<span class="label-text">Primární barva</span>
									</label>
									<div class="flex gap-2">
										<input
											type="color"
											bind:value={$editableSettings.appearance.primaryColor}
											class="w-12 h-12 cursor-pointer rounded-md"
										/>
										<input
											type="text"
											bind:value={$editableSettings.appearance.primaryColor}
											class="input input-bordered w-full"
										/>
									</div>
								</div>

								<div class="form-control">
									<label class="label">
										<span class="label-text">Sekundární barva</span>
									</label>
									<div class="flex gap-2">
										<input
											type="color"
											bind:value={$editableSettings.appearance.secondaryColor}
											class="w-12 h-12 cursor-pointer rounded-md"
										/>
										<input
											type="text"
											bind:value={$editableSettings.appearance.secondaryColor}
											class="input input-bordered w-full"
										/>
									</div>
								</div>
							</div>
						</div>
					</div>
				{/if}

				<!-- Business Settings -->
				{#if activeTab === 'business' && $editableSettings.business}
					<div in:fade={{ duration: 300 }}>
						<h2 class="text-xl font-semibold mb-4">Firemní údaje</h2>

						<div class="space-y-4">
							<div class="form-control">
								<label class="label">
									<span class="label-text">IČO</span>
								</label>
								<input
									type="text"
									bind:value={$editableSettings.business.ico}
									class="input input-bordered w-full"
								/>
							</div>

							<div class="form-control">
								<label class="label">
									<span class="label-text">DIČ</span>
								</label>
								<input
									type="text"
									bind:value={$editableSettings.business.dic}
									class="input input-bordered w-full"
								/>
							</div>

							<div class="form-control">
								<label class="label">
									<span class="label-text">Bankovní účet</span>
								</label>
								<input
									type="text"
									bind:value={$editableSettings.business.bankAccount}
									class="input input-bordered w-full"
								/>
							</div>

							<div class="form-control">
								<label class="label mb-2">
									<span class="label-text">Platební metody</span>
								</label>

								{#if $editableSettings.business.paymentMethods}
									{#each $editableSettings.business.paymentMethods as method, index}
										<div class="flex gap-2 items-center mb-2">
											<input
												type="text"
												bind:value={$editableSettings.business.paymentMethods[index]}
												class="input input-bordered w-full"
												placeholder="Název platební metody"
											/>
											<button
												on:click={() => removePaymentMethod(index)}
												class="btn btn-circle btn-sm btn-error"
												type="button"
											>
												<i class="fas fa-trash"></i>
											</button>
										</div>
									{/each}
								{/if}

								<button
									on:click={addPaymentMethod}
									class="btn btn-outline btn-sm mt-2"
									type="button"
								>
									<i class="fas fa-plus mr-2"></i> Přidat platební metodu
								</button>
							</div>

							<div class="form-control">
								<label class="label mb-2">
									<span class="label-text">Způsoby doručení</span>
								</label>

								{#if $editableSettings.business.deliveryOptions}
									{#each $editableSettings.business.deliveryOptions as option, index}
										<div class="flex gap-2 items-center mb-2">
											<input
												type="text"
												bind:value={$editableSettings.business.deliveryOptions[index]}
												class="input input-bordered w-full"
												placeholder="Způsob doručení"
											/>
											<button
												on:click={() => removeDeliveryOption(index)}
												class="btn btn-circle btn-sm btn-error"
												type="button"
											>
												<i class="fas fa-trash"></i>
											</button>
										</div>
									{/each}
								{/if}

								<button
									on:click={addDeliveryOption}
									class="btn btn-outline btn-sm mt-2"
									type="button"
								>
									<i class="fas fa-plus mr-2"></i> Přidat způsob doručení
								</button>
							</div>
						</div>
					</div>
				{/if}

				<!-- Email Templates Settings -->
				{#if activeTab === 'email' && $editableSettings.email}
					<div in:fade={{ duration: 300 }}>
						<h2 class="text-xl font-semibold mb-4">Šablony e-mailů</h2>

						<div class="space-y-4">
							<div class="form-control">
								<label class="label">
									<span class="label-text">Šablona potvrzení objednávky</span>
								</label>
								<textarea
									bind:value={$editableSettings.email.orderConfirmationTemplate}
									class="textarea textarea-bordered w-full h-32"
									placeholder="Použijte {{orderNumber}} pro vložení čísla objednávky."
								></textarea>
								<span class="text-xs text-gray-500 mt-1">
									Můžete použít {{orderNumber}} pro vložení čísla objednávky.
								</span>
							</div>

							<div class="form-control">
								<label class="label">
									<span class="label-text">Šablona kontaktního formuláře</span>
								</label>
								<textarea
									bind:value={$editableSettings.email.contactFormTemplate}
									class="textarea textarea-bordered w-full h-32"
								></textarea>
							</div>
						</div>
					</div>
				{/if}

				<!-- Integrations Settings -->
				{#if activeTab === 'integrations' && $editableSettings.integrations}
					<div in:fade={{ duration: 300 }}>
						<h2 class="text-xl font-semibold mb-4">Integrace</h2>

						<div class="space-y-4">
							<div class="form-control">
								<label class="label">
									<span class="label-text">Facebook Pixel ID</span>
								</label>
								<input
									type="text"
									bind:value={$editableSettings.integrations.facebookPixelId}
									class="input input-bordered w-full"
								/>
							</div>

							<div class="form-control">
								<label class="label">
									<span class="label-text">reCAPTCHA Site Key</span>
								</label>
								<input
									type="text"
									bind:value={$editableSettings.integrations.recaptchaSiteKey}
									class="input input-bordered w-full"
								/>
							</div>

							<div class="form-control">
								<label class="label">
									<span class="label-text">reCAPTCHA Secret Key</span>
								</label>
								<input
									type="text"
									bind:value={$editableSettings.integrations.recaptchaSecretKey}
									class="input input-bordered w-full"
								/>
							</div>

							<div class="form-control">
								<label class="label cursor-pointer justify-start gap-2">
									<input
										type="checkbox"
										bind:checked={$editableSettings.integrations.cookieConsentEnabled}
										class="checkbox"
									/>
									<span class="label-text">Povolit souhlas s cookies</span>
								</label>
							</div>
						</div>
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>