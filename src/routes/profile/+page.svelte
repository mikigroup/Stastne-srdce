<script lang="ts">
	import { enhance } from "$app/forms";
	import { resolve } from "$app/paths";
	import type { SubmitFunction } from "@sveltejs/kit";
	import { onMount, tick, untrack } from "svelte";
	import { cubicOut } from "svelte/easing";
	import { prefersReducedMotion } from "svelte/motion";
	import { fade, fly, slide } from "svelte/transition";
	import { validateProfileForInvoicing } from "$lib/utils/profileValidation";
	import { formatDateToCzech, formatDateToCzechShort } from "$lib/utils/formatting";

	type MethodOption = { value: string; label: string };

	type MenuInfo = { date?: string | null; soup?: string | null };

	type OrderItem = {
		id: string;
		price: number | null;
		quantity: number | null;
		variant: {
			variant_number: string;
			description: string;
			menu: MenuInfo;
			menu_version_id?: MenuInfo | null;
		} | null;
	};

	type OrderView = {
		id: string;
		order_number: string;
		created_at: string | null;
		total_price: number | null;
		currency: string | null;
		total_pieces: number | null;
		note: string | null;
		order_items: OrderItem[];
		grouped_items?: Array<{ date: string; items: OrderItem[] }>;
	};

	const tabs = [
		{ id: "udaje", label: "Údaje" },
		{ id: "objednavky", label: "Objednávky" },
		{ id: "soukromi", label: "Soukromí" }
	] as const;

	type TabId = (typeof tabs)[number]["id"];

	const cardClass = "bg-white border rounded-lg shadow-md border-gray-300 p-6 sm:p-8";
	const labelClass = "mb-1.5 block text-sm font-semibold text-gray-800";
	const controlClass =
		"w-full rounded-lg border bg-white px-4 py-2.5 text-base text-gray-800 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-700";

	const errorFields = [
		["first_name", "first_name"],
		["last_name", "last_name"],
		["telephone", "telephone"],
		["delivery_method", "delivery_method"],
		["payment_method", "payment_method"],
		["street", "street"],
		["street_number", "street_number"],
		["city", "city"],
		["zip_code", "zip_code"],
		["allergies_description", "allergiesDescription"]
	] as const;

	let { data, form } = $props();
	let session = $derived(data.session);
	let profile = $derived(data.profile);
	let orders = $derived((data.orders ?? []) as OrderView[]);
	let generalSettings = $derived(data.generalSettings);
	let deliveryMethodOptions = $derived((data.deliveryMethodOptions ?? []) as MethodOption[]);
	let paymentMethodOptions = $derived((data.paymentMethodOptions ?? []) as MethodOption[]);

	let reducedMotion = $derived(prefersReducedMotion.current);
	let orderOpenDuration = $derived(reducedMotion ? 0 : 620);
	let animateTabs = $state(false);
	let tab = $state<TabId>("udaje");
	let tabIndex = $derived(tabs.findIndex((item) => item.id === tab));
	let tabEnter = $derived({
		y: reducedMotion || !animateTabs ? 0 : 12,
		duration: reducedMotion || !animateTabs ? 0 : 260,
		opacity: 0,
		easing: cubicOut
	});
	let tabLeave = $derived({
		duration: reducedMotion || !animateTabs ? 0 : 160,
		easing: cubicOut
	});
	let openOrderId = $state<string | null>(null);
	let loading = $state(false);
	let deletionLoading = $state(false);
	let deletionConfirmed = $state(false);
	let legalUnderstanding = $state(false);
	let attempted = $state(false);

	let first_name = $state(untrack(() => profile?.first_name ?? ""));
	let last_name = $state(untrack(() => profile?.last_name ?? ""));
	let telephone = $state(untrack(() => profile?.telephone ?? ""));
	let street = $state(untrack(() => profile?.street ?? ""));
	let street_number = $state(untrack(() => profile?.street_number ?? ""));
	let city = $state(untrack(() => profile?.city ?? ""));
	let zip_code = $state(untrack(() => profile?.zip_code ?? ""));
	let ico = $state(untrack(() => profile?.ico ?? ""));
	let dic = $state(untrack(() => profile?.dic ?? ""));
	let company = $state(untrack(() => profile?.company ?? ""));
	let allergies = $state(untrack(() => (profile?.allergies ? "yes" : "no")));
	let allergiesDescription = $state(untrack(() => profile?.allergies_description ?? ""));
	let deliveryMethod = $state(untrack(() => profile?.delivery_method ?? ""));
	let paymentMethod = $state(untrack(() => profile?.payment_method ?? ""));

	let email = $derived(session?.user?.email ?? "");
	let savedName = $derived([profile?.first_name, profile?.last_name].filter(Boolean).join(" "));
	let showFieldErrors = $derived(attempted);
	let deletionReady = $derived(deletionConfirmed && legalUnderstanding);

	function withoutPlaceholder(options: MethodOption[]) {
		return options.filter((option) => {
			const value = option.value.trim();
			const label = option.label.trim();
			return value !== "" && !/^vyberte\b/i.test(label);
		});
	}

	let deliveryMethodOptionsList = $derived.by(() => {
		const base = withoutPlaceholder(deliveryMethodOptions);
		if (deliveryMethod && !base.some((option) => option.value === deliveryMethod)) {
			base.push({ value: deliveryMethod, label: deliveryMethod });
		}
		return base;
	});

	let paymentMethodOptionsList = $derived.by(() => {
		const base = withoutPlaceholder(paymentMethodOptions);
		if (paymentMethod && !base.some((option) => option.value === paymentMethod)) {
			base.push({ value: paymentMethod, label: paymentMethod });
		}
		return base;
	});

	let invoicePayment = $derived.by(() => {
		const label = paymentMethodOptionsList.find((option) => option.value === paymentMethod)?.label ?? "";
		return paymentMethod === "bankWithInvoice" || /faktur/i.test(label) || /faktur/i.test(paymentMethod);
	});

	let validation = $derived(
		validateProfileForInvoicing({
			first_name,
			last_name,
			street,
			street_number,
			city,
			zip_code,
			email,
			company,
			ico,
			dic,
			telephone,
			delivery_method: deliveryMethod,
			payment_method: paymentMethod,
			allergies: allergies === "yes",
			allergies_description: allergiesDescription
		})
	);

	function missing(value: string, message: string) {
		return value.trim() ? "" : message;
	}

	let fieldErrors = $derived({
		first_name: missing(first_name, "Jméno je povinné"),
		last_name: missing(last_name, "Příjmení je povinné"),
		telephone: missing(telephone, "Telefon je povinný"),
		delivery_method: missing(deliveryMethod, "Způsob dodání je povinný"),
		payment_method: missing(paymentMethod, "Způsob platby je povinný"),
		street: missing(street, "Ulice je povinná"),
		street_number: missing(street_number, "Číslo popisné je povinné"),
		city: missing(city, "Město je povinné"),
		zip_code: missing(zip_code, "PSČ je povinné"),
		allergies_description:
			allergies === "yes" && !allergiesDescription.trim() ? "Popis alergií je povinný" : ""
	});

	let dirty = $derived.by(() => {
		const savedDescription = profile?.allergies ? (profile?.allergies_description ?? "") : "";
		const currentDescription = allergies === "yes" ? allergiesDescription : "";
		return (
			first_name !== (profile?.first_name ?? "") ||
			last_name !== (profile?.last_name ?? "") ||
			telephone !== (profile?.telephone ?? "") ||
			street !== (profile?.street ?? "") ||
			street_number !== (profile?.street_number ?? "") ||
			city !== (profile?.city ?? "") ||
			zip_code !== (profile?.zip_code ?? "") ||
			company !== (profile?.company ?? "") ||
			ico !== (profile?.ico ?? "") ||
			dic !== (profile?.dic ?? "") ||
			allergies !== (profile?.allergies ? "yes" : "no") ||
			currentDescription !== savedDescription ||
			deliveryMethod !== (profile?.delivery_method ?? "") ||
			paymentMethod !== (profile?.payment_method ?? "")
		);
	});

	let allergiesRemaining = $derived(300 - (allergiesDescription?.length || 0));

	function controlClasses(message: string) {
		return `${controlClass} ${showFieldErrors && message ? "border-red-400" : "border-gray-300"}`;
	}

	function describedBy(id: string, message: string) {
		return showFieldErrors && message ? `${id}-error` : undefined;
	}

	function invalid(message: string) {
		return showFieldErrors && message ? "true" : undefined;
	}

	function ordersLabel(count: number) {
		if (count === 1) return "1 objednávka";
		if (count >= 2 && count <= 4) return `${count} objednávky`;
		return `${count} objednávek`;
	}

	function piecesLabel(count: number) {
		const value = Math.abs(count);
		if (value === 1) return `${count} kus`;
		if (value >= 2 && value <= 4) return `${count} kusy`;
		return `${count} kusů`;
	}

	function formatMoney(amount: number | null | undefined, currency?: string | null) {
		if (amount == null || Number.isNaN(Number(amount))) return "";
		const unit = !currency || currency === "CZK" ? "Kč" : currency;
		return `${new Intl.NumberFormat("cs-CZ").format(Number(amount))} ${unit}`;
	}

	function dayGroups(order: OrderView) {
		if (order.grouped_items && order.grouped_items.length > 0) return order.grouped_items;
		return [{ date: "", items: order.order_items ?? [] }];
	}

	function itemSoup(item: OrderItem) {
		return item.variant?.menu_version_id?.soup || item.variant?.menu?.soup || "";
	}

	function itemTitle(item: OrderItem) {
		const number = item.variant?.variant_number;
		const description = item.variant?.description;
		if (number && description) return `${number}. ${description}`;
		return description || "Položka";
	}

	function menuDateLabel(date: string) {
		if (!date) return "Položky";
		return formatDateToCzech(date) || date;
	}

	function scrollToStatus() {
		requestAnimationFrame(() => {
			const node = document.getElementById("account-status");
			if (!node) return;
			const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
			node.scrollIntoView({ block: "center", behavior: reduce ? "auto" : "smooth" });
		});
	}

	function focusFirstInvalid() {
		for (const [key, id] of errorFields) {
			if (!fieldErrors[key]) continue;
			document.getElementById(id)?.focus();
			return;
		}
		document.getElementById("account-status")?.scrollIntoView({ block: "center" });
	}

	const handleSubmit: SubmitFunction = ({ cancel }) => {
		if (!validation.isComplete) {
			attempted = true;
			cancel();
			void tick().then(() => focusFirstInvalid());
			return;
		}

		loading = true;
		attempted = false;
		return async ({ update, result }) => {
			await update({ reset: false });
			loading = false;
			tab = "udaje";
			if (result.type === "success") {
				scrollToStatus();
			} else {
				attempted = true;
				await tick();
				focusFirstInvalid();
			}
		};
	};

	const handleDeletion: SubmitFunction = () => {
		deletionLoading = true;
		tab = "soukromi";
		return async ({ update }) => {
			await update({ reset: false });
			deletionLoading = false;
			scrollToStatus();
		};
	};

	onMount(() => {
		const hash = window.location.hash.replace("#", "");
		if (tabs.some((item) => item.id === hash)) {
			tab = hash as TabId;
		} else if (!deliveryMethod.trim() || hash === "delivery_method") {
			attempted = true;
			void tick().then(() => {
				const field = document.getElementById("delivery_method");
				field?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "center" });
				field?.focus();
			});
		}
		animateTabs = true;
	});

	function selectTab(next: TabId) {
		if (next === tab) return;
		tab = next;
		const url = `${window.location.pathname}${window.location.search}#${next}`;
		history.replaceState(history.state, "", url);
	}

	function hideLeavingPanel(event: Event) {
		const node = event.currentTarget;
		if (node instanceof HTMLElement) node.inert = true;
	}

	function onTabKeydown(event: KeyboardEvent, index: number) {
		const key = event.key;
		if (key !== "ArrowRight" && key !== "ArrowLeft" && key !== "Home" && key !== "End") return;
		event.preventDefault();
		let nextIndex = index;
		if (key === "ArrowRight") nextIndex = (index + 1) % tabs.length;
		if (key === "ArrowLeft") nextIndex = (index - 1 + tabs.length) % tabs.length;
		if (key === "Home") nextIndex = 0;
		if (key === "End") nextIndex = tabs.length - 1;
		const next = tabs[nextIndex].id;
		selectTab(next);
		document.getElementById(`tab-${next}`)?.focus();
	}

	function toggleOrder(orderId: string) {
		openOrderId = openOrderId === orderId ? null : orderId;
	}
