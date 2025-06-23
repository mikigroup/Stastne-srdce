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
	let saved = false;
	let activeTab = 'general';
	let saveMessage = '';
	let saveMessageType: 'success'|'error'|'info' = 'success';
	let showMessage = false;
	let loadingTab = false;

	// File upload state
	let uploadingLogo = false;
	let uploadingFavicon = false;
	let logoFileInput: HTMLInputElement;
	let faviconFileInput: HTMLInputElement;

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
		if (tab && ['general', 'seo', 'contact', 'social', 'appearance', 'business', 'email', 'integrations', 'orders', 'delivery', 'products', 'customer', 'inventory'].includes(tab)) {
			activeTab = tab;
		}
		
		if (success === 'fakturoid_connected') {
			activeTab = 'integrations';
			saveMessage = 'Fakturoid byl úspěšně připojen přes OAuth!';
			saveMessageType = 'success';
			showMessage = true;
			
			setTimeout(() => {
				showMessage = false;
			}, 5000);
		} else if (success === 'fakturoid_disconnected') {
			activeTab = 'integrations';
			// Vyčistíme local cache
			clearCache();
			// Vynucíme refresh dat
			window.location.hash = '#refresh';
			
			saveMessage = 'Fakturoid byl úspěšně odpojeno!';
			saveMessageType = 'success';
			showMessage = true;
			
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

	// Watch for changes in data
	$: if (settings) {
		editableSettings.set(structureSettings(settings));
	}
	
	// Reactive refresh dat při změně URL parametrů
	$: if ($page.url.searchParams.get('success') === 'fakturoid_disconnected') {
		// Force refresh dat po odpojení
		setTimeout(() => {
			editableSettings.set(structureSettings(settings));
		}, 100);
	}

	// Import unified default values
	import { UNIFIED_DEFAULT_SETTINGS } from '$lib/constants/defaultSettings';

	// Use unified defaults as the single source of truth
	const DEFAULT_VALUES = UNIFIED_DEFAULT_SETTINGS;

	// Structure the settings for easier editing
	function structureSettings(settingsData: any) {
		const structured: Record<string, any> = {};
		
		// Inicializujeme všechny sekce s výchozími hodnotami
		Object.keys(DEFAULT_VALUES).forEach(key => {
			structured[key] = { ...DEFAULT_VALUES[key as keyof typeof DEFAULT_VALUES] };
		});

		// Pokud nemáme žádná data, vrátíme výchozí hodnoty
		if (!settingsData || !Array.isArray(settingsData)) {
			console.warn('Žádná data pro strukturování nastavení');
			return structured;
		}

		// Projdeme načtená data a aktualizujeme strukturu
		settingsData.forEach((item: any) => {
			if (!item || !item.key) {
				return;
			}

			// Ignorujeme neplatné klíče
			if (item.key === 'action' || item.key === 'settings') {
				return;
			}

			try {
				let value = item.value;
				
				// Pokud je hodnota string, zkusíme ji parsovat jako JSON
				if (typeof value === 'string') {
					try {
						value = JSON.parse(value);
					} catch (e) {
						// Pokud se nejedná o JSON, použijeme hodnotu jako je
						value = value;
					}
				}

				// Aktualizujeme strukturu, zachováme výchozí hodnoty pro chybějící pole
				if (structured[item.key]) {
					// Pro vnořené objekty použijeme deep merge
					if (typeof value === 'object' && value !== null) {
						structured[item.key] = deepMerge(structured[item.key], value);
					} else {
						structured[item.key] = value;
					}
				}
			} catch (e) {
				console.error(`Chyba při zpracování ${item.key}:`, e);
			}
		});

		return structured;
	}

	// Pomocná funkce pro deep merge objektů
	function deepMerge(target: any, source: any) {
		const output = { ...target };
		
		if (isObject(target) && isObject(source)) {
			Object.keys(source).forEach(key => {
				if (isObject(source[key])) {
					if (!(key in target)) {
						Object.assign(output, { [key]: source[key] });
					} else {
						output[key] = deepMerge(target[key], source[key]);
					}
				} else {
					Object.assign(output, { [key]: source[key] });
				}
			});
		}
		
		return output;
	}

	// Pomocná funkce pro kontrolu, zda je hodnota objekt
	function isObject(item: any) {
		return (item && typeof item === 'object' && !Array.isArray(item));
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
				body: (() => {
					const formData = new FormData();
					formData.append('key', tabId);
					return formData;
				})()
			});

			if (response.ok) {
				const result = await response.json();
				if (result.type === 'success' && result.data?.setting) {
					// Aktualizujeme pouze toto konkrétní nastavení
					editableSettings.update(s => ({
						...s,
						[tabId]: result.data.setting.value || (tabId in DEFAULT_VALUES ? DEFAULT_VALUES[tabId as keyof typeof DEFAULT_VALUES] : {})
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
		{ id: 'orders', label: 'Objednávky', icon: 'fa-solid fa-clipboard-list' },
		{ id: 'delivery', label: 'Doprava', icon: 'fa-solid fa-truck' },
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
		if (!$editableSettings.orders) {
			$editableSettings.orders = {};
		}
		if (!$editableSettings.orders.orderStates) {
			$editableSettings.orders.orderStates = [];
		}
		$editableSettings.orders.orderStates.push({ name: '', color: '#3b82f6' });
		$editableSettings = $editableSettings;
	}

	// Remove order state
	function removeOrderState(index: number) {
		if ($editableSettings.orders?.orderStates && $editableSettings.orders.orderStates.length > index) {
			$editableSettings.orders.orderStates.splice(index, 1);
			$editableSettings = $editableSettings;
		}
	}


	// Dostupné měny pro výběr
	const availableCurrencies = [
		{ code: 'CZK', name: 'Česká koruna' },
		{ code: 'EUR', name: 'Euro' },
		{ code: 'USD', name: 'Americký dolar' },
		{ code: 'GBP', name: 'Britská libra' },
		{ code: 'PLN', name: 'Polský zlotý' },
		{ code: 'CHF', name: 'Švýcarský frank' }
	];

	// Získá název měny podle kódu
	function getCurrencyName(code: string): string {
		const currency = availableCurrencies.find(c => c.code === code);
		return currency ? currency.name : code;
	}

	// Handle přidání měny z selectu
	function handleCurrencyAdd(event: Event) {
		const target = event.target as HTMLSelectElement;
		const currencyCode = target.value;
		
		if (currencyCode && currencyCode.trim() !== '') {
			if (!$editableSettings.general) {
				$editableSettings.general = {};
			}
			if (!$editableSettings.general.currencies) {
				$editableSettings.general.currencies = [];
			}
			
			// Přidáme pouze pokud už tam není
			if (!$editableSettings.general.currencies.includes(currencyCode)) {
				$editableSettings.general.currencies.push(currencyCode);
				$editableSettings = $editableSettings;
			}
			
			// Reset selectu
			target.value = '';
		}
	}

	// Remove currency
	function removeCurrency(index: number) {
		if ($editableSettings.general?.currencies && $editableSettings.general.currencies.length > index) {
			$editableSettings.general.currencies.splice(index, 1);
			$editableSettings = $editableSettings;
		}
	}

	// Add shipping method
	function addShippingMethod() {
		if (!$editableSettings.delivery) {
			$editableSettings.delivery = {};
		}
		if (!$editableSettings.delivery.shippingMethods) {
			$editableSettings.delivery.shippingMethods = [];
		}
		$editableSettings.delivery.shippingMethods.push({ name: '', price: 0 });
		$editableSettings = $editableSettings;
	}

	// Remove shipping method
	function removeShippingMethod(index: number) {
		if ($editableSettings.delivery?.shippingMethods && $editableSettings.delivery.shippingMethods.length > index) {
			$editableSettings.delivery.shippingMethods.splice(index, 1);
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

	// Fakturoid connection functions
	async function connectFakturoid() {
		try {
			// Přesměrujeme na správný OAuth endpoint pro Fakturoid
			window.location.href = '/auth/fakturoid/connect';
		} catch (error) {
			console.error('Chyba při připojování Fakturoid:', error);
			saveMessage = 'Chyba při připojování k Fakturoid';
			saveMessageType = 'error';
			showMessage = true;
			setTimeout(() => showMessage = false, 5000);
		}
	}

	async function disconnectFakturoid() {
		if (!confirm('Opravdu chcete odpojit Fakturoid účet?')) {
			return;
		}

		// Použijeme klasický form submit místo fetch API pro správný redirect
		const form = document.createElement('form');
		form.method = 'POST';
		form.action = '?/disconnectFakturoid';
		form.style.display = 'none';
		
		document.body.appendChild(form);
		form.submit();
	}

	// Handler pro enhance na save tlačítku
	function handleSaveEnhance() {
		loading = true;
		saved = false;
		
		return async ({ result, update }: { result: any, update: () => Promise<void> }) => {
			await update();
			
			loading = false;
			
			if (result.type === 'success') {
				saved = true;
				
				// Po 2 sekundách resetujeme saved stav
				setTimeout(() => {
					saved = false;
				}, 2000);
			}
		};
	}

	// Handler pro enhance na upload formulářích
	function handleUploadEnhance({ formData }: any) {
		const fileType = formData.get('fileType') as string;
		
		if (fileType === 'logo') {
			uploadingLogo = true;
		} else if (fileType === 'favicon') {
			uploadingFavicon = true;
		}

		return async ({ result, update }: { result: any, update: () => Promise<void> }) => {
			await update();

			// Reset loading states
			uploadingLogo = false;
			uploadingFavicon = false;

			if (result.type === 'success' && result.data?.success) {
				// Zobrazíme success zprávu
				saveMessage = result.data.message || 'Soubor byl úspěšně nahrán';
				saveMessageType = 'success';
				showMessage = true;

				// Aktualizujeme nastavení s novou URL
				if (result.data.fileUrl) {
					if (fileType === 'logo') {
						$editableSettings.appearance.logo = result.data.fileUrl;
						if (logoFileInput) logoFileInput.value = '';
					} else if (fileType === 'favicon') {
						$editableSettings.appearance.favicon = result.data.fileUrl;
						if (faviconFileInput) faviconFileInput.value = '';
					}
				}

				setTimeout(() => {
					showMessage = false;
				}, 5000);
			} else if (result.type === 'failure') {
				// Zobrazíme error zprávu
				saveMessage = result.data?.error || 'Chyba při nahrávání souboru';
				saveMessageType = 'error';
				showMessage = true;

				setTimeout(() => {
					showMessage = false;
				}, 8000);
			}
		};
	}

	// Automatické spuštění uploadu při výběru logo souboru
	function handleLogoFileChange(event: Event) {
		const target = event.target as HTMLInputElement;
		if (target.files && target.files.length > 0) {
			// Najdeme formulář a odešleme ho
			const form = target.closest('form');
			if (form) {
				form.requestSubmit();
			}
		}
	}

	// Automatické spuštění uploadu při výběru favicon souboru
	function handleFaviconFileChange(event: Event) {
		const target = event.target as HTMLInputElement;
		if (target.files && target.files.length > 0) {
			// Najdeme formulář a odešleme ho
			const form = target.closest('form');
			if (form) {
				form.requestSubmit();
			}
		}
	}
</script>

<svelte:head>
	<title>LEO - Nastavení webu</title>
</svelte:head>

<div class="p-3 sm:p-5 bg-white rounded-lg shadow-md border border-gray-300">
	<h1 class="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Nastavení webu</h1>

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
	<div class="flex flex-col lg:flex-row gap-4">
		<!-- Tab Navigation -->
		<div class="lg:w-1/4">
			<!-- Mobile Tabs - Horizontal Scroll -->
			<div class="lg:hidden mb-4">
				<div class="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
					{#each tabs as tab}
						<button
							on:click={() => setActiveTab(tab.id)}
							class="flex-shrink-0 px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-1 whitespace-nowrap {activeTab === tab.id ? 'bg-cyan-700 text-white' : 'bg-gray-100 hover:bg-gray-200'}"
						>
							<i class="{tab.icon} text-xs"></i>
							<span class="text-xs">{tab.label}</span>
						</button>
					{/each}
				</div>
			</div>

			<!-- Desktop Tabs - Vertical -->
			<div class="hidden lg:block bg-gray-100 rounded-lg p-2">
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

				<!-- Action Buttons (Desktop Only) -->
				<div class="hidden lg:block mt-6 p-4 border-t border-gray-300 space-y-3">
					<form method="POST" action="?/update" use:enhance={handleSaveEnhance}>
						<input type="hidden" name="settings" value={JSON.stringify($editableSettings)} />
						<button
							type="submit"
							disabled={loading}
							class="w-full btn btn-primary bg-green-800 text-white hover:bg-green-700"
						>
							{#if loading}
								Ukládání...
							{:else if saved}
								Uloženo
							{:else}
								Uložit změny
							{/if}
						</button>
					</form>

			
		<!--		<button
						on:click={resetSettings}
						class="w-full btn btn-outline"
					>
						Obnovit výchozí
					</button>
				-->
				</div>
			</div>
		</div>

		<!-- Tab Content -->
		<div class="lg:w-3/4">
			<div class="bg-gray-50 rounded-lg p-3 sm:p-6 border border-gray-300">
				<!-- General Settings -->
				{#if activeTab === 'general' && $editableSettings.general}
					<div in:fade={{ duration: 300 }}>
						<h2 class="text-xl font-semibold mb-4">Obecné nastavení</h2>

						<div class="space-y-4">
							<div class="form-control">
								<label class="label">
									<span class="label-text text-sm sm:text-base">Název obchodu</span>
								</label>
								<input
									type="text"
									bind:value={$editableSettings.general.shopName}
									class="input input-bordered w-full input-sm sm:input-md"
								/>
							</div>

							<div class="form-control">
								<label class="label">
									<span class="label-text text-sm sm:text-base">Krátký název</span>
								</label>
								<input
									type="text"
									bind:value={$editableSettings.general.shortName}
									class="input input-bordered w-full input-sm sm:input-md"
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
								<h3 class="text-base sm:text-lg font-medium mb-3">Měny</h3>
								<p class="text-gray-500 mb-3 text-sm">Vyberte měny, které chcete podporovat v systému</p>
								
								<!-- Dostupné měny k výběru -->
								<div class="mb-3">
									<label class="label">
										<span class="label-text text-sm sm:text-base">Přidat měnu</span>
									</label>
									<select 
										class="select select-bordered input-sm sm:input-md w-full max-w-xs"
										on:change={handleCurrencyAdd}>
										<option value="">Vyberte měnu</option>
										{#each availableCurrencies as currency}
											{#if !$editableSettings.general?.currencies?.includes(currency.code)}
												<option value={currency.code}>{currency.code} - {currency.name}</option>
											{/if}
										{/each}
									</select>
								</div>
								
								<!-- Vybrané měny -->
								{#if $editableSettings.general?.currencies && $editableSettings.general.currencies.length > 0}
									<div class="space-y-2 max-w-xs">
										<label class="label">
											<span class="label-text text-sm sm:text-base">Vybrané měny</span>
										</label>
										{#each $editableSettings.general.currencies as currency, index}
											<div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-white">
												<div class="flex gap-2 flex-1 items-center">
													<span class="px-3 py-2 bg-blue-100 text-blue-800 rounded-md text-sm font-medium min-w-0">
														{currency}
													</span>
												</div>
												<button 
													class="btn btn-xs btn-outline btn-error self-end sm:self-auto" 
													on:click={() => removeCurrency(index)}>
													×
												</button>
											</div>
										{/each}
									</div>
								{:else}
									<p class="text-gray-500 text-sm">Žádné měny nebyly vybrány</p>
								{/if}
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
								<label class="label cursor-pointer justify-start gap-3">
									<input
										type="checkbox"
										bind:checked={$editableSettings.seo.googleAnalyticsEnabled}
										class="checkbox checkbox-primary"
									/>
									<span class="label-text">Google Analytics</span>
								</label>
								{#if $editableSettings.seo.googleAnalyticsEnabled}
									<input
										type="text"
										bind:value={$editableSettings.seo.googleAnalyticsId}
										class="input input-bordered w-full mt-2"
										placeholder="G-XXXXXXXXXX"
									/>
								{/if}
							</div>

							<div class="form-control">
								<label class="label cursor-pointer justify-start gap-3">
									<input
										type="checkbox"
										bind:checked={$editableSettings.seo.facebookPixelEnabled}
										class="checkbox checkbox-primary"
									/>
									<span class="label-text">Facebook Pixel</span>
								</label>
								{#if $editableSettings.seo.facebookPixelEnabled}
									<input
										type="text"
										bind:value={$editableSettings.seo.facebookPixelId}
										class="input input-bordered w-full mt-2"
										placeholder="123456789012345"
									/>
								{/if}
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
									<span class="label-text">Hlavní telefon</span>
								</label>
								<input
									type="tel"
									bind:value={$editableSettings.contact.phone}
									class="input input-bordered w-full"
								/>
							</div>

							<div class="form-control">
								<label class="label">
									<span class="label-text">Telefon 1</span>
								</label>
								<input
									type="tel"
									bind:value={$editableSettings.contact.phone1}
									class="input input-bordered w-full"
								/>
							</div>

							<div class="form-control">
								<label class="label">
									<span class="label-text">Telefon 2</span>
								</label>
								<input
									type="tel"
									bind:value={$editableSettings.contact.phone2}
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

								<div class="space-y-2">
									{#each ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as day}
										<div class="flex gap-2 items-center">
											<label class="w-32 text-sm font-medium">
												{#if day === 'monday'}Pondělí
												{:else if day === 'tuesday'}Úterý
												{:else if day === 'wednesday'}Středa
												{:else if day === 'thursday'}Čtvrtek
												{:else if day === 'friday'}Pátek
												{:else if day === 'saturday'}Sobota
												{:else if day === 'sunday'}Neděle{/if}
											</label>
											<input
												type="text"
												bind:value={$editableSettings.contact.openingHours[day]}
												class="input input-bordered flex-grow"
												placeholder="např. 8:00-16:00 nebo Zavřeno"
											/>
										</div>
									{/each}
								</div>
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
									<span class="label-text">Logo</span>
								</label>
								
								<!-- Current logo display -->
								{#if $editableSettings.appearance.logo}
									<div class="mb-4 p-4 border rounded-lg bg-gray-50">
										<img
											src={$editableSettings.appearance.logo}
											alt="Logo"
											class="h-16 object-contain mb-2"
										/>
										<p class="text-sm text-gray-600">Současné logo</p>
									</div>
								{/if}								
								
								<form method="POST" action="?/upload" enctype="multipart/form-data" use:enhance={handleUploadEnhance}>
									<input type="hidden" name="fileType" value="logo" />
									<fieldset class="fieldset">										
										<input 
											type="file" 
											name="file"
											accept="image/*"
											class="file-input file-input-bordered w-full" 
											bind:this={logoFileInput}
											on:change={handleLogoFileChange}
										/>
										<label class="label">
											<span class="label-text-alt">Max velikost 2MB, podporované formáty: PNG, JPG, SVG</span>
										</label>
										{#if uploadingLogo}
											<div class="flex items-center gap-2 mt-2">
												<span class="loading loading-spinner loading-sm"></span>
												<span class="text-sm">Nahrávám logo...</span>
											</div>
										{/if}
									</fieldset>
								</form>
							</div>

							<div class="form-control">
								<label class="label">
									<span class="label-text">Favicon</span>
								</label>
								
								<!-- Current favicon display -->
								{#if $editableSettings.appearance.favicon}
									<div class="mb-4 p-4 border rounded-lg bg-gray-50">
										<img
											src={$editableSettings.appearance.favicon}
											alt="Favicon"
											class="h-8 object-contain mb-2"
										/>
										<p class="text-sm text-gray-600">Současný favicon</p>
									</div>
								{/if}								
								
								<form method="POST" action="?/upload" enctype="multipart/form-data" use:enhance={handleUploadEnhance}>
									<input type="hidden" name="fileType" value="favicon" />
									<fieldset class="fieldset">										
										<input 
											type="file" 
											name="file"
											accept="image/*"
											class="file-input file-input-bordered w-full" 
											bind:this={faviconFileInput}
											on:change={handleFaviconFileChange}
										/>
										<label class="label">
											<span class="label-text-alt">Max velikost 2MB, doporučujeme ICO nebo PNG formát</span>
										</label>
										{#if uploadingFavicon}
											<div class="flex items-center gap-2 mt-2">
												<span class="loading loading-spinner loading-sm"></span>
												<span class="text-sm">Nahrávám favicon...</span>
											</div>
										{/if}
									</fieldset>
								</form>
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

							<!-- Meta tagy sekce -->
							<div class="divider">META TAGY</div>
							
							<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div class="form-control">
									<label class="label">
										<span class="label-text">Autor (meta author)</span>
									</label>
									<input
										type="text"
										bind:value={$editableSettings.appearance.metaAuthor}
										class="input input-bordered w-full"
										placeholder="malyleo.cz"
									/>
								</div>

								<div class="form-control">
									<label class="label">
										<span class="label-text">Copyright (meta copyright)</span>
									</label>
									<input
										type="text"
										bind:value={$editableSettings.appearance.metaCopyright}
										class="input input-bordered w-full"
										placeholder="Šťastné srdce"
									/>
								</div>

								<div class="form-control">
									<label class="label">
										<span class="label-text">Robots (meta robots)</span>
									</label>
									<select
										bind:value={$editableSettings.appearance.metaRobots}
										class="select select-bordered w-full"
									>
										<option value="index, follow">Index, Follow</option>
										<option value="noindex, nofollow">Noindex, Nofollow</option>
										<option value="index, nofollow">Index, Nofollow</option>
										<option value="noindex, follow">Noindex, Follow</option>
									</select>
								</div>
							</div>

							<!-- Open Graph sekce -->
							<div class="divider">OPEN GRAPH</div>
							
							<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div class="form-control">
									<label class="label">
										<span class="label-text">OG Type</span>
									</label>
									<select
										bind:value={$editableSettings.appearance.ogType}
										class="select select-bordered w-full"
									>
										<option value="website">Website</option>
										<option value="article">Article</option>
										<option value="product">Product</option>
									</select>
								</div>

								<div class="form-control">
									<label class="label">
										<span class="label-text">OG URL</span>
									</label>
									<input
										type="url"
										bind:value={$editableSettings.appearance.ogUrl}
										class="input input-bordered w-full"
										placeholder="https://www.stastnesrdce.cz"
									/>
								</div>

								<div class="form-control">
									<label class="label">
										<span class="label-text">OG Locale</span>
									</label>
									<select
										bind:value={$editableSettings.appearance.ogLocale}
										class="select select-bordered w-full"
									>
										<option value="cs_CZ">cs_CZ</option>
										<option value="en_US">en_US</option>
										<option value="sk_SK">sk_SK</option>
									</select>
								</div>

								<div class="form-control">
									<label class="label">
										<span class="label-text">Twitter Card</span>
									</label>
									<select
										bind:value={$editableSettings.appearance.twitterCard}
										class="select select-bordered w-full"
									>
										<option value="summary_large_image">Summary Large Image</option>
										<option value="summary">Summary</option>
										<option value="app">App</option>
									</select>
								</div>
							</div>

							<!-- Web App sekce -->
							<div class="divider">WEB APP</div>
							
							<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div class="form-control">
									<label class="label">
										<span class="label-text">Apple Touch Icon</span>
									</label>
									<input
										type="text"
										bind:value={$editableSettings.appearance.appleTouchIcon}
										class="input input-bordered w-full"
										placeholder="/favi/apple-touch-icon.png"
									/>
								</div>

								<div class="form-control">
									<label class="label">
										<span class="label-text">Web Manifest</span>
									</label>
									<input
										type="text"
										bind:value={$editableSettings.appearance.webManifest}
										class="input input-bordered w-full"
										placeholder="/favi/site.webmanifest"
									/>
								</div>
							</div>

							<!-- Custom Scripts sekce -->
							<div class="divider">VLASTNÍ SCRIPTY</div>
							
							<div class="space-y-6">
								<div class="form-control">
									<label class="label">
										<span class="label-text">Scripty do HEAD sekce</span>
										<span class="label-text-alt">Pixels (GA a FB jsou v sekci SEO)</span>
									</label>
									<textarea
										bind:value={$editableSettings.appearance.customHeadScripts}
										class="textarea textarea-bordered h-32 font-mono text-sm"
										placeholder={`<script>
  // Váš kód zde
  console.log('Head script loaded');
</script>

<meta name="custom-meta" content="value" />`}
									></textarea>
									<label class="label">
										<span class="label-text-alt">Můžete vkládat &lt;script&gt;, &lt;meta&gt;, &lt;link&gt; a jiné HTML tagy</span>
									</label>
								</div>

								<div class="form-control">
									<label class="label">
										<span class="label-text">Scripty na konec BODY</span>
										<span class="label-text-alt">Tracking kódy, chat widgety, atd.</span>
									</label>
									<textarea
										bind:value={$editableSettings.appearance.customBodyScripts}
										class="textarea textarea-bordered h-32 font-mono text-sm"
										placeholder={`<script>
  // Váš kód zde
  console.log('Body script loaded');
</script>

<!-- Chat widget nebo jiné -->
<div id="custom-widget"></div>`}
									></textarea>
									<label class="label">
										<span class="label-text-alt">Scripty se vloží před konec &lt;/body&gt; tagu</span>
									</label>
								</div>

								<div class="alert alert-warning">
									<svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
									</svg>
									<div>
										<h3 class="font-bold">Upozornění!</h3>
										<div class="text-sm">Vkládejte pouze kód z důvěryhodných zdrojů. Neplatný kód může poškodit funkčnost webu.</div>
									</div>
								</div>
							</div>

							<!-- <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
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
							</div> -->
						</div>
					</div>
				{/if}

				<!-- Business Settings -->
				{#if activeTab === 'business' && $editableSettings.business}
					<div in:fade={{ duration: 300 }}>
						<h2 class="text-xl font-semibold mb-4">Firemní údaje</h2>

<div class="gap-8 grid">

						<div class="form-control w-3/4">
							<label class="label">
								<span class="label-text">Název firmy</span>
							</label>
							<input
								type="text"
								bind:value={$editableSettings.business.companyName}
								class="input input-bordered w-full"
							/>
						</div>
						<div class="grid grid-cols-4 gap-8">
							
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
									<span class="label-text">Číslo</span>
								</label>
								<input
									type="text"
									bind:value={$editableSettings.business.streetNumber}
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
							
						</div>
						<div class="form-control w-1/3">
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
										bind:checked={$editableSettings.integrations.fakturoid.enabled} 
										class="checkbox checkbox-primary"
									/>
									<span class="label-text font-medium">Povolit integraci s Fakturoid</span>
								</label>
							</div>

							{#if $editableSettings.integrations.fakturoid.enabled}
								<div class="space-y-4 pl-4 border-l-4 border-green-200">
									<!-- OAuth Connection Status -->
									<div class="flex items-center justify-between">
										<div>
											<h3 class="text-lg font-medium">Fakturoid</h3>
											{#if $editableSettings.integrations?.fakturoid?.connected}
												<p class="text-sm text-gray-500">Připojeno k účtu: {$editableSettings.integrations.fakturoid.accounts[0]?.email}</p>
											{:else}
												<p class="text-sm text-gray-500">Fakturoid používá bezpečné OAuth 2.0 ověření. Klikněte níže pro připojení vašeho Fakturoid účtu.</p>
											{/if}
										</div>
										{#if $editableSettings.integrations?.fakturoid?.connected}
											<button
												on:click={() => disconnectFakturoid()}
												class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
											>
												Odpojit účet
											</button>
										{:else}
											<button
												on:click={() => connectFakturoid()}
												class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
											>
												Připojit účet
											</button>
										{/if}
									</div>
									
									{#if $editableSettings.integrations.fakturoid.connected}
										<div class="mt-3 p-2 bg-green-100 rounded text-xs text-green-700">
											<strong>Účet:</strong> {$editableSettings.integrations.fakturoid.accounts.length > 0 ? $editableSettings.integrations.fakturoid.accounts[0].name : 'Připojeno'}
											{#if $editableSettings.integrations.fakturoid.accounts.length > 0 && $editableSettings.integrations.fakturoid.accounts[0].subdomain}
												<br><strong>Subdoména:</strong> {$editableSettings.integrations.fakturoid.accounts[0].subdomain}
											{/if}
										</div>
									{/if}
								</div>
							{/if}
						</div>
					</div>
				{/if}

				<!-- Orders Settings -->
				{#if activeTab === 'orders' && $editableSettings.orders}
					<div in:fade={{ duration: 300 }}>
						<h2 class="text-base sm:text-xl font-semibold mb-4">Nastavení zakázek</h2>
						
						<!-- Stavy zakázek -->
						<div class="mb-6 border-b pb-4">
							<h3 class="text-base sm:text-lg font-medium mb-3">Stavy zakázek</h3>
							<p class="text-xs sm:text-sm text-gray-600 mb-3">Definujte stavy objednávek, které se používají v systému. Stavy jsou automaticky načteny z existujících objednávek.</p>
							
							{#if !$editableSettings.orders.orderStates || $editableSettings.orders.orderStates.length === 0}
								<div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
									<p class="text-yellow-800 text-xs sm:text-sm">
										<i class="fa-solid fa-exclamation-triangle"></i>
										Žádné stavy zakázek nebyly definovány. Klikněte na "Načíst ze systému" pro automatické načtení stavů z existujících objednávek.
									</p>
								</div>
							{:else}
								<div class="space-y-2">
									{#each $editableSettings.orders.orderStates as state, index}
										<div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
											<div class="flex gap-2 flex-1">
												<input 
													type="text" 
													bind:value={state.name} 
													class="input input-bordered input-sm flex-grow min-w-0"
													placeholder="Název stavu"
												/>
												<input 
													type="color" 
													bind:value={state.color} 
													class="w-10 h-8 rounded border border-gray-300 flex-shrink-0"
													title="Barva stavu"
												/>
											</div>
											<button 
												class="btn btn-xs btn-outline btn-error self-end sm:self-auto" 
												on:click={() => removeOrderState(index)}
												title="Smazat stav">
												×
											</button>
										</div>
									{/each}
								</div>
							{/if}
							
							<div class="flex flex-col sm:flex-row gap-2 mt-3">
								<button 
									class="btn btn-xs sm:btn-sm btn-outline w-full sm:w-auto" 
									on:click={addOrderState}>
									<i class="fa-solid fa-plus"></i>
									<span class="hidden sm:inline">Přidat stav zakázky</span>
									<span class="sm:hidden">Přidat stav</span>
								</button>								
							</div>
						</div>
						
						<!-- Další nastavení zakázek -->
						<div class="mb-6">
							<h3 class="text-base sm:text-lg font-medium mb-3">Notifikace</h3>
							
							<div class="form-control">
								<label class="label">
									<span class="label-text text-sm sm:text-base">E-mail pro notifikace</span>
								</label>
								<input
									type="email"
									bind:value={$editableSettings.orders.notificationEmail}
									class="input input-bordered input-sm sm:input-md w-full"
									placeholder="admin@example.com"
								/>
								<span class="text-xs text-gray-500 mt-1">
									E-mail, na který budou zasílány notifikace o nových objednávkách
								</span>
							</div>
						</div>
					</div>
				{/if}

				<!-- Delivery Settings -->
				{#if activeTab === 'delivery'}
					<div in:fade={{ duration: 300 }}>
						<h2 class="text-xl font-semibold mb-4">Nastavení dopravy</h2>
						
						<!-- Způsoby dopravy -->
						<div class="mb-6 border-b pb-4">
							<h3 class="text-lg font-medium mb-3">Způsoby dopravy</h3>
							
							{#if !$editableSettings.delivery?.shippingMethods || $editableSettings.delivery.shippingMethods.length === 0}
								<p class="text-gray-500 mb-2">Žádné způsoby dopravy nebyly definovány</p>
							{:else}
								<div class="space-y-2">
									{#each $editableSettings.delivery.shippingMethods as method, index}
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
										bind:value={$editableSettings.delivery.minimumOrderValue}
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
										bind:value={$editableSettings.delivery.freeDeliveryThreshold}
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

	<!-- Mobile Action Buttons (Fixed Bottom) -->
	<div class="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-300 p-4 space-y-2 z-50">
		<form method="POST" action="?/update" use:enhance={handleSaveEnhance}>
			<input type="hidden" name="settings" value={JSON.stringify($editableSettings)} />
			<button
				type="submit"
				disabled={loading}
				class="w-full btn btn-sm btn-primary bg-green-800 text-white hover:bg-green-700"
			>
				{#if loading}
					Ukládání...
				{:else if saved}
					Uloženo
				{:else}
					Uložit změny
				{/if}
			</button>
		</form>

		<button
			on:click={resetSettings}
			class="w-full btn btn-sm btn-outline"
		>
			Obnovit výchozí
		</button>
	</div>

	<!-- Mobile Bottom Padding -->
	<div class="lg:hidden h-24"></div>
</div>


<style>
	/* Custom scrollbar for mobile tabs */
	.scrollbar-thin {
		scrollbar-width: thin;
		scrollbar-color: #cbd5e0 transparent;
	}
	
	.scrollbar-thin::-webkit-scrollbar {
		height: 4px;
	}
	
	.scrollbar-thin::-webkit-scrollbar-track {
		background: transparent;
	}
	
	.scrollbar-thin::-webkit-scrollbar-thumb {
		background: #cbd5e0;
		border-radius: 2px;
	}
	
	.scrollbar-thin::-webkit-scrollbar-thumb:hover {
		background: #a0aec0;
	}

	/* Mobile responsive inputs */
	@media (max-width: 375px) {
		.input-sm {
			font-size: 0.75rem;
			padding: 0.375rem 0.5rem;
		}
		
		.btn-xs {
			font-size: 0.625rem;
			padding: 0.25rem 0.5rem;
		}
	}
</style>