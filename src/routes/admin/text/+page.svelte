<script lang="ts">
	import { onMount } from 'svelte';
	import { enhance } from "$app/forms";
	import type { SubmitFunction } from "@sveltejs/kit";
	import type { ActionData, PageData } from "./$types";
	import { browser } from '$app/environment';

	export let data: PageData;
	export let form: ActionData;

	let { session, texts } = data;
	$: ({ session, texts } = data);

	let html = "";
	let Editor: any;
	let colors = ["#000000"];
	let loading = false;
	let title: string = "";
	let selectedTextId: number | null = null;
	let existingContent: string = "";

	const actions = ["b", "i", "ul", "ol", "undo", "redo", "hr"]

	onMount(async () => {
		if (browser) {
			const module = await import('cl-editor');
			Editor = module.default;
		}
	});

	function loadText(textId: number) {
		const text = texts.find((t) => t.id === textId);
		if (text) {
			title = text.title;
			html = text.text;
			existingContent = text.text;
		}
	}

	function newText() {
		title = "";
		html = "";
		existingContent = "";
		selectedTextId = null;
	}

	const handleSubmit: SubmitFunction = ({ formData }) => {
		const submittedTitle = formData.get("title") as string;
		const submittedText = formData.get("text") as string;

		if (!submittedTitle || !submittedText) {
			alert("Název a text jsou povinné");
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

<section class="mx-auto container flex">
	<form method="POST" action="?/update" use:enhance={handleSubmit}>
		<div class="container mx-auto px-4">
			<h1 class="text-2xl mb-4">Editor - Info koutek</h1>

			<div class="mb-4">
				<label for="text-select">Vybrat existující text:</label>
				<select id="text-select" class="border-black rounded-lg border p-2" bind:value={selectedTextId} on:change={() => loadText(selectedTextId)}>
					<option value={null}>-- Vyberte text --</option>
					{#each texts as text}
						<option value={text.id}>{text.title}</option>
					{/each}
				</select>
				<button type="button" class="btn btn-outline" on:click={newText}>Nový text</button>
			</div>

			<div class="py-5">
				<label for="title">Nadpis</label><br />
				<input
					class="border-black rounded-lg border p-2"
					id="title"
					name="title"
					type="text"
					bind:value={title}
					required
				/>
			</div>

			<div class="max-w-md">
				{#if browser && Editor}
					<Editor bind:html={html} {colors} {actions} on:change={(evt) => (html = evt.detail)} />
				{/if}
			</div>

			<input type="hidden" name="text" bind:value={html} />

			<div class="mt-10">
				<h2 class="text-xl font-bold mb-2">Existující obsah:</h2>
				<div class="border-gray-400 border rounded-2xl p-5 max-w-md">{@html existingContent}</div>
			</div>

			<!--<div class="mt-10">
				<h2 class="text-xl font-bold mb-2">Jak to bude vypadat:</h2>
				<div class="border-gray-400 border rounded-2xl p-5 max-w-md">{@html html}</div>
			</div>-->
		</div>

		<button
			disabled={loading || !title || !html}
			type="submit"
			class="btn btn-outline"
		>
			{loading ? "Ukládá se..." : "Potvrdit změnu"}
		</button>

		{#if form?.message}
			<div class="flex w-full p-2 my-4 border rounded-lg">
				<p class:success={form.message.success} class:error={!form.message.success}>
					{form.message.display}
				</p>
			</div>
		{/if}
	</form>
</section>