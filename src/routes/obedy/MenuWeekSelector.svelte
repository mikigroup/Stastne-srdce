<script lang="ts">
	import { createEventDispatcher } from "svelte";

	export let weeks: any[][] = [];
	export let selectedWeek: number = 0;

	const dispatch = createEventDispatcher();

	function selectWeek(index: number) {
		selectedWeek = index;
		dispatch("select", { week: index });
	}
</script>

<div class="flex items-center pl-0 mb-4 text-center border-b-0">
	{#each weeks as _, index}
		<button
			class="w-full px-6 py-3 text-xs font-medium leading-tight border-t-0 border-b-2 md:text-lg m-1
        {selectedWeek === index
				? 'border-green-600 bg-gray-50'
				: 'border-transparent hover:bg-gray-50 hover:border-green-600 duration-300'}"
			on:click={() => selectWeek(index)}>
			{index + 1}. týden
		</button>
	{/each}
</div>