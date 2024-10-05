<script lang="ts">
	import Editor from "cl-editor";
	import { enhance, type SubmitFunction } from "$app/forms";
	import type { ActionData, PageData } from "./$types";
	import { onMount } from 'svelte';

	export let data: PageData;
	export let form: ActionData;

	let { session, texts } = data;
	$: ({ session, texts } = data);

	let html = "";
	let editor;
	let colors = ["#000000"];

	let loading = false;

	let title: string = "";

	const handleSubmit: SubmitFunction = ({ formData }) => {
		const submittedTitle = formData.get('title') as string;
		const submittedText = formData.get('text') as string;

		if (!submittedTitle || !submittedText) {
			alert('Název a text jsou povinné');
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

<section>
	<form method="POST" action="?/update" use:enhance={handleSubmit}>
		<div class="container mx-auto px-4">
			<h1 class="text-2xl mb-4">Editor - Info koutek</h1>
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
				<Editor {html} {colors} on:change={(evt)=>html = evt.detail} />
			</div>
			<input type="hidden" name="text" bind:value={html} />
			<div class="mt-10">
				<h2 class="text-xl font-bold mb-2">Editor Content:</h2>
				<div class="border-gray-400 border rounded-2xl p-5 max-w-md">
					{@html html}
				</div>
			</div>
		</div>
		<button
			disabled={loading || !title || !html}
			type="submit"
			class="border rounded-2xl p-4 mt-10 hover:bg-amber-50"
		>
			{loading ? "Ukládá se..." : "Potvrdit změnu"}
		</button>
		{#if form?.message}
			<div class="flex w-full p-2 my-4 border rounded-lg">
				<p
					class:success={form.message.success}
					class:error={!form.message.success}
				>
					{form.message.display}
				</p>
			</div>
		{/if}
	</form>
</section>