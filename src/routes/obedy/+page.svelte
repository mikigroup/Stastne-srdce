<script lang="ts">
	import { totalPiecesStore } from "$lib/stores/store";
	import MenuItem from "./MenuItem.svelte";
	import { page } from "$app/stores";
	import type { Menu } from "$lib/types/menu";

	export let data: {
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

	let filterVegetarian = false;

	// Filtrování menu podle vegetariánských jídel
	$: filteredMenus = filterVegetarian 
		? data.menus
			.map(menu => ({
				...menu,
				variants: menu.variants ? menu.variants.filter(variant => variant.vegetarian) : []
			}))
			.filter(menu => menu.variants.length > 0)
		: data.menus;

	function scrollToTop(event: Event) {
		event.preventDefault();
		document.getElementById("menu-content")?.scrollIntoView({ behavior: "smooth" });
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
		<div class="bg-white border rounded-lg shadow-md p-8 border-gray-400">
			{@html data.texts?.text || "Žádný text pro jídelníček není k dispozici."}
		</div>

		<div class="mt-5 bg-white border rounded-lg border-gray-400">
			<!-- Informace o zobrazení menu -->
			{#if data.productsSettings?.nextDayMenuEnabled}
				<div class="p-3 border-b border-gray-200 bg-blue-50 m-2">
					<div class="flex items-center gap-2 text-sm text-blue-700">
						<i class="fa-solid fa-clock"></i>
						<span class="text-sm">
							Objednávky na další den jsou možné do <strong>{data.productsSettings.nextDayMenuTime}</strong>
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
						/>
						<span class="text-sm md:text-lg font-medium">🌱 Pouze vegetariánská menu</span>
					</label>
					
						<span class="text-sm text-gray-600">
							{filteredMenus.length} z {data.menus.length}
						</span>
					
				</div>
			</div>

			<div class="pb-10" id="menu-content">
				<div class="mt-10 border md:mx-10 md:p-5 bg-orange-50 border-gray-300">
					{#if filteredMenus?.length > 0}
						{#each filteredMenus as menu (menu.id)}
							<MenuItem {menu} productsSettings={data.productsSettings} />
						{/each}
					{:else if filterVegetarian}
						<p class="p-4 text-center text-gray-600">
							Žádná vegetariánská menu nenalezena.
						</p>
					{:else}
						<p class="p-4 text-center text-gray-600">
							Žádný jídelníček nenalezen pro následujících {data.visibleDays} menu.
						</p>
					{/if}
				</div>
			</div>
		</div>

		<div class="flex justify-end gap-4 pt-10 pr-5">
			<a
				href="#menu-content"
				on:click={scrollToTop}
				class="px-4 py-2 text-center text-white bg-green-800 rounded-lg shadow-md hover:bg-green-900">
				Skoč nahoru
			</a>

			{#if $totalPiecesStore > 0 && $page.data.session}
				<a
					href="/kosik"
					class="px-4 py-2 text-center text-white bg-green-800 rounded-lg shadow-md hover:bg-green-900">
					Košík ({$totalPiecesStore})
				</a>
			{/if}
		</div>
	</section>
