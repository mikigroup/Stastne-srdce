<script>
	import Editor from "cl-editor";

	let html = "";
	let editor;
	let colors = ["#000000"];
</script>

<svelte:head>
	<title>Editor</title>
	<meta name="description" content="" />
</svelte:head>

<section>
	<form action="">
		<div class="container mx-auto px-4">
			<h1 class="text-2xl font-bold mb-4">Editor</h1>
			<div class="py-5">
				<label for="">Nadpis</label>
				<input class="border-black rounded-lg border p-2" type="text" />
			</div>
			<div class="max-w-md">
				<Editor {html} {colors} on:change={(evt) => (html = evt.detail)} />
			</div>
			<div class="mt-10">
				<h2 class="text-xl font-bold mb-2">Editor Content:</h2>
				<div class="border-gray-400 border rounded-2xl p-5 max-w-md">
					{@html html}
				</div>
			</div>
			<button class="border rounded-2xl p-4 mt-10 hover:bg-amber-50"
				>Potvrdit</button>
		</div>
	</form>
</section>

<style>
	/* You can add any page specific styles here */
</style>