</script>

{#snippet fieldError(id: string, message: string)}
	{#if showFieldErrors && message}
		<p id="{id}-error" class="mt-1.5 text-sm text-red-700">{message}</p>
	{/if}
{/snippet}

<svelte:head>
	<title>Účet - {generalSettings?.shopName ?? "Účet"}</title>
	<meta name="description" content="Údaje účtu, objednávky a správa osobních údajů." />
</svelte:head>

<section class="max-w-screen-xl px-4 py-16 mx-auto mb-10 rounded-lg bg-stone-100">
	<header class="mb-8 text-center">
		<h1 class="text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl">Účet</h1>
		<p class="mt-3 text-lg text-gray-600">Údaje pro rozvoz, platbu a vaše objednávky</p>
		{#if email}
			<p class="mt-2 text-gray-800">
				{#if savedName}<span class="font-semibold">{savedName}</span>{/if}
				{#if savedName}<span class="text-gray-400" aria-hidden="true"> · </span>{/if}
				{email}
			</p>
		{/if}
	</header>

	<div id="account-status" aria-live="polite" class="max-w-4xl mx-auto">
		{#if form?.message}
			<div
				class={[
					"mb-6 rounded-lg border px-4 py-3",
					form.message.success
						? "border-green-200 bg-green-50 text-green-900"
						: "border-red-200 bg-red-50 text-red-800"
				]}
			>
				<p class="font-medium">{form.message.display}</p>
			</div>
		{/if}
	</div>

	{#if !validation.isComplete}
		<div class="max-w-4xl mx-auto mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-amber-950">
			<p class="font-semibold">Než půjde objednávka odeslat, doplňte údaje</p>
			<p class="mt-1 text-sm">{validation.missingFields.join(", ")}</p>
		</div>
	{/if}

	<div
		class="relative mx-auto mb-6 grid max-w-4xl grid-cols-3 gap-1 rounded-lg border border-gray-300 bg-white p-1 shadow-sm"
		role="tablist"
		aria-label="Části účtu"
	>
		<span class="tab-indicator" style:--tab-index={tabIndex} aria-hidden="true"></span>
		{#each tabs as item, index (item.id)}
			<button
				type="button"
				id={`tab-${item.id}`}
				role="tab"
				class={[
					"relative z-10 inline-flex w-full min-w-0 cursor-pointer items-center justify-center gap-1 rounded-md px-1 py-2.5 text-xs font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700 motion-reduce:transition-none sm:gap-1.5 sm:px-2 sm:text-sm md:text-base",
					tab === item.id ? "text-white" : "text-gray-700 hover:bg-stone-100"
				]}
				aria-selected={tab === item.id}
				aria-controls={`panel-${item.id}`}
				tabindex={tab === item.id ? 0 : -1}
				onclick={() => selectTab(item.id)}
				onkeydown={(event) => onTabKeydown(event, index)}
			>
				{item.label}
				{#if item.id === "udaje" && !validation.isComplete}
					<span
						class={["inline-block h-2 w-2 rounded-full", tab === "udaje" ? "bg-amber-300" : "bg-amber-500"]}
						aria-hidden="true"
					></span>
					<span class="sr-only">, údaje nejsou kompletní</span>
				{/if}
			</button>
		{/each}
	</div>

	<div class="tab-stage">
		{#key tab}
			<div class="tab-panel" in:fly={tabEnter} out:fade={tabLeave} onoutrostart={hideLeavingPanel}>
	{#if tab === "udaje"}
		<div role="tabpanel" id="panel-udaje" aria-labelledby="tab-udaje" class="max-w-4xl mx-auto">
			<form class="space-y-4" method="post" action="?/update" use:enhance={handleSubmit} autocomplete="on">
				<section class={cardClass}>
					<h2 class="text-xl font-semibold text-gray-800">Osobní údaje</h2>
					<div class="mt-5 grid gap-4 sm:grid-cols-2">
						<div>
							<label class={labelClass} for="first_name">Jméno <span class="text-red-700" aria-hidden="true">*</span></label>
							<input
								bind:value={first_name}
								type="text"
								name="first_name"
								id="first_name"
								autocomplete="given-name"
								class={controlClasses(fieldErrors.first_name)}
								aria-invalid={invalid(fieldErrors.first_name)}
								aria-describedby={describedBy("first_name", fieldErrors.first_name)}
							/>
							{@render fieldError("first_name", fieldErrors.first_name)}
						</div>
						<div>
							<label class={labelClass} for="last_name">Příjmení <span class="text-red-700" aria-hidden="true">*</span></label>
							<input
								bind:value={last_name}
								type="text"
								name="last_name"
								id="last_name"
								autocomplete="family-name"
								class={controlClasses(fieldErrors.last_name)}
								aria-invalid={invalid(fieldErrors.last_name)}
								aria-describedby={describedBy("last_name", fieldErrors.last_name)}
							/>
							{@render fieldError("last_name", fieldErrors.last_name)}
						</div>
						<div>
							<label class={labelClass} for="telephone">Telefon <span class="text-red-700" aria-hidden="true">*</span></label>
							<input
								bind:value={telephone}
								type="tel"
								name="telephone"
								id="telephone"
								autocomplete="tel"
								inputmode="tel"
								class={controlClasses(fieldErrors.telephone)}
								aria-invalid={invalid(fieldErrors.telephone)}
								aria-describedby={describedBy("telephone", fieldErrors.telephone)}
							/>
							{@render fieldError("telephone", fieldErrors.telephone)}
						</div>
						<div>
							<p class={labelClass}>E-mail</p>
							<p class="rounded-lg border border-gray-200 bg-stone-50 px-4 py-2.5 text-base text-gray-800">{email}</p>
							<p class="mt-1.5 text-sm text-gray-600">E-mail je přihlašovací údaj, nejde ho změnit.</p>
						</div>
					</div>
				</section>

				<section class={cardClass}>
					<h2 class="text-xl font-semibold text-gray-800">Dodání a platba</h2>
					<div class="mt-5 grid gap-4 sm:grid-cols-2">
						<div>
							<label class={labelClass} for="delivery_method">Dodání <span class="text-red-700" aria-hidden="true">*</span></label>
							<select
								bind:value={deliveryMethod}
								name="delivery_method"
								id="delivery_method"
								class={controlClasses(fieldErrors.delivery_method)}
								aria-invalid={invalid(fieldErrors.delivery_method)}
								aria-describedby={describedBy("delivery_method", fieldErrors.delivery_method)}
							>
								<option value="">Vyberte způsob dodání</option>
								{#each deliveryMethodOptionsList as option (option.value)}
									<option value={option.value}>{option.label}</option>
								{/each}
							</select>
							{@render fieldError("delivery_method", fieldErrors.delivery_method)}
						</div>
						<div>
							<label class={labelClass} for="payment_method">Platba <span class="text-red-700" aria-hidden="true">*</span></label>
							<select
								bind:value={paymentMethod}
								name="payment_method"
								id="payment_method"
								class={controlClasses(fieldErrors.payment_method)}
								aria-invalid={invalid(fieldErrors.payment_method)}
								aria-describedby={describedBy("payment_method", fieldErrors.payment_method)}
							>
								{#each paymentMethodOptionsList as option (option.value)}
									<option value={option.value}>{option.label}</option>
								{/each}
							</select>
							{@render fieldError("payment_method", fieldErrors.payment_method)}
						</div>
					</div>
				</section>

				<section class={cardClass}>
					<h2 class="text-xl font-semibold text-gray-800">Doručovací adresa</h2>
					<div class="mt-5 grid gap-4 sm:grid-cols-6">
						<div class="sm:col-span-4">
							<label class={labelClass} for="street">Ulice <span class="text-red-700" aria-hidden="true">*</span></label>
							<input
								bind:value={street}
								name="street"
								type="text"
								id="street"
								autocomplete="address-line1"
								class={controlClasses(fieldErrors.street)}
								aria-invalid={invalid(fieldErrors.street)}
								aria-describedby={describedBy("street", fieldErrors.street)}
							/>
							{@render fieldError("street", fieldErrors.street)}
						</div>
						<div class="sm:col-span-2">
							<label class={labelClass} for="street_number">Číslo popisné <span class="text-red-700" aria-hidden="true">*</span></label>
							<input
								bind:value={street_number}
								type="text"
								name="street_number"
								id="street_number"
								autocomplete="address-line2"
								class={controlClasses(fieldErrors.street_number)}
								aria-invalid={invalid(fieldErrors.street_number)}
								aria-describedby={describedBy("street_number", fieldErrors.street_number)}
							/>
							{@render fieldError("street_number", fieldErrors.street_number)}
						</div>
						<div class="sm:col-span-4">
							<label class={labelClass} for="city">Město <span class="text-red-700" aria-hidden="true">*</span></label>
							<input
								bind:value={city}
								type="text"
								name="city"
								id="city"
								autocomplete="address-level2"
								class={controlClasses(fieldErrors.city)}
								aria-invalid={invalid(fieldErrors.city)}
								aria-describedby={describedBy("city", fieldErrors.city)}
							/>
							{@render fieldError("city", fieldErrors.city)}
						</div>
						<div class="sm:col-span-2">
							<label class={labelClass} for="zip_code">PSČ <span class="text-red-700" aria-hidden="true">*</span></label>
							<input
								bind:value={zip_code}
								type="text"
								name="zip_code"
								id="zip_code"
								autocomplete="postal-code"
								inputmode="numeric"
								class={controlClasses(fieldErrors.zip_code)}
								aria-invalid={invalid(fieldErrors.zip_code)}
								aria-describedby={describedBy("zip_code", fieldErrors.zip_code)}
							/>
							{@render fieldError("zip_code", fieldErrors.zip_code)}
						</div>
					</div>
				</section>

				<section class={cardClass}>
					<h2 class="text-xl font-semibold text-gray-800">Alergie</h2>
					<p class="mt-1 text-sm text-gray-600">
						Podle odpovědi kuchyně připraví oběd.
						<a href={resolve("/alergeny")} class="font-semibold text-green-800 underline underline-offset-2 hover:text-green-900">Seznam alergenů</a>
					</p>
					<div class="mt-5 grid max-w-md grid-cols-2 gap-3" role="radiogroup" aria-label="Alergie">
						<label
							class={[
								"flex cursor-pointer items-center justify-center gap-2 rounded-lg border px-4 py-3",
								allergies === "no"
									? "border-green-700 bg-green-50 text-green-900"
									: "border-gray-300 bg-white text-gray-800"
							]}
						>
							<input class="h-4 w-4 accent-green-800" type="radio" name="allergies" value="no" bind:group={allergies} />
							Ne
						</label>
						<label
							class={[
								"flex cursor-pointer items-center justify-center gap-2 rounded-lg border px-4 py-3",
								allergies === "yes"
									? "border-green-700 bg-green-50 text-green-900"
									: "border-gray-300 bg-white text-gray-800"
							]}
						>
							<input class="h-4 w-4 accent-green-800" type="radio" name="allergies" value="yes" bind:group={allergies} />
							Ano
						</label>
					</div>
					{#if allergies === "yes"}
						<div class="mt-4">
							<label class={labelClass} for="allergiesDescription">
								Popis alergií <span class="text-red-700" aria-hidden="true">*</span>
							</label>
							<textarea
								id="allergiesDescription"
								name="allergies_description"
								bind:value={allergiesDescription}
								maxlength="300"
								rows="3"
								class={controlClasses(fieldErrors.allergies_description)}
								aria-invalid={invalid(fieldErrors.allergies_description)}
								aria-describedby={describedBy("allergiesDescription", fieldErrors.allergies_description)}
							></textarea>
							{@render fieldError("allergiesDescription", fieldErrors.allergies_description)}
							<p class={["mt-1.5 text-right text-sm", allergiesRemaining < 40 ? "text-amber-800" : "text-gray-600"]}>
								Zbývá {allergiesRemaining} znaků
							</p>
						</div>
					{/if}
				</section>

				<section class={cardClass}>
					<h2 class="text-xl font-semibold text-gray-800">Fakturační údaje</h2>
					{#if invoicePayment}
						<p class="mt-1 text-sm text-gray-600">
							U platby fakturou uveďte firmu, IČO a DIČ, ať jde faktura vystavit.
						</p>
					{/if}
					<div class="mt-5 grid gap-4 sm:grid-cols-2">
						<div class="sm:col-span-2">
							<label class={labelClass} for="company">Firma</label>
							<input
								bind:value={company}
								type="text"
								name="company"
								id="company"
								autocomplete="organization"
								class="{controlClass} border-gray-300"
							/>
						</div>
						<div>
							<label class={labelClass} for="ico">IČO</label>
							<input
								bind:value={ico}
								type="text"
								name="ico"
								id="ico"
								inputmode="numeric"
								autocomplete="off"
								class="{controlClass} border-gray-300"
							/>
						</div>
						<div>
							<label class={labelClass} for="dic">DIČ</label>
							<input
								bind:value={dic}
								type="text"
								name="dic"
								id="dic"
								autocomplete="off"
								class="{controlClass} border-gray-300"
							/>
						</div>
					</div>
				</section>

				<div>
					<div class="flex flex-col gap-3 rounded-lg border border-gray-300 bg-white p-4 shadow-md sm:flex-row sm:items-center sm:justify-between">
						<p class="text-sm text-gray-600">
							{#if dirty}
								Máte neuložené změny.
							{:else if !validation.isComplete}
								Doplňte povinné údaje a uložte je.
							{:else}
								Údaje jsou uložené.
								<a href={resolve("/kosik")} class="ml-2 font-semibold text-green-800 underline underline-offset-2 hover:text-green-900">Přejít do košíku</a>
							{/if}
						</p>
						<button
							type="submit"
							class="w-full cursor-pointer rounded-lg bg-green-800 px-8 py-3 text-base font-semibold text-white shadow-md hover:bg-green-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
							disabled={loading}
						>
							{loading ? "Ukládá se…" : "Uložit změny"}
						</button>
					</div>
				</div>
			</form>
		</div>
	{:else if tab === "objednavky"}
		<div role="tabpanel" id="panel-objednavky" aria-labelledby="tab-objednavky" class="max-w-4xl mx-auto">
			<h2 class="sr-only">Objednávky</h2>
			{#if orders.length === 0}
				<div class="{cardClass} text-center">
					<p class="text-lg text-gray-800">Zatím tu není žádná objednávka.</p>
					<a
						href={resolve("/obedy")}
						class="mt-5 inline-block rounded-lg bg-green-800 px-6 py-3 font-semibold text-white shadow-md hover:bg-green-900"
					>
						Přejít na jídelníček
					</a>
				</div>
			{:else}
				<p class="mb-4 text-sm font-medium text-gray-600">{ordersLabel(orders.length)}</p>
				<div class="space-y-3">
					{#each orders as order (order.id)}
						{@const open = openOrderId === order.id}
						<article
							class={[
								"overflow-hidden rounded-lg border bg-white shadow-md transition-colors ease-out",
								reducedMotion ? "duration-0" : "duration-500",
								open ? "border-green-700" : "border-gray-300"
							]}
						>
							<button
								type="button"
								class="flex w-full cursor-pointer items-center justify-between gap-4 p-4 text-left"
								aria-expanded={open}
								aria-controls={`order-panel-${order.id}`}
								onclick={() => toggleOrder(order.id)}
							>
								<span class="min-w-0">
									<span class="block font-semibold text-gray-900">č. {order.order_number}</span>
									<span class="mt-1.5 flex flex-wrap items-center gap-2 text-sm font-medium text-gray-900">
										{#if order.created_at}
											<span class="font-semibold">{formatDateToCzechShort(order.created_at)}</span>
										{/if}
										{#if order.total_pieces != null}
											<span class="text-sm font-medium text-gray-600">{piecesLabel(order.total_pieces)}</span>
										{/if}
									</span>
								</span>
								<span class="flex shrink-0 items-center gap-3">
									<span class="font-semibold text-gray-900">{formatMoney(order.total_price, order.currency)}</span>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										class={[
											"h-5 w-5 text-gray-500 transition-transform ease-out",
											reducedMotion ? "duration-0" : "duration-500",
											open && "rotate-180"
										]}
										viewBox="0 0 20 20"
										fill="currentColor"
										aria-hidden="true"
									>
										<path
											fill-rule="evenodd"
											d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
											clip-rule="evenodd"
										/>
									</svg>
								</span>
							</button>

							{#if open}
								<div
									id={`order-panel-${order.id}`}
									class="space-y-4 border-t border-gray-200 p-4 sm:p-5"
									in:slide={{ duration: orderOpenDuration, easing: cubicOut }}
									out:slide={{ duration: Math.round(orderOpenDuration * 0.7), easing: cubicOut }}
								>
									{#if order.note?.trim()}
										<p class="whitespace-pre-line rounded-lg bg-stone-50 px-4 py-3 text-sm text-gray-700">{order.note}</p>
									{/if}
									{#each dayGroups(order) as group (group.date || "bez-data")}
										{@const soup = group.items.map(itemSoup).find(Boolean) ?? ""}
										<div class="rounded-lg bg-stone-50 p-4">
											<h3 class="font-semibold text-gray-900">{menuDateLabel(group.date)}</h3>
											{#if soup}
												<p class="mt-1 text-sm text-gray-600">Polévka: {soup}</p>
											{/if}
											<ul class="mt-2 divide-y divide-gray-200">
												{#each group.items as item (item.id)}
													<li class="flex items-start justify-between gap-4 py-3">
														<p class="text-gray-800">{itemTitle(item)}</p>
														<p class="shrink-0 text-right text-sm text-gray-600">
															{#if item.quantity != null}{piecesLabel(item.quantity)}{/if}
															{#if item.price != null}
																<span class="mt-0.5 block font-medium text-gray-900">{formatMoney(item.price, order.currency)}</span>
															{/if}
														</p>
													</li>
												{/each}
											</ul>
										</div>
									{/each}
								</div>
							{/if}
						</article>
					{/each}
				</div>
			{/if}
		</div>
	{:else}
		<div role="tabpanel" id="panel-soukromi" aria-labelledby="tab-soukromi" class="max-w-4xl mx-auto">
			<section class={cardClass}>
				<h2 class="text-xl font-semibold text-gray-800">Smazání osobních údajů</h2>

				{#if data.profile?.data_deletion_requested}
					<div class="mt-5 rounded-lg border border-blue-200 bg-blue-50 p-4 text-blue-950">
						<p class="font-semibold">Žádost o smazání dat je aktivní</p>
						<p class="mt-2 text-sm">
							Podáno: {data.profile.data_deletion_date ? formatDateToCzech(data.profile.data_deletion_date) : "neuvedeno"}<br />
							Smazání: {data.profile.data_deletion_scheduled ? formatDateToCzech(data.profile.data_deletion_scheduled) : "neuvedeno"}
						</p>
						<p class="mt-3 text-sm">
							Máte 30 dní na rozmyšlenou. Účet lze obnovit odkazem, který jsme poslali na váš e-mail.
						</p>
					</div>
				{:else}
					<div class="mt-5 rounded-lg border border-gray-200 bg-stone-50 p-4">
						<p class="text-sm font-semibold text-gray-900">Co se stane</p>
						<ul class="mt-2 space-y-1.5 text-xs text-gray-700">
							<li>30 dní na rozmyšlenou a možnost žádost zrušit.</li>
							<li>Po uplynutí lhůty smažeme osobní údaje.</li>
							<li>Faktury zůstanou uložené 10 let (zákon č. 563/1991 Sb., o účetnictví).</li>
							<li>Anonymizované statistiky mohou zůstat zachované.</li>
						</ul>
					</div>

					<form method="POST" action="?/requestDataDeletion" class="mt-8 space-y-8" use:enhance={handleDeletion}>
						<div class="space-y-3">
							<label class="flex items-start gap-4 text-sm leading-6 text-gray-700">
								<input
									type="checkbox"
									name="deletion_confirmed"
									value="yes"
									required
									bind:checked={deletionConfirmed}
									class="mt-0.5 h-4 w-4 rounded border-gray-300 accent-green-800"
								/>
								<span>Žádám o smazání všech mých osobních údajů a rozumím, že mám 30 dní na zrušení této žádosti.</span>
							</label>
							<label class="flex items-start gap-4 text-sm leading-6 text-gray-700">
								<input
									type="checkbox"
									name="legal_understanding"
									value="yes"
									required
									bind:checked={legalUnderstanding}
									class="mt-0.5 h-4 w-4 rounded border-gray-300 accent-green-800"
								/>
								<span>Souhlasím s uchováním fakturačních údajů po zákonnou dobu (zákon č. 563/1991 Sb., o účetnictví).</span>
							</label>
						</div>
						<div class="flex flex-col gap-4 pt-2 sm:flex-row sm:items-center">
							<button
								type="submit"
								class="inline-flex cursor-pointer items-center justify-center rounded-lg border border-red-800 px-4 py-2.5 text-sm font-semibold text-red-800 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
								disabled={!deletionReady || deletionLoading}
							>
								{deletionLoading ? "Odesílám…" : "Požádat o smazání dat"}
							</button>
							<p class="text-sm text-gray-600">Po odeslání dostanete e-mail.</p>
						</div>
					</form>
				{/if}

				<p class="mt-6 border-t border-gray-200 pt-4 text-center text-xs text-gray-500">
					Zpracování v souladu s GDPR (EU 2016/679) a českým zákonem č. 110/2019 Sb. o zpracování osobních údajů.
				</p>
			</section>
		</div>
	{/if}
			</div>
		{/key}
	</div>
</section>

<style>
	.tab-indicator {
		position: absolute;
		top: 0.25rem;
		bottom: 0.25rem;
		left: 0.25rem;
		z-index: 0;
		width: calc((100% - 1rem) / 3);
		border-radius: 0.375rem;
		background-color: #166534;
		pointer-events: none;
		transform: translateX(calc(var(--tab-index) * (100% + 0.25rem)));
		transition: transform 260ms cubic-bezier(0.33, 1, 0.68, 1);
	}

	.tab-stage {
		display: grid;
	}

	.tab-panel {
		grid-area: 1 / 1;
		min-width: 0;
		background-color: #f5f5f4;
	}

	@media (prefers-reduced-motion: reduce) {
		.tab-indicator {
			transition: none;
		}
	}
</style>
