<script lang="ts">
	import type { ActionData } from "./$types";
	import { fade, fly, scale } from "svelte/transition";
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

	let { session, supabase } = data;
	$: ({ session, supabase } = data);

	const key = "6Ldvac0ZAAAAAFmtvwilkJ3MOD4IGou9KjhRglIo";
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

		grecaptcha.ready(function () {
			grecaptcha
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
	<meta name="description" content="Kontakt" />
	<script src="https://www.google.com/recaptcha/api.js?render={key}"></script>
</svelte:head>

<main
	class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
	<div class="max-w-6xl mx-auto px-4 py-20">
		<h1
			in:fly={{ y: 50, duration: 1000 }}
			class="text-4xl md:text-5xl mb-16 font-extrabold tracking-tight text-center text-gray-900">
			Kontaktujte nás
		</h1>

		<div class="grid md:grid-cols-2 gap-8">
			<!-- Levá strana - Kontaktní informace -->
			<div class="space-y-8">
				<!-- Info karta -->
				<div
					class="bg-white rounded-2xl shadow-xl p-8 space-y-6 transform transition-all duration-300 hover:shadow-2xl">
					<div class="flex items-center gap-3 border-b pb-4">
						<Building2 class="w-6 h-6 text-green-700" />
						<h2 class="text-2xl font-semibold text-gray-800">
							Šťastné srdce s.r.o.
						</h2>
					</div>

					<div class="space-y-4">
						<div class="flex items-center gap-3">
							<MapPin class="w-5 h-5 text-green-700 flex-shrink-0" />
							<p class="text-gray-600">Potoční 16, Mikulovice 79084</p>
						</div>
						<div class="flex items-center gap-3">
							<Globe class="w-5 h-5 text-green-700 flex-shrink-0" />
							<div>
								<p class="text-gray-600">IČO: 21300674</p>
								<p class="text-gray-600">DIČ: CZ21300674</p>
							</div>
						</div>
						<div class="flex items-center gap-3">
							<Phone class="w-5 h-5 text-green-700 flex-shrink-0" />
							<p class="text-gray-600">724 448 377</p>
						</div>
						<div class="flex items-center gap-3">
							<MailIcon class="w-5 h-5 text-green-700 flex-shrink-0" />
							<p class="text-gray-600">stastnesrdcekk@seznam.cz</p>
						</div>
						<div class="flex items-center gap-3">
							<Clock class="w-5 h-5 text-green-700 flex-shrink-0" />
							<p class="text-gray-600">Po-Pá: 8:00 - 16:00</p>
						</div>
					</div>
				</div>

				<!-- Mapa -->
				<div class="bg-white rounded-2xl shadow-xl overflow-hidden h-64">
					<iframe
						class="w-full h-full"
						src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2548.593686167967!2d17.32430381590737!3d50.29951200610991!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4711eb61ad640179%3A0x480cac0b0efc56ef!2sPoto%C4%8Dn%C3%AD%2016%2C%20790%2084%20Mikulovice!5e0!3m2!1sen!2scz!4v1657788959804!5m2!1sen!2scz"
						loading="lazy"
						referrerpolicy="no-referrer-when-downgrade"
						title="Šťastné srdce" />
				</div>
			</div>

			<!-- Pravá strana - Kontaktní formulář -->
			<div class="bg-white rounded-2xl shadow-xl p-8">
				<h2 class="text-2xl font-semibold text-gray-800 mb-6">Napište nám</h2>
				<form
					method="POST"
					action="?/sendForm"
					on:submit|preventDefault={doRecaptcha}
					class="space-y-6">
					<!-- Email -->
					<div class="relative">
						<label
							for="email"
							class="text-sm font-medium text-gray-700 mb-1 block">
							Váš email
						</label>
						<div class="relative">
							<Mail
								class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 transition-all duration-300 {focused ===
								'email'
									? 'text-blue-500'
									: ''}" />
							<input
								value={form?.email ?? ""}
								type="email"
								name="email"
								id="email"
								class="w-full pl-10 pr-4 py-3 text-gray-900 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none transition-all"
								class:border-red-500={form?.errors?.email}
								placeholder="vas@email.cz"
								disabled={isSubmitting}
								on:focus={() => (focused = "email")}
								on:blur={() => (focused = "")} />
						</div>
						{#if form?.errors?.email}
							<p class="mt-1 text-sm text-red-600" transition:fade>
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
								class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 transition-all duration-300 {focused ===
								'name'
									? 'text-blue-500'
									: ''}" />
							<input
								value={form?.name ?? ""}
								type="text"
								name="name"
								id="name"
								class="w-full pl-10 pr-4 py-3 text-gray-900 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none transition-all"
								class:border-red-500={form?.errors?.name}
								placeholder="Jan Novák"
								disabled={isSubmitting}
								on:focus={() => (focused = "name")}
								on:blur={() => (focused = "")} />
						</div>
						{#if form?.errors?.name}
							<p class="mt-1 text-sm text-red-600" transition:fade>
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
								class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 transition-all duration-300 {focused ===
								'tel'
									? 'text-blue-500'
									: ''}" />
							<input
								value={form?.tel ?? ""}
								type="tel"
								name="tel"
								id="tel"
								class="w-full pl-10 pr-4 py-3 text-gray-900 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none transition-all"
								class:border-red-500={form?.errors?.tel}
								placeholder="+420 123 456 789"
								disabled={isSubmitting}
								on:focus={() => (focused = "tel")}
								on:blur={() => (focused = "")} />
						</div>
						{#if form?.errors?.tel}
							<p class="mt-1 text-sm text-red-600" transition:fade>
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
								class="absolute left-3 top-3 w-5 h-5 text-gray-400 transition-all duration-300 {focused ===
								'content'
									? 'text-blue-500'
									: ''}" />
							<textarea
								value={form?.content ?? ""}
								name="content"
								id="content"
								rows="4"
								class="w-full pl-10 pr-4 py-3 text-gray-900 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none transition-all"
								class:border-red-500={form?.errors?.content}
								placeholder="Vaše zpráva..."
								disabled={isSubmitting}
								on:focus={() => (focused = "content")}
								on:blur={() => (focused = "")} />
						</div>
						{#if form?.errors?.content}
							<p class="mt-1 text-sm text-red-600" transition:fade>
								{form.errors.content}
							</p>
						{/if}
					</div>

					<!-- Submit Button -->
					<button
						type="submit"
						disabled={isSubmitting}
						class="w-full px-4 py-2 text-base font-semibold text-center text-white transition duration-200 ease-in-out transform bg-green-800 rounded-lg shadow-md hover:scale-105
                               disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed">
						{#if isSubmitting}
							<span class="flex items-center justify-center gap-2">
								<div
									class="w-5 h-5 border-t-2 border-white rounded-full animate-spin">
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
							in:fly={{ y: 20, duration: 300 }}
							class="p-4 mt-6 rounded-xl border"
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
</main>
