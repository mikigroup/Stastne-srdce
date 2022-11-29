<script>
	import { supabase } from './supabaseClient';

	let message = { success: null, display: '' };

	function onSubmit(e) {
		const formData = new FormData(e.target);
		const data = {};
		for (let field of formData) {
			const [key, value] = field;
			data[key] = value;
		}
		console.log(data);
		supabase.functions.invoke('sendForm', {
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
	/* window.location='/send'; */

	/*  const onSubmit = async () => {	
  if (data != confirmpassword) {
	message = { success: false, display: "Heslo a potvrzovací heslo není stejné, zadejte je prosím znovu" };
	return;
  }

  try {
	loading = true;
	const { error } = await supabase.auth.signUp({ email, password });
	console.log(error);
	if (error) throw error;
	message = { success: true, display: "Na Vaši emailovou schránku byla odeslána zpráva. Prosím potvrďte ji a následně se přihlašte." };	
  } catch (error) {
	console.log(error);
	let errorMsg = error.error_description || error.message;
	message = { success: false, display: errorMsg };
  } finally {
	loading = false;
  }
}; */
</script>

<style>
	textarea:focus-visible {
		outline: 1px solid green !important;
	}
</style>

<svelte:head>
	<title>Šťastné srdce - Kontakt</title>
</svelte:head>

<main>
	<section class="form py-8 py-16 md:px-4 mx-auto max-w-screen-lg mt-4 bg-slate-100 rounded-lg">
		<div class="py-8 py-16 px-4 mx-auto max-w-screen-md bg-slate-100 rounded-lg">
			<h1
				class="mb-10 mb-4 text-4xl tracking-tight font-extrabold text-center text-gray-900
				dark:text-white">
				Kontakt
			</h1>
			<div class="grid grid-cols-1 md:grid-cols-1 border-2 p-5 rounded-lg bg-white">
				<!-- <div
					class="mb-8 lg:my-8 font-light text-center text-gray-500 dark:text-gray-400 text-xl md:text-lg">
					<p>
						Dietologická poradna
						<br />
						Dukelská 456 (ambulantní služba)
						<br />
						Jeseník 79001
						<br />
						<span class="text-sm"></span> 724 448 377<br> <span class="text-sm"></span> stastnesrdcekk@seznam.cz
					</p>
				</div> -->
				<div
					class="mb-4 font-light text-center text-gray-500 dark:text-gray-400 text-xl md:text-xl">
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
			<div class="justify-center rounded-lg border-2">
				<iframe
					class="w-full aspect-auto"
					src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2548.593686167967!2d17.32430381590737!3d50.29951200610991!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4711eb61ad640179%3A0x480cac0b0efc56ef!2sPoto%C4%8Dn%C3%AD%2016%2C%20790%2084%20Mikulovice!5e0!3m2!1sen!2scz!4v1657788959804!5m2!1sen!2scz"
					style="border:0;"
					allowfullscreen=""
					loading="lazy"
					referrerpolicy="no-referrer-when-downgrade"
					title="Šťastné srdce" />
			</div>
			<form on:submit|preventDefault={onSubmit} class="space-y-8 mt-10">
				<div>
					<label for="email" class="block mb-2 text-sm font-medium text-gray-900">
						<p class="text-lg">Váš mail</p>
					</label>
					<input
						name="email"
						id="email"
						class="shadow-sm bg-gray-50 border border-gray-300 text-sm rounded-lg block w-full p-2.5
						dark:border-gray-600 dark:placeholder-gray-400 dark:shadow-sm-light appearance-none
						block w-full border border-gray-200 rounded-lg py-3 px-3 focus:outline-none border
						focus:ring-2 focus:ring-green-700"
						placeholder="franta@vomacka.com"
						required />
				</div>
				<div>
					<label for="name" class="block mb-2 text-sm font-medium text-gray-900">
						<p class="text-lg">Jméno</p>
					</label>
					<input
						name="name"
						id="name"
						class="shadow-sm bg-gray-50 border border-gray-300 text-sm rounded-lg block w-full p-2.5
						dark:border-gray-600 dark:placeholder-gray-400 dark:shadow-sm-light appearance-none
						block w-full border border-gray-200 rounded-lg py-3 px-3 focus:outline-none border
						focus:ring-2 focus:ring-green-700"
						placeholder="Franta Vomáčka"
						required />
				</div>
				<div>
					<label for="phone" class="block mb-2 text-sm font-medium text-gray-900">
						<p class="text-lg">Telefon</p>
					</label>
					<input
						name="phone"
						id="phone"
						class="shadow-sm bg-gray-50 border border-gray-300 text-sm rounded-lg block w-full p-2.5
						dark:border-gray-600 dark:placeholder-gray-400 dark:shadow-sm-light appearance-none
						block w-full border border-gray-200 rounded-lg py-3 px-3 focus:outline-none border
						focus:ring-2 focus:ring-green-700"
						placeholder="+420 777 111 222"
						required />
				</div>
				<div class="sm:col-span-2">
					<label for="message" class="block mb-2 text-sm font-medium text-gray-900">
						<p class="text-lg">Zpráva</p>
					</label>
					<textarea
						name="message"
						id="message"
						rows="6"
						class="shadow-sm bg-gray-50 border border-gray-300 text-sm rounded-lg block w-full p-2.5
						dark:border-gray-600 dark:placeholder-gray-400 dark:shadow-sm-light appearance-none
						block w-full border border-gray-200 rounded-lg py-3 px-3 focus:outline-none border
						focus:ring-2 focus:ring-green-700"
						placeholder="Zanechte zprávu ..." />
				</div>
				<button
					type="submit"
					value="submit"
					class="btn btn-success py-2 px-4 bg-green-600 hover:bg-green-700 focus:ring-green-500 f
					ocus:ring-offset-green-200 text-white transition ease-in duration-200 w-full text-center
					shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-lg">
					Odeslat
				</button>
				<div class="flex">{message.display}</div>
			</form>
		</div>
	</section>

</main>
