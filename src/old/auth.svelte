<!-- <script>
    import { supabase } from './supabaseClient'
  
    let loading = false
    let email
  
    const handleLogin = async () => {
      try {
        loading = true
        const { error } = await supabase.auth.signIn({ email })
        if (error) throw error
        alert('Check your email for the login link!')
      } catch (error) {
        alert(error.error_description || error.message)
      } finally {
        loading = false
      }
    }
  </script> -->
  
<!--   <form class="row flex-center flex" on:submit|preventDefault="{handleLogin}">
    <div class="col-6 form-widget">
      <h1 class="header">Supabase + Svelte</h1>
      <p class="description">Sign in via magic link with your email below</p>
      <div>
        <input
          class="inputField"
          type="email"
          placeholder="Your email"
          bind:value="{email}"
        />
      </div>
      <div>
        <input type="submit" class='button block' value={loading ? "Loading" :
        "Send magic link"} disabled={loading} />
      </div>
    </div>
  </form> -->

  <!-- <script>
    import { supabase } from "./supabaseClient";
  
    let loading = false;
    let email, password, confirmpassword;
    let message = { success: null, display: "" };
  
    const handleSignup = async () => {
  
      if (password != confirmpassword) {
        message = { success: false, display: "Password and Confirm Password fields do not match" };
        return;
      }
  
      try {
        loading = true;
        const { error } = await supabase.auth.signUp({ email, password });
        console.log(error);
        if (error) throw error;
        message = { success: true, display: "We have sent you an confirmation email. Please check your email" };
      } catch (error) {
        console.log(error);
        let errorMsg = error.error_description || error.message;
        message = { success: false, display: errorMsg };
      } finally {
        loading = false;
      }
    };
  </script>


<form on:submit|preventDefault={handleSignup}>
	<div class="">
		<h1 class=""></h1>
		<p class="description">Vytvoření hesla</p>
		<div class="form-group">
			<label for="email">Emailová adresa</label>
			<input
				id='email' class="form-control" type="email" placeholder="Your email" 
				bind:value={email}
			/>
		</div>
		<div class="form-group">
			<label for="password">Heslo</label>
			<input
				id='password' class="form-control" type="password" placeholder="Set your new password"
				bind:value={password}
			/>
		</div>
		<div class="form-group">
			<label for="confirmpassword">Potvrzení hesla</label>
			<input
				id='confirmpassword' class="form-control" type="password" placeholder="Confirm your new password"
				bind:value={confirmpassword}
			/>
		</div>
		<div>
			<input type="submit" class="btn btn-success" value={loading ? "Loading" : "Sign up"}
				disabled={loading}
			/>
		</div>

		{#if message.success != null}
			<div class="alert {message.success ? 'alert-success' : 'alert-danger'}" role="alert">
				{message.display}
			</div>
		{/if}
	</div>
</form>
 -->

<script>
	import Login from "../routes/Login.svelte";
	import Signup from "../routes/Signup.svelte";

	let currentTab = "Login";

	const changeTab = (tab) => {
		currentTab = tab;
	};
</script>

<main class="container">
	<div class="row flex flex-center">
		<div class="col-4 offset-4 mt-5">
			<div class="row">
				<div class="col tab-heading {currentTab == 'Login' ? 'tab-active': ''}" on:click={() => changeTab("Login")}>
					<span>Login</span>
				</div>
				<div class="col tab-heading {currentTab == 'Signup' ? 'tab-active': ''}" on:click={() => changeTab("Signup")}>
					<span>Create Account</span>
				</div>
			</div>
			{#if currentTab === "Login"}
				<Login />
			{:else}
				<Signup />
			{/if}
		</div>
	</div>
</main>

<style>
	.tab-heading {
		font-weight: bold;
		padding: 1rem;
		background-color: lightgray;
	}

	.tab-active {
		background: black;
		color: white;
	}
</style>