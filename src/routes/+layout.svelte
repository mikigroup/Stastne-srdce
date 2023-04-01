<script>
	import Header from '$lib/Header.svelte';	
	import '../app.css';
	import { supabase } from "../lib/initSupabase";
	import { user } from './Stores/stores';
	// user.set(supabase.auth.user())
	// export let data;

	//V2
export function getData() {
  return async (dispatch) => {
    try {
     const {
				data: { session },
			} = await supabase.auth.getSession()
			const { user } = session
    	} catch(err) {
      console.log('error: ', err)
    }
  }
}

import { page } from '$app/stores';
	import { time } from '../routes/Stores/stores';
	import CartItemsStore from '../routes/Stores/stores';
	
	let src = '/android-chrome-192x192.png';

	const formatter = new Intl.DateTimeFormat('en', {
		hour12: false,
		hour: 'numeric',
		minute: '2-digit'
	});

	// const session = supabase.auth.session();
/* 	$: isLoggedIn = !supabase.auth.user;
	$: usertest = supabase.auth.user;
	$: username = $user !== null ? $user.username : ' there!'; */

	supabase.auth.onAuthStateChange((state, session) => {
		user.set(state === 'SIGNED_IN' && session);
	});

	async function logOut() {
		try {
			loading = true;
			let { error } = await supabase.auth.signOut();
			if (error) throw error;			
		} catch (error) {
			message = { success: false, display: error.message };
		} finally {
			loading = false;
			window.location = '/';
		}
	}

	let loading = false;
	let message = { success: null, display: '' };

	function toggleMenu() {
		var menuBox = document.getElementById('menu-box');
		if (menuBox.style.display == 'block') {
			// if is menuBox displayed, hide it
			menuBox.style.display = 'none';
		} else {
			// if is menuBox hidden, display it
			menuBox.style.display = 'block';
		}
	}

	$: totalPieces =
		$CartItemsStore.length &&
		$CartItemsStore.reduce((sum, cartItems) => sum + cartItems.quantity, 0);
</script>

<Header />

<div class="mt-10 pt-5"  ></div>
<slot class="mt-10" />
	
<footer class="">
  <div class="grid md:grid-cols-5 text-gray-500 mt-40 p-4 border-2 md:mx-4 rounded-lg">    
    <div class="text-sm grid col-span-2">
<p>Copyright © 2022 Šťastné srdce Všechny práva vyhrazena.</p>     
    </div>    
    <div class="grid col-span-3 text-sm justify-end">
      <a class="items-center mt-3 text-sm sm:mt-0" target="_blank" href="https://www.mikigroup.cz/">With <i class="fa fa-regular fa-hand-spock"></i> by Mikigroup™ ver_1.1</a>            
  </div>
</footer>
	

<style>
	/* main {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 1rem;
		width: 100%;
		max-width: 1024px;
		margin: 0 auto;
		box-sizing: border-box;
	}

	footer {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 40px;
	}

	footer a {
		font-weight: bold;
	}

	@media (min-width: 480px) {
		footer {
			padding: 40px 0;
		}
	} */
</style>
