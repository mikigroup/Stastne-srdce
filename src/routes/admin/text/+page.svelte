<script lang="ts">
	import { onMount } from "svelte";
	import { enhance } from "$app/forms";
	import type { SubmitFunction } from "@sveltejs/kit";
	import type { ActionData, PageData } from "./$types";
	import { browser } from "$app/environment";

	export let data: PageData;
	export let form: ActionData;

	let { texts, occupiedPositions } = data;
	$: ({ texts, occupiedPositions } = data);

	let html = "";  // Primární proměnná pro obsah
	let Editor: any;
	let colors = ["#000000"];
	let loading = false;
	let title: string = "";
	let selectedTextId: number = 0;
	let existingContent: string = "";
	let selectedPage: string = "hlavni";
	let position: string = "";

	const pages = ["hlavni", "jidelnicek"];

	const actions = [
		"left", "right", "center", "justify", "p", "hr",
		"b", "i", "u", "strike", "h2", "blockquote",
		"ol", "ul", "a", "removeFormat", "undo", "redo", "viewHtml"
	];

	$: filteredTexts = texts.filter((text) => text.page === selectedPage);

	onMount(async () => {
		if (browser) {
			const module = await import("cl-editor");
			Editor = module.default;
		}
	});

	function loadText(textId: number) {
		const text = texts.find((t) => t.id === textId);
		if (text) {
			selectedTextId = text.id;
			title = text.title || "";

			// Nastavení HTML přímo přes reaktivní proměnnou
			html = text.text || "";

			existingContent = text.text || "";
			selectedPage = text.page || "hlavni";
			position = text.position || "";

			occupiedPositions = occupiedPositions.map((p) =>
				p.id === text.id ? { ...p, position: text.position || "" } : p
			);

			console.log("Načtený text:", text);
		}
	}

	function newText() {
		selectedTextId = 0;
		title = "";
		html = "";  // Vyčištění obsahu
		existingContent = "";
		position = "";
	}

	function handlePageChange() {
		selectedTextId = 0;
		newText();
	}

	const handleSubmit: SubmitFunction = ({ formData }) => {
		const submittedTitle = formData.get("title") as string;
		const submittedText = formData.get("text") as string;
		const submittedPage = formData.get("page") as string;

		if (!submittedText || !submittedPage) {
			alert("Text a stránka jsou povinné");
			return;
		}

		// Pro jídelníček není nadpis povinný
		if (submittedPage !== "jidelnicek" && !submittedTitle) {
			alert("Název je povinný pro všechny stránky kromě jídelníčku");
			return;
		}

		loading = true;
		return async ({ update, result }) => {
			await update();
			loading = false;

			if (result.type === "success") {
				console.log("Text uložen:", result.data);
			} else {
				console.error("Chyba při ukládání:", result.error);
			}
		};
	};

	function checkPosition(selectedPosition: string) {
		const occupiedPosition = occupiedPositions.find(
			(p) => p.position === selectedPosition
		);
		if (occupiedPosition && occupiedPosition.id !== selectedTextId) {
			const confirmed = confirm(
				`Pozice '${selectedPosition}' je již obsazena. Chcete přepsat existující text?`
			);
			if (confirmed) {
				selectedTextId = occupiedPosition.id;
				// Automaticky načteme text obsazené pozice
				loadText(occupiedPosition.id);
			} else {
				position = "";
			}
		}
	}
</script>

<svelte:head>
	<title>Editor textů</title>
	<meta name="description" content="Editor textů pro různé stránky" />
</svelte:head>

<section class="flex justify-center container">
	<div class="w-full">
		<form method="POST" action="?/update" use:enhance={handleSubmit} class="">
			<div class="">
				<h1 class="text-2xl mb-4">Editor textů</h1>
				<div class="mb-4">
					<select
						id="page-select"
						name="page"
						class="mr-5 border-black rounded-lg border p-2"
						bind:value={selectedPage}
						on:change={handlePageChange}
						required>
						{#each pages as page}
							<option value={page}>{page}</option>
						{/each}
					</select>
				</div>
				<div class="mb-4">
					<input type="hidden" name="id" bind:value={selectedTextId} />
					<select
						id="text-select"
						class="mr-5 border-black rounded-lg border p-2"
						bind:value={selectedTextId}
						on:change={() => loadText(selectedTextId)}
						disabled={!selectedPage}>
						<option value={0}>Vyberte text</option>
						{#each filteredTexts as text}
							<option value={text.id} selected={selectedTextId === text.id}>
								{text.title || 'Bez nadpisu'}
							</option>
						{/each}
					</select>
					<button type="button" class="btn btn-outline" on:click={newText}>
						Nový text
					</button>
				</div>

				{#if selectedPage === "hlavni"}
					<div class="py-5">
						<label>Umístění</label><br />
						<div class="flex gap-4">
							{#each ["left", "center", "right"] as pos}
								<div>
									<div>
										{pos === "left" ? "Levý" : pos === "center" ? "Střed" : "Pravý"}
									</div>
									<div>
										<input
											type="radio"
											name="position"
											value={pos}
											class="radio border-black"
											bind:group={position}
											on:change={() => checkPosition(pos)}
											disabled={occupiedPositions.some(
												(p) => p.position === pos && p.id !== selectedTextId
											)} />
									</div>
								</div>
							{/each}
						</div>
					</div>
				{/if}

				{#if selectedPage !== "jidelnicek"}
					<div class="py-5">
						<label for="title">Nadpis</label><br />
						<input
							class="border-black rounded-lg border p-2"
							id="title"
							name="title"
							type="text"
							bind:value={title}
							required />
					</div>
				{:else}
					<input type="hidden" name="title" value="" />
				{/if}

				<input type="hidden" name="text" bind:value={html} />

				<div class="mt-10">
					<h2 class="text-xl font-bold mb-2">Existující obsah:</h2>
					<div class="border-gray-400 border rounded-2xl p-5 w-full">
						{@html existingContent}
					</div>
				</div>

				<div class="mt-10">
					{#if browser && Editor}
						<Editor
							bind:html
							{colors}
							{actions}
							on:change={(evt) => {
								html = evt.detail;
								console.log('Editor content changed:', html);
							}} />
					{/if}
				</div>
			</div>

			<button
				disabled={loading ||
					!html ||
					!selectedPage ||
					(selectedPage !== "jidelnicek" && !title)}
				type="submit"
				class="btn btn-outline mt-4">
				{loading ? "Ukládá se..." : "Potvrdit změnu"}
			</button>

			{#if form?.message}
				<div class="flex w-full p-2 my-4 border rounded-lg">
					<p
						class:success={form.message.success}
						class:error={!form.message.success}>
						{form.message.display}
					</p>
				</div>
			{/if}
		</form>
	</div>
</section>

<style>
    .success { color: green; }
    .error { color: red; }
</style>