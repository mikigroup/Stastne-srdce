<script lang="ts">
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import {
		Mail,
		User,
		Phone,
		MessageSquare,
		MapPin,
		Building2,
		Mail as MailIcon,
		Clock,
		Globe
	} from "@lucide/svelte";
	import { PUBLIC_RECAPTCHA_SITE_KEY, PUBLIC_GOOGLE_MAPS_API_KEY } from "$env/static/public";

	interface Props {
		data: any;
		form: any;
	}

	let { data, form }: Props = $props();

	let session = $derived(data.session);
	let supabase = $derived(data.supabase);
	let settings = $derived(data.settings);

	// Extrahujeme data z settings
	let contact = $derived(settings?.contact || {});
	let business = $derived(settings?.business || {});
	let companyAddress = $derived.by(() => {
		const streetLine = [business?.street, business?.streetNumber].filter(Boolean).join(" ").trim();
		const cityLine = [business?.zipCode, business?.city].filter(Boolean).join(" ").trim();
		const fromBusiness = [streetLine, cityLine].filter(Boolean).join(", ");
		return fromBusiness || String(contact?.address || "").trim() || "Adresa není k dispozici";
	});
	let shopName = $derived(String(settings?.shopName || "").trim());
	let pageTitle = $derived(shopName ? `${shopName} - Kontakt` : "Kontakt");
	let pageDescription = $derived(shopName ? `Kontaktujte nás - ${shopName}` : "Kontaktujte nás");
	
	// Title pro mapu z nastavení
	let mapQuery = $derived(String(contact?.address || '').trim());
	let mapTitle = $derived(business?.companyName && mapQuery ? 
		`${business.companyName} - ${mapQuery}` : 
		mapQuery);
	let mapSrc = $derived.by(() => {
		if (!mapQuery) return '';
		const query = encodeURIComponent(mapQuery);
		if (PUBLIC_GOOGLE_MAPS_API_KEY) {
			return `https://www.google.com/maps/embed/v1/place?key=${PUBLIC_GOOGLE_MAPS_API_KEY}&q=${query}&zoom=15`;
		}
		return `https://maps.google.com/maps?q=${query}&z=15&output=embed`;
	});

	let submitting = $state(false);
	let recaptchaError = $state("");

	function recaptchaSrc(): string {
		return `https://www.google.com/recaptcha/api.js?render=${PUBLIC_RECAPTCHA_SITE_KEY}`;
	}

	function findRecaptchaScript(): HTMLScriptElement | null {
		return document.querySelector(`script[src="${recaptchaSrc()}"]`);
	}

	function ensureRecaptchaScript(): Promise<void> {
		const grecaptcha = (window as Window & { grecaptcha?: unknown }).grecaptcha;
		if (grecaptcha) return Promise.resolve();

		const existing = findRecaptchaScript();
		const script = existing ?? document.createElement("script");
		if (!existing) {
			script.src = recaptchaSrc();
			script.async = true;
			script.defer = true;
			document.head.appendChild(script);
		}

		const alreadyLoaded =
			!!existing &&
			performance.getEntriesByType("resource").some((entry) => entry.name.startsWith(recaptchaSrc()));
		if (alreadyLoaded) return Promise.resolve();

		return new Promise((resolve, reject) => {
			script.addEventListener("load", () => resolve(), { once: true });
			script.addEventListener("error", () => reject(new Error("reCAPTCHA script failed")), { once: true });
		});
	}

	async function getRecaptchaToken(): Promise<string | null> {
		if (!PUBLIC_RECAPTCHA_SITE_KEY) return null;

		try {
			await ensureRecaptchaScript();
			const grecaptcha = (window as Window & {
				grecaptcha?: {
					ready: (callback: () => void) => void;
					execute: (siteKey: string, options: { action: string }) => Promise<string>;
				};
			}).grecaptcha;
			if (!grecaptcha) return null;

			return await new Promise((resolve) => {
				grecaptcha.ready(() => {
					grecaptcha
						.execute(PUBLIC_RECAPTCHA_SITE_KEY, { action: "contact_form" })
						.then((token) => resolve(token || null))
						.catch(() => resolve(null));
				});
			});
		} catch (error) {
			console.error("❌ [RECAPTCHA] Chyba při získávání tokenu:", error);
			return null;
		}
	}

	const handleSubmit: SubmitFunction = async ({ formData, cancel }) => {
		recaptchaError = "";
		submitting = true;

		if (PUBLIC_RECAPTCHA_SITE_KEY) {
			const recaptchaToken = await getRecaptchaToken();
			if (!recaptchaToken) {
				submitting = false;
				cancel();
				recaptchaError = "Ověření prohlížeče se nepodařilo. Zkuste to prosím znovu.";
				return;
			}
			formData.set("recaptcha_token", recaptchaToken);
		}

		return async ({ update }) => {
			submitting = false;
			await update();
		};
	};
