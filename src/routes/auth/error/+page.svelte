<script>
	import { page } from "$app/stores";

	// Získání chybových informací z URL
	const errorCode = $page.url.searchParams.get("error_code");
	const errorMessage = $page.url.searchParams.get("error_message") || "Ověření se nezdařilo";
	const errorType = $page.url.searchParams.get("error_type");

	let userFriendlyMessage = "";

	// Poskytnutí uživatelsky přívětivých zpráv podle typu chyby
	if (errorCode === "401") {
		userFriendlyMessage = "Odkaz pro ověření již vypršel. Zkuste si znovu vyžádat nový odkaz.";
	} else if (errorCode === "invalid_token") {
		userFriendlyMessage = "Neplatný odkaz pro ověření. Zkuste si znovu vyžádat nový odkaz.";
	} else if (errorType === "exception") {
		userFriendlyMessage = "Při zpracování ověření došlo k neočekávané chybě. Zkuste to znovu později nebo kontaktujte podporu.";
	} else {
		userFriendlyMessage = "Váš odkaz pro ověření nemohl být zpracován. Zkuste si vyžádat nový.";
	}
</script>

<div class="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
	<div class="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
		<h1 class="text-2xl font-bold text-red-600 mb-4">Chyba ověření</h1>

		<p class="text-gray-700 mb-4">{userFriendlyMessage}</p>

		{#if errorMessage}
			<div class="bg-gray-50 border border-gray-200 rounded-md p-3 mb-6">
				<p class="text-gray-600 text-sm">{errorMessage}</p>
			</div>
		{/if}

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