<script lang="ts">
	export let selectedTags: string[] = [];
	export let availableTags: string[] = [];
	export let onUpdate: (tags: string[]) => void;

	let newTag = '';

	function addTag() {
		if (newTag && !selectedTags.includes(newTag)) {
			selectedTags = [...selectedTags, newTag];
			onUpdate(selectedTags);
			newTag = '';
		}
	}

	function removeTag(tag: string) {
		selectedTags = selectedTags.filter(t => t !== tag);
		onUpdate(selectedTags);
	}

	function selectExistingTag(tag: string) {
		if (!selectedTags.includes(tag)) {
			selectedTags = [...selectedTags, tag];
			onUpdate(selectedTags);
		}
	}
</script>

<div class="tag-selector">
	<div class="selected-tags">
		{#each selectedTags as tag}
      <span class="tag">
        {tag}
				<button on:click={() => removeTag(tag)} class="remove-tag">×</button>
      </span>
		{/each}
	</div>
	<div class="tag-input">
		<input
			bind:value={newTag}
			on:keydown={(e) => e.key === 'Enter' && addTag()}
			placeholder="Přidat nový tag"
			class="input input-bordered"
		/>
		<button on:click={addTag} class="btn">Přidat</button>
	</div>
	<div class="available-tags">
		{#each availableTags.filter(tag => !selectedTags.includes(tag)) as tag}
			<button on:click={() => selectExistingTag(tag)} class="btn btn-sm">{tag}</button>
		{/each}
	</div>
</div>

<style>
    .tag-selector {
        margin-bottom: 1rem;
    }
    .selected-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin-bottom: 0.5rem;
    }
    .tag {
        background-color: #e2e8f0;
        padding: 0.25rem 0.5rem;
        border-radius: 0.25rem;
        display: inline-flex;
        align-items: center;
    }
    .remove-tag {
        margin-left: 0.25rem;
        cursor: pointer;
        border: none;
        background: none;
        font-size: 1.25rem;
    }
    .tag-input {
        display: flex;
        gap: 0.5rem;
        margin-bottom: 0.5rem;
    }
    .available-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
    }
</style>