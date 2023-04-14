<script>
  import { supabaseClient, signOut, updateProfile } from "$lib/supabaseClient";
  
  /* let loading = false;
  let username: string | null = null;
  let website: string | null = null;
  onMount(() => {
    getProfile();
  });

  const getProfile = async () => {
    try {
      loading = true;

      const { user } = session;
      const { data, error, status } = await supabaseClient
        .from("profiles")
        .select(`username, website`)
        .eq("id", user.id)
        .single();
      if (data) {
        username = data.username;
        website = data.website;
        avatarUrl = data.avatar_url;
      }

      if (error && status !== 406) throw error;
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      }
    } finally {
      loading = false;
    }
  }; */

  /* 
	const session = supabase.auth.session();
	supabase.auth.onAuthStateChange((_, session) => {
		user.set(session.user);
	}); */

  /* let loading = true
  let user_name = null
  let website = null
  let avatar_url = null
  let email = $user.email;

  function getProfile(node) {
  try {
    loading = true;
    const user = supabase.auth.user();

    supabase
      .from("profiles")
      .select(`user_name, website, avatar_url`)
      .eq("id", user?.id)
      .single()
      .then(({ data, error, status }) => {
        if (data) {
          user_name = data.user_name;
          website = data.website;
          avatar_url = data.avatar_url;
        }
        if (error && status !== 406) throw error;
      });
    } catch (error) {
      alert(error.message);
    } finally {
      loading = false;
    }
  } */

  
  let loading = true;
  let first_name = null;
  let avatar_url = null;
  let avatar = null;
  let last_name = null;
  let telephone = null;
  let company_name = null;
  let street = null;
  let street_number = null;
  let city = null;
  let ico = null;
  let dic = null;
  let company = null;
  
  async function getProfile() {
    try {
      loading = true;
      /* const user = supabaseClient.auth.user(); */

      let { data, error, status } = await supabaseClient
        .from("profile")
        .select(
          `first_name, last_name, telephone, company_name, street, street_number, city, ico, dic, company`
        )
        .eq("id", $session.id)
        .single();

      if (error && status !== 406) throw error;

      if (data) {
        first_name = data.first_name;
        last_name = data.last_name;
        telephone = data.telephone;
        company_name = data.company_name;
        street = data.street;
        street_number = data.street_number;
        ico = data.ico;
        dic = data.dic;
        company = data.company;
        city = data.city;
      }
    } catch (error) {
      alert(error.message);
    } finally {
      loading = false;
    }
  } 
</script>

 <svelte:head>
  <title>Šťastné srdce - Účet</title>
  <meta name="description" content="Účet" />
</svelte:head>
<section
  class="max-w-screen-lg px-4 py-8 py-16 mx-auto mt-4 rounded-lg form bg-slate-100"
