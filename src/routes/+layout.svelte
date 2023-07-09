<script>
	import './app.css';
	import CartItemsStore from '../routes/Stores/stores';
	import { page } from '$app/stores';	
  import { supabaseClient } from "$lib/supabaseClient";
	import { readable } from 'svelte/store';
	import { invalidate } from '$app/navigation'
	import { onMount } from 'svelte'

	onMount(() => {
		const {
			data: { subscription }
		} = supabaseClient.auth.onAuthStateChange(() => {
			invalidate('supabase:auth')
		})

		return () => {
			subscription.unsubscribe()
		}
	})


	let src = '/android-chrome-192x192.png';

	const formatter = new Intl.DateTimeFormat('en', {
		hour12: false,
		hour: 'numeric',
		minute: '2-digit'
	});

	const time = readable(new Date(), function start(set) {
	const interval = setInterval(() => {
		set(new Date());
	}, 1000);

	return function stop() {
		clearInterval(interval);
	};
});

supabaseClient.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN') {		
    console.log('User signed in')
    
  } else if (event === 'SIGNED_OUT') {
    console.log('User signed out')
    
  }
})




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

	let loading = false;
	async function signOut() {
		try {
			loading = true
			let { error } = await supabaseClient.auth.signOut()
			if (error) throw error
		} catch (error) {
			if (error instanceof Error) {
				alert(error.message)
			}
		} finally {
			loading = false
		}
	}

	$: totalPieces =
		$CartItemsStore.length &&
		$CartItemsStore.reduce((sum, cartItems) => sum + cartItems.quantity, 0);
</script>

