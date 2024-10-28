<script lang="ts">
	import { totalPiecesStore } from "$lib/stores/store";
	import MenuWeekSelector from "./MenuWeekSelector.svelte";
	import MenuItem from "./MenuItem.svelte";
	import { page } from "$app/stores";

	export let data;
	let { weeks, texts } = data;
	let selectedWeek = 0;
	let currentWeekMenus = weeks[0] || [];

	$: totalPieces = $totalPiecesStore;

	function handleWeekSelect(event) {
		selectedWeek = event.detail.week;
		currentWeekMenus = weeks[selectedWeek] || [];
	}

	function scrollToTop(event) {
		event.preventDefault();
		document
			.getElementById("menu-content")
			?.scrollIntoView({ behavior: "smooth" });
	}
</script>

<svelte:head>
	<title>Šťastné srdce - Jídelníček</title>
	<meta name="description" content="Jídelníček" />
</svelte:head>

<main>
	<section
		class="max-w-screen-lg py-16 mx-auto mt-20 mb-10 rounded-lg md:px-4 bg-stone-100">
		<h1
			class="mb-10 text-5xl font-extrabold tracking-tight text-center text-gray-900">
			Jídelníček
		</h1>

		<div class="max-w-4xl p-5 pb-2 mx-auto bg-white border-2 rounded-lg mb-3">
			{@html texts?.text || "Žádný text pro jídelníček není k dispozici."}
		</div>

		<div class="max-w-4xl mx-auto mt-5 bg-white border-2 rounded-lg">
			<div class="pb-10" id="menu-content">
				<MenuWeekSelector {weeks} on:select={handleWeekSelect} />

				<div class="mt-10 border-2 md:mx-10 md:p-5 bg-orange-50">
					{#if currentWeekMenus.length > 0}
						{#each currentWeekMenus as menu (menu.id)}
							<MenuItem {menu} />
						{/each}
					{:else}
						<p>Žádný jídelníček nenalezen pro tento týden</p>
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
