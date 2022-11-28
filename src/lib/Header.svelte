<script>
	/* import { Navbar, NavBrand, NavUl, NavLi, NavHamburger, Button 	} from 'flowbite-svelte';
	import { page } from '$app/stores'; */
	/** import logo from './svelte-logo.svg'; */
	import { user, redirectURL } from '../store';
	
</script>
{#await import("../lib/Header2.svelte") then Module}
	<Module.default />
{/await}

<!-- <header>
	<Navbar let:hidden let:toggle>
		<NavBrand href="/">
				<img
					src="logo.png"
					class="mr-3 h-6 sm:h-9"
					alt="Štastné srdce"
				/> 
			<span class="self-center whitespace-nowrap text-xl font-semibold dark:text-white">
				Štastné srdce
			</span>
		</NavBrand>
		<div class="flex md:order-2">
			<a activeClass={$page.url.pathname === '/login'} href="/login">
				<Button color="green">Přihlášení</Button>
			</a>
			<NavHamburger on:click={toggle} />
		</div>
		<NavUl {hidden}>
			<NavLi activeClass={$page.url.pathname === '/'} href="/">Úvod</NavLi>
			<NavLi activeClass={$page.url.pathname === '/jidelnicek'} href="/jidelnicek">Jídelníček</NavLi>
			<NavLi activeClass={$page.url.pathname === '/kontakt'} href="/kontakt">Kontakt</NavLi>
			<NavLi activeClass={$page.url.pathname === '/kosik'} href="/kosik">Košík</NavLi>
		</NavUl>
	</Navbar>
</header> -->
