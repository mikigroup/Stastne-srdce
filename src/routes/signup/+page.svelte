<script lang="ts">
	import type { ActionData } from "./$types";
	import { enhance } from "$app/forms";
	export let form: ActionData;
	export let data;
	let { session, supabase } = data;
	$: ({ session, supabase } = data);

	let loading = false;
	let agreedToTerms = false;

	function handleSubmit() {
		if (!agreedToTerms) return; // zabrání odeslání, pokud není souhlas

		loading = true;
		return async ({ result, update }) => {
			console.log('Form result:', result);

			if (result.type === 'success' || result.type === 'failure') {
				loading = false;
			}

			await update();
		};
	}

	async function signInWithGoogle() {
		try {
			loading = true;
			const { error } = await supabase.auth.signInWithOAuth({
				provider: "google",
				options: {
					queryParams: {
						access_type: "offline",
						prompt: "consent"
					},
					redirectTo: `${window.location.origin}/auth/callback`
				}
			});
			if (error) throw error;
		} catch (error) {
			console.error("Chyba při přihlášení pomocí Google:", error);
		} finally {
			loading = false;
		}
	}

	async function signInWithFacebook() {
		try {
			loading = true;
			const { error } = await supabase.auth.signInWithOAuth({
				provider: "facebook",
				options: {
					queryParams: {
						access_type: "offline",
						prompt: "consent"
					},
					redirectTo: `${window.location.origin}/auth/callback`
				}
			});
			if (error) throw error;
		} catch (error) {
			console.error("Chyba při přihlášení pomocí Google:", error);
		} finally {
			loading = false;
		}
	}

	$: console.log("form:", form);

	const { generalSettings } = data;
</script>

<svelte:head>
	<title>{generalSettings.shopName} - Vytvoření nového účtu</title>
	<meta name="description" content="Registrace nového účtu" />
</svelte:head>

