<script>
	import { page } from "$app/stores";

	// Získání chybové zprávy z URL
	const errorMsg = $page.url.searchParams.get("error") || "Došlo k neznámé chybě při ověřování";
</script>

<div class="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
	<div class="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
		<h1 class="text-2xl font-bold text-red-600 mb-4">Chyba ověření</h1>
		<p class="text-gray-700 mb-6">{errorMsg}</p>
		<p class="text-gray-600 mb-4">Váš odkaz pro ověření může být neplatný nebo vypršel. Zkuste požádat o nový odkaz pro ověření.</p>
		<div class="flex gap-4">
			<a href="/login" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
				Přihlásit se
			</a>
			<a href="/signup" class="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300">
				Registrovat se
			</a>
		</div>
	</div>
</div>