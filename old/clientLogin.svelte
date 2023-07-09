<script>
import { user, redirectURL } from '../store';
import netlifyIdentity from 'netlify-identity-widget';
import Protected from '../routes/Protected.svelte';
import { Router, Route, Link, navigate } from 'svelte-routing';
/* console.log(netlifyIdentity); */
import { Navbar, NavBrand, NavUl, NavLi, NavHamburger, Button } from 'flowbite-svelte';
import { page } from '$app/stores';

netlifyIdentity.init({
  locale: 'cs' // defaults to 'en'
});
$: isLoggedIn = !!$user
  $: username = $user !== null ? $user.username : ' there!'

  function handleUserAction(action) {
    if (action === 'login' || action === 'signup') {
      netlifyIdentity.open(action)
      netlifyIdentity.on('login', u => {
        user.login(u)
        netlifyIdentity.close()
        if ($redirectURL !== '') {
          navigate($redirectURL)
          redirectURL.clearRedirectURL()
        }
      })
    } else if (action === 'logout') {
      navigate('/')
      user.logout()
      netlifyIdentity.logout()
    }
  }

</script>

<!-- <h1>Test propisu - clientLogin</h1> --> 
<h1>Přihlášení</h1>

{#if isLoggedIn}
    <div class="center">
      <p>Hello {username}</p>
      <div>
        <button on:click={() => handleUserAction('logout')}>Odhlásit</button>
      </div>
    </div>
  {:else}
    <div class="center">
      <!-- <p>Nejste přihlášen</p> -->
      <div>
        <button on:click={() => handleUserAction('login')}>Přihlásit</button>
        <button on:click={() => handleUserAction('signup')}>Registrovat</button>
      </div>
    </div>
  {/if}

  <Router>

    <Route path="/protected" component={Protected} />

  </Router>