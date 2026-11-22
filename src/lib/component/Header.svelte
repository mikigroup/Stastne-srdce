<script lang="ts">
	import { page } from "$app/state";
	import { totalPiecesStore } from "$lib/stores/store";
	import { beforeNavigate } from "$app/navigation";
	import { readable } from "svelte/store";
	import { onMount } from "svelte";
	import { ROUTES } from "$lib/constants/routes";

	let { data } = $props();

	// Logo ze site settings, fallback na default  
	let src = $derived(data.settings?.appearance?.logo || "/srdce.png");

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

	let menuVisible = $state(false);
	let totalPieces = $derived($totalPiecesStore);

	let generalSettings = $derived(data.generalSettings ?? data.settings?.general);
	let pathname = $derived(page.url.pathname);

	const mobileLinks = [
		{ href: "/", label: "Úvod" },
		{ href: "/obedy", label: "Obědy" },
		{ href: "/poradna", label: "Poradna" },
		{ href: "/haccp", label: "HACCP" },
		{ href: "/prednasky-a-kurzy", label: "Přednášky a kurzy" },
		{ href: "/kontakt", label: "Kontakt" }
	];

	function isCurrent(href: string, path: string) {
		if (href === "/") return path === "/";
		return path === href || path.startsWith(`${href}/`);
	}

	function itemClass(href: string, path: string) {
		return isCurrent(href, path)
			? "border border-green-800 bg-green-800 text-white"
			: "border border-transparent bg-slate-50 text-gray-800 hover:border-green-700 hover:bg-green-50 hover:text-green-800";
	}

	function closeMenu() {
		menuVisible = false;
	}

	function toggleMenu(event: MouseEvent) {
		event.stopPropagation();
		menuVisible = !menuVisible;
	}

	// Zavřít dřív, než se vykreslí nová stránka. Animace odchodu by jinak
	// nechala panel inertní a následující klik na ikonu se občas ztratil.
	beforeNavigate(() => {
		menuVisible = false;
	});

	onMount(() => {
		function handlePointerDown(event: PointerEvent) {
			if (!menuVisible) return;
			const target = event.target;
			if (!(target instanceof Element)) return;
			if (target.closest("[data-menu-button], [data-mobile-menu]")) return;
			closeMenu();
		}

		document.addEventListener("pointerdown", handlePointerDown);

		return () => {
			document.removeEventListener("pointerdown", handlePointerDown);
		};
	});
</script>

