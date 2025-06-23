<script lang="ts">
	import { onMount, createEventDispatcher } from 'svelte';
	import { fade, slide } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { cookieStore, type CookieCategory } from '../stores/cookieStore';

	const dispatch = createEventDispatcher();

	// Props
	export let cookieName: string = 'gdpr_consent';
	export let visible: boolean = true;
	export let showSettingsButton: boolean = true;
	export let showEditIcon: boolean = true;
	export let companyName: string = 'Šťastné srdce';
	export let privacyPolicyUrl: string = '/gdpr';

	// Text labels - možná přizpůsobit podle jazyka
	export let headingText: string = 'Souhlas s cookies';
	export let descriptionText: string = 'Abychom poskytli co nejlepší služby, používáme technologie jako jsou cookies pro ukládání a přístup k informacím o zařízení. Souhlas s těmito technologiemi nám umožní zpracovávat údaje, jako je chování při procházení nebo unikátní ID na tomto webu.';
	export let acceptAllLabel: string = 'Přijmout vše';
	export let acceptSelectedLabel: string = 'Potvrdit výběr';
	export let rejectAllLabel: string = 'Odmítnout vše';
	export let settingsLabel: string = 'Vlastní nastavení';
	export let closeLabel: string = 'Zavřít';
	export let editLabel: string = 'Upravit nastavení cookies';

	// Stavy
	let shown: boolean = false;
	let settingsShown: boolean = false;
	let cookieCategories: Record<string, any> = {};

	// Pomocná funkce pro reaktivní aktualizaci
	function updateCategoryValue(id: CookieCategory, value: boolean) {
		$cookieStore[id].value = value;
		cookieCategories = { ...$cookieStore };
	}

	function show() {
		// Zkopírujeme aktuální hodnoty z cookie store
		cookieCategories = { ...$cookieStore };
		shown = true;
		settingsShown = false;
		dispatch('show');
	}

	function showSettings() {
		settingsShown = true;
	}

	function closeSettings(save = false) {
		settingsShown = false;
		if (!save) {
			// Obnovíme hodnoty z cookie store bez ukládání změn
			cookieCategories = { ...$cookieStore };
		}
	}

	function acceptSelected() {
		cookieStore.saveSelection();
		shown = false;
		settingsShown = false;
		dispatch('accept-selection');
	}

	function acceptAll() {
		cookieStore.acceptAll();
		shown = false;
		settingsShown = false;
		dispatch('accept-all');
	}

	function rejectAll() {
		cookieStore.rejectAll();
		shown = false;
		settingsShown = false;
		dispatch('reject-all');
	}

	onMount(() => {
		// Nastavení podle cookie store
		cookieCategories = { ...$cookieStore };

		// Synchronizace viditelnosti dialogu
		shown = visible && !cookieStore.hasConsent();
	});

	// Reaktivní aktualizace když se změní prop 'visible'
	$: if (visible !== shown && visible) {
		show();
	}
</script>

