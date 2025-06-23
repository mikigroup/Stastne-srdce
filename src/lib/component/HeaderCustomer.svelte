<script>
	import { page } from "$app/stores";
	import { totalPiecesStore } from "$lib/stores/store";
	import { goto } from "$app/navigation";
	import { readable } from "svelte/store";
	import { slide } from "svelte/transition";

	export let data;
	let { supabase, session, user } = data;
	$: ({ supabase, session, user } = data);

	async function signOut() {
		try {
			const { error } = await supabase.auth.signOut();
			if (error) throw error;
			await goto("/");
		} catch (error) {
			console.error("Error logging out:", error);
		}
	}

	// Logo ze site settings, fallback na default  
	$: src = data.settings?.appearance?.logo || "/srdce.png";

	const formatter = new Intl.DateTimeFormat("en", {
		hour12: false,
		hour: "numeric",
		minute: "2-digit"
	});

	const time = readable(new Date(), function start(set) {
		const interval = setInterval(() => {
			set(new Date());
		}, 1000);

		return function stop() {
			clearInterval(interval);
		};
	});

	let menuVisible = false;
	let loading = false;
	$: totalPieces = $totalPiecesStore;

	const { generalSettings } = data;
</script>

<header class="fixed top-0 left-0 w-full bg-white z-10">
	<nav>
		<div class="flex items-center justify-between w-full px-4 m-2 mx-auto xl:flex xl:justify-between max-w-8xl">
			<!-- Logo a čas -->
			<div class="flex items-center justify-between w-full lg:w-auto lg:px-8 gap-8">
				<div class="flex items-center gap-2">
					<h1 class="text-xl font-semibold">
						<a href="/" class="hover:text-gray-600 transition-colors duration-200 whitespace-nowrap">
							{generalSettings.shopName}
						</a>
					</h1>
					<img {src} alt="stastne srdce" class="shrink-0" width="22" height="22" />
				</div>
				<div class="mx-auto">
					<time>{formatter.format($time)}</time>
				</div>
			</div>

			<!-- Desktop menu -->
			<div class="items-center hidden text-center border-2 rounded-full xl:grid xl:grid-cols-6 bg-slate-50 border-green-700 h-[3.5rem] ">
				<div class="border-r-2 border-green-700">
					<a href="/" class="block py-2 hover:text-green-800 transition-colors duration-200 px-1 lg:px-2">O nás</a>
				</div>
				<div class="border-r-2 border-green-700">
					<a href="/obedy" class="block py-2 hover:text-green-800 transition-colors duration-200 px-1 lg:px-2">Obědy</a>
				</div>
				<div class="border-r-2 border-green-700">
					<a href="/poradna" class="block py-2 hover:text-green-800 transition-colors duration-200 px-1 lg:px-2">Poradna</a>
				</div>
				<div class="border-r-2 border-green-700">
					<a href="/haccp" class="block py-2 hover:text-green-800 transition-colors duration-200 px-1 lg:px-2">HACCP</a>
				</div>
				<div class="border-r-2 border-green-700 h-[40px] flex items-center justify-center">
					<a href="/prednasky-a-kurzy" class="block py-2 hover:text-green-800 transition-colors duration-200 px-1 lg:px-2 text-xs lg:text-sm">Přednášky a kurzy</a>
				</div>
				<div class="text-slate-600">
					<a href="/kontakt" class="block py-2 hover:text-green-800 transition-colors duration-200 px-1 lg:px-2">Kontakt</a>
				</div>
			</div>
			<!-- Right section -->
			<div class="flex items-center justify-self-end gap-2">
				{#if $page.data.session}
					<!-- Desktop nav for logged users -->
					<div class="hidden xl:flex items-center gap-2">
						<a href="/kosik" class="flex items-center gap-2 p-[10px] px-6 text-green-800 border border-green-700 rounded-3xl hover:bg-green-800 hover:text-white transition-colors duration-200">
							<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<circle cx="9" cy="21" r="1" />
								<circle cx="20" cy="21" r="1" />
								<path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
							</svg>
							<span class="text-sm">{#if totalPieces}<strong>{totalPieces}</strong>{/if}</span>
						</a>
						<a href="/profile" class="p-2 px-6 text-green-800 border border-green-700 rounded-3xl hover:bg-green-800 hover:text-white transition-colors duration-200">Účet</a>
						 <button on:click={signOut} disabled={loading} id="signOut" class="p-2 px-6 text-green-800 border border-green-700 rounded-3xl hover:bg-green-800 hover:text-white transition-colors duration-200 disabled:opacity-50">Odhlásit</button>
					</div>
				{:else}
					<!-- Desktop nav for guests -->
					<div class="hidden xl:flex items-center gap-2">
						<a href="/login" class="p-2 px-6 text-green-800 border border-green-700 rounded-3xl hover:bg-green-800 hover:text-white transition-colors duration-200">Přihlásit</a>
						<a href="/signup" class="p-2 px-6 text-green-800 border border-green-700 rounded-3xl hover:bg-green-800 hover:text-white transition-colors duration-200">Přidej se</a>
					</div>
				{/if}

				<!-- Mobile menu button and cart -->
				<div class="flex items-center xl:hidden">
					<button on:click={() => (menuVisible = !menuVisible)} class="p-2">
						<svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
						</svg>
					</button>
					{#if totalPieces}
						<span class="ml-2 font-bold">{totalPieces}</span>
					{/if}
				</div>
			</div>
		</div>

		<!-- Mobile menu -->
		{#if menuVisible}
			<div transition:slide={{ duration: 400 }} class="mb-4 flex flex-row-reverse justify-center text-lg tracking-wide text-center bg-white xl:hidden">
				<div class="flex flex-col space-y-4 p-4 w-full">
					<hr />
					<ul class="space-y-2">
						<li>
							<a href="/" class="block py-1 hover:text-green-800 transition-colors duration-200">Úvod</a>
						</li>
						<li>
							<a href="/obedy" class="block py-1 hover:text-green-800 transition-colors duration-200">Obědy</a>
						</li>
						<li>
							<a href="/poradna" class="block py-1 hover:text-green-800 transition-colors duration-200">Poradna</a>
						</li>
						<li>
							<a href="/haccp" class="block py-1 hover:text-green-800 transition-colors duration-200">HACCP</a>
						</li>
						<li>
							<a href="/prednasky-a-kurzy" class="block py-1 hover:text-green-800 transition-colors duration-200">Přednášky a kurzy</a>
						</li>
						<li>
							<a href="/kontakt" class="block py-1 hover:text-green-800 transition-colors duration-200">Kontakt</a>
						</li>
						<li>
							<a href="/kosik" class="block py-1 hover:text-green-800 transition-colors duration-200">Košík {#if totalPieces}({totalPieces}){/if}</a>
						</li>
					</ul>

					<div class="flex flex-wrap justify-center gap-2 pt-2">
						{#if $page.data.session}
							<a href="/profile" class="py-2 px-4 text-sm text-center text-green-800 border border-green-700 rounded-3xl hover:bg-green-800 hover:text-white transition-colors duration-200">Účet</a>
							<button on:click={signOut} disabled={loading} class="py-2 px-4 text-sm text-center text-green-800 border border-green-700 rounded-3xl hover:bg-green-800 hover:text-white transition-colors duration-200 disabled:opacity-50">Odhlásit</button>
						{:else}
							<a href="/login" class="py-2 px-4 text-sm text-center text-green-800 border border-green-700 rounded-3xl hover:bg-green-800 hover:text-white transition-colors duration-200">Přihlásit</a>
							<a href="/signup" class="py-2 px-4 text-sm text-center text-green-800 border border-green-700 rounded-3xl hover:bg-green-800 hover:text-white transition-colors duration-200">Přidej se</a>
						{/if}
					</div>
				</div>
			</div>
		{/if}
		<hr class="mx-4 border-t border-gray-200" />
	</nav>
</header>