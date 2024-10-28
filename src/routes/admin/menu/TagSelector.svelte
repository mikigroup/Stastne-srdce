<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import type { Database } from "$lib/database.types";

	// Component props: arrays of selected and available tags
	export let selectedTags:
		| Database["public"]["Tables"]["allergens"]["Row"][]
		| Database["public"]["Tables"]["ingredients"]["Row"][] = [];
	export let availableTags:
		| Database["public"]["Tables"]["allergens"]["Row"][]
		| Database["public"]["Tables"]["ingredients"]["Row"][] = [];

	// Create event dispatcher for tag updates
	const dispatch = createEventDispatcher<{ update: typeof selectedTags }>();

	// State for input and filtered tags
	let inputValue = "";
	let filteredTags: typeof availableTags = [];

	// Reactive statement to filter available tags based on input
	$: {
		filteredTags = availableTags.filter(
			(tag) =>
				// Filter tags that include the input value (case-insensitive)
				tag.name.toLowerCase().includes(inputValue.toLowerCase()) &&
				// Exclude tags that are already selected
				!selectedTags.some((selected) => selected.id === tag.id)
		);
	}

	// Add a tag to the selected tags
	function addTag(tag: (typeof availableTags)[number]) {
		console.log("addTag called with:", tag);
		// Check if the tag is not already in the selected tags
		if (!selectedTags.some((selected) => selected.id === tag.id)) {
			// Create a new array with the new tag added (to trigger reactivity)
			selectedTags = [...selectedTags, tag];
			console.log("selectedTags after adding:", selectedTags);
			// Dispatch the update event with the new selectedTags array
			dispatch("update", selectedTags);
		}
		// Clear the input value after adding a tag
		inputValue = "";
	}

	// Remove a tag from the selected tags
	function removeTag(tag: (typeof selectedTags)[number]) {
		// Filter out the tag to be removed
		selectedTags = selectedTags.filter((t) => t.id !== tag.id);
		// Dispatch the update event with the new selectedTags array
		dispatch("update", selectedTags);
	}

	// Handle keydown event for adding tags
	function handleKeydown(event: KeyboardEvent) {
		// Check if the pressed key is Enter and there's input
		if (event.key === "Enter" && inputValue) {
			event.preventDefault();
			// If there are filtered tags, add the first one
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
		placeholder="Přidat tag..." />
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
