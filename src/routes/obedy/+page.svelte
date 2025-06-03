<script lang="ts">
	import { totalPiecesStore } from "$lib/stores/store";
	import MenuCountSelector from "./MenuWeekSelector.svelte";
	import MenuItem from "./MenuItem.svelte";
	import { page } from "$app/stores";
	import { writable } from "svelte/store";

	export let data;
	let { menus, menuGroups, texts } = data;

	// Dostupné volby počtu menu, které můžeme zobrazit
	const menuCountOptions = [7, 14, 21, 28, 70];

	// Výchozí počet menu k zobrazení
	let selectedMenuCount = 70;

	// Store pro aktuálně vybraná menu
	const currentMenus = writable(menuGroups[selectedMenuCount]);

	// Aktualizace menu při změně vybraného počtu
	function handleMenuCountSelect(event) {
		selectedMenuCount = event.detail.count;
		$currentMenus = menuGroups[selectedMenuCount];
	}

	$: totalPieces = $totalPiecesStore;

	function scrollToTop(event) {
		event.preventDefault();
		document
			.getElementById("menu-content")
			?.scrollIntoView({ behavior: "smooth" });
	}

	const { generalSettings } = data;
</script>

<svelte:head>
	<title>{generalSettings.shopName} - Obědy</title>
	<meta name="description" content="Obědy" />
</svelte:head>

<main>
	<section
		class="max-w-screen-lg py-16 mx-auto mt-20 mb-10 rounded-lg md:px-4 bg-stone-100">
		<h1
			class="mb-10 text-5xl font-extrabold tracking-tight text-center text-gray-900">
			Obědy
		</h1>
		<div class="max-w-4xl p-5 md:p-10 mx-auto bg-white border border-gray-400 rounded-lg">
			{@html texts?.text || "Žádný text pro jídelníček není k dispozici."}
		</div>

		<div class="max-w-4xl mx-auto mt-5 bg-white border rounded-lg border-gray-400">
			<div class="pb-10" id="menu-content">
<!--				<MenuCountSelector
					options={menuCountOptions}
					selectedCount={selectedMenuCount}
					on:select={handleMenuCountSelect} />-->

				<div class="mt-10 border md:mx-10 md:p-5 bg-orange-50 border-gray-300">
					{#if $currentMenus && $currentMenus.length > 0}
						{#each $currentMenus as menu (menu.id)}
							<MenuItem {menu} />
						{/each}
					{:else}
						<p>Žádný jídelníček nenalezen</p>
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

			{#if totalPieces > 0 && $page.data.session}
				<a
					href="/kosik"
					class="px-4 py-2 text-center text-white bg-green-800 rounded-lg shadow-md hover:bg-green-900">
					Košík ({totalPieces})
				</a>
			{/if}
		</div>
	</section>
</main>