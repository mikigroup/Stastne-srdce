<script lang="ts">
	import { page } from "$app/stores";
	import { fade } from "svelte/transition";
	import type { Actions } from "@sveltejs/kit";
	export let form: Actions;
	export let data;
	let { session, supabase, user } = data;
	$: ({ session, supabase, user } = data);

	let email = "@";
	let loading = false;
	let message = { success: "", display: "" };

	/* const handleSignup = async () => {
		if (password != confirmpassword) {
			message = {
				success: '',
				display: 'Heslo a potvrzovací heslo není stejné, zadejte je prosím znovu'
			};
			return;
		}

		try {
			loading = true;
			const { error } = await supabase.auth.signUp({ email, password });
			console.log(error);
			if (error) throw error;
			message = {
				success: true,
				display:
					'Na Vaši emailovou schránku byla odeslána zpráva. Prosím potvrďte ji a následně se přihlašte.'
			};
		} catch (error) {
			console.log(error);
			let errorMsg = error.error_description || error.message;
			message = { success: false, display: errorMsg };
		} finally {
			loading = false;
		}
	}; */

	/* 
 async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  })
} */
</script>

<svelte:head>
	<title>Šťastné srdce - Vytvoření nového účtu</title>
	<meta name="description" content="SingUp" />
</svelte:head>
<section>
	<!-- <form method="POST" action="?/signUp" class="pt-20">
	<label>
		Email
		<input name="email" type="email" />
	</label>
	<label>
		Password
		<input name="password" type="password" />
	</label>	
	<button formaction="?/signup">Sign up</button>
</form> -->

	<div class="pt-20 footer_fix">
		<div
			class="flex flex-col max-w-md px-4 pb-2 mx-auto mt-20 bg-white rounded-lg shadow pt-7 sm:px-6 md:px-8 lg:px-10">
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
								class="w-full px-4 py-2 text-base bg-white border border-gray-300 rounded-lg shadow-sm appearance-none text-gray-aceholder-gray-400 focus:outline-none focus:border-green-600"
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
								class="w-full px-4 py-2 text-base bg-white border border-gray-300 rounded-lg shadow-sm appearance-none text-gray-aceholder-gray-400 focus:outline-none focus:border-green-600"
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
								type="repassword"
								id="repassword"
								class="w-full px-4 py-2 text-base bg-white border border-gray-300 rounded-lg shadow-sm appearance-none text-gray-aceholder-gray-400 focus:outline-none focus:border-green-600"
								name="potvrzenihesla"
								placeholder="Potvrzení hesla (napiš stejné heslo)"
								minlength="6"
								required />
						</div>
					</div>
					<div class="flex w-full my-4">
						<button
							type="submit"
							class="w-full px-4 py-2 text-base font-semibold text-center text-white transition duration-200 ease-in-out transform bg-green-800 rounded-lg shadow-md hover:scale-105">
							Registrace
						</button>
					</div>
					{#if message.success != null}
						<div
							class="alert {message.success ? 'alert-success' : 'alert-danger'}"
							role="alert">
							{message.display}
						</div>
					{/if}
				</form>
			</div>
		</div>
		<!-- <div class="form-widget">
					<div
						class="flex max-w-md gap-2 px-4 py-8 mx-auto bg-white rounded-lg shadow flex-col-2 sm:px-6 md:px-8 lg:px-10">
						<form on:submit|preventDefault={signInWithGoogle}>
							<div class="">
								<button
									value={loading ? 'Loading' : 'Log in with Google'}
									disabled={loading}
									id="btn-success"
									type="submit"
									class="px-4 py-2 text-base font-semibold text-center transition duration-200 ease-in rounded-lg shadow-md btn btn-success hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2">
									<img src="/google.svg" alt="" width="40" height="40" />
								</button>
							</div>
						</form>
					</div>
				</div> -->
	</div>
</section>