<header class="fixed top-0 left-0 w-full bg-white z-40">
	<nav>
		<div class="flex items-center justify-between w-full px-4 m-2 mx-auto xl:flex xl:justify-between max-w-8xl">
			<!-- Logo a čas -->
			<div class="flex items-center justify-between w-full lg:w-auto lg:px-8 gap-8">
				<div class="flex items-center gap-2">
					<h1 class="text-xl font-semibold">
						<a href="/" class="hover:text-gray-600 transition-colors duration-200 whitespace-nowrap [word-spacing:-0.12em] sm:[word-spacing:normal]">
							{generalSettings?.shopName ?? "Šťastné srdce"}
						</a>
					</h1>
					<img {src} alt="stastne srdce" class="shrink-0" width="22" height="22" />
				</div>
				<div class="mx-auto">
					<time class="text-xs sm:text-base">{formatter.format($time)}</time>
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
				{#if page.data.session}
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
						<form method="POST" action={ROUTES.AUTH.LOGOUT} data-sveltekit-reload>
							<button type="submit" id="signOut" class="p-2 px-6 text-green-800 border border-green-700 rounded-3xl hover:bg-green-800 hover:text-white transition-colors duration-200">Odhlásit</button>
						</form>
					</div>
				{:else}
					<!-- Desktop nav for guests -->
					<div class="hidden xl:flex items-center gap-2">
						<a href={ROUTES.AUTH.LOGIN} class="p-2 px-6 text-green-800 border border-green-700 rounded-3xl hover:bg-green-800 hover:text-white transition-colors duration-200">Přihlásit</a>
						<a href={ROUTES.AUTH.SIGNUP} class="p-2 px-6 whitespace-nowrap text-green-800 border border-green-700 rounded-3xl hover:bg-green-800 hover:text-white transition-colors duration-200">Přidej se</a>
					</div>
				{/if}

				<!-- Mobile menu button and cart -->
				<div class="flex items-center xl:hidden">
					<button
						type="button"
						data-menu-button
						onclick={toggleMenu}
						class={["menu-button relative z-20 rounded-full p-2 hover:bg-slate-50", menuVisible && "is-open"]}
						aria-expanded={menuVisible}
						aria-controls="mobile-menu"
						aria-label={menuVisible ? "Zavřít menu" : "Otevřít menu"}>
						<span class="menu-icon" aria-hidden="true">
							<span></span>
							<span></span>
							<span></span>
						</span>
					</button>
					{#if totalPieces}
						<span class="ml-2 font-bold">{totalPieces}</span>
					{/if}
				</div>
			</div>
		</div>

		<!-- Mobile menu: výška se animuje v CSS, aby zavírání nenechalo panel inertní -->
		<div
			id="mobile-menu"
			data-mobile-menu
			class={["mobile-menu", menuVisible && "is-open"]}
			inert={!menuVisible}
			aria-hidden={!menuVisible}>
			<div class="mobile-menu-clip">
				<div class="border-t border-gray-100 bg-white px-4 pb-4 pt-3">
					<div class="mx-auto flex w-full max-w-[21rem] flex-col gap-2">
						<ul class="flex flex-col gap-2">
							{#each mobileLinks as link, index (link.href)}
								<li style:--delay="{index * 35}ms">
									<a
										href={link.href}
										onclick={closeMenu}
										class="flex h-full items-center justify-center rounded-2xl px-3 py-3 text-center text-base font-medium leading-tight transition-colors duration-200 {itemClass(link.href, pathname)}">
										{link.label}
									</a>
								</li>
							{/each}
						</ul>
					</div>

					<a
						href="/kosik"
						onclick={closeMenu}
						style:--delay="210ms"
						class="menu-piece mx-auto mt-2 flex w-full max-w-2xl items-center justify-center gap-2 rounded-2xl px-3 py-3 text-base font-medium transition-colors duration-200 {itemClass('/kosik', pathname)}">
						Košík
						{#if totalPieces}
							<span
								class="inline-flex min-w-[1.5rem] items-center justify-center rounded-full px-2 text-sm {isCurrent('/kosik', pathname) ? 'bg-white text-green-800' : 'bg-green-800 text-white'}">
								{totalPieces}
							</span>
						{/if}
					</a>

					<div class="menu-piece mx-auto mt-5 grid w-full max-w-[21rem] grid-cols-2 gap-2" style:--delay="250ms">
						{#if page.data.session}
							<a
								href="/profile"
								onclick={closeMenu}
								class="rounded-2xl border border-green-700 py-3 text-center text-base font-medium text-green-800 transition-colors duration-200 hover:bg-green-800 hover:text-white">
								Účet
							</a>
							<form method="POST" action={ROUTES.AUTH.LOGOUT} class="contents" data-sveltekit-reload>
								<button
									type="submit"
									class="w-full rounded-2xl border border-green-700 py-3 text-center text-base font-medium text-green-800 transition-colors duration-200 hover:bg-green-800 hover:text-white">
									Odhlásit
								</button>
							</form>
						{:else}
							<a
								href={ROUTES.AUTH.LOGIN}
								onclick={closeMenu}
								class="rounded-2xl border border-green-700 py-3 text-center text-base font-medium text-green-800 transition-colors duration-200 hover:bg-green-800 hover:text-white">
								Přihlásit
							</a>
							<a
								href={ROUTES.AUTH.SIGNUP}
								onclick={closeMenu}
								class="rounded-2xl bg-green-800 py-3 text-center text-base font-medium text-white transition-colors duration-200 hover:bg-green-900">
								Přidej se
							</a>
						{/if}
					</div>
				</div>
			</div>
		</div>
		<hr class="mx-4 border-t border-gray-200" />
	</nav>
</header>

<style>
	.menu-button {
		transition: background-color 0.2s ease, transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
	}

	.menu-button:active {
		transform: scale(0.92);
	}

	.menu-icon {
		position: relative;
		display: block;
		width: 1.75rem;
		height: 1.75rem;
	}

	.menu-icon span {
		position: absolute;
		left: 0.25rem;
		right: 0.25rem;
		height: 2px;
		border-radius: 999px;
		background: currentColor;
		transform-origin: center;
		transition:
			transform 0.42s cubic-bezier(0.22, 1, 0.36, 1),
			opacity 0.28s ease,
			top 0.42s cubic-bezier(0.22, 1, 0.36, 1);
	}

	.menu-icon span:nth-child(1) {
		top: 0.45rem;
	}

	.menu-icon span:nth-child(2) {
		top: 0.8rem;
	}

	.menu-icon span:nth-child(3) {
		top: 1.15rem;
	}

	.menu-button.is-open .menu-icon span:nth-child(1) {
		top: 0.8rem;
		transform: rotate(45deg);
	}

	.menu-button.is-open .menu-icon span:nth-child(2) {
		opacity: 0;
		transform: scaleX(0.2);
	}

	.menu-button.is-open .menu-icon span:nth-child(3) {
		top: 0.8rem;
		transform: rotate(-45deg);
	}

	.mobile-menu {
		display: grid;
		grid-template-rows: 0fr;
		transition: grid-template-rows 0.45s cubic-bezier(0.22, 1, 0.36, 1);
	}

	.mobile-menu.is-open {
		grid-template-rows: 1fr;
	}

	.mobile-menu-clip {
		overflow: hidden;
		min-height: 0;
	}

	.mobile-menu.is-open li,
	.mobile-menu.is-open .menu-piece {
		animation: menu-rise 0.48s cubic-bezier(0.22, 1, 0.36, 1) both;
		animation-delay: var(--delay, 0ms);
	}

	@keyframes menu-rise {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}

		to {
			opacity: 1;
			transform: none;
		}
	}

	@media (min-width: 80rem) {
		.mobile-menu {
			display: none;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.menu-button,
		.menu-icon span,
		.mobile-menu {
			transition: none;
		}

		.mobile-menu.is-open li,
		.mobile-menu.is-open .menu-piece {
			animation: none;
		}
	}
</style>