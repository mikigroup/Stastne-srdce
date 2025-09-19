<script lang="ts">
	import type { ActionData } from "./$types";
	import type { FormData } from "$lib/types/form";
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
	} from "lucide-svelte";

	export let form: FormData;
	export let data;

	let { session, supabase, settings } = data;
	$: ({ session, supabase, settings } = data);

	// Extrahujeme data z settings
	$: contact = settings?.contact || {};
	$: business = settings?.business || {};
	
	// Debug výpis pro kontrolu dat
	$: console.log('🔍 Kontakt - Svelte data:', {
		contact: contact,
		business: business,
		showOpeningHours: contact?.showOpeningHours,
		openingHours: contact?.openingHours,
		shouldShow: contact?.showOpeningHours && contact?.openingHours,
		hasContactData: !!contact && Object.keys(contact).length > 0,
		hasBusinessData: !!business && Object.keys(business).length > 0,
		contactKeys: contact ? Object.keys(contact) : [],
		businessKeys: business ? Object.keys(business) : []
	});
	
	// Title pro mapu z nastavení
	$: mapTitle = business?.companyName && contact?.address ? 
		`${business.companyName} - ${contact.address}` : 
		'';

	const key = "6LcNpg4qAAAAAPfGa_aQYUsxGK-fNgxQRVklEdnW";
	const State = {
		idle: "idle",
		requesting: "requesting",
		success: "success"
	};

	let token = "";
	let state = State.idle;
	let isSubmitting = false;
	let focused = "";

	function doRecaptcha(e: any) {
		state = State.requesting;
		isSubmitting = true;

		(window as any).grecaptcha.ready(function () {
			(window as any).grecaptcha
				.execute(key, { action: "submit" })
				.then(function (t: any) {
					state = State.success;
					token = t;

					const form = e.target;
					const tokenInput = document.createElement("input");
					tokenInput.type = "hidden";
					tokenInput.name = "g-recaptcha-response";
					tokenInput.value = token;
					form.appendChild(tokenInput);

					form.submit();
				})
				.catch(() => {
					state = State.idle;
					isSubmitting = false;
				});
		});
	}
</script>

<svelte:head>
	<title>Šťastné srdce - Kontakt</title>
	<meta name="description" content="Kontaktujte nás - Šťastné srdce" />
	<script src="https://www.google.com/recaptcha/api.js?render={key}"></script>
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
									{contact?.address || `${business?.street || ''} ${business?.streetNumber || ''}, ${business?.city || ''} ${business?.zipCode || ''}` || 'Adresa není k dispozici'}
								</p>
							</div>
							<div class="flex items-center gap-3">
								<Globe class="w-5 h-5 text-green-700 flex-shrink-0" />
								<div>
									<p class="text-gray-600">IČO: {business?.ico || 'Není k dispozici'}</p>
									<p class="text-gray-600">DIČ: {business?.dic || 'Není k dispozici'}</p>
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
								<p class="text-gray-600">{contact?.email || 'Email není k dispozici'}</p>
							</div>					
							
							<!-- Otevírací doba -->
							{#if contact?.showOpeningHours && contact?.openingHours}
								<div class="flex items-start gap-3">
									<Clock class="w-5 h-5 text-green-700 flex-shrink-0 mt-0.5" />
									<div>
										<p class="text-gray-600 font-medium mb-1">Otevírací doba:</p>
										<div class="text-sm text-gray-600 space-y-1">
											{#each Object.entries(contact.openingHours) as [day, hours]}
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

					<!-- Mapa -->
					<div class="bg-gray-50 rounded-lg overflow-hidden h-64 border border-gray-200">
						{#if contact?.mapCoordinates?.lat && contact?.mapCoordinates?.lng}
							<iframe
								class="w-full h-full"
								src="https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q={contact.mapCoordinates.lat},{contact.mapCoordinates.lng}&zoom=15"
								loading="lazy"
								referrerpolicy="no-referrer-when-downgrade"
								title={mapTitle} />
						{:else}
							<iframe
								class="w-full h-full"
								src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2548.593686167967!2d17.32430381590737!3d50.29951200610991!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4711eb61ad640179%3A0x480cac0b0efc56ef!2sPoto%C4%8Dn%C3%AD%2016%2C%20790%2084%20Mikulovice!5e0!3m2!1sen!2scz!4v1657788959804!5m2!1sen!2scz"
								loading="lazy"
								referrerpolicy="no-referrer-when-downgrade"
								title={mapTitle} />
						{/if}
					</div>
				</div>

				<!-- Pravá strana - Kontaktní formulář -->
				<div class="bg-gray-50 rounded-lg p-6 border border-gray-200">
					<h2 class="text-xl font-semibold text-gray-800 mb-6">Napište nám</h2>
					<form
						method="POST"
						action="?/sendForm"
						on:submit|preventDefault={doRecaptcha}
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
									class="w-full pl-10 pr-4 py-3 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none"
									class:border-red-500={form?.errors?.email}
									placeholder="vas@email.cz"
									disabled={isSubmitting} />
							</div>
							{#if form?.errors?.email}
								<p class="mt-1 text-sm text-red-600">
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
									class="w-full pl-10 pr-4 py-3 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none"
									class:border-red-500={form?.errors?.name}
									placeholder="Jan Novák"
									disabled={isSubmitting} />
							</div>
							{#if form?.errors?.name}
								<p class="mt-1 text-sm text-red-600">
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
									class="w-full pl-10 pr-4 py-3 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none"
									class:border-red-500={form?.errors?.tel}
									placeholder="+420 123 456 789"
									disabled={isSubmitting} />
							</div>
							{#if form?.errors?.tel}
								<p class="mt-1 text-sm text-red-600">
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
									class="w-full pl-10 pr-4 py-3 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none"
									class:border-red-500={form?.errors?.content}
									placeholder="Vaše zpráva..."
									disabled={isSubmitting} />
							</div>
							{#if form?.errors?.content}
								<p class="mt-1 text-sm text-red-600">
									{form.errors.content}
								</p>
							{/if}
						</div>

						<!-- Submit Button -->
						<button
							type="submit"
							disabled={isSubmitting}
							class="w-full px-4 py-2 text-base font-semibold text-center text-white bg-green-800 rounded-lg shadow-md hover:bg-green-900 disabled:opacity-50 disabled:cursor-not-allowed">
							{#if isSubmitting}
								<span class="flex items-center justify-center gap-2">
									<div class="w-5 h-5 border-t-2 border-white rounded-full animate-spin">
									</div>
									Odesílám...
								</span>
							{:else}
								Odeslat zprávu
							{/if}
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