<!-- <Header /> -->
<header class="bg-white">
	<nav>
		<div class="grid grid-cols-2 px-4 m-2 mx-auto md:grid-cols-3 max-w-8xl"> <!-- gap-2  -->
			<div class="grid items-center w-full grid-cols-2 py-4 mx-4 lg:px-8 lg:mx-0">
				<div class="grid grid-cols-2 w-80">
						<h1 class="text-xl font-semibold"><a href="/">
						Šťastné srdce</a></h1>
						<img {src} alt="staste srdce" class="pt-1 animate-pulse" width="20" height="20">
				</div>				
				<!-- čas -->
				<div class="grid justify-end w-44"><time>{formatter.format($time)}</time></div>  <!-- items-center pl-12 ml-12 md:ml-5 md:pl-5 -->
			</div>
			<!-- menu -->
			<div
				class="grid items-center hidden grid-cols-4 tracking-wide text-center border-2 rounded-full textmenu md:grid bg-slate-50">
				<div class="border-r-2" id="">
					<a class="navItem" activeClass={$page.url.pathname === '/'} href="/">Úvod</a>					
				</div>
				<div class="border-r-2">
					<a class="navItem" activeClass={$page.url.pathname === '/jidelnicek'} href="/jidelnicek">
						Jídelníček
					</a>
				</div>
				<div class="border-r-2">
					<a class="navItem" activeClass={$page.url.pathname === '/kontakt'} href="/kontakt">
						Kontakt
					</a>
				</div>
				<div class="">
					<a class="navItem" activeClass={$page.url.pathname === '/kosik'} href="/kosik">
						Košík
						{#if $page.data.session }
							<strong>{totalPieces}</strong>						
						{/if}
					</a>
				</div>
			</div>

			<div class="flex items-center justify-self-end">
				{#if $page.data.session}
					<!-- <div class=""> 
          <p class="font-semibold">Ahoj {usertest}</p> 
        </div> -->

					<!-- 	<a activeClass={$page.url.pathname === '/orders'} href="/orders">
						<Button outline color="green" pill={true}>Objednávky</Button>
					</a> -->

					<!-- pravá část menu -->
					<div class="relative grid items-center hidden grid-cols-2 ml-auto md:flex">
						<div class="pr-2">
							<a class="" id="" activeClass={$page.url.pathname === '/profile'} href="/profile">
								<button
									class="p-2 px-6 text-green-800 border border-green-700 btn rounded-3xl hover:text-white hover:bg-green-800">
									Účet
								</button>
							</a>
						</div>
						<div class="">
							<button										
								on:click={signOut} disabled={loading}
								class="p-2 px-6 text-green-800 border border-green-700 btn rounded-3xl hover:text-white hover:bg-green-800">
								Odhlásit
							</button>
						</div>
					</div>
				{:else}
					<div class="relative grid items-center hidden grid-cols-2 ml-auto md:flex">
						<div class="pr-2">
							<a class="" id="" activeClass={$page.url.pathname === '/login'} href="/login">
								<button
									class="p-2 px-6 text-green-800 border border-green-700 btn rounded-3xl hover:text-white hover:bg-green-800">
									Přihlásit
								</button>
							</a>
						</div>
						<div class="">
							<a activeClass={$page.url.pathname === '/signup'} href="/signup">
								<button
									class="p-2 px-6 text-green-800 border border-green-700 btn rounded-3xl hover:text-white hover:bg-green-800">
									Přidej se
								</button>
							</a>
						</div>
					</div>
				{/if}
				<div class="md:hidden">
					<button class="" id="menu" on:click={() => toggleMenu()}>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="w-6 h-6"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M4 6h16M4 12h16M4 18h16" />
						</svg>
					</button>
				</div>
				<div class="md:hidden">
					{#if !totalPieces}											
						{:else}
						<strong>{totalPieces}</strong>
					{/if}
				</div>
			</div>
		</div>
		<div
			class="flex flex-row-reverse justify-center text-lg tracking-wide text-center bg-white md:hidden">
			<ul id="menu-box" style="" class="hidden mb-4">
				<hr />				
				<div class="mt-4">
					<a class="navItem" activeClass={$page.url.pathname === '/'} href="/">Úvod</a>
				</div>
				<div>
					<a class="navItem" activeClass={$page.url.pathname === '/jidelnicek'} href="/jidelnicek">
						Jídelníček
					</a>
				</div>
				<div>
					<a class="navItem" activeClass={$page.url.pathname === '/kotankt'} href="/kontakt">
						Kontakt
					</a>
				</div>
				<div>
					<a class="navItem" activeClass={$page.url.pathname === '/kosik'} href="/kosik">Košík</a>
				</div>
				<div class="grid grid-cols-2 mt-6">
				{#if $page.data.session}				
					<div class="col-end-2 pr-2">							
								<a class="" id="" activeClass={$page.url.pathname === '/profile'} href="/profile">
								<button
									class="p-1 px-6 text-sm text-green-800 border border-green-700 btn rounded-3xl hover:text-white hover:bg-green-800">
									Účet
								</button>
							</a>
						</div>
						<div class="">
							<button
								on:click={signOut} disabled={loading}
								class="p-1 px-6 text-sm text-green-800 border border-green-700 btn rounded-3xl hover:text-white hover:bg-green-800">
								Odhlásit
							</button>
						</div>
					{:else}					
						<div class="col-end-2 pr-2">
							<a class="" id="" activeClass={$page.url.pathname === '/login'} href="/login">
								<button
									class="p-1 px-6 text-sm text-green-800 border border-green-700 btn rounded-3xl hover:text-white hover:bg-green-800">
									Přihlásit
								</button>
							</a>
						</div>
						<div class="">
							<a activeClass={$page.url.pathname === '/signup'} href="/signup">
								<button
									class="p-1 px-6 text-sm text-green-800 border border-green-700 btn rounded-3xl hover:text-white hover:bg-green-800">
									Přidej se
								</button>
							</a>
							</div>			
				{/if}
				</div>								
			</ul>						
		</div>
		<hr class="mx-4" />
	</nav>
</header>

<div class="pt-5 mt-10"  ></div>
<slot class="mt-10" />
	
<footer class="">
  <div class="grid p-4 mt-40 text-gray-500 border-2 rounded-lg md:grid-cols-5 md:mx-4">    
    <div class="grid col-span-2 text-sm">
			<p><a class="items-center mt-3 text-sm sm:mt-0" target="_blank" href="https://www.mikigroup.cz/">Vytvořeno <i class="fa fa-regular fa-hand-spock"></i> Mikigroup™</a></p>                 
    </div>    
    <div class="grid justify-end col-span-3 text-sm">
			<p>Copyright © 2022-2023 Šťastné srdce Všechny práva vyhrazena. <a href="https://www.mikigroup.cz/">ver_1.02</a>  </p>
  </div>
</footer>


<style lang="postcss">
	.textmenu {
		font-size: 0.9em;
	}
	header {
		position: fixed;
		top: 0px;
		width: 100%;
		height: 100px;
		z-index: 1;
	}
	.navItem {
		text-decoration: none;
		position: relative;
		display: inline-block;
	}

	.navItem::after {
		content: '';
		background: #d2691e;
		height: 1px;
		position: absolute;
		bottom: 0;
		transition: 0.16s all 0.025s;
	}

	.navItem::after {
		left: 100%;
		right: 0;
	}

	.navItem:hover ~ a::after {
		left: 0;
		right: 100%;
	}

	.navItem:hover::after {
		left: 0;
		right: 0;
	}
</style>
