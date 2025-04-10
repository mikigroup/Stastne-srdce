<script>
	import { page } from "$app/stores";

	// Získání chybové zprávy a dalších detailů z URL
	const errorType = $page.url.searchParams.get("error") || "neznámá_chyba";
	const errorMessage = $page.url.searchParams.get("message") || "Došlo k nespecifikované chybě při ověřování";

	// Mapování kódů chyb na uživatelsky přívětivé zprávy
	const errorMessages = {
		"verification_error": "Ověření e-mailu selhalo",
		"verify_exception": "Chyba při zpracování ověření",
		"global_exception": "Nastala neočekávaná chyba",
		"chybejici_parametry": "V odkazu chybí potřebné parametry",
		"neocekavana_chyba": "Došlo k neočekávané chybě",
		"verification_failed": "Ověření se nezdařilo"
	};

	const userFriendlyError = errorMessages[errorType] || "Chyba při ověřování";
</script>

<div class="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
	<div class="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
		<h1 class="text-2xl font-bold text-red-600 mb-4">Chyba ověření</h1>
		<p class="text-gray-700 mb-2"><strong>{userFriendlyError}</strong></p>
		<p class="text-gray-600 mb-4">{errorMessage}</p>

		<div class="bg-yellow-50 border-yellow-100 p-3 rounded-md mb-6">
			<p class="text-yellow-800">
				Váš odkaz pro ověření může být neplatný nebo vypršel. Zkuste požádat o nový odkaz pro ověření.
			</p>
		</div>

		<div class="flex flex-col sm:flex-row gap-4">
			<a href="/login" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-center">
				Přihlásit se
			</a>
			<a href="/signup" class="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 text-center">
				Vytvořit nový účet
			</a>
			<a href="/forgot" class="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 text-center">
				Obnovit heslo
			</a>
		</div>
	</div>
</div>