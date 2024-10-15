<script lang="ts">
	import { createEventDispatcher } from "svelte";

	export let selectedTags: any[] = [];
	export let availableTags: any[] = [];

	const dispatch = createEventDispatcher();

	let inputValue = "";
	let filteredTags: any[] = [];

	$: {
		filteredTags = availableTags.filter(tag =>
			tag.name.toLowerCase().includes(inputValue.toLowerCase()) &&
			!selectedTags.some(selected => selected.id === tag.id)
		);
	}

	function addTag(tag: any) {
		if (!selectedTags.some(selected => selected.id === tag.id)) {
			selectedTags = [...selectedTags, tag];
			dispatch("update", selectedTags);
		}
		inputValue = "";
	}

	function removeTag(tag: any) {
		selectedTags = selectedTags.filter(t => t.id !== tag.id);
		dispatch("update", selectedTags);
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === "Enter" && inputValue) {
			event.preventDefault();
			if (filteredTags.length > 0) {
				addTag(filteredTags[0]);
			}
		}
	}
</script>

<div class="tag-selector">
	<div class="selected-tags">
		{#each selectedTags as tag (tag.id)}
      <span class="tag">
        {tag.name}
				<button on:click={() => removeTag(tag)}>&times;</button>
      </span>
		{/each}
	</div>
	<input
		type="text"
		bind:value={inputValue}
		on:keydown={handleKeydown}
		placeholder="Přidat tag..."
	/>
	{#if inputValue && filteredTags.length > 0}
		<ul class="tag-suggestions">
			{#each filteredTags as tag (tag.id)}
				<li on:click={() => addTag(tag)}>{tag.name}</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
    .tag-selector {
        /* Add your styles here */
    }
    .selected-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin-bottom: 0.5rem;
    }
    .tag {
        background-color: #e0e0e0;
        padding: 0.25rem 0.5rem;
        border-radius: 0.25rem;
        display: flex;
        align-items: center;
    }
    .tag button {
        margin-left: 0.25rem;
        border: none;
        background: none;
        cursor: pointer;
    }
    .tag-suggestions {
        list-style-type: none;
        padding: 0;
        margin: 0;
        border: 1px solid #ccc;
        max-height: 200px;
        overflow-y: auto;
    }
    .tag-suggestions li {
        padding: 0.5rem;
        cursor: pointer;
    }
    .tag-suggestions li:hover {
        background-color: #f0f0f0;
    }
</style>