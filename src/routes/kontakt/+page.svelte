<script>
	let message = { success: null, display: '' };

	function onSubmit(e) {
		const formData = new FormData(e.target);
		const data = {};
		for (let field of formData) {
			const [key, value] = field;
			data[key] = value;
		}		
		supabaseClient.auth.functions.invoke('sendForm', {
			body: JSON.stringify({ data: data })
		});
		if (data != null) {
			setTimeout(function () {
			window.location.reload();
		}, 5000);
			message = { display: 'Formulář odeslán' };
			return;
		}
		
	}
</script>

<style>
	textarea:focus-visible {
		outline: 1px solid green !important;
	}
</style>

<svelte:head>
	<title>Šťastné srdce - Kontakt</title>
	<meta name="description" content="Kontakt" />
</svelte:head>
<main>
	<section class="">
		<div class="max-w-screen-lg px-4 py-8 py-16 mx-auto mt-20 mb-10 rounded-lg bg-stone-100">
			<h1
				class="mb-4 mb-10 text-5xl font-extrabold tracking-tight text-center text-gray-900 animate__animated animate__rubberBand ">
				Kontakt
			</h1>
			<div class="grid grid-cols-1 p-5 bg-white border-2 rounded-lg md:grid-cols-1">
				<div
					class="mb-4 text-xl font-light text-center text-gray-500 md:text-xl">
					<p>
						<span class="text-2xl">Kuchyň K&K</span>
						<br />
						Potoční 16
						<br />
						Mikulovice 79081
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
					allowfullscreen=""
					loading="lazy"
					referrerpolicy="no-referrer-when-downgrade"
					title="Šťastné srdce" />
			</div>
			


			<form on:submit|preventDefault={onSubmit} class="mt-10 space-y-8">
				<!-- <div class="grid text-center"> -->
					<div class="">
				<div>
					<label for="email" class="block mb-2 text-sm font-medium text-gray-900">
						<p class="pt-5 text-lg text-center md:text-left">Váš mail</p>
					</label>
					<input
						type="email"
						name="email"
						id="email"
						class="w-full px-4 py-2 text-base text-gray-700 placeholder-gray-400 bg-white border border-gray-300 rounded-lg shadow-sm appearance-none focus:outline-none focus:border-green-600"
						placeholder="franta@vomacka.com"
						required />
				</div>
				<div>
					<label for="name" class="block mb-2 text-sm font-medium text-gray-900">
						<p class="pt-5 text-lg text-center md:text-left">Jméno</p>
					</label>
					<input
						name="name"
						id="name"
						class="w-full px-4 py-2 text-base text-gray-700 placeholder-gray-400 bg-white border border-gray-300 rounded-lg shadow-sm appearance-none focus:outline-none focus:border-green-600"
						placeholder="Franta Vomáčka"
						required />
				</div>
				<div>
					<label for="phone" class="block mb-2 text-sm font-medium text-gray-900">
						<p class="pt-5 text-lg text-center md:text-left">Telefon</p>
					</label>
					<input
						type="tel"
						name="phone"
						id="phone"
						class="w-full px-4 py-2 text-base text-gray-700 placeholder-gray-400 bg-white border border-gray-300 rounded-lg shadow-sm appearance-none focus:outline-none focus:border-green-600"
						placeholder="+420 777 111 222"
						pattern="[0-9]{3}-[0-9]{2}-[0-9]{3}"
						required />
				</div>
				<div class="sm:col-span-2">
					<label for="message" class="block mb-2 text-sm font-medium text-gray-900">
						<p class="pt-5 text-lg text-center md:text-left ">Zpráva</p>
					</label>
					<textarea
						name="message"
						id="message"
						rows="6"
						class="w-full px-4 py-2 text-base text-gray-700 placeholder-gray-400 bg-white border border-gray-300 rounded-lg shadow-sm appearance-none focus:outline-none"
						placeholder="Zanechte zprávu ..." />
				</div>
				<button
					type="submit"
					value="submit"					
					class="w-full px-4 py-2 text-base font-semibold text-center text-white transition duration-200 ease-in bg-green-600 rounded-lg shadow-md btn btn-success hover:bg-green-700 focus:ring-green-500 focus:ring-offset-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2">
					Odeslat
				</button>
				<div class="flex">{message.display}</div>
				</div>
			</form>
		</div>
	</section>

</main>
