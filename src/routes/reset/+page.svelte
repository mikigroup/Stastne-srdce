<script>
  import { user } from "../Stores/stores";  
  import { supabaseClient } from "$lib/supabaseClient";
  
let newPassword = '';
  let message = '';
  let loading = false;
  let messageSuc = '';
  let messageFalse = '';
  let error = '';

  async function reset() {
    if (!newPassword) {
      message = 'Zadejte heslo';
      return;
    }

    loading = true;

    try {
      const { error } = await supabaseClient.auth.updateUser({ password: newPassword });
      if (error) {
        throw error;
      }

      messageSuc = 'Heslo změněno.';
    } catch (error) {
      messageFalse = error.error_description || error.message;
    } finally {
      loading = false;
    }
  }

  /**
 * Step 2: Once the user is redirected back to your application,
 * ask the user to reset their password.
 
useEffect(() => {
  supabase.auth.onAuthStateChange(async (event, session) => {
    if (event == "PASSWORD_RECOVERY") {
      const newPassword = prompt("What would you like your new password to be?");
      const { data, error } = await supabase.auth.update({
        password: newPassword,
      })

      if (data) alert("Password updated successfully!")
      if (error) alert("There was an error updating your password.")
    }
  })
}, [])
*/


 supabaseClient.auth.onAuthStateChange((state, session) => {
    user.set(state === "PASSWORD_RECOVERY" && session.user);
  });

  /* let error, newPassword;
  let loading = false;
  let message = '';  // { success: null, display: "" };

  const reset = async () => {
    if ((newPassword == null)) {
      message = {
        success: false,
        display: "Zadejte heslo",
      };
      return;
    }

    try {

      loading = true;
      const { user, error } = await supabase.auth.update({ password: newPassword });

      console.log(error);
      if (error) throw error;
      message = {
        success: true,
        display: "Heslo změněno.",
      };
    } catch (error) {
      console.log(error);
      let errorMsg = error.error_description || error.message;
      message = { success: false, display: errorMsg };
    } finally {
      loading = false;
    }
  };  */

 /*  let error, newPassword = '', messageSuc, messageFalse,  message = '', loading = false;
    async function reset() {      
    const { user, data, error } = await supabase.auth.update({ password: newPassword });
     
    if (error) throw error
      message = 'Nepodařilo se změnit heslo.'
  else
      message = 'Heslo změněno'
      loading = false
       if (data) throw data
        message = 'Nepodařilo se změnit heslo.'        
    return       
    }	 

    if (error) 
      message = 'Nepodařilo se změnit heslo'
    else
      message = 'Heslo změněno'
      loading = false
    return
    }	

 */
/* 
   let error = '', message = '', loading = false, accessToken= '', password = '';

    async function reset() {
    error = '';
    message = '';
    password = '';
    loading = true;

    const { error: err } = supabase.auth.update({password: '',})
    const { error: err } = await supabase.auth.api.resetPasswordForEmail(email) 
    if (err)
      error = 'Něco je špatně...'
    else
      message = 'Nastaveno'
    loading = false
    };*/
</script>

<svelte:head>
  <title>Šťastné srdce - Reset hesla</title>
  <meta name="description" content="Reset" />
</svelte:head>
<section class="footer_fix2">
  <form on:submit|preventDefault={reset}>
    <div class="pt-20 form-widget">
      <div
        class="flex flex-col w-full max-w-md px-4 py-8 mx-auto mt-20 bg-white rounded-lg shadow sm:px-6 md:px-8 lg:px-10"
      >
        <div
          class="self-center mb-4 text-3xl font-light text-gray-800 sm:text-2xl"
        >
          Nové heslo
        </div>
        <div class="flex w-full text-xl">
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
                d="M1792 710v794q0 66-47 113t-113 47h-1472q-66 0-113-47t-47-113v-794q44 49 101 87 362 246 497 345 57 42 92.5 65.5t94.5 48 110 24.5h2q51 0 110-24.5t94.5-48 92.5-65.5q170-123 498-345 57-39 100-87zm0-294q0 79-49 151t-122 123q-376 261-468 325-10 7-42.5 30.5t-54 38-52 32.5-57.5 27-50 9h-2q-23 0-50-9t-57.5-27-52-32.5-54-38-42.5-30.5q-91-64-262-182.5t-205-142.5q-62-42-117-115.5t-55-136.5q0-78 41.5-130t118.5-52h1472q65 0 112.5 47t47.5 113z"
              />
            </svg>
          </span>
          <input
            class="flex-1 w-full px-4 py-2 text-base text-gray-700 placeholder-gray-400 bg-white border border-gray-300 rounded-r-lg shadow-sm appearance-none form-control focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
            name="password"
            type="password"
            label="Heslo"
            placeholder="Zadej svoje nové heslo"
            icon="password"
            bind:value={newPassword}
            minlength="6"
            required
          />
        </div>
        <div class="flex w-full my-4">
          <button
            {loading}
            id="btn-success"
            type="submit"
            class="w-full px-4 py-2 text-base font-semibold text-center text-white transition duration-200 ease-in bg-green-600 rounded-lg shadow-md btn btn-success hover:bg-green-700 focus:ring-green-500 focus:ring-offset-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
          >
            Nastavit heslo
          </button>
        </div>
         {#if messageFalse}
                <div class="flex w-full p-2 my-4 border rounded-lg">
                <p>{messageFalse}</p>
                </div>
                {/if}
                {#if messageSuc}
                <div class="flex w-full p-2 my-4 border rounded-lg">
                <p>{messageSuc}</p>
                </div>
              {/if}
               {#if message}
                <div class="flex w-full p-2 my-4 border rounded-lg">
                <p>{message}</p>
                </div>
              {/if}  
               {#if error}
                <div class="flex w-full p-2 my-4 border rounded-lg">
                <p>{error}</p>
                </div>
              {/if} 
      </div>
    </div>
  </form>
</section>