<section>
	<div class="footer_fix">
		<div class="flex flex-col max-w-md px-4 pb-2 mx-auto bg-white rounded-lg shadow pt-10 sm:px-6 md:px-8 lg:px-10 border border-gray-300 mt-20">
			<div class="self-center mb-2 text-3xl font-light text-gray-800 sm:text-2xl">
				Vytvoření nového účtu
			</div>
			<span class="justify-center text-sm text-center text-gray-500 flex-items-center">
       Máte již účet?
       <a href="/login" class="text-sm text-blue-500 underline hover:text-blue-700">
         Přihlášení
       </a>
     </span>

			<div class="mt-8">
				<form
					method="POST"
					action="?/signUp"
					use:enhance={handleSubmit}
					class="space-y-4"
				>
					<!-- Email input -->
					<div class="flex flex-col">
						<div class="relative flex">
             <span class="inline-flex items-center px-3 text-sm text-gray-500 bg-white border-t border-b border-l border-gray-300 shadow-sm rounded-l-md">
               <svg width="15" height="15" fill="currentColor" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg">
                 <path d="M1792 710v794q0 66-47 113t-113 47h-1472q-66 0-113-47t-47-113v-794q44 49 101 87 362 246 497 345 57 42 92.5 65.5t94.5 48 110 24.5h2q51 0 110-24.5t94.5-48 92.5-65.5q170-123 498-345 57-39 100-87zm0-294q0 79-49 151t-122 123q-376 261-468 325-10 7-42.5 30.5t-54 38-52 32.5-57.5 27-50 9h-2q-23 0-50-9t-57.5-27-52-32.5-54-38-42.5-30.5q-91-64-262-182.5t-205-142.5q-62-42-117-115.5t-55-136.5q0-78 41.5-130t118.5-52h1472q65 0 112.5 47t47.5 113z" />
               </svg>
             </span>
							<input
								value={form?.email ?? ""}
								type="email"
								id="email"
								name="email"
								class="w-full px-4 py-2 text-base bg-white border border-gray-300 rounded-lg shadow-sm appearance-none text-gray-700 focus:outline-none focus:border-green-600"
								placeholder="Email"
								required
							/>
						</div>
					</div>

					<!-- Password input -->
					<div class="flex flex-col">
						<div class="relative flex">
             <span class="inline-flex items-center px-3 text-sm text-gray-500 bg-white border-t border-b border-l border-gray-300 shadow-sm rounded-l-md">
               <svg width="15" height="15" fill="currentColor" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg">
                 <path d="M1376 768q40 0 68 28t28 68v576q0 40-28 68t-68 28h-960q-40 0-68-28t-28-68v-576q0-40 28-68t68-28h32v-320q0-185 131.5-316.5t316.5-131.5 316.5 131.5 131.5 316.5q0 26-19 45t-45 19h-64q-26 0-45-19t-19-45q0-106-75-181t-181-75-181 75-75 181v320h736z" />
               </svg>
             </span>
							<input
								value={form?.password ?? ""}
								type="password"
								id="password"
								name="password"
								class="w-full px-4 py-2 text-base bg-white border border-gray-300 rounded-lg shadow-sm appearance-none text-gray-700 focus:outline-none focus:border-green-600"
								placeholder="Heslo (min 8 znaků)"
								minlength="8"
								required
							/>
						</div>
					</div>

					<!-- Password confirmation -->
					<div class="flex flex-col">
						<div class="relative flex">
             <span class="inline-flex items-center px-3 text-sm text-gray-500 bg-white border-t border-b border-l border-gray-300 shadow-sm rounded-l-md">
               <svg width="15" height="15" fill="currentColor" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg">
                 <path d="M1376 768q40 0 68 28t28 68v576q0 40-28 68t-68 28h-960q-40 0-68-28t-28-68v-576q0-40 28-68t68-28h32v-320q0-185 131.5-316.5t316.5-131.5 316.5 131.5 131.5 316.5q0 26-19 45t-45 19h-64q-26 0-45-19t-19-45q0-106-75-181t-181-75-181 75-75 181v320h736z" />
               </svg>
             </span>
							<input
								value={form?.repassword ?? ""}
								type="password"
								id="repassword"
								name="repassword"
								class="w-full px-4 py-2 text-base bg-white border border-gray-300 rounded-lg shadow-sm appearance-none text-gray-700 focus:outline-none focus:border-green-600"
								placeholder="Potvrzení hesla"
								minlength="8"
								required
							/>
						</div>
					</div>
					<div class="my-8 py-4 h-24">
						<label class="flex items-center">
							<input
								type="checkbox"
								bind:checked={agreedToTerms}
								class="mr-2 rounded text-green-800 focus:ring-green-800"
							/>
							<span class="text-sm text-gray-700 text-base hover:underline"><a href="/obchodni-podminky">Souhlas s obchodními podmínkami</a></span>
						</label>
						{#if !agreedToTerms}
							<p class="mt-1 text-xs text-red-600 text-base font-semibold ">
								Pro dokončení registrace je nutné souhlasit s obchodními podmínkami
							</p>
						{/if}
					</div>

					<!-- Submit button -->
					<div class="flex w-full my-4">
						<button
							type="submit"
							class="w-full px-4 py-2 text-base font-semibold text-center text-white transition duration-200 ease-in-out transform bg-green-800 rounded-lg shadow-md hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
							disabled={loading || !agreedToTerms}
						>
						{#if loading}
			<span class="inline-flex items-center justify-center">
				<svg class="w-4 h-4 mr-2 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
					<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
					<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
				</svg>
				Probíhá registrace...
			</span>
						{:else}
							Registrovat
						{/if}
						</button>
					</div>

					<!-- Form messages -->
					{#if form}
						<div
							class="flex w-full p-2 my-4 border rounded-lg"
							class:bg-red-50={form.error}
							class:bg-green-50={!form.error}
						>
							<p
								class:text-red-700={form.error}
								class:text-green-700={!form.error}
							>
								{form.message}
							</p>
						</div>
					{/if}
				</form>
			</div>
		</div>

		<!-- Google auth -->
		<!--<div class="form-widget">
			<div class="flex max-w-md gap-2 px-4 py-8 mx-auto bg-white rounded-lg shadow flex-col-2 sm:px-6 md:px-8 lg:px-10 border border-gray-300">
				<button
					on:click={signInWithGoogle}
					disabled={loading}
					class="px-4 py-2 text-base font-semibold text-center transition duration-200 ease-in rounded-lg shadow-md hover:bg-gray-600"
				>
					<img src="/google.svg" alt="Přihlásit přes Google" width="40" height="40" />
				</button>
				&lt;!&ndash;<button
					on:click={signInWithFacebook}
					disabled={loading}
					class="px-4 py-2 text-base font-semibold text-center transition duration-200 ease-in rounded-lg shadow-md hover:bg-gray-600"
				>
					<img src="/facebook.svg" alt="Přihlásit přes Facebook" width="40" height="40" />
				</button>&ndash;&gt;
			</div>
		</div>-->

		</div>
</section>