{#if showEditIcon && !shown}
	<button
		class="cookie-btn-toggle"
		aria-label={editLabel}
		on:click={() => show()}
		transition:fade={{duration: 200}}>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 512 512"
			fill="currentColor"
			width="24"
			height="24">
			<path d="M510.52 255.82c-69.97-.85-126.47-57.69-126.47-127.86-70.17 0-127-56.49-127.86-126.45-27.26-4.14-55.13.3-79.72 12.82l-69.13 35.22a132.221 132.221 0 0 0-57.79 57.81l-35.1 68.88a132.645 132.645 0 0 0-12.82 80.95l12.08 76.27a132.521 132.521 0 0 0 37.16 72.96l54.77 54.76a132.036 132.036 0 0 0 72.71 37.06l76.71 12.15c27.51 4.36 55.7-.11 80.53-12.76l69.13-35.21a132.273 132.273 0 0 0 57.79-57.81l35.1-68.88c12.56-24.64 17.01-52.58 12.91-79.91zM176 368c-17.67 0-32-14.33-32-32s14.33-32 32-32 32 14.33 32 32-14.33 32-32 32zm32-160c-17.67 0-32-14.33-32-32s14.33-32 32-32 32 14.33 32 32-14.33 32-32 32zm160 128c-17.67 0-32-14.33-32-32s14.33-32 32-32 32 14.33 32 32-14.33 32-32 32z" />
		</svg>
	</button>
{/if}

{#if shown}
	<div class="cookie-overlay" transition:fade={{duration: 300}}>
		<div class="cookie-banner" transition:slide={{duration: 300, easing: quintOut}}>
			{#if !settingsShown}
				<!-- Hlavní banner -->
				<div class="cookie-content">
					<div class="cookie-header">
						<h2>{headingText}</h2>
					</div>
					<div class="cookie-body">
						<p>{descriptionText}</p>
						<p class="cookie-privacy-link">
							Více informací najdete v našich <a href={privacyPolicyUrl}>zásadách ochrany osobních údajů</a>.
						</p>
					</div>
					<div class="cookie-buttons">
						<button class="cookie-btn cookie-btn-reject" on:click={rejectAll}>
							{rejectAllLabel}
						</button>
						{#if showSettingsButton}
							<button class="cookie-btn cookie-btn-settings" on:click={showSettings}>
								{settingsLabel}
							</button>
						{/if}
						<button class="cookie-btn cookie-btn-accept" on:click={acceptAll}>
							{acceptAllLabel}
						</button>
					</div>
				</div>
			{:else}
				<!-- Detailní nastavení -->
				<div class="cookie-settings">
					<div class="cookie-header">
						<h2>Nastavení cookies</h2>
						<button class="cookie-btn-close" on:click={() => closeSettings(false)}>
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="24" height="24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>
					</div>
					<div class="cookie-body">
						<p>Zde můžete přizpůsobit své preference pro cookies. Nutné cookies jsou vždy povoleny, protože jsou nezbytné pro fungování webu.</p>

						<div class="cookie-categories">
							{#each Object.values($cookieStore) as category}
								<div class="cookie-category">
									<div class="cookie-category-header">
										<label class="cookie-switch">
											<input
												type="checkbox"
												checked={category.value}
												disabled={category.required}
												on:change={(e) => updateCategoryValue(category.id, e.target.checked)}
											/>
											<span class="cookie-slider"></span>
										</label>
										<h3>{category.label}</h3>
									</div>
									<p class="cookie-category-desc">{category.description}</p>
								</div>
							{/each}
						</div>
					</div>
					<div class="cookie-buttons">
						<button class="cookie-btn cookie-btn-reject" on:click={rejectAll}>
							{rejectAllLabel}
						</button>
						<button class="cookie-btn cookie-btn-accept-selected" on:click={acceptSelected}>
							{acceptSelectedLabel}
						</button>
						<button class="cookie-btn cookie-btn-accept" on:click={acceptAll}>
							{acceptAllLabel}
						</button>
					</div>
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
    /* Základní styly pro banner */
    .cookie-overlay {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        /*background-color: rgba(0, 0, 0, 0.5);*/
        z-index: 9999;
        display: flex;
        justify-content: center;
        align-items: flex-end;
        padding: 1rem;
    }

    .cookie-banner {
        background-color: white;
        border-radius: 0.5rem;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        width: 100%;
        max-width: 800px;
        max-height: 80vh;
        overflow-y: auto;
    }

    .cookie-content, .cookie-settings {
        padding: 1.5rem;
    }

    .cookie-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
    }

    .cookie-header h2 {
        font-size: 1.5rem;
        font-weight: 600;
        margin: 0;
    }

    .cookie-body {
        margin-bottom: 1.5rem;
    }

    .cookie-privacy-link {
        font-size: 0.875rem;
        margin-top: 0.5rem;
    }

    .cookie-privacy-link a {
        color: #000000;
        text-decoration: underline;
    }

    .cookie-buttons {
        display: flex;
        flex-wrap: wrap;
        gap: 0.75rem;
        justify-content: flex-end;
    }

    /* Tlačítka */
    .cookie-btn {
        padding: 0.5rem 1rem;
        border-radius: 0.25rem;
        font-weight: 500;
        border: none;
        cursor: pointer;
        font-size: 0.875rem;
        transition: background-color 0.2s, transform 0.1s;
    }

    .cookie-btn:hover {
        transform: translateY(-1px);
    }

    .cookie-btn:active {
        transform: translateY(0px);
    }

    .cookie-btn-accept {
        background-color: #15803d;
        color: white;
    }

    .cookie-btn-accept:hover {
        background-color: #166534;
    }

    .cookie-btn-settings {
        background-color: #f5f5f5;
        color: #333;
    }

    .cookie-btn-settings:hover {
        background-color: #e8e8e8;
    }

    .cookie-btn-reject {
        background-color: #f5f5f5;
        color: #333;
    }

    .cookie-btn-reject:hover {
        background-color: #e8e8e8;
    }

    .cookie-btn-accept-selected {
        background-color: #94a3b8;
        color: white;
    }

    .cookie-btn-accept-selected:hover {
        background-color: #64748b;
    }

    .cookie-btn-close {
        background-color: transparent;
        border: none;
        color: #666;
        cursor: pointer;
        padding: 0.25rem;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 9999px;
    }

    .cookie-btn-close:hover {
        background-color: #f5f5f5;
    }

    /* Kategorie cookies */
    .cookie-categories {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        margin-top: 1rem;
    }

    .cookie-category {
        background-color: #f9f9f9;
        border-radius: 0.375rem;
        padding: 1rem;
    }

    .cookie-category-header {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin-bottom: 0.5rem;
    }

    .cookie-category-header h3 {
        font-size: 1rem;
        font-weight: 600;
        margin: 0;
    }

    .cookie-category-desc {
        font-size: 0.875rem;
        color: #666;
        margin: 0;
    }

    /* Přepínač (switch) */
    .cookie-switch {
        position: relative;
        display: inline-block;
        width: 48px;
        height: 24px;
    }

    .cookie-switch input {
        opacity: 0;
        width: 0;
        height: 0;
    }

    .cookie-slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: #ccc;
        transition: .3s;
        border-radius: 24px;
    }

    .cookie-slider:before {
        position: absolute;
        content: "";
        height: 18px;
        width: 18px;
        left: 3px;
        bottom: 3px;
        background-color: white;
        transition: .3s;
        border-radius: 50%;
    }

    input:checked + .cookie-slider {
        background-color: #15803d;
    }

    input:checked + .cookie-slider:before {
        transform: translateX(24px);
    }

    input:disabled + .cookie-slider {
        opacity: 0.7;
        cursor: not-allowed;
    }

    /* Tlačítko pro opětovné zobrazení banneru */
    .cookie-btn-toggle {
        position: fixed;
        bottom: 1.5rem;
        left: 1.5rem;
        width: 3rem;
        height: 3rem;
        background-color: #e2e8f0;
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        border: none;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
        transition: background-color 0.2s, transform 0.1s;
        z-index: 9998;
    }

    .cookie-btn-toggle:hover {
        background-color: #15803d;
        transform: scale(1.05);
    }

    /* Responzivní úpravy */
    @media (max-width: 768px) {
        .cookie-buttons {
            flex-direction: column;
            width: 100%;
        }

        .cookie-btn {
            width: 100%;
            text-align: center;
        }
    }

    @media (max-width: 480px) {
        .cookie-overlay {
            padding: 0.5rem;
        }

        .cookie-content, .cookie-settings {
            padding: 1rem;
        }
    }
</style>