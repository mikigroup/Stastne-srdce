<script lang="ts">
	import { writable } from 'svelte/store';
	import { fade, fly } from "svelte/transition";
	import type { PageData } from './$types';
	import { enhance } from "$app/forms";
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';

	export let data: PageData;

	type FormData = {
		message?: {
			success: boolean;
			display: string;
		};
	};

	export let form: FormData | null = null;

	// State management
	let loading = false;
	let activeTab = 'general';
	let saveMessage = '';
	let saveMessageType: 'success'|'error'|'info' = 'success';
	let showMessage = false;
	let loadingTab = false;

	// Cache management
	const CACHE_KEY = 'site_settings_cache';
	const CACHE_DURATION = 5 * 60 * 1000; // 5 minut

	// Funkce pro práci s cache
	function getCachedSettings() {
		if (!browser) return null;
		
		try {
			const cached = localStorage.getItem(CACHE_KEY);
			if (!cached) return null;
			
			const { data, timestamp } = JSON.parse(cached);
			
			// Zkontrolujeme, zda cache není starší než CACHE_DURATION
			if (Date.now() - timestamp > CACHE_DURATION) {
				localStorage.removeItem(CACHE_KEY);
				return null;
			}
			
			return data;
		} catch (e) {
			console.error('Chyba při čtení cache:', e);
			return null;
		}
	}

	function setCachedSettings(settings: any) {
		if (!browser) return;
		
		try {
			localStorage.setItem(CACHE_KEY, JSON.stringify({
				data: settings,
				timestamp: Date.now()
			}));
		} catch (e) {
			console.error('Chyba při ukládání do cache:', e);
		}
	}

	function clearCache() {
		if (!browser) return;
		localStorage.removeItem(CACHE_KEY);
	}

	// Zpracování OAuth úspěchu a chyb
	onMount(() => {
		const success = $page.url.searchParams.get('success');
		const error = $page.url.searchParams.get('error');
		const message = $page.url.searchParams.get('message');
		const tab = $page.url.searchParams.get('tab');
		
		// Automatické přepnutí na zadanou záložku
		if (tab && ['general', 'seo', 'contact', 'social', 'appearance', 'business', 'email', 'integrations', 'zakazky', 'doprava', 'products', 'customer', 'inventory'].includes(tab)) {
			activeTab = tab;
		}
		
		if (success === 'fakturoid_connected') {
			activeTab = 'integrations';
			saveMessage = 'Fakturoid byl úspěšně připojen přes OAuth!';
			saveMessageType = 'success';
			showMessage = true;
			
			// Vyčistíme URL parametry
			const url = new URL(window.location.href);
			url.searchParams.delete('success');
			window.history.replaceState({}, '', url.toString());
			
			setTimeout(() => {
				showMessage = false;
			}, 5000);
		} else if (error) {
			activeTab = 'integrations';
			
			// Mapování chybových kódů na uživatelsky přívětivé zprávy
			const errorMessages: Record<string, string> = {
				'oauth_state_mismatch': 'Chyba ověření OAuth stavu. Zkuste to prosím znovu.',
				'missing_oauth_params': 'Chybí OAuth parametry. Zkuste připojení znovu.',
				'invalid_state_format': 'Neplatný formát OAuth stavu.',
				'token_request_failed': 'Nepodařilo se získat přístupový token od Fakturoid.',
				'user_info_failed': 'Nepodařilo se načíst informace o uživateli z Fakturoid.',
				'token_save_failed': 'Nepodařilo se uložit přístupový token do databáze.',
				'settings_update_failed': 'Nepodařilo se aktualizovat nastavení integrace.',
				'callback_failed': 'Obecná chyba při OAuth callback.'
			};
			
			saveMessage = errorMessages[error] || (message ? decodeURIComponent(message) : 'Neznámá chyba při připojování Fakturoid účtu.');
			saveMessageType = 'error';
			showMessage = true;
			
			// Vyčistíme URL parametry
			const url = new URL(window.location.href);
			url.searchParams.delete('error');
			url.searchParams.delete('message');
			window.history.replaceState({}, '', url.toString());
			
			setTimeout(() => {
				showMessage = false;
			}, 8000);
		}
	});

	// Get settings from data or cache
	let settings = data.settings;
	
	// Zkusíme načíst z cache při prvním načtení
	onMount(() => {
		const cached = getCachedSettings();
		if (cached && cached.length > 0) {
			settings = cached;
			editableSettings.set(structureSettings(cached));
		}
	});
	
	$: settings = data.settings;
	$: if (settings && settings.length > 0) {
		setCachedSettings(settings);
	}

	// Výchozí hodnoty pro každou sekci
	const DEFAULT_VALUES = {
		general: {
			shopName: '',
			shortName: '',
			legalName: ''
		},
		seo: {
			metaTitle: '',
			metaDescription: '',
			metaKeywords: '',
			ogImage: '',
			googleAnalyticsId: ''
		},
		contact: {
			email: '',
			phone: '',
			address: '',
			mapCoordinates: { lat: 0, lng: 0 },
			openingHours: {}
		},
		social: {
			facebook: '',
			instagram: '',
			twitter: '',
			linkedin: '',
			youtube: ''
		},
		appearance: {
			logo: '',
			favicon: '',
			primaryColor: '#10b981',
			secondaryColor: '#3b82f6',
			footerText: ''
		},
		business: {
			companyName: '',
			street: '',
			streetNumber: '',
			zipCode: '',
			city: '',
			ico: '',
			dic: '',
			bankAccount: ''
		},
		email: {
			orderConfirmationTemplate: '',
			contactFormTemplate: ''
		},
		integrations: {
			fakturoidEnabled: false,
			fakturoidConnected: false,
			fakturoidAccountName: '',
			fakturoidSubdomain: '',
			fakturoidDefaultLanguage: 'cz',
			fakturoidAutoCreateInvoices: false,
			fakturoidInvoiceDueDays: 14,
			fakturoidDefaultPaymentMethod: 'bank',
			fakturoidSendInvoiceEmail: false,
			fakturoidInvoiceNote: '',
			googleAnalyticsEnabled: false,
			googleAnalyticsTrackingId: '',
			facebookPixelEnabled: false,
			facebookPixelId: ''
		},
		eshop: {
			orderStates: [],
			currencies: []
		},
		doprava: {
			shippingMethods: [],
			minimumOrderValue: 0,
			freeDeliveryThreshold: 1000
		},
		products: {
			menuTitle: 'Obědy',
			menuIntroText: '',
			visibleDays: 7,
			features: [],
			showAllergens: true,
			showAllergensTooltip: true
		},
		customer: {
			allowRegistration: true,
			requireEmailVerification: true,
			defaultRole: 'customer'
		},
		inventory: {
			trackInventory: false,
			lowStockThreshold: 10
		}
	};

	// Structure the settings for easier editing
	function structureSettings(settingsData: any) {
		const structured: Record<string, any> = {};
		if (!settingsData) return structured;

		settingsData.forEach((item: any) => {
			try {
				if (typeof item.value === 'object' && item.value !== null) {
					structured[item.key] = item.value;
				}
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

		// Doplníme výchozí hodnoty pro chybějící nastavení
		Object.keys(DEFAULT_VALUES).forEach(key => {
			if (!structured[key]) {
				structured[key] = DEFAULT_VALUES[key as keyof typeof DEFAULT_VALUES];
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

	// Lazy loading pro jednotlivé taby
	async function loadTabSettings(tabId: string) {
		// Pokud už máme data pro tento tab, nemusíme načítat
		if ($editableSettings[tabId] && Object.keys($editableSettings[tabId]).length > 0) {
			return;
		}

		loadingTab = true;
		
		try {
			const response = await fetch('?/loadSetting', {
				method: 'POST',
				body: new FormData(Object.assign(document.createElement('form'), {
					innerHTML: `<input name="key" value="${tabId}">`
				}))
			});

			if (response.ok) {
				const result = await response.json();
				if (result.type === 'success' && result.data?.setting) {
					// Aktualizujeme pouze toto konkrétní nastavení
					editableSettings.update(s => ({
						...s,
						[tabId]: result.data.setting.value || DEFAULT_VALUES[tabId as keyof typeof DEFAULT_VALUES]
					}));
				}
			}
		} catch (e) {
			console.error('Chyba při načítání nastavení:', e);
		} finally {
			loadingTab = false;
		}
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
		{ id: 'integrations', label: 'Integrace', icon: 'fa-solid fa-plug' },
		{ id: 'zakazky', label: 'Objednávky', icon: 'fa-solid fa-clipboard-list' },
		{ id: 'doprava', label: 'Doprava', icon: 'fa-solid fa-truck' },
		{ id: 'products', label: 'Produkty', icon: 'fa-solid fa-utensils' },
		{ id: 'customer', label: 'Zákazníci', icon: 'fa-solid fa-users' },
		{ id: 'inventory', label: 'Inventář', icon: 'fa-solid fa-boxes-stacked' }
	];

	// Set active tab with lazy loading
	async function setActiveTab(tabId: string) {
		activeTab = tabId;
		// Lazy load nastavení pro tento tab
		await loadTabSettings(tabId);
	}

	// Note: We're using the form action to save settings
	// The form in the HTML section below submits the settings directly to the server

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

	// Add phone contact
	function addPhoneContact() {
		if (!$editableSettings.contact?.phoneContacts) {
			$editableSettings.contact = { ...$editableSettings.contact, phoneContacts: [] };
		}
		$editableSettings.contact.phoneContacts.push({ name: '', phone: '' });
		$editableSettings = $editableSettings;
	}

	// Remove phone contact
	function removePhoneContact(index: number) {
		if ($editableSettings.contact?.phoneContacts && $editableSettings.contact.phoneContacts.length > index) {
			$editableSettings.contact.phoneContacts.splice(index, 1);
			$editableSettings = $editableSettings;
		}
	}

	// Add order state
	function addOrderState() {
		if (!$editableSettings.eshop) {
			$editableSettings.eshop = {};
		}
		if (!$editableSettings.eshop.orderStates) {
			$editableSettings.eshop.orderStates = [];
		}
		$editableSettings.eshop.orderStates.push({ name: '', color: '#ffffff' });
		$editableSettings = $editableSettings;
	}

	// Remove order state
	function removeOrderState(index: number) {
		if ($editableSettings.eshop?.orderStates && $editableSettings.eshop.orderStates.length > index) {
			$editableSettings.eshop.orderStates.splice(index, 1);
			$editableSettings = $editableSettings;
		}
	}

	// Add currency
	function addCurrency() {
		if (!$editableSettings.eshop) {
			$editableSettings.eshop = {};
		}
		if (!$editableSettings.eshop.currencies) {
			$editableSettings.eshop.currencies = [];
		}
		$editableSettings.eshop.currencies.push({ code: '', symbol: '', name: '' });
		$editableSettings = $editableSettings;
	}

	// Remove currency
	function removeCurrency(index: number) {
		if ($editableSettings.eshop?.currencies && $editableSettings.eshop.currencies.length > index) {
			$editableSettings.eshop.currencies.splice(index, 1);
			$editableSettings = $editableSettings;
		}
	}

	// Add shipping method
	function addShippingMethod() {
		if (!$editableSettings.doprava) {
			$editableSettings.doprava = {};
		}
		if (!$editableSettings.doprava.shippingMethods) {
			$editableSettings.doprava.shippingMethods = [];
		}
		$editableSettings.doprava.shippingMethods.push({ name: '', price: 0 });
		$editableSettings = $editableSettings;
	}

	// Remove shipping method
	function removeShippingMethod(index: number) {
		if ($editableSettings.doprava?.shippingMethods && $editableSettings.doprava.shippingMethods.length > index) {
			$editableSettings.doprava.shippingMethods.splice(index, 1);
			$editableSettings = $editableSettings;
		}
	}

	// Add homepage service
	function addHomepageService() {
		if (!$editableSettings.homepage) {
			$editableSettings.homepage = {};
		}
		if (!$editableSettings.homepage.services) {
			$editableSettings.homepage.services = [];
		}
		$editableSettings.homepage.services.push({ title: '', link: '' });
		$editableSettings = $editableSettings;
	}

	// Remove homepage service
	function removeHomepageService(index: number) {
		if ($editableSettings.homepage?.services && $editableSettings.homepage.services.length > index) {
			$editableSettings.homepage.services.splice(index, 1);
			$editableSettings = $editableSettings;
		}
	}

	// Add product feature
	function addProductFeature() {
		if (!$editableSettings.products) {
			$editableSettings.products = {};
		}
		if (!$editableSettings.products.features) {
			$editableSettings.products.features = [];
		}
		$editableSettings.products.features.push({ title: '', description: '' });
		$editableSettings = $editableSettings;
	}

	// Remove product feature
	function removeProductFeature(index: number) {
		if ($editableSettings.products?.features && $editableSettings.products.features.length > index) {
			$editableSettings.products.features.splice(index, 1);
			$editableSettings = $editableSettings;
		}
	}

	// Add legal section
	function addLegalSection() {
		if (!$editableSettings.pages) {
			$editableSettings.pages = {};
		}
		if (!$editableSettings.pages.legalSections) {
			$editableSettings.pages.legalSections = [];
		}
		$editableSettings.pages.legalSections.push({ title: '', content: '' });
		$editableSettings = $editableSettings;
	}

	// Remove legal section
	function removeLegalSection(index: number) {
		if ($editableSettings.pages?.legalSections && $editableSettings.pages.legalSections.length > index) {
			$editableSettings.pages.legalSections.splice(index, 1);
			$editableSettings = $editableSettings;
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
					<form method="POST" action="?/update" use:enhance={() => {
						loading = true;
						return async ({ result, update }) => {
							loading = false;
							if (result.type === 'success') {
								// Vymazat cache po úspěšném uložení
								clearCache();
								saveMessage = 'Nastavení byla úspěšně uložena!';
								saveMessageType = 'success';
								showMessage = true;
								setTimeout(() => {
									showMessage = false;
								}, 3000);
							} else if (result.type === 'failure') {
								saveMessage = (result.data as any)?.error || 'Chyba při ukládání nastavení';
								saveMessageType = 'error';
								showMessage = true;
								setTimeout(() => {
									showMessage = false;
								}, 5000);
							}
							await update();
						};
					}}>
						<input type="hidden" name="settings" value={JSON.stringify($editableSettings)} />
						<button
							type="submit"
							name="action"
						value="update"
						disabled={loading}
						class="w-full btn btn-primary bg-green-800 text-white hover:bg-green-700"
						>
						{loading ? 'Ukládání...' : 'Uložit změny'}
						</button>
					</form>

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
									<span class="label-text">Krátký název</span>
								</label>
								<input
									type="text"
									bind:value={$editableSettings.general.shortName}
									class="input input-bordered w-full"
								/>
							</div>

							<!--<div class="form-control">
								<label class="label">
									<span class="label-text">Slogan</span>
								</label>
								<input
									type="text"
									bind:value={$editableSettings.general.slogan}
									class="input input-bordered w-full"
								/>
							</div>-->
							
							<!-- Měny -->
							<div class="mb-6 border-t pt-4 mt-4">
								<h3 class="text-lg font-medium mb-3">Měny</h3>
								
								{#if !$editableSettings.eshop?.currencies || $editableSettings.eshop.currencies.length === 0}
									<p class="text-gray-500 mb-2">Žádné měny nebyly definovány</p>
								{:else}
									<div class="space-y-2">
										{#each $editableSettings.eshop.currencies as currency, index}
											<div class="flex items-center gap-2">
												<input 
													type="text" 
													bind:value={currency.code} 
													class="input input-bordered w-20"
													placeholder="Kód"
												/>
												<input 
													type="text" 
													bind:value={currency.symbol} 
													class="input input-bordered w-20"
													placeholder="Symbol"
												/>
												<input 
													type="text" 
													bind:value={currency.name} 
													class="input input-bordered flex-grow"
													placeholder="Název"
												/>
												<button 
													class="btn btn-sm btn-outline btn-error" 
													on:click={() => removeCurrency(index)}>
													×
												</button>
											</div>
										{/each}
									</div>
								{/if}
								
								<button 
									class="btn btn-sm btn-outline mt-2" 
									on:click={addCurrency}>
									Přidat měnu
								</button>
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

						<div class="space-y-4 grid grid-cols-3 gap-2">
							<div class="form-control">
								<label class="label">
									<span class="label-text">Název firmy</span>
								</label>
								<input
									type="text"
									bind:value={$editableSettings.business.companyName}
									class="input input-bordered w-full"
								/>
							</div>
							<div class="form-control">
								<label class="label">
									<span class="label-text">Ulice</span>
								</label>
								<input
									type="text"
									bind:value={$editableSettings.business.street}
									class="input input-bordered w-full"
								/>
							</div>
							<div class="form-control">
								<label class="label">
									<span class="label-text">Číslo ulice</span>
								</label>
								<input
									type="text"
									bind:value={$editableSettings.business.streetNumber}
									class="input input-bordered w-full"
								/>
							</div>
							<div class="form-control">
								<label class="label">
									<span class="label-text">PSČ</span>
								</label>
								<input
									type="text"
									bind:value={$editableSettings.business.zipCode}
									class="input input-bordered w-full"
								/>
							</div>
							<div class="form-control">
								<label class="label">
									<span class="label-text">Město</span>
								</label>
								<input
									type="text"
									bind:value={$editableSettings.business.city}
									class="input input-bordered w-full"
								/>
							</div>

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
									placeholder="Použijte {'{{orderNumber}}'} pro vložení čísla objednávky."
								></textarea>
								<span class="text-xs text-gray-500 mt-1">
									Můžete použít {'{{orderNumber}}'} pro vložení čísla objednávky.
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
						
						<!-- Fakturoid Section -->
						<div class="mb-6 border-b pb-6">
							<h3 class="text-lg font-medium mb-4 flex items-center gap-2">
								<i class="fa-solid fa-file-invoice text-green-600"></i>
								Fakturoid
							</h3>
							
							<div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
								<h4 class="font-medium text-blue-800 mb-2">
									<i class="fa-solid fa-info-circle"></i>
									Informace o integraci
								</h4>
								<p class="text-sm text-blue-700 mb-2">
									Fakturoid je služba pro online fakturaci. Po konfiguraci budete moci automaticky vytvářet faktury pro objednávky.
								</p>
								<p class="text-sm text-blue-700">
									<strong>Potřebné údaje:</strong> API token, subdoména účtu a číslo účtu pro párování plateb.
								</p>
							</div>

							<!-- Enable/Disable Toggle -->
							<div class="form-control mb-4">
								<label class="label cursor-pointer justify-start gap-3">
									<input 
										type="checkbox" 
										bind:checked={$editableSettings.integrations.fakturoidEnabled} 
										class="checkbox checkbox-primary"
									/>
									<span class="label-text font-medium">Povolit integraci s Fakturoid</span>
								</label>
							</div>

							{#if $editableSettings.integrations.fakturoidEnabled}
								<div class="space-y-4 pl-4 border-l-4 border-green-200">
									<!-- OAuth Connection Status -->
									<div class="card bg-gradient-to-r from-green-50 to-blue-50 border border-green-200">
										<div class="card-body p-4">
											<h4 class="font-medium text-green-800 mb-2 flex items-center gap-2">
												<i class="fa-solid fa-shield-halved"></i>
												OAuth Připojení
											</h4>
											{#if $editableSettings.integrations.fakturoidConnected}
												<p class="text-sm text-green-700 mb-3">
													Váš Fakturoid účet je úspěšně připojen a můžete vytvářet faktury pro objednávky.
												</p>
											{:else}
												<p class="text-sm text-green-700 mb-3">
													Fakturoid používá bezpečné OAuth 2.0 ověření. Klikněte níže pro připojení vašeho Fakturoid účtu.
												</p>
											{/if}
											
											<!-- Connect/Disconnect Button -->
											<div class="flex items-center gap-3">
												{#if $editableSettings.integrations.fakturoidConnected}
													<div class="flex items-center gap-2 text-green-600">
														<i class="fa-solid fa-check-circle"></i>
														<span class="font-medium">Připojeno k Fakturoid</span>
													</div>
													<form method="POST" action="?/disconnectFakturoid" use:enhance={() => {
														loading = true;
														return async ({ result, update }) => {
															loading = false;
															if (result.type === 'success') {
																saveMessage = 'Fakturoid byl úspěšně odpojeno!';
																saveMessageType = 'success';
																showMessage = true;
																
																// Aktualizovat lokální stav
																$editableSettings.integrations.fakturoidConnected = false;
																$editableSettings.integrations.fakturoidEnabled = false;
																$editableSettings.integrations.fakturoidAccountName = '';
															} else if (result.type === 'failure') {
																saveMessage = String(result.data?.['error'] || 'Chyba při odpojování');
																saveMessageType = 'error';
																showMessage = true;
															}
															setTimeout(() => {
																showMessage = false;
															}, 5000);
															await update();
														};
													}}>
														<button 
															type="submit"
															class="btn btn-outline btn-sm btn-error"
															disabled={loading}
														>
															{#if loading}
																<span class="loading loading-spinner loading-xs"></span>
																Odpojování...
															{:else}
																<i class="fa-solid fa-unlink"></i>
																Odpojit
															{/if}
														</button>
													</form>
												{:else}
													<button 
														class="btn btn-primary btn-sm"
														on:click={() => {
															// Přesměrujeme na OAuth endpoint
															window.location.href = '/auth/fakturoid/connect';
														}}
													>
														<i class="fa-solid fa-link"></i>
														Připojit Fakturoid účet
													</button>
												{/if}
											</div>
											
											{#if $editableSettings.integrations.fakturoidConnected}
												<div class="mt-3 p-2 bg-green-100 rounded text-xs text-green-700">
													<strong>Účet:</strong> {$editableSettings.integrations.fakturoidAccountName || 'Připojeno'}
													{#if $editableSettings.integrations.fakturoidSubdomain}
														<br><strong>Subdoména:</strong> {$editableSettings.integrations.fakturoidSubdomain}
													{/if}
												</div>
											{/if}
										</div>
									</div>

									<!-- Invoice Settings -->
									<div class="divider">Nastavení faktur</div>

									<!-- Default Invoice Language -->
									<div class="form-control">
										<label class="label">
											<span class="label-text font-medium">Výchozí jazyk faktur</span>
										</label>
										<select bind:value={$editableSettings.integrations.fakturoidDefaultLanguage} class="select select-bordered w-full">
											<option value="cz">Čeština</option>
											<option value="sk">Slovenština</option>
											<option value="en">Angličtina</option>
											<option value="de">Němčina</option>
										</select>
									</div>

									<!-- Auto-create Invoices -->
									<div class="form-control">
										<label class="label cursor-pointer justify-start gap-3">
											<input 
												type="checkbox" 
												bind:checked={$editableSettings.integrations.fakturoidAutoCreateInvoices} 
												class="checkbox checkbox-primary"
											/>
											<span class="label-text">Automaticky vytvářet faktury pro objednávky</span>
										</label>
									</div>

									<!-- Invoice Due Days -->
									<div class="form-control">
										<label class="label">
											<span class="label-text font-medium">Splatnost faktur (dny)</span>
										</label>
										<input
											type="number"
											bind:value={$editableSettings.integrations.fakturoidInvoiceDueDays}
											class="input input-bordered w-full"
											placeholder="14"
											min="1"
											max="365"
										/>
									</div>

									<!-- Default Payment Method -->
									<div class="form-control">
										<label class="label">
											<span class="label-text font-medium">Výchozí způsob platby</span>
										</label>
										<select bind:value={$editableSettings.integrations.fakturoidDefaultPaymentMethod} class="select select-bordered w-full">
											<option value="bank">Bankovní převod</option>
											<option value="cash">Hotově</option>
											<option value="card">Kartou</option>
											<option value="paypal">PayPal</option>
											<option value="gopay">GoPay</option>
										</select>
									</div>

									<!-- Additional Settings -->
									<div class="divider">Další nastavení</div>

									<!-- Send Invoice Email -->
									<div class="form-control">
										<label class="label cursor-pointer justify-start gap-3">
											<input 
												type="checkbox" 
												bind:checked={$editableSettings.integrations.fakturoidSendInvoiceEmail} 
												class="checkbox checkbox-primary"
											/>
											<span class="label-text">Automaticky odeslat fakturu emailem</span>
										</label>
									</div>

									<!-- Invoice Note -->
									<div class="form-control">
										<label class="label">
											<span class="label-text font-medium">Poznámka na faktuře</span>
										</label>
										<textarea
											bind:value={$editableSettings.integrations.fakturoidInvoiceNote}
											class="textarea textarea-bordered w-full h-20"
											placeholder="Dodatečná poznámka, která se zobrazí na všech fakturách..."
										></textarea>
									</div>

									<!-- Test Connection Button (only if connected) -->
									{#if $editableSettings.integrations.fakturoidConnected}
										<div class="card bg-gray-50 border border-gray-300">
											<div class="card-body p-4">
												<h4 class="font-medium mb-2">Test připojení</h4>
												<p class="text-sm text-gray-600 mb-3">
													Otestujte aktuální OAuth připojení k Fakturoid.
												</p>
												<form method="POST" action="?/testFakturoidOAuth" use:enhance={() => {
													loading = true;
													return async ({ result, update }) => {
														loading = false;
														if (result.type === 'success') {
															saveMessage = String(result.data?.['message'] || 'Test připojení byl úspěšný!');
															saveMessageType = 'success';
															showMessage = true;
														} else if (result.type === 'failure') {
															saveMessage = String(result.data?.['error'] || 'Test připojení selhal');
															saveMessageType = 'error';
															showMessage = true;
														}
														setTimeout(() => {
															showMessage = false;
														}, 5000);
														await update();
													};
												}}>
													<button 
														type="submit"
														class="btn btn-outline btn-sm"
														disabled={loading}
													>
														{#if loading}
															<span class="loading loading-spinner loading-xs"></span>
															Testování...
														{:else}
															<i class="fa-solid fa-plug"></i>
															Otestovat OAuth připojení
														{/if}
													</button>
												</form>
											</div>
										</div>
									{/if}
								</div>
							{/if}
						</div>

						<!-- Google Analytics Section -->
						<div class="mb-6 border-b pb-6">
							<h3 class="text-lg font-medium mb-4 flex items-center gap-2">
								<i class="fa-brands fa-google text-blue-600"></i>
								Google Analytics
							</h3>
							
							<div class="form-control mb-4">
								<label class="label cursor-pointer justify-start gap-3">
									<input 
										type="checkbox" 
										bind:checked={$editableSettings.integrations.googleAnalyticsEnabled} 
										class="checkbox checkbox-primary"
									/>
									<span class="label-text font-medium">Povolit Google Analytics</span>
								</label>
							</div>

							{#if $editableSettings.integrations.googleAnalyticsEnabled}
								<div class="space-y-4 pl-4 border-l-4 border-blue-200">
									<div class="form-control">
										<label class="label">
											<span class="label-text font-medium">Tracking ID (GA4)</span>
										</label>
										<input
											type="text"
											bind:value={$editableSettings.integrations.googleAnalyticsTrackingId}
											class="input input-bordered w-full"
											placeholder="G-XXXXXXXXXX"
										/>
									</div>
								</div>
							{/if}
						</div>

						<!-- Facebook Pixel Section -->
						<div class="mb-6">
							<h3 class="text-lg font-medium mb-4 flex items-center gap-2">
								<i class="fa-brands fa-facebook text-blue-800"></i>
								Facebook Pixel
							</h3>
							
							<div class="form-control mb-4">
								<label class="label cursor-pointer justify-start gap-3">
									<input 
										type="checkbox" 
										bind:checked={$editableSettings.integrations.facebookPixelEnabled} 
										class="checkbox checkbox-primary"
									/>
									<span class="label-text font-medium">Povolit Facebook Pixel</span>
								</label>
							</div>

							{#if $editableSettings.integrations.facebookPixelEnabled}
								<div class="space-y-4 pl-4 border-l-4 border-blue-800">
									<div class="form-control">
										<label class="label">
											<span class="label-text font-medium">Pixel ID</span>
										</label>
										<input
											type="text"
											bind:value={$editableSettings.integrations.facebookPixelId}
											class="input input-bordered w-full"
											placeholder="123456789012345"
										/>
									</div>
								</div>
							{/if}
						</div>
					</div>
				{/if}

				<!-- E-shop Settings -->
				{#if activeTab === 'zakazky' && $editableSettings.eshop}
					<div in:fade={{ duration: 300 }}>
						<h2 class="text-xl font-semibold mb-4">Nastavení zakázek</h2>
						
						<!-- Stavy zakázek -->
						<div class="mb-6 border-b pb-4">
							<h3 class="text-lg font-medium mb-3">Stavy zakázek</h3>
							
							{#if !$editableSettings.eshop.orderStates || $editableSettings.eshop.orderStates.length === 0}
								<p class="text-gray-500 mb-2">Žádné stavy zakázek nebyly definovány</p>
							{:else}
								<div class="space-y-2">
									{#each $editableSettings.eshop.orderStates as state, index}
										<div class="flex items-center gap-2">
											<input 
												type="text" 
												bind:value={state.name} 
												class="input input-bordered flex-grow"
												placeholder="Název stavu"
											/>
											<input 
												type="color" 
												bind:value={state.color} 
												class="w-12 h-10"
											/>
											<button 
												class="btn btn-sm btn-outline btn-error" 
												on:click={() => removeOrderState(index)}>
												×
											</button>
										</div>
									{/each}
								</div>
							{/if}
							
							<button 
								class="btn btn-sm btn-outline mt-2" 
								on:click={addOrderState}>
								Přidat stav zakázky
							</button>
						</div>
					</div>
				{/if}

				<!-- Doprava Settings -->
				{#if activeTab === 'doprava'}
					<div in:fade={{ duration: 300 }}>
						<h2 class="text-xl font-semibold mb-4">Nastavení dopravy</h2>
						
						<!-- Způsoby dopravy -->
						<div class="mb-6 border-b pb-4">
							<h3 class="text-lg font-medium mb-3">Způsoby dopravy</h3>
							
							{#if !$editableSettings.doprava?.shippingMethods || $editableSettings.doprava.shippingMethods.length === 0}
								<p class="text-gray-500 mb-2">Žádné způsoby dopravy nebyly definovány</p>
							{:else}
								<div class="space-y-2">
									{#each $editableSettings.doprava.shippingMethods as method, index}
										<div class="flex items-center gap-2">
											<input 
												type="text" 
												bind:value={method.name} 
												class="input input-bordered flex-grow"
												placeholder="Název"
											/>
											<input 
												type="number" 
												bind:value={method.price} 
												class="input input-bordered w-32"
												placeholder="Cena"
											/>
											<button 
												class="btn btn-sm btn-outline btn-error" 
												on:click={() => removeShippingMethod(index)}>
												×
											</button>
										</div>
									{/each}
								</div>
							{/if}
							
							<button 
								class="btn btn-sm btn-outline mt-2" 
								on:click={addShippingMethod}>
								Přidat způsob dopravy
							</button>
						</div>
						
						<!-- Nastavení dopravy -->
						<div class="mb-6">
							<h3 class="text-lg font-medium mb-3">Obecná nastavení dopravy</h3>
							
							<div class="form-control mb-3">
								<label class="label">
									<span class="label-text">Minimální hodnota objednávky pro dopravu</span>
								</label>
								<div class="flex items-center gap-3">
									<input
										type="number"
										bind:value={$editableSettings.doprava.minimumOrderValue}
										class="input input-bordered w-32"
										min="0"
										step="10"
										placeholder="0"
									/>
									<p class="text-sm text-gray-500">
										Minimální částka pro objednání
									</p>
								</div>
							</div>
							
							<div class="form-control mb-3">
								<label class="label">
									<span class="label-text">Hranice pro dopravu zdarma</span>
								</label>
								<div class="flex items-center gap-3">
									<input
										type="number"
										bind:value={$editableSettings.doprava.freeDeliveryThreshold}
										class="input input-bordered w-32"
										min="0"
										step="100"
										placeholder="1000"
									/>
									<p class="text-sm text-gray-500">
										Hodnota objednávky, od které je doprava zdarma
									</p>
								</div>
							</div>
						</div>
					</div>
				{/if}

				<!-- Products Settings -->
				{#if activeTab === 'products' && $editableSettings.products}
					<div in:fade={{ duration: 300 }}>
						<h2 class="text-xl font-semibold mb-4">Nastavení produktů</h2>
						
						<!-- Jídelníček -->
						<div class="mb-6 border-b pb-4">
							<h3 class="text-lg font-medium mb-3">Nastavení jídelníčku</h3>
							
							<div class="form-control mb-3">
								<label class="label">
									<span class="label-text">Nadpis stránky</span>
								</label>
								<input
									type="text"
									bind:value={$editableSettings.products.menuTitle}
									class="input input-bordered w-full"
									placeholder="Obědy"
								/>
							</div>
							
							<div class="form-control mb-3">
								<label class="label">
									<span class="label-text">Úvodní text</span>
								</label>
								<textarea
									bind:value={$editableSettings.products.menuIntroText}
									class="textarea textarea-bordered w-full h-24"
									placeholder="Úvodní text jídelníčku..."
								></textarea>
							</div>
							
							<div class="form-control">
								<label class="label">
									<span class="label-text">Počet viditelných dnů</span>
								</label>
								<div class="flex items-center gap-3">
									<input
										type="number"
										bind:value={$editableSettings.products.visibleDays}
										class="input input-bordered w-24"
										min="1"
										max="70"
										placeholder="7"
									/>
									<p class="text-sm text-gray-500">
										Počet dnů, které se zobrazí na stránce jídelníčku
									</p>
								</div>
							</div>
						</div>
						
						<!-- Funkce produktů -->
						<div class="mb-6 border-b pb-4">
							<h3 class="text-lg font-medium mb-3">Funkce produktů</h3>
							
							<div class="space-y-3">
								{#if !$editableSettings.products.features || $editableSettings.products.features.length === 0}
									<p class="text-gray-500 mb-2">Žádné funkce nebyly definovány</p>
								{:else}
									{#each $editableSettings.products.features as feature, index}
										<div class="flex items-center gap-2">
											<input 
												type="text" 
												bind:value={feature.title} 
												class="input input-bordered w-1/3"
												placeholder="Název funkce"
											/>
											<input 
												type="text" 
												bind:value={feature.description} 
												class="input input-bordered flex-grow"
												placeholder="Popis funkce"
											/>
											<button 
												class="btn btn-sm btn-outline btn-error" 
												on:click={() => removeProductFeature(index)}>
												×
											</button>
										</div>
									{/each}
								{/if}
								
								<button 
									class="btn btn-sm btn-outline mt-2" 
									on:click={addProductFeature}>
									Přidat funkci
								</button>
							</div>
						</div>
						
						<!-- Zobrazení alergenů -->
						<div class="mb-6">
							<h3 class="text-lg font-medium mb-3">Zobrazení alergenů</h3>
							
							<div class="form-control">
								<label class="label cursor-pointer justify-start gap-2">
									<input 
										type="checkbox" 
										class="checkbox checkbox-primary" 
										bind:checked={$editableSettings.products.showAllergens} 
									/>
									<span class="label-text">Zobrazit alergeny u produktů</span>
								</label>
							</div>
							
							<div class="form-control mt-3">
								<label class="label cursor-pointer justify-start gap-2">
									<input 
										type="checkbox" 
										class="checkbox checkbox-primary" 
										bind:checked={$editableSettings.products.showAllergensTooltip} 
									/>
									<span class="label-text">Zobrazit popis alergenů v nápovědě</span>
								</label>
							</div>
						</div>
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>