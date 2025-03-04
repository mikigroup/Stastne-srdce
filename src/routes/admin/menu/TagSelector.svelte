<script lang="ts">

	// Přímé bindování místo event dispatcheru
	export let selectedTags:
		| Database["public"]["Tables"]["allergens"]["Row"][]
		| Database["public"]["Tables"]["ingredients"]["Row"][] = [];
	export let availableTags:
		| Database["public"]["Tables"]["allergens"]["Row"][]
		| Database["public"]["Tables"]["ingredients"]["Row"][] = [];

	// State pro input a filtrované tagy
	let inputValue = "";
	let filteredTags: typeof availableTags = [];

	// Reaktivní deklarace pro filtrování dostupných tagů
	$: {
		filteredTags = availableTags.filter(
			(tag) =>
				tag.name.toLowerCase().includes(inputValue.toLowerCase()) &&
				!selectedTags.some((selected) => selected.id === tag.id)
		);
	}

	// Přímá manipulace s bindovaným polem
	function toggleTag(tag) {
		const newTags = selectedTags.some(t => t.id === tag.id)
			? selectedTags.filter(t => t.id !== tag.id)
			: [...selectedTags, tag];

		// Aktualizujte lokální proměnnou
		selectedTags = newTags;

		console.log("Aktualizované selectedTags:", selectedTags);
	}

	// Funkce pro přidání tagu z textového vstupu
	function addTag(tag: (typeof availableTags)[number]) {
		if (!selectedTags.some((selected) => selected.id === tag.id)) {
			selectedTags = [...selectedTags, tag];
		}
		inputValue = "";
	}

	// Handle keydown event pro přidání tagů
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
	<!-- Alternativní UI s tlačítky pro snadnější výběr -->
	<div class="quick-select mb-3 flex flex-wrap gap-2">
		{#each availableTags as tag (tag.id)}
			<button
				type="button"
				class="text-sm rounded-full border px-3 py-1"
				class:bg-teal-800={selectedTags.some(t => t.id === tag.id)}
				class:text-white={selectedTags.some(t => t.id === tag.id)}
				class:border-green-700={selectedTags.some(t => t.id === tag.id)}
				class:bg-gray-100={!selectedTags.some(t => t.id === tag.id)}
				class:text-gray-700={!selectedTags.some(t => t.id === tag.id)}
				class:border-gray-300={!selectedTags.some(t => t.id === tag.id)}
				on:click={() => toggleTag(tag)}>
				{tag.number ? `${tag.number}. ` : ""}{tag.name}
			</button>
		{/each}
	</div>
	<hr>
	<!-- Vybrané tagy -->
<!--	<div class="selected-tags my-5">
		{#each selectedTags as tag (tag.id)}
			<span class="tag p-5">
				{tag.name}
			</span>
		{/each}
	</div>-->

	<!-- Textový vstup pro filtrování -->
	<!--<input
		type="text"
		bind:value={inputValue}
		on:keydown={handleKeydown}
		placeholder="Přidat tag..." />-->

	<!-- Návrhy tagů -->
	<!--{#if inputValue && filteredTags.length > 0}
		<ul class="tag-suggestions">
			{#each filteredTags as tag (tag.id)}
				<li on:click={() => addTag(tag)}>{tag.name}</li>
			{/each}
		</ul>
	{/if}-->
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