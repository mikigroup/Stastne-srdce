<script lang="ts">
	import { onMount } from "svelte";
	import { enhance } from "$app/forms";
	import type { SubmitFunction } from "@sveltejs/kit";
	import type { ActionData, PageData } from "./$types";
	import { browser } from "$app/environment";

	export let data: PageData;
	export let form: ActionData;

	let { session, texts, pages } = data;
	$: ({ session, texts, pages } = data);

	let html = "";
	let Editor: any;
	let colors = ["#000000"];
	let loading = false;
	let title: string = "";
	let selectedTextId: number;
	let existingContent: string = "";
	let selectedPage: string | null = null;

	const actions = [
		"p",
		"hr",
		"b",
		"i",
		"undo",
		"redo",
		"left",
		"right",
		"center",
		"justify"
	];

	$: filteredTexts = selectedPage
		? texts.filter((text) => text.page === selectedPage)
		: [];

	onMount(async () => {
		if (browser) {
			const module = await import("cl-editor");
			Editor = module.default;
		}
	});

	function loadText(textId: number) {
		const text = texts.find((t) => t.id === textId);
		if (text) {
			title = text.title || "";
			html = text.text || "";
			existingContent = text.text || "";
			selectedPage = text.page || null;
		}
	}

	function newText() {
		title = "";
		html = "";
		existingContent = "";
		selectedTextId = 0;
	}

	function handlePageChange() {
		selectedTextId = 0;
		newText();
	}

	const handleSubmit: SubmitFunction = ({ formData }) => {
		const submittedTitle = formData.get("title") as string;
		const submittedText = formData.get("text") as string;
		const submittedPage = formData.get("page") as string;

		if (!submittedTitle || !submittedText || !submittedPage) {
			alert("Název, text a stránka jsou povinné");
			return;
		}

		loading = true;
		return async ({ update }) => {
			await update();
			loading = false;
		};
	};
</script>

<svelte:head>
	<title>Editor</title>
	<meta name="description" content="" />
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
						<option value="">Vyberte stránku</option>
						{#each pages as page}
							<option value={page}>{page}</option>
						{/each}
					</select>
				</div>
				<div class="mb-4">
					<select
						id="text-select"
						class="mr-5 border-black rounded-lg border p-2"
						bind:value={selectedTextId}
						on:change={() => loadText(selectedTextId)}
						disabled={!selectedPage}>
						<option value={null}>Vyberte text</option>
						{#each filteredTexts as text}
							<option value={text.id}>{text.title}</option>
						{/each}
					</select>
					<button type="button" class="btn btn-outline" on:click={newText}
						>Nový text</button>
				</div>

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
				{/if}

				<div class="">
					{#if browser && Editor}
						<Editor
							bind:html
							{colors}
							{actions}
							on:change={(evt) => (html = evt.detail)} />
					{/if}
				</div>

				<input type="hidden" name="text" bind:value={html} />

				<div class="mt-10">
					<h2 class="text-xl font-bold mb-2">Existující obsah:</h2>
					<div class="border-gray-400 border rounded-2xl p-5 w-full">
						{@html existingContent}
					</div>
				</div>
			</div>

			<button
				disabled={loading || !title || !html || !selectedPage}
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
