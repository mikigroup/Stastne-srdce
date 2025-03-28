<script lang="ts">
	import { createEventDispatcher } from "svelte";

	export let options: number[] = [7, 14, 21, 28];
	export let selectedCount: number = 7;

	const dispatch = createEventDispatcher();

	function selectCount(count: number) {
		selectedCount = count;
		dispatch("select", { count });
	}

	// Mapování počtu jídel na popisky záložek
	const getTabLabel = (count: number): string => {
		return `${count} dní`;
	};

	// Pro výběr v dropdown menu
	let menuCountDropdown = selectedCount;

	function handleSelectChange(event) {
		const newCount = parseInt(event.target.value);
		selectCount(newCount);
	}
</script>

<div class="px-4 py-3 md:px-8">
	<!-- Mobilní verze s dropdown -->
	<div class="block md:hidden">
		<select
			bind:value={menuCountDropdown}
			on:change={handleSelectChange}
			class="w-full p-2 border border-gray-300 rounded-lg bg-white">
			{#each options as option}
				<option value={option}>{getTabLabel(option)}</option>
			{/each}
		</select>
	</div>
<div class="py-2 my-2">
	Počet dnů zobrazených na stránce
</div>
	<div class="hidden md:flex items-center pl-0 text-center border ">
		{#each options as option}
			<button
				class="w-full px-6 py-3 text-xs font-medium leading-tight border-t-0 border-b-2 md:text-lg m-1
            {selectedCount === option
              ? 'border-green-600 bg-gray-50'
              : 'border-transparent hover:bg-gray-50 hover:border-green-600 duration-300'}"
				on:click={() => selectCount(option)}>
				{getTabLabel(option)}
			</button>
		{/each}
	</div>
</div>