<script lang="ts">
	import type { ActionData } from "./$types";
	import { fade } from "svelte/transition";
	import type { FormData } from "$lib/types/form";

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

	function doRecaptcha(e: any) {
		state = State.requesting;
		isSubmitting = true;

		grecaptcha.ready(function() {
			grecaptcha.execute(key, { action: "submit" }).then(function(t: any) {
				state = State.success;
				token = t;

				const form = e.target;
				const tokenInput = document.createElement("input");
				tokenInput.type = "hidden";
				tokenInput.name = "g-recaptcha-response";
				tokenInput.value = token;
				form.appendChild(tokenInput);

				form.submit();
			}).catch(() => {
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

<main>
	<section class="">
		<div class="max-w-screen-lg px-4 py-16 mx-auto mt-20 mb-10 rounded-lg bg-stone-100">
			<h1 class="mb-10 text-5xl font-extrabold tracking-tight text-center text-gray-900 animate__animated animate__rubberBand">
				Kontakt
			</h1>

			<div class="max-w-4xl pb-2 mx-auto">
				<!-- Company Info -->
				<div class="grid grid-cols-1 p-5 mb-8 bg-white border-2 rounded-lg md:grid-cols-1">
					<div class="text-xl font-light text-center text-gray-500 md:text-xl">
						<p>
							<span class="text-2xl">Šťastné srdce s.r.o.</span><br />
							Potoční 16<br />
							Mikulovice 79084<br />
							IČO: 21300674<br />
							DIČ: CZ21300674<br /><br />
							724 448 377<br />
							stastnesrdcekk@seznam.cz
						</p>
					</div>
				</div>

				<!-- Map -->
				<div class="mb-8 border-2 rounded-lg">
					<iframe
						class="w-full aspect-auto"
						src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2548.593686167967!2d17.32430381590737!3d50.29951200610991!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4711eb61ad640179%3A0x480cac0b0efc56ef!2sPoto%C4%8Dn%C3%AD%2016%2C%20790%2084%20Mikulovice!5e0!3m2!1sen!2scz!4v1657788959804!5m2!1sen!2scz"
						style="border:0;"
						loading="lazy"
						referrerpolicy="no-referrer-when-downgrade"
						title="Šťastné srdce" />
				</div>

				<!-- Contact Form -->
				<form
					method="POST"
					action="?/sendForm"
					on:submit|preventDefault={doRecaptcha}
					class="max-w-screen-sm mx-auto"
				>
					<!-- Email Field -->
					<div class="mb-6 w-96">
						<label for="email" class="block mb-2 text-lg font-medium text-gray-900">
							Váš email
						</label>
						<input
							value={form?.email ?? ""}
							type="email"
							name="email"
							id="email"
							class="w-full px-4 py-2 text-base text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
							class:border-red-500={form?.errors?.email}
							placeholder="vas@email.cz"
							disabled={isSubmitting}
						/>
						{#if form?.errors?.email}
							<p class="mt-1 text-sm text-red-600" transition:fade>{form.errors.email}</p>
						{/if}
					</div>

					<!-- Name Field -->
					<div class="mb-6 w-96">
						<label for="name" class="block mb-2 text-lg font-medium text-gray-900">
							Jméno
						</label>
						<input
							value={form?.name ?? ""}
							type="text"
							name="name"
							id="name"
							class="w-full px-4 py-2 text-base text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
							class:border-red-500={form?.errors?.name}
							placeholder="Vaše jméno"
							disabled={isSubmitting}
						/>
						{#if form?.errors?.name}
							<p class="mt-1 text-sm text-red-600" transition:fade>{form.errors.name}</p>
						{/if}
					</div>

					<!-- Phone Field -->
					<div class="mb-6 w-96">
						<label for="tel" class="block mb-2 text-lg font-medium text-gray-900">
							Telefon
						</label>
						<input
							value={form?.tel ?? ""}
							type="tel"
							name="tel"
							id="tel"
							class="w-full px-4 py-2 text-base text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
							class:border-red-500={form?.errors?.tel}
							placeholder="+420 123 456 789"
							disabled={isSubmitting}
						/>
						{#if form?.errors?.tel}
							<p class="mt-1 text-sm text-red-600" transition:fade>{form.errors.tel}</p>
						{/if}
					</div>

					<!-- Message Field -->
					<div class="mb-6">
						<label for="content" class="block mb-2 text-lg font-medium text-gray-900">
							Zpráva
						</label>
						<textarea
							value={form?.content ?? ""}
							name="content"
							id="content"
							rows="6"
							class="w-full px-4 py-2 text-base text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
							class:border-red-500={form?.errors?.content}
							placeholder="Vaše zpráva..."
							disabled={isSubmitting}
						/>
						{#if form?.errors?.content}
							<p class="mt-1 text-sm text-red-600" transition:fade>{form.errors.content}</p>
						{/if}
					</div>

					<!-- Submit Button -->
					<button
						type="submit"
						disabled={isSubmitting}
						class="w-full px-4 py-2 text-base font-semibold text-center text-white transition duration-200 ease-in-out transform bg-green-800 rounded-lg shadow-md hover:scale-105 disabled:opacity-50"
					>
						{isSubmitting ? "Odesílám..." : "Odeslat"}
					</button>

					<!-- Status Message -->
					{#if form?.status}
						<div
							class="p-4 mt-6 rounded-lg"
							class:bg-red-100={!form.status.success}
							class:bg-green-100={form.status.success}
							transition:fade
						>
							<p
								class="text-sm font-medium"
								class:text-green-800={form.status.success}
								class:text-red-800={!form.status.success}
							>
								{form.status.display}
							</p>
						</div>
					{/if}
				</form>
			</div>
		</div>
	</section>
</main>

<style>
</style>