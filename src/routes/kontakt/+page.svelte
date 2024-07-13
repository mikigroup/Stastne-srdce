<script lang="ts">
	import type { Actions } from "@sveltejs/kit";
	export let form: Actions;
	export let data;

	let { session, supabase } = data;
	$: ({ session, supabase } = data);

	const key = "6Ldvac0ZAAAAAFmtvwilkJ3MOD4IGou9KjhRglIo";
	let State = {
		idle: "idle",
		requesting: "requesting",
		success: "success"
	};
	/*	let token;
		let state = State.idle;*/

	let token = "";
	let state = State.idle;


	function doRecaptcha(e:any) {
		grecaptcha.ready(function() {
			grecaptcha.execute(key, { action: "submit" }).then(function(t:any) {
				state = State.success;
				token = t;

				const form = e.target;
				const tokenInput = document.createElement('input');
				tokenInput.type = 'hidden';
				tokenInput.name = 'g-recaptcha-response';
				tokenInput.value = token;
				form.appendChild(tokenInput);

				form.submit();
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
		<div
			class="max-w-screen-lg px-4 py-16 mx-auto mt-20 mb-10 rounded-lg bg-stone-100">
			<h1
				class="mb-10 text-5xl font-extrabold tracking-tight text-center text-gray-900 animate__animated animate__rubberBand">
				Kontakt
			</h1>
			<div class="max-w-4xl pb-2 mx-auto">
				<div
					class="grid grid-cols-1 p-5 bg-white border-2 rounded-lg md:grid-cols-1">
					<div
						class="mb-4 text-xl font-light text-center text-gray-500 md:text-xl">
						<p>
							<span class="text-2xl">Šťastné srdce s.r.o.</span>
							<br />
							Potoční 16
							<br />
							Mikulovice 79081
							<br />
							IČO: 21300674<br />
							DIČ: CZ21300674
							<br />
							<br />
							724 448 377
							<br />
							stastnesrdcekk@seznam.cz
						</p>
					</div>
				</div>
				<div class="justify-center border-2 rounded-lg">
					<iframe
						class="w-full aspect-auto"
						src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2548.593686167967!2d17.32430381590737!3d50.29951200610991!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4711eb61ad640179%3A0x480cac0b0efc56ef!2sPoto%C4%8Dn%C3%AD%2016%2C%20790%2084%20Mikulovice!5e0!3m2!1sen!2scz!4v1657788959804!5m2!1sen!2scz"
						style="border:0;"
						loading="lazy"
						referrerpolicy="no-referrer-when-downgrade"
						title="Šťastné srdce" />
				</div>
			</div>
			<div class="">
				<form method="POST" class="" action="?/sendForm" on:submit|preventDefault={doRecaptcha}>
					<!-- <div class="grid text-center"> -->
					<div class="max-w-screen-sm py-20 mx-auto my-20">
						<div>
							<label
								for="email"
								class="block mb-2 text-sm font-medium text-gray-900">
								<p class="pt-5 text-lg text-center md:text-left">Váš mail</p>
							</label>
							<input
								value={form?.email ?? ""}
								type="email"
								name="email"
								id="email"
								class="w-full px-4 py-2 text-base text-center bg-white border border-gray-300 rounded-lg shadow-sm appearance-none text-gray-aceholder-gray-400 focus:outline-none focus:border-green-600"
								required
								placeholder="Email" />
						</div>
						<div>
							<label
								for="name"
								class="block mb-2 text-sm font-medium text-gray-900">
								<p class="pt-5 text-lg text-center md:text-left">Jméno</p>
							</label>
							<input
								value={form?.name ?? ""}
								type="text"
								name="name"
								id="name"
								class="w-full px-4 py-2 text-base text-center bg-white border border-gray-300 rounded-lg shadow-sm appearance-none text-gray-aceholder-gray-400 focus:outline-none focus:border-green-600"
								required
								placeholder="Jméno" />
						</div>
						<div>
							<label
								for="phone"
								class="block mb-2 text-sm font-medium text-gray-900">
								<p class="pt-5 text-lg text-center md:text-left">Telefon</p>
							</label>
							<input
								value={form?.tel ?? ""}
								type="text"
								name="tel"
								id="tel"
								class="w-full px-4 py-2 text-base text-center bg-white border border-gray-300 rounded-lg shadow-sm appearance-none text-gray-aceholder-gray-400 focus:outline-none focus:border-green-600"
								required
								placeholder="Telefon" />
						</div>
						<div class="sm:col-span-2">
							<label
								for="message"
								class="block mb-2 text-sm font-medium text-gray-900">
								<p class="pt-5 text-lg text-center md:text-left">Zpráva</p>
							</label>
							<textarea
								value={form?.message ?? ""}
								name="message"
								id="message"
								rows="6"
								class="w-full px-4 py-2 text-base text-gray-700 placeholder-gray-400 bg-white border border-gray-300 rounded-lg shadow-sm appearance-none focus:outline-none"
								placeholder="Zanechte zprávu ..." />
						</div>
						<button
							type="submit"
							value="submit"
							class="w-full px-4 py-2 text-base font-semibold text-center text-white transition duration-200 ease-in-out transform bg-green-800 rounded-lg shadow-md hover:scale-105">
							Odeslat
						</button>
						{#if form?.message}
							<div class="flex w-full p-2 my-4 border rounded-lg">
								<p class="error">{form.message.display}</p>
							</div>
						{/if}
					</div>
				</form>
			</div>
		</div>
	</section>
</main>

<style>
    textarea:focus-visible {
        outline: 1px solid green !important;
    }
</style>