</script>

<svelte:head>
	<title>{pageTitle}</title>
	<meta name="description" content={pageDescription} />
</svelte:head>

<section class="max-w-screen-xl px-4 py-16 mx-auto mb-10 rounded-lg bg-stone-100">
	<h1 class="mb-8 text-4xl font-extrabold tracking-tight text-center text-gray-900 md:text-5xl">
		Kontaktujte nás
	</h1>

	<div class="max-w-4xl mx-auto">
		<div class="bg-white border rounded-lg shadow-md p-8 border-gray-400">
			<div class="grid md:grid-cols-2 gap-8">
				<!-- Levá strana - Kontaktní informace -->
				<div class="space-y-6">
					<!-- Info karta -->
					<div class="bg-gray-50 rounded-lg p-6 space-y-4 border border-gray-200">
						<div class="flex items-center gap-3 border-b pb-4">
							<Building2 class="w-6 h-6 text-green-700" />
							<h2 class="text-xl font-semibold text-gray-800">
								{business?.companyName || ''}
							</h2>
						</div>

						<div class="space-y-3">
							<div class="flex items-center gap-3">
								<MapPin class="w-5 h-5 text-green-700 flex-shrink-0" />
								<p class="text-gray-600">
									{companyAddress}
								</p>
							</div>
							<div class="flex items-center gap-3">
								<Globe class="w-5 h-5 text-green-700 flex-shrink-0" />
								<div>
									<p class="text-gray-600">IČO: {business?.ico || 'Není k dispozici'}</p>
									<p class="text-gray-600">DIČ: {business?.dic || 'Není k dispozici'}</p>
									{#if business?.bankAccount}
										<p class="text-gray-600">Účet: {business.bankAccount}</p>
									{/if}
								</div>
							</div>
							<div class="flex items-center gap-3">
								<Phone class="w-5 h-5 text-green-700 flex-shrink-0" />
								<div>
									{#if contact?.phone}
										<p class="text-gray-600">
											<a href="tel:{contact.phone}" class="hover:text-green-700 hover:underline">
												{contact.phone}
											</a>
										</p>
									{/if}
									{#if contact?.phone1}
										<p class="text-gray-600">
											<a href="tel:{contact.phone1}" class="hover:text-green-700 hover:underline">
												{contact.phone1}
											</a>
										</p>
									{/if}
									{#if contact?.phone2}
										<p class="text-gray-600">
											<a href="tel:{contact.phone2}" class="hover:text-green-700 hover:underline">
												{contact.phone2}
											</a>
										</p>
									{/if}
									{#if !contact?.phone && !contact?.phone1 && !contact?.phone2}
										<p class="text-gray-600">Telefon není k dispozici</p>
									{/if}
								</div>
							</div>
							<div class="flex items-center gap-3">
								<MailIcon class="w-5 h-5 text-green-700 flex-shrink-0" />
								{#if contact?.email}
									<a href="mailto:{contact.email}" class="text-gray-600 hover:text-green-700 hover:underline">
										{contact.email}
									</a>
								{:else}
									<p class="text-gray-600">Email není k dispozici</p>
								{/if}
							</div>					
							
							<!-- Otevírací doba -->
							{#if contact?.showOpeningHours && contact?.openingHours}
								<div class="flex items-start gap-3">
									<Clock class="w-5 h-5 text-green-700 flex-shrink-0 mt-0.5" />
									<div>
										<p class="text-gray-600 font-medium mb-1">Otevírací doba:</p>
										<div class="text-sm text-gray-600 space-y-1">
											{#each Object.entries(contact.openingHours) as [day, hours] (day)}
												<div class="flex justify-between gap-4">
													<span class="capitalize">
														{#if day === "monday"}Pondělí
														{:else if day === "tuesday"}Úterý
														{:else if day === "wednesday"}Středa
														{:else if day === "thursday"}Čtvrtek
														{:else if day === "friday"}Pátek
														{:else if day === "saturday"}Sobota
														{:else if day === "sunday"}Neděle{/if}
													</span>
													<span>{hours}</span>
												</div>
											{/each}
										</div>
									</div>
								</div>
							{/if}
						</div>
					</div>

					{#if mapSrc}
						<div class="bg-gray-50 rounded-lg overflow-hidden h-64 border border-gray-200">
							<iframe
								class="w-full h-full"
								src={mapSrc}
								loading="lazy"
								referrerpolicy="no-referrer-when-downgrade"
								title={mapTitle}></iframe>
						</div>
					{/if}
				</div>

				<!-- Pravá strana - Kontaktní formulář -->
				<div class="bg-gray-50 rounded-lg p-6 border border-gray-200">
					<h2 class="text-xl font-semibold text-gray-800 mb-6">Napište nám</h2>
					<form
						method="POST"
						action="?/sendForm"
						use:enhance={handleSubmit}
						class="space-y-4">
						<!-- Email -->
						<div class="relative">
							<label
								for="email"
								class="text-sm font-medium text-gray-700 mb-1 block">
								Váš email
							</label>
							<div class="relative">
								<Mail
									class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
								<input
									value={form?.email ?? ""}
									type="email"
									name="email"
									id="email"
									required
									autocomplete="email"
									maxlength="254"
									aria-invalid={form?.errors?.email ? "true" : "false"}
									aria-describedby={form?.errors?.email ? "email-error" : undefined}
									class="w-full pl-10 pr-4 py-3 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none"
									class:border-red-500={form?.errors?.email}
									placeholder="vas@email.cz"
									/>
							</div>
							{#if form?.errors?.email}
								<p id="email-error" class="mt-1 text-sm text-red-600">
									{form.errors.email}
								</p>
							{/if}
						</div>

						<!-- Jméno -->
						<div class="relative">
							<label
								for="name"
								class="text-sm font-medium text-gray-700 mb-1 block">
								Vaše jméno
							</label>
							<div class="relative">
								<User
									class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
								<input
									value={form?.name ?? ""}
									type="text"
									name="name"
									id="name"
									required
									autocomplete="name"
									minlength="2"
									maxlength="80"
									aria-invalid={form?.errors?.name ? "true" : "false"}
									aria-describedby={form?.errors?.name ? "name-error" : undefined}
									class="w-full pl-10 pr-4 py-3 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none"
									class:border-red-500={form?.errors?.name}
									placeholder="Jan Novák"
									/>
							</div>
							{#if form?.errors?.name}
								<p id="name-error" class="mt-1 text-sm text-red-600">
									{form.errors.name}
								</p>
							{/if}
						</div>

						<!-- Telefon -->
						<div class="relative">
							<label
								for="tel"
								class="text-sm font-medium text-gray-700 mb-1 block">
								Telefon
							</label>
							<div class="relative">
								<Phone
									class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
								<input
									value={form?.tel ?? ""}
									type="tel"
									name="tel"
									id="tel"
									required
									autocomplete="tel"
									aria-invalid={form?.errors?.tel ? "true" : "false"}
									aria-describedby={form?.errors?.tel ? "tel-error" : undefined}
									class="w-full pl-10 pr-4 py-3 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none"
									class:border-red-500={form?.errors?.tel}
									placeholder="+420777456789"
									/>
							</div>
							{#if form?.errors?.tel}
								<p id="tel-error" class="mt-1 text-sm text-red-600">
									{form.errors.tel}
								</p>
							{/if}
						</div>

						<!-- Zpráva -->
						<div class="relative">
							<label
								for="content"
								class="text-sm font-medium text-gray-700 mb-1 block">
								Vaše zpráva
							</label>
							<div class="relative">
								<MessageSquare
									class="absolute left-3 top-3 w-5 h-5 text-gray-400" />
								<textarea
									value={form?.content ?? ""}
									name="content"
									id="content"
									rows="4"
									required
									minlength="10"
									maxlength="2000"
									aria-invalid={form?.errors?.content ? "true" : "false"}
									aria-describedby={form?.errors?.content ? "content-error" : undefined}
									class="w-full pl-10 pr-4 py-3 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none"
									class:border-red-500={form?.errors?.content}
									placeholder="Vaše zpráva..."
									></textarea>
							</div>
							{#if form?.errors?.content}
								<p id="content-error" class="mt-1 text-sm text-red-600">
									{form.errors.content}
								</p>
							{/if}
						</div>

						<!-- Submit Button -->
						{#if recaptchaError}
							<p class="text-sm text-red-600" role="alert">{recaptchaError}</p>
						{/if}

						<button
							type="submit"
							disabled={submitting}
							class="w-full px-4 py-2 text-base font-semibold text-center text-white bg-green-800 rounded-lg shadow-md hover:bg-green-900 disabled:opacity-50 disabled:cursor-not-allowed">
							{submitting ? "Odesílám…" : "Odeslat zprávu"}
						</button>

						<!-- Status Message -->
						{#if form?.status}
							<div
								class="p-4 mt-4 rounded-lg border"
								class:bg-red-50={!form.status.success}
								class:border-red-100={!form.status.success}
								class:bg-green-50={form.status.success}
								class:border-green-100={form.status.success}>
								<p
									class="text-sm font-medium"
									class:text-green-800={form.status.success}
									class:text-red-800={!form.status.success}>
									{form.status.display}
								</p>
							</div>
						{/if}
					</form>
				</div>
			</div>
		</div>
	</div>
</section>