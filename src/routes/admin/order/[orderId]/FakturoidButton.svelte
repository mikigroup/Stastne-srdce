<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/stores';

	// Přijímání dat z serveru
	export let data;

	let authStatus = 'idle';
	let error = '';

	function startAuth() {
		if (!browser) return;

		authStatus = 'loading';
		error = '';

		try {
			// Použít URL vygenerovanou na serveru
			document.cookie = `oauth_state=${data.fakturoidState}; path=/; max-age=300`;
			window.location.href = data.fakturoidAuthUrl;
		} catch (err) {
			authStatus = 'error';
			error = 'Failed to start authentication';
			console.error(err);
		}
	}

	// Po načtení zkontrolovat stav autentizace
	if (browser) {
		const errorParam = $page.url.searchParams.get('error');
		if (errorParam) {
			error = errorParam;
		}
		$page.url.searchParams.get('auth') === 'success' && (authStatus = 'authenticated');
	}
</script>

{#if browser}
	<div class="auth-container">
		{#if authStatus === 'idle'}
			<button on:click={startAuth} class="auth-button">
				Připojit Fakturoid účet
			</button>
		{:else if authStatus === 'loading'}
			<div class="loading">Probíhá ověření...</div>
		{:else if authStatus === 'authenticated'}
			<div class="success">Úspěšně připojeno!</div>
		{/if}

		{#if error}
			<div class="error">{error}</div>
		{/if}
	</div>
{/if}

<style>
    .auth-container {
        margin: 1rem 0;
        padding: 1rem;
        border: 1px solid #e2e8f0;
        border-radius: 0.5rem;
    }

    .auth-button {
        background-color: #4f46e5;
        color: white;
        padding: 0.5rem 1rem;
        border-radius: 0.25rem;
        cursor: pointer;
    }

    .loading { color: #64748b; }
    .success { color: #10b981; }
    .error { color: #ef4444; }
</style>