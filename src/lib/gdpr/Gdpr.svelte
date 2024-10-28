<svelte:options
	customElement={{
		tag: "cookie-consent-banner",
		props: {
			cookieName: { attribute: "cookie-name" },
			canRejectCookies: { attribute: "can-reject-cookies", type: "Boolean" },
			showEditIcon: { attribute: "show-edit-icon", type: "Boolean" },
			acceptLabel: { attribute: "accept-label" },
			rejectLabel: { attribute: "reject-label" },
			settingsLabel: { attribute: "settings-label" },
			closeLabel: { attribute: "close-label" },
			editLabel: { attribute: "edit-label" },
			visible: { attribute: "visible", type: "Boolean" },
			settingsShown: { attribute: "settings-shown", type: "Boolean" },
			cookieConfig: { attribute: "cookie-config", type: "Object" },
			shown: { attribute: "shown", type: "Boolean" },
			choices: { attribute: "choices", type: "Object" }
		}
	}} />

<script>
	import Cookies from "js-cookie";
	import { validate } from "./util.js";
	import { fade } from "svelte/transition";
	import { onMount, createEventDispatcher } from "svelte";

	const dispatch = createEventDispatcher();

	/**
	 * @type {string|undefined|null}
	 */
	export let cookieName = null;
	export let canRejectCookies = false;
	export let showEditIcon = true;

	/**
	 * @type {string|undefined|null}
	 */
	export let acceptLabel = "Souhlasíš";
	export let rejectLabel = "Nesouhlasíš";
	export let settingsLabel = "Nastavení";
	export let closeLabel = "Zavřít nastavení";
	export let editLabel = "Editovat cookie nastavení";

	/**
	 * Whether to show the cookie banner if the user has not yet accepted or rejected your choices.
	 *
	 * @type {boolean|undefined|null}
	 */
	export let visible = true;

	let shown = false;
	let settingsShown = false;

	export let heading = "GDPR Oznámení";
	export let description =
		'Abychom poskytli co nejlepší služby, používáme k ukládání a/nebo přístupu k informacím o zařízení, technologie jako jsou soubory cookies. Souhlas s těmito technologiemi nám umožní zpracovávat údaje, jako je chování při procházení nebo jedinečná ID na tomto webu. Zde jsou  <a href="/gdpr">zásady použítí</a>.';

	export let cookieConfig = {
		domain: "stastnesrdce.cz",
		path: "/"
	};

	const defaults = {
		sameSite: "strict"
	};
	export let choices = {};
	const choicesDefaults = {
		necessary: {
			label: "Nutné",
			description: "Tyto šušenky jsou nutné pro základní fungování webu",
			value: true
		},
		tracking: {
			label: "Sledovací",
			description: "Používá se pro reklamní systémy",
			value: true
		},
		analytics: {
			label: "Analytické",
			description: "Google Analytics a další analytické nástroje 3.stran",
			value: true
		},
		marketing: {
			label: "Marketingové",
			description: "Použítí pro marketingové data",
			value: true
		}
	};

	$: choicesMerged = Object.assign({}, choicesDefaults, choices);

	$: choicesArr = Object.values(choicesMerged).map((item, index) => {
		return Object.assign({}, item, { id: Object.keys(choicesMerged)[index] });
	});

	$: cookieChoices = choicesArr.reduce((result, item) => {
		result[item.id] = item.value ? item.value : false;
		return result;
	}, {});

	$: necessaryCookieChoices = choicesArr.reduce((result, item) => {
		result[item.id] = item.id === "necessary";
		return result;
	}, {});

	export function show() {
		shown = visible;
	}

	onMount(() => {
		//console.log("Komponenta Banner.svelte byla připojena");
		if (!cookieName) {
			console.error("Název cookie pro GDPR není nastaven");
			throw new Error("Musíte nastavit GDPR cookie name");
		}

		const cookie = Cookies.get(cookieName);
		// console.log(`Hodnota cookie: ${cookie ? cookie : "není nastavena"}`);
		if (!cookie) {
			// console.log(`Používá se název cookie: ${cookieName}`);
			show();
			return;
		}

		try {
			const { choices } = JSON.parse(cookie);
			console.log("Načtené volby uživatele z cookie:", choices);
			const valid = validate(cookieChoices, choices);
			console.log(
				`Validace voleb uživatele: ${valid ? "úspěšná" : "neúspěšná"}`
			);

			if (!valid) {
				throw new Error("cookie consent has changed");
			}

			execute(choices);
		} catch (e) {
			removeCookie();
			show();
		}
	});

	function setCookie(choices) {
		// console.log("Nastavování cookie s preferencemi:", choices);
		const expires = new Date();
		expires.setDate(expires.getDate() + 365);

		const options = Object.assign({}, defaults, cookieConfig, { expires });
		Cookies.set(cookieName, JSON.stringify({ choices }), options);
		// console.log("Nastavení cookie s těmito možnostmi:", options);
		/*console.log(
			"Volání Cookies.set s:",
			"userPreferences",
			JSON.stringify(choices),
			options
		);*/

		// Ověření, že cookie byla správně nastavena (v reálném případě byste ověřovali skutečnou cookie)
		// console.log("Ověření, že cookie 'userPreferences' je správně nastavena.");
	}

	function removeCookie() {
		const { path } = cookieConfig;
		Cookies.remove(cookieName, Object.assign({}, path ? { path } : {}));
	}

	function execute(chosen) {
		const types = Object.keys(cookieChoices);

		for (const t of types) {
			const agreed = chosen[t];
			if (choicesMerged[t]) {
				choicesMerged[t].value = agreed;
			}
			if (agreed) {
				dispatch(t);
				window.dispatchEvent(new CustomEvent(`consent:${t}`));
			}
		}

		shown = false;
	}

	function reject() {
		setCookie(necessaryCookieChoices);
		execute(necessaryCookieChoices);
	}

	function choose() {
		// console.log("Uživatel potvrdil své preference:", cookieChoices);
		setCookie(cookieChoices);
		// console.log("Cookie byla nastavena.");
		execute(cookieChoices);
	}

	function hideBanner() {
		shown = false;
	}
