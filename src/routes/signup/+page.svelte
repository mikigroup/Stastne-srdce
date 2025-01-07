<script lang="ts">
	import type { Actions } from "@sveltejs/kit";
	import { enhance } from "$app/forms";
	export let form: Actions;
	export let data;
	let { session, supabase, user } = data;
	$: ({ session, supabase, user } = data);

	let loading = false;
	let allergies = "no";
	let allergiesDescription = "";
	let deliveryMethod = "";
	let paymentMethod = "";

	async function signInWithGoogle() {
		loading = true;
		const { data, error } = await supabase.auth.signInWithOAuth({
			provider: "google",
			options: {
				queryParams: {
					access_type: "offline",
					prompt: "consent"
				}
			}
		});
		if (error) {
			console.error("Chyba při přihlášení pomocí Google:", error.message);
		} else {
			// Redirect or handle successful sign-in
		}
		loading = false;
	}
</script>

<svelte:head>
	<title>Šťastné srdce - Vytvoření nového účtu</title>
	<meta name="description" content="SingUp" />
</svelte:head>

<section>
	<div class="footer_fix">
		<div
			class="flex flex-col max-w-md px-4 pb-2 mx-auto bg-white rounded-lg shadow pt-7 sm:px-6 md:px-8 lg:px-10">
			<div
				class="self-center mb-2 text-3xl font-light text-gray-800 sm:text-2xl">
				Vytvoření nového účtu
			</div>
			<span
				class="justify-center text-sm text-center text-gray-500 flex-items-center">
				Máte již účet?
				<a
					href="/login"
					class="text-sm text-blue-500 underline hover:text-blue-700"
					>Přihlášení</a>
			</span>
			<div class="mt-8">
				<form method="POST" action="?/signUp" class="">
					<div class="flex flex-col mb-2">
						<div class="relative flex">
							<span
								class="inline-flex items-center px-3 text-sm text-gray-500 bg-white border-t border-b border-l border-gray-300 shadow-sm rounded-l-md">
								<svg
									width="15"
									height="15"
									fill="currentColor"
									viewBox="0 0 1792 1792"
									xmlns="http://www.w3.org/2000/svg">
									<path
										d="M1792 710v794q0 66-47 113t-113 47h-1472q-66 0-113-47t-47-113v-794q44 49 101
										87 362 246 497 345 57 42 92.5 65.5t94.5 48 110 24.5h2q51 0 110-24.5t94.5-48
										92.5-65.5q170-123 498-345 57-39 100-87zm0-294q0 79-49 151t-122 123q-376 261-468
										325-10 7-42.5 30.5t-54 38-52 32.5-57.5 27-50 9h-2q-23
										0-50-9t-57.5-27-52-32.5-54-38-42.5-30.5q-91-64-262-182.5t-205-142.5q-62-42-117-115.5t-55-136.5q0-78
										41.5-130t118.5-52h1472q65 0 112.5 47t47.5 113z" />
								</svg>
							</span>
							<input
								value={form?.email ?? "@"}
								type="email"
								id="email"
								name="email"
								class="w-full px-4 py-2 text-base bg-white border border-gray-300 rounded-lg shadow-sm appearance-none text-gray-placeholder-gray-400 focus:outline-none focus:border-green-600"
								pattern="[^@]+@[^\.]+\..+"
								placeholder="Email"
								required />
						</div>
					</div>
					<div class="flex flex-col mb-2">
						<div class="relative flex">
							<span
								class="inline-flex items-center px-3 text-sm text-gray-500 bg-white border-t border-b border-l border-gray-300 shadow-sm rounded-l-md">
								<svg
									width="15"
									height="15"
									fill="currentColor"
									viewBox="0 0 1792 1792"
									xmlns="http://www.w3.org/2000/svg">
									<path
										d="M1376 768q40 0 68 28t28 68v576q0 40-28 68t-68 28h-960q-40
										0-68-28t-28-68v-576q0-40 28-68t68-28h32v-320q0-185 131.5-316.5t316.5-131.5 316.5
										131.5 131.5 316.5q0 26-19 45t-45 19h-64q-26
										0-45-19t-19-45q0-106-75-181t-181-75-181 75-75 181v320h736z" />
								</svg>
							</span>
							<input
								value={form?.password ?? ""}
								type="password"
								id="password"
								name="password"
								class="w-full px-4 py-2 text-base bg-white border border-gray-300 rounded-lg shadow-sm appearance-none text-gray-placeholder-gray-400 focus:outline-none focus:border-green-600"
								placeholder="Heslo (min 6 znaků)"
								minlength="6"
								required />
						</div>
					</div>
					<div class="flex flex-col mb-2">
						<div class="relative flex">
							<span
								class="inline-flex items-center px-3 text-sm text-gray-500 bg-white border-t border-b border-l border-gray-300 shadow-sm rounded-l-md">
								<svg
									width="15"
									height="15"
									fill="currentColor"
									viewBox="0 0 1792 1792"
									xmlns="http://www.w3.org/2000/svg">
									<path
										d="M1376 768q40 0 68 28t28 68v576q0 40-28 68t-68 28h-960q-40
										0-68-28t-28-68v-576q0-40 28-68t68-28h32v-320q0-185 131.5-316.5t316.5-131.5 316.5
										131.5 131.5 316.5q0 26-19 45t-45 19h-64q-26
										0-45-19t-19-45q0-106-75-181t-181-75-181 75-75 181v320h736z" />
								</svg>
							</span>
							<input
								value={form?.repassword ?? ""}
								type="password"
								id="repassword"
								class="w-full px-4 py-2 text-base bg-white border border-gray-300 rounded-lg shadow-sm appearance-none text-gray-placeholder-gray-400 focus:outline-none focus:border-green-600"
								name="repassword"
								placeholder="Potvrzení hesla (napiš stejné heslo)"
								minlength="6"
								required />
						</div>
					</div>
					<!--Nové Prvky-->

					<div class="flex flex-col mb-2">
						<div class="relative flex">
							<input
								value={form?.name ?? ""}
								type="text"
								id="name"
								name="name"
								class="w-full px-4 py-2 text-base bg-white border border-gray-300 rounded-lg shadow-sm appearance-none text-gray-placeholder-gray-400 focus:outline-none focus:border-green-600"
								placeholder="Jméno"
								required />
						</div>
					</div>
					<div class="flex flex-col mb-2">
						<div class="relative flex">
							<input
								value={form?.surname ?? ""}
								type="text"
								id="surname"
								name="surname"
								class="w-full px-4 py-2 text-base bg-white border border-gray-300 rounded-lg shadow-sm appearance-none text-gray-placeholder-gray-400 focus:outline-none focus:border-green-600"
								placeholder="Příjmení"
								required />
						</div>
					</div>
					<!--Dodací adresa-->
					<h3>
						Dodací adresa
					</h3>
					<div class="flex flex-col mb-2">
						<div class="relative flex">
							<input
								value={form?.street ?? ""}
								type="text"
								id="street"
								name="street"
								class="w-full px-4 py-2 text-base bg-white border border-gray-300 rounded-lg shadow-sm appearance-none text-gray-placeholder-gray-400 focus:outline-none focus:border-green-600"
								placeholder="Ulice"
								required
							/>
						</div>
					</div>
					<div class="flex flex-col mb-2">
						<div class="relative flex">
							<input
								value={form?.street_number ?? ""}
								type="text"
								id="street_number"
								name="street_number"
								class="w-full px-4 py-2 text-base bg-white border border-gray-300 rounded-lg shadow-sm appearance-none text-gray-placeholder-gray-400 focus:outline-none focus:border-green-600"
								placeholder="Číslo popisné"
								required
							/>
						</div>
					</div>
					<div class="flex flex-col mb-2">
						<div class="relative flex">
							<input
								value={form?.city ?? ""}
								type="text"
								id="city"
								name="city"
								class="w-full px-4 py-2 text-base bg-white border border-gray-300 rounded-lg shadow-sm appearance-none text-gray-placeholder-gray-400 focus:outline-none focus:border-green-600"
								placeholder="Město"
								required
							/>
						</div>
					</div>
					<div class="flex flex-col mb-2">
						<div class="relative flex">
							<input
								value={form?.zip ?? ""}
								type="text"
								id="zip"
								name="zip"
								class="w-full px-4 py-2 text-base bg-white border border-gray-300 rounded-lg shadow-sm appearance-none text-gray-placeholder-gray-400 focus:outline-none focus:border-green-600"
								placeholder="Směrovací číslo"
								required
							/>
						</div>
					</div>
					<div class="flex flex-col mb-2">
						<div class="relative flex">
							<input
								value={form?.telephone ?? ""}
								type="tel"
								id="telephone"
								name="telephone"
								class="w-full px-4 py-2 text-base bg-white border border-gray-300 rounded-lg shadow-sm appearance-none text-gray-placeholder-gray-400 focus:outline-none focus:border-green-600"
								placeholder="Telefon"
								required
							/>
						</div>
					</div>
					<!-- Alergie -->
					<div class="mt-6 mb-4">
						<h3 class="text-lg font-medium mb-2">Alergie</h3>
						<div class="flex gap-4 mb-2">
							<label class="flex items-center">
								<input
									type="radio"
									name="allergies"
									value="no"
									bind:group={allergies}
									class="mr-2"
								/>
								Ne
							</label>
							<label class="flex items-center">
								<input
									type="radio"
									name="allergies"
									value="yes"
									bind:group={allergies}
									class="mr-2"
								/>
								Ano
							</label>
						</div>
						{#if allergies === "yes"}
							<div class="flex flex-col">
            <textarea
							name="allergiesDescription"
							bind:value={allergiesDescription}
							maxlength="300"
							placeholder="Popište vaše alergie (max 300 znaků)"
							class="w-full px-4 py-2 text-base bg-white border border-gray-300 rounded-lg shadow-sm appearance-none text-gray-placeholder-gray-400 focus:outline-none focus:border-green-600"
							rows="3"
						></textarea>
								<span class="text-sm text-gray-500 mt-1">
                Zbývá {300 - (allergiesDescription?.length || 0)} znaků
            </span>
							</div>
						{/if}
					</div>

					<!-- Způsob dodání -->
					<div class="mt-6 mb-4">
						<h3 class="text-lg font-medium mb-2">Způsob dodání</h3>
						<div class="flex flex-col gap-2">
							<label class="flex items-center">
								<input
									type="radio"
									name="deliveryMethod"
									value="own"
									bind:group={deliveryMethod}
									class="mr-2"
								/>
								Vlastní nosič
							</label>
							<label class="flex items-center">
								<input
									type="radio"
									name="deliveryMethod"
									value="reBox"
									bind:group={deliveryMethod}
									class="mr-2"
								/>
								REkrabička (záloha 160 Kč za set/80 Kč za jednu)
							</label>
							<label class="flex items-center">
								<input
									type="radio"
									name="deliveryMethod"
									value="menuBox"
									bind:group={deliveryMethod}
									class="mr-2"
								/>
								Menu Box (12 Kč/kus)
							</label>
						</div>
					</div>

					<!-- Způsob platby -->
					<div class="mt-6 mb-4">
						<h3 class="text-lg font-medium mb-2">Způsob platby</h3>
						<div class="flex flex-col gap-2">
							<label class="flex items-center">
								<input
									type="radio"
									name="paymentMethod"
									value="cash"
									bind:group={paymentMethod}
									class="mr-2"
								/>
								Hotově
							</label>
							<label class="flex items-center">
								<input
									type="radio"
									name="paymentMethod"
									value="bankNoInvoice"
									bind:group={paymentMethod}
									class="mr-2"
								/>
								Na účet bez faktury
							</label>
							<label class="flex items-center">
								<input
									type="radio"
									name="paymentMethod"
									value="bankWithInvoice"
									bind:group={paymentMethod}
									class="mr-2"
								/>
								Na účet s fakturou
							</label>
						</div>
					</div>


					<!--display-->
					<div class="flex w-full my-4">
						<button
							type="submit"
							class="w-full px-4 py-2 text-base font-semibold text-center text-white transition duration-200 ease-in-out transform bg-green-800 rounded-lg shadow-md hover:scale-105"
							disabled={loading}>
							{loading ? "Probíhá registrace..." : "Registrovat"}
						</button>
					</div>
					{#if form?.message}
						<div class="flex w-full p-2 my-4 border rounded-lg">
							<p class="error">{form.message.display}</p>
						</div>
					{/if}
				</form>
			</div>
		</div>
		<div class="form-widget">
			<div
				class="flex max-w-md gap-2 px-4 py-8 mx-auto bg-white rounded-lg shadow flex-col-2 sm:px-6 md:px-8 lg:px-10">
				<div class="">
					<button
						on:click={signInWithGoogle}
						value={loading ? "Loading" : "Log in with Google"}
						disabled={loading}
						id="btn-success"
						type="submit"
						class="px-4 py-2 text-base font-semibold text-center transition duration-200 ease-in rounded-lg shadow-md hover:bg-green-800">
						<img src="/google.svg" alt="" width="40" height="40" />
					</button>
				</div>
			</div>
		</div>
	</div>
</section>
