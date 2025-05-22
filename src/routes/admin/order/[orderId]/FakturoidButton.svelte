<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/stores';

	let authStatus = 'idle';
	let error = '';

	async function startAuth() {
		if (!browser) return;

		authStatus = 'loading';
		error = '';

		try {
			// Generování náhodného state parametru
			const state = crypto.randomUUID();
			document.cookie = `oauth_state=${state}; path=/; max-age=300`;

			const authUrl = new URL('https://app.fakturoid.cz/api/v3/oauth');
			authUrl.searchParams.append('client_id', import.meta.env.VITE_PRIVATE_FAKTUROID_CLIENT_ID);
			authUrl.searchParams.append('redirect_uri', import.meta.env.VITE_FAKTUROID_REDIRECT_URI);
			authUrl.searchParams.append('response_type', 'code');
			authUrl.searchParams.append('state', state);

			window.location.href = authUrl.toString();
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