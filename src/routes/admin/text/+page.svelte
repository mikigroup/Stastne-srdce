<script>
	import Editor from 'cl-editor';

	let html = '';
	let editor;
	let colors = ['#000000']
</script>

<svelte:head>
	<title>Cl Editor Example</title>
	<meta name="description" content="A page demonstrating usage of Cl Editor" />
</svelte:head>

<section>
	<div class="container mx-auto px-4">
		<h1 class="text-2xl font-bold mb-4">CL Editor</h1>
	<div class="max-w-md">
		<Editor {html} {colors} on:change={(evt)=>html = evt.detail}/>
	</div>
		<div class="mt-10">
			<h2 class="text-xl font-bold mb-2">Editor Content:</h2>
			<div class="border-gray-400 border rounded-2xl p-5 max-w-md">{@html html}</div>
		</div>
	</div>
</section>

<style>
    /* You can add any page specific styles here */
</style>