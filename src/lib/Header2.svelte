<script>
	import { page } from '$app/stores';
	import { time } from '../routes/Stores/stores';
	import CartItemsStore from '../routes/Stores/stores';
	
	let src = '/android-chrome-192x192.png';

	const formatter = new Intl.DateTimeFormat('en', {
		hour12: false,
		hour: 'numeric',
		minute: '2-digit'
	});

	import { user } from '../routes/Stores/stores';
	// import { supabase } from '../routes/supabaseClient';
	import { supabase } from "../lib/initSupabase";
	user.set(supabase.auth.user());

	const session = supabase.auth.session();
	$: isLoggedIn = !supabase.auth.user;
	$: usertest = supabase.auth.user;
	$: username = $user !== null ? $user.username : ' there!';

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

<style>
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

<header class="bg-white">
	<nav>
		<div class="grid grid-cols-2 md:grid-cols-3 m-2 px-4 max-w-8xl mx-auto"> <!-- gap-2  -->
			<div class="grid grid-cols-2 items-center py-4 lg:px-8 mx-4 lg:mx-0 w-full">
				<div class="grid grid-cols-2 text-xl font-semibold w-80">
						<a href="/">
						Šťastné srdce</a>
						<img {src} alt="staste srdce" class="pt-1" width="20" height="20">
				</div>				
				<!-- čas -->
				<div class="grid justify-end w-44"><time>{formatter.format($time)}</time></div>  <!-- items-center pl-12 ml-12 md:ml-5 md:pl-5 -->
			</div>
			<!-- menu -->
			<div
				class="grid grid-cols-4 border-2 rounded-full text-center items-center textmenu hidden
				md:grid tracking-wide bg-slate-50">
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
						{#if $user}
							<strong>{totalPieces}</strong>
						{:else}{/if}
					</a>
				</div>
			</div>

			<div class="justify-self-end flex items-center">
				{#if $user}
					<!-- <div class=""> 
          <p class="font-semibold">Ahoj {usertest}</p> 
        </div> -->

					<!-- 	<a activeClass={$page.url.pathname === '/orders'} href="/orders">
						<Button outline color="green" pill={true}>Objednávky</Button>
					</a> -->

					<!-- pravá část menu -->
					<div class="grid grid-cols-2 relative hidden md:flex items-center ml-auto">
						<div class="pr-2">
							<a class="" id="" activeClass={$page.url.pathname === '/profile'} href="/profile">
								<button
									class="btn border rounded-3xl p-2 px-6 border-green-700 text-green-800
									hover:text-white hover:bg-green-800">
									Účet
								</button>
							</a>
						</div>
						<div class="">
							<button
								on:click={logOut}
								class="btn border rounded-3xl p-2 px-6 border-green-700 text-green-800
								hover:text-white hover:bg-green-800">
								Odhlásit
							</button>
						</div>
					</div>
				{:else}
					<div class="grid grid-cols-2 relative hidden md:flex items-center ml-auto">
						<div class="pr-2">
							<a class="" id="" activeClass={$page.url.pathname === '/login'} href="/login">
								<button
									class="btn border rounded-3xl p-2 px-6 border-green-700 text-green-800
									hover:text-white hover:bg-green-800">
									Přihlásit
								</button>
							</a>
						</div>
						<div class="">
							<a activeClass={$page.url.pathname === '/signup'} href="/signup">
								<button
									class="btn border rounded-3xl p-2 px-6 border-green-700 text-green-800
									hover:text-white hover:bg-green-800">
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
			class="flex flex-row-reverse md:hidden justify-center tracking-wide text-center text-lg
			bg-white">
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
				<div class="mt-6 grid grid-cols-2">
				{#if $user}				
					<div class="pr-2 col-end-2">
							<a class="" id="" activeClass={$page.url.pathname === '/profile'} href="/profile">
								<button
									class="btn border rounded-3xl p-1 px-6 border-green-700 text-green-800
									hover:text-white hover:bg-green-800 text-sm">
									Účet
								</button>
							</a>
						</div>
						<div class="">
							<button
								on:click={logOut}
								class="btn border rounded-3xl p-1 px-6 border-green-700 text-green-800
								hover:text-white hover:bg-green-800 text-sm">
								Odhlásit
							</button>
						</div>
					{:else}					
						<div class="pr-2 col-end-2">
							<a class="" id="" activeClass={$page.url.pathname === '/login'} href="/login">
								<button
									class="btn border rounded-3xl p-1 px-6 border-green-700 text-green-800
									hover:text-white hover:bg-green-800 text-sm">
									Přihlásit
								</button>
							</a>
						</div>
						<div class="">
							<a activeClass={$page.url.pathname === '/signup'} href="/signup">
								<button
									class="btn border rounded-3xl p-1 px-6 border-green-700 text-green-800
									hover:text-white hover:bg-green-800 text-sm">
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
