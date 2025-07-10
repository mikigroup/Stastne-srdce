<script>
	import { page } from "$app/stores";
</script>

<svelte:head>
	<title>Admin přihlášení</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
	<div class="max-w-md w-full space-y-8">
		<slot />
	</div>
</div>

<style>
	:global(body) {
		background-color: #f9fafb;
	}
</style> 