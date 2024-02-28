<script>  
  import { page } from "$app/stores";
	
  export let data;

	let { session, supabase } = data
	$: ({ session, supabase } = data)
  let loading = false;
	let email = [];
  let password = [];
	let message = { success: null, display: '' };
 
  const handleLogin = async () => {
		try {
			loading = true;
			const { data, error } = await supabase.auth.signInWithPassword({ email, password });
			if (error) throw error;
			message = { success: true, display: 'Úspěšně zalogován' };
			window.location = '/jidelnicek';
		} catch (error) {
			let errorMsg = error.error_description || error.message;
			message = { success: false, display: errorMsg };
		} finally {
			loading = false;
		}
	};


/*   let loading = false
	let email: string

	const handleLogin = async () => {
		try {
			loading = true
			const { error } = await supabaseClient.auth.signInWithOtp({ email })
			if (error) throw error
			alert('Check your email for the login link!')
		} catch (error) {
			if (error instanceof Error) {
				alert(error.message)
			}
		} finally {
			loading = false
		}
	} */

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
}


/* 
  async function signInWithFacebook() {
    const { user, data, error } = await supabase.auth.signIn({
      provider: "facebook",
    });
  }  */
  
</script>

<svelte:head>
  <title>Šťastné srdce - Login</title>
  <meta name="description" content="Login" />
</svelte:head>

<section class="footer_fix">
  <div class="">
    <form on:submit|preventDefault={handleLogin}>
      <div class="pt-20 form-widget">
        <div
          class="flex flex-col w-full max-w-md px-4 py-8 mx-auto mt-20 bg-white rounded-lg shadow sm:px-6 md:px-8 lg:px-10"
        >
          {#if $page.data.session}
            <div class="flex w-full text-xl">
              <p>Jste přihlášeni.</p>
            </div>
          {:else}
            <div class="self-center mb-2 text-3xl font-light sm:text-2xl">
              Přihlášení do účtu
            </div>
            <span
              class="justify-center text-sm text-center text-gray-500 flex-items-center "
            >
              Ještě nemáte účet?
              <a
                href="/signup"
                class="text-sm text-blue-500 underline hover:text-blue-700"
              >
                Přidej se
              </a>
            </span>
            <div class="mt-8">
              <!--  <form action="#" autoComplete="on"> -->
              <div class="flex flex-col mb-2">
                <div class="relative flex ">
                  <span
                    class="inline-flex items-center px-3 text-sm text-gray-500 bg-white border-t border-b border-l border-gray-300 shadow-sm rounded-l-md"
                  >
                    <svg
                      width="15"
                      height="15"
                      fill="currentColor"
                      viewBox="0 0 1792 1792"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M1792 710v794q0 66-47 113t-113 47h-1472q-66 0-113-47t-47-113v-794q44 49
												101 87 362 246 497 345 57 42 92.5 65.5t94.5 48 110 24.5h2q51 0
												110-24.5t94.5-48 92.5-65.5q170-123 498-345 57-39 100-87zm0-294q0 79-49
												151t-122 123q-376 261-468 325-10 7-42.5 30.5t-54 38-52 32.5-57.5 27-50
												9h-2q-23
												0-50-9t-57.5-27-52-32.5-54-38-42.5-30.5q-91-64-262-182.5t-205-142.5q-62-42-117-115.5t-55-136.5q0-78
												41.5-130t118.5-52h1472q65 0 112.5 47t47.5 113z"
                      />
                    </svg>
                  </span>
                  <input
                    bind:value={email}
                    type="email"
                    id="email"                    
                    class="flex-1 w-full px-4 py-2 text-base text-gray-700 placeholder-gray-400 bg-white border border-gray-300 rounded-r-lg shadow-sm appearance-none focus:outline-none focus:border-green-600"
                    required
                    placeholder="Email"
                  />
                </div>
              </div>
              <div class="flex flex-col mb-6">
                <div class="relative flex ">
                  <span
                    class="inline-flex items-center px-3 text-sm text-gray-500 bg-white border-t border-b border-l border-gray-300 shadow-sm rounded-l-md"
                  >
                    <svg
                      width="15"
                      height="15"
                      fill="currentColor"
                      viewBox="0 0 1792 1792"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M1376 768q40 0 68 28t28 68v576q0 40-28 68t-68 28h-960q-40
												0-68-28t-28-68v-576q0-40 28-68t68-28h32v-320q0-185 131.5-316.5t316.5-131.5
												316.5 131.5 131.5 316.5q0 26-19 45t-45 19h-64q-26
												0-45-19t-19-45q0-106-75-181t-181-75-181 75-75 181v320h736z"
                      />
                    </svg>
                  </span>
                  <input
                    bind:value={password}
                    type="password"
                    id="password"
                    class="flex-1 w-full px-4 py-2 text-base text-gray-700 placeholder-gray-400 bg-white border border-gray-300 rounded-r-lg shadow-sm appearance-none focus:outline-none focus:border-green-600"
                    required
                    placeholder="Heslo"
                  />
                </div>
              </div>
              <div class="flex items-center mb-6 -mt-4">
                <div class="flex ml-auto">
                  <a
                    href="/forgot"
                    class="inline-flex text-xs font-thin text-gray-500 sm:text-sm hover:text-gray-700 "
                  >
                    Zapoměli jste heslo?
                  </a>
                </div>
              </div>

              <div class="flex w-full">
                <button
                  value={loading ? "Loading" : "Log in"}
                  disabled={loading}
                  id="btn-success"
                  type="submit"
                  class="w-full px-4 py-2 text-base font-semibold text-center text-white transition duration-200 ease-in bg-green-600 rounded-lg shadow-md btn btn-success hover:bg-green-700 focus:ring-green-500 focus:ring-offset-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
                >
                  Přihlásit se
                </button>
              </div>
              
              <div />
            </div>
          {/if}
        </div>
				{#if ! $page.data.session}
        <div class="form-widget">
          <div
            class="flex max-w-md gap-2 px-4 py-8 mx-auto bg-white rounded-lg shadow flex-col-2 sm:px-6 md:px-8 lg:px-10"
          >
            <div class="">
              <button
                on:click={() => {
                  signInWithGoogle();
                }}
                value={loading ? "Loading" : "Log in with Google"}
                disabled={loading}
                id="btn-success"
                type="submit"
                class="px-4 py-2 text-base font-semibold text-center transition duration-200 ease-in rounded-lg shadow-md btn btn-success hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2"
              >
                <img src="/google.svg" alt="" width="40" height="40" />
              </button>
            </div>
						
          </div>
				
        </div>
 				{/if}

      </div>
    </form>
  </div>
</section>
