<script lang="ts">
	import { totalPiecesStore } from "$lib/stores/store";
	import MenuItem from "./MenuItem.svelte";
	import { page } from "$app/state";
	import type { Menu } from "$lib/types/menu";
	import type { Attachment } from "svelte/attachments";
	import { prefersReducedMotion } from "svelte/motion";
	import { fade, fly } from "svelte/transition";
	import { menuSlide } from "./menu-motion";

	interface Props {
		data: {
		menus: Menu[];
		texts: any;
		visibleDays: number;
		generalSettings: any;
		productsSettings: any;
		loadingStats: {
			totalRequested: number;
			successfullyLoaded: number;
			failed: number;
		};
	};
	}

	let { data }: Props = $props();

	let filterVegetarian = $state(false);
	let showScrollTop = $state(false);
	let playMenuMotion = $state(false);
	let reducedMotion = $derived(prefersReducedMotion.current);

	function enterDuration() {
		return reducedMotion || !playMenuMotion ? 0 : 420;
	}

	function leaveDuration() {
		return reducedMotion ? 0 : 300;
	}

	const observeThirdMenu: Attachment = (node) => {
		const update = () => {
			const visible = node.getBoundingClientRect().top < window.innerHeight;
			if (visible !== showScrollTop) showScrollTop = visible;
		};
		const observer = new IntersectionObserver(update);
		observer.observe(node);
		window.addEventListener("scroll", update, { passive: true });
		update();
		return () => {
			observer.disconnect();
			window.removeEventListener("scroll", update);
			showScrollTop = false;
		};
	};

	// Filtrování menu podle vegetariánských jídel
	let filteredMenus = $derived(filterVegetarian 
		? data.menus
			.map(menu => ({
				...menu,
				variants: menu.variants ? menu.variants.filter(variant => variant.vegetarian) : []
			}))
			.filter(menu => menu.variants.length > 0)
		: data.menus);

	function scrollToTop(event: Event) {
		event.preventDefault();
		document.getElementById("menu-content")?.scrollIntoView({
			behavior: reducedMotion ? "auto" : "smooth"
		});
	}
</script>

<svelte:head>
	<title>Obědy - {data.generalSettings?.shopName || 'Šťastné srdce'}</title>
</svelte:head>

<section class="max-w-screen-xl px-4 py-16 mx-auto mb-10 rounded-lg bg-stone-100">
	<h1 class="mb-8 text-4xl font-extrabold tracking-tight text-center text-gray-900 md:text-5xl">
		Obědy
	</h1>
	
	<div class="max-w-4xl mx-auto">
		<div class="bg-white border rounded-lg shadow-md p-8 border-gray-400 [&_img]:max-w-full [&_img]:h-auto">
			{@html data.texts?.text || "Žádný text pro jídelníček není k dispozici."}
		</div>

		<div class="mt-5 bg-white border rounded-lg border-gray-400">
			<!-- Informace o zobrazení menu -->
			{#if data.productsSettings?.nextDayMenuEnabled}
				<div class="p-3 border-b border-gray-200 bg-blue-50 m-2">
					<div class="flex items-center gap-2 text-sm text-blue-700">
						<i class="fa-solid fa-clock"></i>
						<span class="text-xs">
							Objednávky na další den jsou možné do <strong class="text-lg leading-none">{data.productsSettings.nextDayMenuTime}</strong>
						</span>
					</div>
				</div>
			{/if}
			
			<!-- Informace o chybějících menu -->
			{#if data.loadingStats.failed > 0}
				<div class="p-3 border-b border-gray-200 bg-yellow-50 m-2">
					<div class="flex items-center gap-2 text-sm text-yellow-700">
						<i class="fa-solid fa-exclamation-triangle"></i>
						<span class="text-sm">
							Zobrazuje se {data.loadingStats.successfullyLoaded} z {data.loadingStats.totalRequested} menu 
							({data.loadingStats.failed} menu nebylo možné načíst)
						</span>
					</div>
				</div>
			{/if}
			
			<!-- Filtr pro vegetariánská jídla -->
			<div class="p-4 border-b border-gray-200 bg-gray-50 m-2">
				<div class="flex items-center justify-between">
					<label class="flex items-center gap-3 cursor-pointer">						
						<input
							type="checkbox"
							class="checkbox"
							bind:checked={filterVegetarian}
							onchange={() => (playMenuMotion = true)}
						/>
						<span class="text-sm md:text-lg font-medium">🌱 Pouze vegetariánská menu</span>
					</label>
					
						<span class="text-sm text-gray-600">
							{filteredMenus.length} z {data.menus.length}
						</span>
					
				</div>
			</div>

			<div class="pb-10 scroll-mt-28" id="menu-content">
				<div class="mt-10 border md:mx-10 md:p-5 bg-orange-50 border-gray-300">
					{#each filteredMenus as menu, index (menu.id)}
						<div
							class="flow-root"
							in:menuSlide={{ duration: enterDuration() }}
							out:menuSlide={{ duration: leaveDuration() }}>
							{#if index === 2}
								<div
									class="h-px -mb-px w-full pointer-events-none"
									aria-hidden="true"
									{@attach observeThirdMenu}></div>
							{/if}
							<MenuItem
								{menu}
								productsSettings={data.productsSettings}
								animate={playMenuMotion} />
						</div>
					{:else}
						<p
							class="p-4 text-center text-gray-600"
							in:menuSlide={{ duration: enterDuration() }}
							out:menuSlide={{ duration: leaveDuration() }}>
							{filterVegetarian
								? "Žádná vegetariánská menu nenalezena."
								: `Žádný jídelníček nenalezen pro následujících ${data.visibleDays} menu.`}
						</p>
					{/each}
				</div>
			</div>
		</div>

		{#if $totalPiecesStore > 0 && page.data.session}
			<div class="flex justify-end gap-4 pt-10 pr-5">
				<a
					href="/kosik"
					class="px-4 py-2 text-center text-white bg-green-800 rounded-lg shadow-md hover:bg-green-900">
					Košík ({$totalPiecesStore})
				</a>
			</div>
		{/if}
	</div>
</section>

{#if showScrollTop}
	<button
		type="button"
		class="fixed bottom-6 right-4 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-green-800 text-white shadow-lg hover:bg-green-900"
		onclick={scrollToTop}
		aria-label="Skoč nahoru"
		in:fly={{ x: reducedMotion ? 0 : 24, duration: reducedMotion ? 0 : 200 }}
		out:fade={{ duration: reducedMotion ? 0 : 150 }}>
		<i class="fa-solid fa-chevron-up" aria-hidden="true"></i>
	</button>
{/if}
