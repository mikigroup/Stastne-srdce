<script class="module">
	import { user } from './Stores/stores';
	import { supabase } from './supabaseClient';
	/*  import Profile from './Profile.svelte' */
	user.set(supabase.auth.user());

	console.log();

	supabase.auth.onAuthStateChange((state, session) => {
		user.set(state === 'SIGNED_IN' && session.user);
	});

	let email, password, confirmpassword;
	let loading = false;
	let message = { success: null, display: '' };

	const handleSignup = async () => {
		if (password != confirmpassword) {
			message = {
				success: false,
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
	};

	async function signInWithGoogle() {
		const { user, session, error } = await supabase.auth.signIn({
			provider: 'google'
		});
	}
</script>

<svelte:head>
	<title>Šťastné srdce - Vytvoření nového účtu</title>
	<meta name="description" content="SingUp" />
</svelte:head>
<section>
	<div class="pt-20 footer_fix">
		<div
			class="mt-20 flex flex-col max-w-md px-4 pt-7 pb-2 bg-white rounded-lg shadow 
			sm:px-6 md:px-8 lg:px-10 mx-auto">
			<div
				class="self-center mb-2 text-3xl sm:text-2xl font-light text-gray-800 sm:text-2xl
				">
				Vytvoření nového účtu
			</div>
			<span
				class="justify-center text-sm text-center text-gray-500 flex-items-center">
				Máte již účet?
				<a href="/login" class="text-sm text-blue-500 underline hover:text-blue-700">Přihlášení</a>
			</span>
			<div class="mt-8">
				<form on:submit|preventDefault={handleSignup}>
					<div class="flex flex-col mb-2">
						<div class="flex relative">
							<span
								class="rounded-l-md inline-flex items-center px-3 border-t bg-white border-l
								border-b border-gray-300 text-gray-500 shadow-sm text-sm">
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
								bind:value={email}
								type="email"
								id="email"
								class="form-control rounded-r-lg flex-1 appearance-none border border-gray-300
								w-full py-2 px-4 bg-white text-gray-700 placeholder-gray-400 shadow-sm text-base
								focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
								placeholder="Email"
								required
								/>
						</div>
					</div>
					<div class="flex flex-col mb-2">
						<div class="flex relative">
							<span
								class="rounded-l-md inline-flex items-center px-3 border-t bg-white border-l
								border-b border-gray-300 text-gray-500 shadow-sm text-sm">
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
								bind:value={password}
								type="password"
								id="password"
								class="form-control rounded-r-lg flex-1 appearance-none border border-gray-300
								w-full py-2 px-4 bg-white text-gray-700 placeholder-gray-400 shadow-sm text-base
								focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
								placeholder="Heslo" 
								required
								/>
						</div>
					</div>
					<div class="flex flex-col mb-2">
						<div class="flex relative">
							<span
								class="rounded-l-md inline-flex items-center px-3 border-t bg-white border-l
								border-b border-gray-300 text-gray-500 shadow-sm text-sm">
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
								bind:value={confirmpassword}
								type="password"
								id="confirmpassword"
								class="form-control rounded-r-lg flex-1 appearance-none border border-gray-300
								w-full py-2 px-4 bg-white text-gray-700 placeholder-gray-400 shadow-sm text-base
								focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
								name="potvrzenihesla"
								placeholder="Potvrzení hesla" 
								required
								/>
						</div>
					</div>
					<div class="flex w-full my-4">
						<button
							type="submit"
							class="py-2 px-4 bg-green-600 hover:bg-green-700 focus:ring-green-500
							focus:ring-offset-green-200 text-white w-full transition ease-in duration-200
							text-center text-base font-semibold hover:text-yellow shadow-md focus:outline-none
							focus:ring-2 focus:ring-offset-2 rounded-lg ">
							Registrace
						</button>

					</div>
					{#if message.success != null}
						<div class="alert {message.success ? 'alert-success' : 'alert-danger'}" role="alert">
							{message.display}
						</div>
					{/if}
				</form>
				

			</div>
		</div>
		<div class="form-widget">
					<div
						class="mx-auto flex flex-col-2 gap-2 max-w-md px-4 py-8 bg-white rounded-lg shadow
					 sm:px-6 md:px-8 lg:px-10">
						<form on:submit|preventDefault={signInWithGoogle}>
							<div class="">
								<button
									value={loading ? 'Loading' : 'Log in with Google'}
									disabled={loading}
									id="btn-success"
									type="submit"
									class="btn btn-success py-2 px-4 hover:bg-green-700 transition ease-in
									duration-200 text-center text-base font-semibold shadow-md focus:outline-none
									focus:ring-2 focus:ring-offset-2 rounded-lg">
									<img src="/google.svg" alt="" width="40" height="40" />
								</button>
							</div>
						</form>
					</div>
				</div>
	</div>

</section>
