<script lang="ts">
	import { writable, type Writable } from "svelte/store";
	import { fade, fly } from "svelte/transition";
	import type { PageData } from "./$types";
	import { enhance } from "$app/forms";
	import { page } from "$app/stores";
	import { onMount } from "svelte";
	import { goto } from "$app/navigation";
	import { browser } from "$app/environment";

	import GeneralSettings from "./GeneralSettings.svelte";
	import SeoSettings from "./SeoSettings.svelte";
	import ContactSettings from "./ContactSettings.svelte";
	import SocialSettings from "./SocialSettings.svelte";
	import AppearanceSettings from "./AppearanceSettings.svelte";
	import BusinessSettings from "./BusinessSettings.svelte";
	import EmailSettings from "./EmailSettings.svelte";
	import IntegrationsSettings from "./IntegrationsSettings.svelte";
	import OrdersSettings from "./OrdersSettings.svelte";
	import DeliverySettings from "./DeliverySettings.svelte";
	import ProductsSettings from "./ProductsSettings.svelte";
	import CustomerSettings from "./CustomerSettings.svelte";
	import LoyaltySettings from "./LoyaltySettings.svelte";
	import NotificationSettings from "./NotificationSettings.svelte";

		export let data: PageData;

	type FormData = {
		message?: {
			success: boolean;
			display: string;
		};
	};

	export const form: FormData | null = null;

	// Supabase bude dostupné přes locals v komponentě

	// State management
	let loading = false;
	let saved = false;
	let activeTab = 'general';
	let saveMessage = '';
	let saveMessageType: 'success'|'error'|'info' = 'success';
	let showMessage = false;
	let loadingTab = false;

	// File upload state
	let uploadingLogo: boolean = false;
	let uploadingFavicon: boolean = false;
	let logoFileInput!: HTMLInputElement;
	let faviconFileInput!: HTMLInputElement;

	// Cache management
	const CACHE_KEY = "site_settings_cache";
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
			console.error("Chyba při čtení cache:", e);
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
			console.error("Chyba při ukládání do cache:", e);
		}
	}

	function clearCache() {
		if (!browser) return;
		localStorage.removeItem(CACHE_KEY);
	}

	// Zpracování OAuth úspěchu a chyb
	onMount(() => {
		const success = $page.url.searchParams.get("success");
		const error = $page.url.searchParams.get("error");
		const message = $page.url.searchParams.get("message");
		const tab = $page.url.searchParams.get("tab");
		
		// Automatické přepnutí na zadanou záložku
		if (tab && ["general", "seo", "contact", "social", "appearance", "business", "email", "integrations", "orders", "delivery", "products", "customer", "inventory"].includes(tab)) {
			activeTab = tab;
		}
		
		if (success === "fakturoid_connected") {
			activeTab = "integrations";
			saveMessage = "Fakturoid byl úspěšně připojen přes OAuth!";
			saveMessageType = "success";
			showMessage = true;
			
			setTimeout(() => {
				showMessage = false;
			}, 5000);
		} else if (success === "fakturoid_disconnected") {
			activeTab = "integrations";
			// Vyčistíme local cache
			clearCache();
			// Vynucíme refresh dat
			window.location.hash = "#refresh";
			
			saveMessage = "Fakturoid byl úspěšně odpojeno!";
			saveMessageType = "success";
			showMessage = true;
			
			setTimeout(() => {
				showMessage = false;
			}, 5000);
		} else if (error) {
			activeTab = "integrations";
			
			// Mapování chybových kódů na uživatelsky přívětivé zprávy
			const errorMessages: Record<string, string> = {
				"oauth_state_mismatch": "Chyba ověření OAuth stavu. Zkuste to prosím znovu.",
				"missing_oauth_params": "Chybí OAuth parametry. Zkuste připojení znovu.",
				"invalid_state_format": "Neplatný formát OAuth stavu.",
				"token_request_failed": "Nepodařilo se získat přístupový token od Fakturoid.",
				"user_info_failed": "Nepodařilo se načíst informace o uživateli z Fakturoid.",
				"token_save_failed": "Nepodařilo se uložit přístupový token do databáze.",
				"settings_update_failed": "Nepodařilo se aktualizovat nastavení integrace.",
				"callback_failed": "Obecná chyba při OAuth callback."
			};
			
			saveMessage = errorMessages[error] || (message ? decodeURIComponent(message) : "Neznámá chyba při připojování Fakturoid účtu.");
			saveMessageType = "error";
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
	$: if ($page.url.searchParams.get("success") === "fakturoid_disconnected") {
		// Force refresh dat po odpojení
		setTimeout(() => {
			editableSettings.set(structureSettings(settings));
		}, 100);
	}

	// Import unified default values
	import { UNIFIED_DEFAULT_SETTINGS } from "$lib/constants/defaultSettings";

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
			console.warn("Žádná data pro strukturování nastavení");
			return structured;
		}

		// Projdeme načtená data a aktualizujeme strukturu
		settingsData.forEach((item: any) => {
			if (!item || !item.key) {
				return;
			}

			// Ignorujeme neplatné klíče
		if (item.key === "action" || item.key === "settings") {
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
	let editableSettings: Writable<Record<string, any>> = writable<Record<string, any>>(structureSettings(data.settings));

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
			const response = await fetch("?/loadSetting", {
				method: "POST",
				body: (() => {
					const formData = new FormData();
					formData.append("key", tabId);
					return formData;
				})()
			});

			if (response.ok) {
				const result = await response.json();
				if (result.type === "success" && result.data?.setting) {
					// Aktualizujeme pouze toto konkrétní nastavení
					editableSettings.update(s => ({
						...s,
						[tabId]: result.data.setting.value || (tabId in DEFAULT_VALUES ? DEFAULT_VALUES[tabId as keyof typeof DEFAULT_VALUES] : {})
					}));
				}
			}
		} catch (e) {
			console.error("Chyba při načítání nastavení:", e);
		} finally {
			loadingTab = false;
		}
	}

	// Tabs configuration
	const tabs = [
		{ id: "general", label: "Obecné", icon: "fa-solid fa-gear" },
		{ id: "seo", label: "SEO", icon: "fa-solid fa-magnifying-glass" },
		{ id: "contact", label: "Kontakt", icon: "fa-solid fa-address-book" },
		{ id: "social", label: "Sociální sítě", icon: "fa-solid fa-share-nodes" },
		{ id: "appearance", label: "Vzhled", icon: "fa-solid fa-palette" },
		{ id: "business", label: "Firemní údaje", icon: "fa-solid fa-building" },
		{ id: "email", label: "Šablony e-mailů", icon: "fa-solid fa-envelope" },
		{ id: "notifications", label: "Automatické notifikace", icon: "fa-solid fa-bell" },
		{ id: "integrations", label: "Integrace", icon: "fa-solid fa-plug" },
		{ id: "orders", label: "Objednávky", icon: "fa-solid fa-clipboard-list" },
		{ id: "delivery", label: "Doprava", icon: "fa-solid fa-truck" },
		{ id: "products", label: "Produkty", icon: "fa-solid fa-utensils" },
		{ id: "customer", label: "Zákazníci", icon: "fa-solid fa-users" },
		{ id: "loyalty", label: "Věrnostní systém", icon: "fa-solid fa-gem" }
	];

	// Set active tab with lazy loading
	async function setActiveTab(tabId: string) {
		activeTab = tabId;
		// Lazy load nastavení pro tento tab
		await loadTabSettings(tabId);
	}

	// Reset settings to defaults
	function resetSettings() {
		if (confirm("Opravdu chcete obnovit výchozí nastavení? Všechny změny budou ztraceny.")) {
			editableSettings.set(structureSettings(settings));
			saveMessage = "Nastavení byla obnovena na původní hodnoty";
			saveMessageType = "info";
			showMessage = true;

			setTimeout(() => {
				showMessage = false;
			}, 3000);
		}
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
		const fileType = formData.get("fileType") as string;
		
		if (fileType === "logo") {
			uploadingLogo = true;
		} else if (fileType === "favicon") {
			uploadingFavicon = true;
		}

		return async ({ result, update }: { result: any, update: () => Promise<void> }) => {
			await update();

			// Reset loading states
			uploadingLogo = false;
			uploadingFavicon = false;

			if (result.type === "success" && result.data?.success) {
				// Zobrazíme success zprávu
				saveMessage = result.data.message || "Soubor byl úspěšně nahrán";
				saveMessageType = "success";
				showMessage = true;

				// Aktualizujeme nastavení s novou URL
				if (result.data.fileUrl) {
					if (fileType === "logo") {
						$editableSettings.appearance.logo = result.data.fileUrl;
						if (logoFileInput) logoFileInput.value = "";
					} else if (fileType === "favicon") {
						$editableSettings.appearance.favicon = result.data.fileUrl;
						if (faviconFileInput) faviconFileInput.value = "";
					}
				}

				setTimeout(() => {
					showMessage = false;
				}, 5000);
			} else if (result.type === "failure") {
				// Zobrazíme error zprávu
				saveMessage = result.data?.error || "Chyba při nahrávání souboru";
				saveMessageType = "error";
				showMessage = true;

				setTimeout(() => {
					showMessage = false;
				}, 8000);
			}
		};
	}

	// Available currencies
	const availableCurrencies = [
		{ code: "CZK", name: "Česká koruna" },
		{ code: "EUR", name: "Euro" },
		{ code: "USD", name: "Americký dolar" }
	];

	// Handle přidání měny z selectu - pouze jedna měna
	function handleCurrencyAdd(event: Event) {
		const target = event.target as HTMLSelectElement;
		const currencyCode = target.value;
		
		if (currencyCode && currencyCode.trim() !== "") {
			if (!$editableSettings.general) {
				$editableSettings.general = {};
			}
			
			// Nastavíme pouze jednu měnu (přepíše původní)
			$editableSettings.general.currencies = [currencyCode];
			$editableSettings = $editableSettings;
			
			// Reset selectu
			target.value = "";
		}
	}

	// Remove currency - smaže všechny měny
	function removeCurrency(index: number) {
		if ($editableSettings.general?.currencies) {
			$editableSettings.general.currencies = [];
			$editableSettings = $editableSettings;
		}
	}
</script>

<!-- Success/Error Message -->
{#if showMessage}
	<div class="fixed top-4 right-4 z-50">
		<div class="alert {saveMessageType === 'success' ? 'alert-success' : saveMessageType === 'error' ? 'alert-error' : 'alert-info'} shadow-lg">
			<div>
				{#if saveMessageType === 'success'}
					<svg xmlns="http://www.w3.org/2000/svg" class="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
				{:else if saveMessageType === 'error'}
					<svg xmlns="http://www.w3.org/2000/svg" class="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
				{:else}
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current flex-shrink-0 w-6 h-6">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
					</svg>
				{/if}
				<span>{saveMessage}</span>
			</div>
		</div>
	</div>
{/if}

<div class="min-h-screen bg-gray-100">
	<!-- Header -->
	<div class="bg-white shadow-sm border-b border-gray-200">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex justify-between items-center py-4">
				<div>
					<h1 class="text-2xl font-bold text-gray-900">Nastavení systému</h1>					
				</div>
				
				<!-- Desktop Save Button -->
				<div class="hidden lg:flex items-center gap-4">
					<form method="POST" action="?/update" use:enhance={handleSaveEnhance}>
						<input type="hidden" name="settings" value={JSON.stringify($editableSettings)} />
						<button
							type="submit"
							disabled={loading}
							class="btn btn-primary bg-green-800 text-white hover:bg-green-700"
						>
							{#if loading}
								<span class="loading loading-spinner loading-sm"></span>
								Ukládání...
							{:else if saved}
								<i class="fa-solid fa-check"></i>
								Uloženo
							{:else}
								<i class="fa-solid fa-save"></i>
								Uložit změny
							{/if}
						</button>
					</form>					
				</div>
			</div>
		</div>
	</div>

	<!-- Main Content -->
	<div class="max-w-7xl mx-auto py-6">
		<div class="flex flex-col lg:flex-row gap-6">			
			<!-- Sidebar -->
			<div class="lg:w-1/4">
				<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">										
					<!-- Desktop Tabs -->
					<div class="hidden lg:block">
						<div class="space-y-2">
							{#each tabs as tab}
								<button
									class="w-full text-left px-4 py-3 rounded-lg transition-colors {activeTab === tab.id ? 'bg-blue-100 text-blue-800 border border-blue-200' : 'hover:bg-gray-50 text-gray-700'}"
									on:click={() => setActiveTab(tab.id)}
								>
									<div class="flex items-center gap-3">
										<i class="{tab.icon} text-lg"></i>
										<span class="font-medium">{tab.label}</span>
									</div>
								</button>
							{/each}
						</div>
					</div>

					<!-- Mobile Tabs -->
					<div class="lg:hidden">
						<div class="flex overflow-x-auto scrollbar-thin gap-2 pb-2">
							{#each tabs as tab}
								<button
									class="flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors {activeTab === tab.id ? 'bg-blue-100 text-blue-800 border border-blue-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
									on:click={() => setActiveTab(tab.id)}
								>
									<div class="flex items-center gap-2">
										<i class="{tab.icon}"></i>
										<span>{tab.label}</span>
									</div>
								</button>
							{/each}
						</div>
					</div>
				</div>
			</div>

			<!-- Tab Content -->
			<div class="lg:w-3/4">
				<div class="bg-gray-50 rounded-lg p-3 sm:p-6 border border-gray-300">
					{#if loadingTab}
						<div class="flex items-center justify-center py-8">
							<span class="loading loading-spinner loading-lg"></span>
							<span class="ml-2">Načítání...</span>
						</div>
					{:else}
						<!-- General Settings -->
						{#if activeTab === 'general' && $editableSettings.general}
							<GeneralSettings {editableSettings} {availableCurrencies} />
						{/if}

						<!-- SEO Settings -->
						{#if activeTab === 'seo' && $editableSettings.seo}
							<SeoSettings {editableSettings} />
						{/if}

						<!-- Contact Settings -->
						{#if activeTab === 'contact' && $editableSettings.contact}
							<ContactSettings {editableSettings} />
						{/if}

						<!-- Social Settings -->
						{#if activeTab === 'social' && $editableSettings.social}
							<SocialSettings {editableSettings} />
						{/if}

						<!-- Appearance Settings -->
						{#if activeTab === 'appearance' && $editableSettings.appearance}
							<AppearanceSettings 
								{editableSettings} 
								{uploadingLogo} 
								{uploadingFavicon} 
								{logoFileInput} 
								{faviconFileInput} 
							/>
						{/if}

						<!-- Business Settings -->
						{#if activeTab === 'business' && $editableSettings.business}
							<BusinessSettings {editableSettings} />
						{/if}

						<!-- Email Settings -->
						{#if activeTab === 'email' && $editableSettings.email}
							<EmailSettings {editableSettings} />
						{/if}

						<!-- Integrations Settings -->
						{#if activeTab === 'integrations' && $editableSettings.integrations}
							<IntegrationsSettings {editableSettings} />
						{/if}

						<!-- Orders Settings -->
						{#if activeTab === 'orders' && $editableSettings.orders}
							<OrdersSettings {editableSettings} />
						{/if}

						<!-- Delivery Settings -->
						{#if activeTab === 'delivery' && $editableSettings.delivery}
							<DeliverySettings {editableSettings} />
						{/if}

						<!-- Products Settings -->
						{#if activeTab === 'products' && $editableSettings.products}
							<ProductsSettings {editableSettings} />
						{/if}

						<!-- Customer Settings -->
						{#if activeTab === 'customer' && $editableSettings.customer}
							<CustomerSettings {editableSettings} />
						{/if}

						<!-- Loyalty Settings -->
						{#if activeTab === 'loyalty' && $editableSettings.customer?.loyalty}
							<LoyaltySettings {editableSettings} />
						{/if}

						<!-- Notification Settings -->
						{#if activeTab === 'notifications'}
							<NotificationSettings {editableSettings} />
						{/if}						
					{/if}
				</div>
			</div>			
		</div>	
		<div class="">
		<button
			on:click={resetSettings}
			class="btn btn-sm btn-outline my-5"
		>
			Obnovit výchozí nastavení
		</button>
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