>
  <div class="max-w-screen-md px-4 py-8 py-16 mx-auto rounded-lg bg-slate-100">
    <h1
      class="mb-4 mb-10 text-4xl font-extrabold tracking-tight text-center text-gray-900 dark:text-white"
    >
      Profil účtu
    </h1>
    {$session.user_metadata.avatar_url}
    {#if $session}
      <h1>Vítej do Admin prostředí!</h1>
      <h4>Relace "$session store" pracuje mezi stránky.</h4>
      <h4>Vaše id je: {$session.id}</h4>
    {/if}

    <form
      use:getProfile
      class="form-widget"
      on:submit|preventDefault={updateProfile}
    >
      <div class="p-5 bg-white border-2 rounded-lg">
        <div
          class="mb-8 text-xl font-light text-center text-gray-500 lg:mb-16 dark:text-gray-400 md:text-lg"
        >
          <div class="my-2">
            <div class="flex flex-col items-center md:flex-row">
              <div class="flex justify-start basis-1/2">
                <label class="pr-2" for="email">Email / uživatel</label>
              </div>
              <div class="w-full basis-1/2">
                <input
                  value="{$session.email}"
                  disabled
                  type="email"
                  id="email"
                  class="w-full px-4 py-2 text-base text-center text-gray-700 placeholder-gray-400 border border-gray-300 rounded-lg shadow-sm appearance-none form-control bg-slate-200 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                  required
                  placeholder="Email"
                />                
              </div>
            </div>
            <hr class="w-32" />
            <div class="my-2">
              <div class="flex flex-col items-center md:flex-row">
                <div class="flex justify-start basis-1/2">
                  <label class="pr-2" for="first_name">Jméno</label>
                </div>
                <div class="w-full basis-1/2">
                  <input
                    bind:value={$session.first_name}
                    type="first_name"
                    id="first_name"
                    class="w-full px-4 py-2 text-base text-center text-gray-700 placeholder-gray-400 bg-white border border-gray-300 rounded-lg shadow-sm appearance-none form-control focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                    required
                    placeholder="Jméno"
                  />
                </div>
              </div>
              <hr class="w-32" />
            </div>
            <div class="my-2">
              <div class="flex flex-col items-center md:flex-row">
                <div class="flex justify-start basis-1/2">
                  <label class="pr-2" for="first_name">Příjmení</label>
                </div>
                <div class="w-full basis-1/2">
                  <input
                    bind:value={$session.last_name}
                    type="last_name"
                    id="last_name"
                    class="w-full px-4 py-2 text-base text-center text-gray-700 placeholder-gray-400 bg-white border border-gray-300 rounded-lg shadow-sm appearance-none form-control focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                    required
                    placeholder="Příjmení"
                  />
                </div>
              </div>
              <hr class="w-32" />
            </div>
            <div class="my-2">
              <div class="flex flex-col items-center md:flex-row">
                <div class="flex justify-start basis-1/2">
                  <label class="pr-2" for="telephone">Telefon</label>
                </div>
                <div class="w-full basis-1/2">
                  <input
                    bind:value={$session.telephone}
                    type="telephone"
                    id="telephone"
                    class="w-full px-4 py-2 text-base text-center text-gray-700 placeholder-gray-400 bg-white border border-gray-300 rounded-lg shadow-sm appearance-none form-control focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                    required
                    placeholder="Telefon"
                  />
                </div>
              </div>
              <hr class="w-32" />
            </div>
            <div class="flex flex-col my-2">
              <!-- <div class="flex flex-col items-center md:flex-row">
                <div class="flex justify-start basis-1/2">
                  <label class="pr-2" for="company_name">Název firmy</label>
                </div>
                <div class="w-full basis-1/2">
                  <input
                    bind:value={$session.company_name}
                    type="company_name"
                    id="company_name"
                    class="w-full px-4 py-2 text-base text-center text-gray-700 placeholder-gray-400 bg-white border border-gray-300 rounded-lg shadow-sm appearance-none form-control focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                    required
                    placeholder="Název firmy"
                  />
                </div>
              </div> 
              <hr class="w-32" />
            </div>-->
            <div class="my-2">
              <div class="flex flex-col items-center md:flex-row">
                <div class="flex justify-start basis-1/2">
                  <label class="pr-2" for="street">Ulice</label>
                </div>
                <div class="w-full basis-1/2">
                  <input
                    bind:value={$session.street}
                    type="street"
                    id="street"
                    class="w-full px-4 py-2 text-base text-center text-gray-700 placeholder-gray-400 bg-white border border-gray-300 rounded-lg shadow-sm appearance-none form-control focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                    required
                    placeholder="Ulice"
                  />
                </div>
              </div>
              <hr class="w-32" />
            </div>
            <div class="my-2">
              <div class="flex flex-col items-center md:flex-row">
                <div class="flex justify-start basis-1/2">
                  <label class="pr-2" for="street_number">Číslo popisné</label>
                </div>
                <div class="w-full basis-1/2">
                  <input
                    bind:value={$session.street_number}
                    type="street_number"
                    id="street_number"
                    class="w-full px-4 py-2 text-base text-center text-gray-700 placeholder-gray-400 bg-white border border-gray-300 rounded-lg shadow-sm appearance-none form-control focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                    required
                    placeholder="Číslo popisné"
                  />
                </div>
              </div>
              <hr class="w-32" />
            </div>
            <div class="my-2">
              <div class="flex flex-col items-center md:flex-row">
                <div class="flex justify-start basis-1/2">
                  <label class="pr-2" for="city">Město</label>
                </div>
                <div class="w-full basis-1/2">
                  <input
                    bind:value={$session.city}
                    type="city"
                    id="city"
                    class="form-control
                  </div>
                   rounded-lg text-center appearance-none border border-gray-300 w-full py-2 px-4
                    bg-white text-gray-700 placeholder-gray-400 shadow-sm text-base
                     focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                    required
                    placeholder="Město"
                  />
                </div>
              </div>
              <hr class="w-32" />
 	<!-- {#if message.success != null}
				<div
					class="alert {message.success ? 'alert-success' : 'alert-danger'}"
					role="alert"
				>
					{message.display}
				</div>
			{/if}  -->
   </div>
            <div class="my-2">
              <div class="flex flex-col items-center md:flex-row">
                <div class="flex justify-start basis-1/2">
                  <label class="pr-2" for="ico">IČO</label>
                </div>
                <div class="w-full basis-1/2">
                  <input
                    bind:value={$session.ico}
                    type="ico"
                    id="ico"
                    class="w-full px-4 py-2 text-base text-center text-gray-700 placeholder-gray-400 bg-white border border-gray-300 rounded-lg shadow-sm appearance-none form-control focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                    placeholder="IČO"
                  />
                </div>
              </div>
              <hr class="w-32" />
            </div>
            <div class="my-2">
              <div class="flex flex-col items-center md:flex-row">
                <div class="flex justify-start basis-1/2">
                  <label class="pr-2" for="dic">DIČ</label>
                </div>
                <div class="w-full basis-1/2">
                  <input
                    bind:value={$session.dic}
                    type="dic"
                    id="dic"
                    class="w-full px-4 py-2 text-base text-center text-gray-700 placeholder-gray-400 bg-white border border-gray-300 rounded-lg shadow-sm appearance-none form-control focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                    placeholder="DIČ"
                  />
                </div>
              </div>
              <hr class="w-32" />
            </div>
            <div class="my-2">
              <div class="flex flex-col items-center md:flex-row">
                <div class="flex justify-start basis-1/2">
                  <label class="pr-2" for="company">Firma</label>
                </div>
                <div class="w-full basis-1/2">
                  <input
                    bind:value={$session.company}
                    type="company"
                    id="company"
                    class="w-full px-4 py-2 text-base text-center text-gray-700 placeholder-gray-400 bg-white border border-gray-300 rounded-lg shadow-sm appearance-none form-control focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                    placeholder="Firma"
                  />
                </div>
              </div>
              <hr class="w-32" />
            </div>
          </div>
          <div class="mt-10">
            <button
              class="px-4 py-2 text-base font-semibold text-center text-white transition duration-200 ease-in bg-green-600 rounded-lg shadow-md btn btn-success hover:bg-green-700 focus:ring-green-500 focus:ring-offset-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
            >
              <input
                type="submit"
                class="block button primary"
                value={loading ? "Nahrává se..." : "Update profilu"}
                disabled={loading}
              />
            </button>
          </div>
        </div>
      </div>
    </form>
  </div>
</section> 
<!-- <form class="form-widget" on:submit|preventDefault={updateProfile}>
  <div>
    <label for="email">Email</label>

    <input id="email" type="text" value={session.user.email} disabled />
  </div>

  <div>
    <label for="username">Name</label>

    <input id="username" type="text" bind:value={username} />
  </div>

  <div>
    <label for="website">Website</label>

    <input id="website" type="website" bind:value={website} />
  </div>

  <div>
    <input
      type="submit"
      class="block button primary"
      value={loading ? "Loading..." : "Update"}
      disabled={loading}
    />
  </div>

  <div>
    <button class="block button" on:click={signOut} disabled={loading}
      >Sign Out</button
    >
  </div>
</form> -->
