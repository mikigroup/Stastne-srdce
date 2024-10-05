<script>
	import Editor from "cl-editor/src/Editor.svelte";

	let html = '';
	let editor;
</script>

<svelte:head>
	<title>Cl Editor Example</title>
	<meta name="description" content="A page demonstrating usage of Cl Editor" />
</svelte:head>

<section>
	<div class="container mx-auto px-4">
		<h1 class="text-2xl font-bold mb-4">Cl Editor Example</h1>

		<Editor {html} on:change={(evt)=>html = evt.detail}/>

		<div class="mt-4">
			<h2 class="text-xl font-bold mb-2">Editor Content:</h2>
			{@html html}
		</div>
	</div>
</section>

<style>
    /* You can add any page specific styles here */
</style>