</script>

{#if showEditIcon}
	<button
		class="cookieConsentToggle"
		part="toggle"
		aria-label={editLabel}
		on:click={show}
		transition:fade>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 512 512"
			fill="currentColor">
			<path
				d="M510.52 255.82c-69.97-.85-126.47-57.69-126.47-127.86-70.17
        0-127-56.49-127.86-126.45-27.26-4.14-55.13.3-79.72 12.82l-69.13
        35.22a132.221 132.221 0 0 0-57.79 57.81l-35.1 68.88a132.645 132.645 0 0
        0-12.82 80.95l12.08 76.27a132.521 132.521 0 0 0 37.16 72.96l54.77
        54.76a132.036 132.036 0 0 0 72.71 37.06l76.71 12.15c27.51 4.36 55.7-.11
        80.53-12.76l69.13-35.21a132.273 132.273 0 0 0
        57.79-57.81l35.1-68.88c12.56-24.64 17.01-52.58 12.91-79.91zM176
        368c-17.67 0-32-14.33-32-32s14.33-32 32-32 32 14.33 32 32-14.33 32-32
        32zm32-160c-17.67 0-32-14.33-32-32s14.33-32 32-32 32 14.33 32 32-14.33
        32-32 32zm160 128c-17.67 0-32-14.33-32-32s14.33-32 32-32 32 14.33 32
        32-14.33 32-32 32z" />
		</svg>
	</button>
{/if}

{#if shown}
	<div
		class="cookieConsentWrapper"
		on:click={hideBanner}
		part="wrapper"
		transition:fade>
		<div class="cookieConsent" part="consent">
			<div class="cookieConsent__Left" part="consent--left">
				<div class="cookieConsent__Content" part="consent--content">
					<p class="cookieConsent__Title" part="consent--title">{heading}</p>
					<p class="cookieConsent__Description" part="consent--description">
						{@html description}
					</p>
				</div>
			</div>
			<div class="cookieConsent__Right" part="consent--right">
				<button
					type="button"
					class="cookieConsent__Button"
					part="button"
					aria-label={settingsLabel}
					on:click={() => {
						settingsShown = true;
					}}>
					{settingsLabel}
				</button>
				{#if canRejectCookies}
					<button
						type="submit"
						class="cookieConsent__Button"
						part="button"
						on:click={reject}
						aria-label={rejectLabel}>
						{rejectLabel}
					</button>
				{/if}
				<button
					type="submit"
					class="cookieConsent__Button"
					part="button"
					on:click={choose}
					aria-label={acceptLabel}>
					{acceptLabel}
				</button>
			</div>
		</div>
	</div>
{/if}

{#if settingsShown}
	<div class="cookieConsentOperations" part="operations" transition:fade>
		<div class="cookieConsentOperations__List" part="operations--list">
			{#each choicesArr as choice}
				{#if Object.hasOwnProperty.call(choicesMerged, choice.id) && choicesMerged[choice.id]}
					<div
						class="cookieConsentOperations__Item"
						class:disabled={choice.id === "necessary"}
						part={`operations--list-item ${choice.id === "necessary" ? "operations--list-item--disabled" : ""}`}>
						<input
							type="checkbox"
							id={`gdpr-check-${choice.id}`}
							part="operations--list-item-input"
							bind:checked={choicesMerged[choice.id].value}
							disabled={choice.id === "necessary"} />
						<label
							for={`gdpr-check-${choice.id}`}
							part={`operations--list-item-label ${choicesMerged[choice.id].value ? "operations--list-item-label--checked" : ""}`}>
							{choice.label}
						</label>
						<span
							class="cookieConsentOperations__ItemLabel"
							part="operations--list-item-description">
							{choice.description}
						</span>
					</div>
				{/if}
			{/each}
			<button
				type="submit"
				class="cookieConsent__Button cookieConsent__Button--Close"
				part="button button--close"
				aria-label={closeLabel}
				on:click={() => {
					settingsShown = false;
					choose();
				}}>
				{closeLabel}
			</button>
		</div>
	</div>
{/if}
