<script>
	import { ROUTES } from "$lib/stores/store"; //proč nefunguje pro globálni použití na stránkách?
</script>

<main class="">
	<div
		class="container mx-auto px-5 shadow-md sm:rounded-lg py-10 mt-5 font-sans border-zinc-200 border bg-slate-100">
		<slot />
	</div>
</main>

<style>
</style>
