<script>
	import { onMount } from 'svelte';
	
	let loading = false;
	let result = null;
	let error = null;
	let tokenInfo = null;
	
	async function testRefreshToken() {
		loading = true;
		error = null;
		result = null;
		
		try {
			console.log('🧪 Testing refresh token...');
			
			// Nejdříve získáme refresh token z token-status endpointu
			const tokenStatusResponse = await fetch('/api/fakturoid/token-status', {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json'
				}
			});
			
			if (!tokenStatusResponse.ok) {
				const tokenStatusData = await tokenStatusResponse.json();
				error = tokenStatusData;
				console.error('❌ Failed to get token status:', tokenStatusData);
				return;
			}
			
			const tokenStatusData = await tokenStatusResponse.json();
			console.log('📋 Token status:', tokenStatusData);
			
			// Získáme refresh token z DB (musíme ho získat přímo z DB, protože token-status ho nevrací)
			const dbResponse = await fetch('/api/fakturoid/get-refresh-token', {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json'
				}
			});
			
			if (!dbResponse.ok) {
				const dbData = await dbResponse.json();
				error = dbData;
				console.error('❌ Failed to get refresh token from DB:', dbData);
				return;
			}
			
			const dbData = await dbResponse.json();
			const refreshToken = dbData.refresh_token;
			
			if (!refreshToken) {
				error = { error: 'Refresh token není k dispozici' };
				console.error('❌ No refresh token available');
				return;
			}
			
			console.log('🔄 Refresh token length:', refreshToken.length);
			
			// Nyní pošleme refresh token na test-refresh endpoint
			const response = await fetch(`/api/fakturoid/test-refresh?refresh_token=${encodeURIComponent(refreshToken)}`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json'
				}
			});
			
			const responseText = await response.text();
			console.log('📡 Raw response:', responseText);
			console.log('📡 Response status:', response.status);
			console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
			
			if (response.ok) {
				try {
					const data = JSON.parse(responseText);
					result = data;
					console.log('✅ Test successful:', data);
				} catch (parseError) {
					result = { rawResponse: responseText };
					console.log('✅ Test successful (raw response):', responseText);
				}
			} else {
				try {
					const data = JSON.parse(responseText);
					error = {
						...data,
						httpStatus: response.status,
						httpStatusText: response.statusText,
						responseHeaders: Object.fromEntries(response.headers.entries()),
						rawResponse: responseText
					};
					console.error('❌ Test failed:', data);
				} catch (parseError) {
					error = { 
						error: `HTTP ${response.status}`,
						details: responseText,
						httpStatus: response.status,
						httpStatusText: response.statusText,
						responseHeaders: Object.fromEntries(response.headers.entries()),
						rawResponse: responseText
					};
					console.error('❌ Test failed (raw response):', responseText);
				}
			}
		} catch (err) {
			error = {
				error: 'Network error',
				details: err.message,
				stack: err.stack
			};
			console.error('❌ Network error:', err);
		} finally {
			loading = false;
		}
	}
	
	async function getTokenInfo() {
		try {
			const response = await fetch('/api/fakturoid/token-status', {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json'
				}
			});
			
			const data = await response.json();
			
			if (response.ok) {
				tokenInfo = data;
			} else {
				console.error('Failed to get token info:', data);
			}
		} catch (err) {
			console.error('Error getting token info:', err);
		}
	}
	
	onMount(() => {
		getTokenInfo();
	});
</script>

<div class="container mx-auto px-4 py-8">
	<h1 class="text-3xl font-bold mb-8">Test Refresh Token</h1>
	
	<!-- Token Info -->
	{#if tokenInfo}
		<div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
			<h2 class="text-lg font-semibold mb-3">Aktuální stav tokenu</h2>
			<div class="grid grid-cols-2 gap-4 text-sm">
				<div>
					<strong>Status:</strong> {tokenInfo.tokenStatus || 'N/A'}
				</div>
				<div>
					<strong>Account:</strong> {tokenInfo.accountEmail || 'N/A'}
				</div>
				<div>
					<strong>Expires at:</strong> {tokenInfo.expiresAt ? new Date(tokenInfo.expiresAt).toLocaleString('cs-CZ') : 'N/A'}
				</div>
				<div>
					<strong>Is expired:</strong> {tokenInfo.isExpired ? 'Ano' : 'Ne'}
				</div>
			</div>
		</div>
	{/if}
	
	<!-- Test Button -->
	<div class="mb-6">
		<button 
			on:click={testRefreshToken}
			disabled={loading}
			class="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded"
		>
			{loading ? 'Testuji...' : 'Testovat Refresh Token'}
		</button>
	</div>
	
	<!-- Results -->
	{#if result}
		<div class="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
			<h2 class="text-lg font-semibold text-green-800 mb-3">✅ Test úspěšný</h2>
			<div class="space-y-2 text-sm">
				<div><strong>Zpráva:</strong> {result.message}</div>
				<div><strong>Nové vypršení:</strong> {result.newExpiry} sekund</div>
				<div><strong>Access token délka:</strong> {result.accessTokenLength} znaků</div>
				<div><strong>Refresh token délka:</strong> {result.refreshTokenLength} znaků</div>
				{#if result.tokenInfo}
					<div class="mt-3 p-2 bg-green-100 rounded">
						<strong>Token info:</strong>
						<div class="text-xs">
							<div>Account: {result.tokenInfo.accountEmail}</div>
							<div>Status: {result.tokenInfo.status}</div>
							<div>Refresh attempts: {result.tokenInfo.refreshAttempts}</div>
						</div>
					</div>
				{/if}
			</div>
		</div>
	{/if}
	
	{#if error}
		<div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
			<h2 class="text-lg font-semibold text-red-800 mb-3">❌ Test selhal</h2>
			<div class="space-y-2 text-sm">
				<div><strong>Chyba:</strong> {error.error}</div>
				{#if error.details}
					<div><strong>Detaily:</strong> {error.details}</div>
				{/if}
				{#if error.httpStatus}
					<div><strong>HTTP Status:</strong> {error.httpStatus} {error.httpStatusText}</div>
				{/if}
				{#if error.status}
					<div><strong>Status:</strong> {error.status}</div>
				{/if}
				{#if error.responseHeaders}
					<div class="mt-3 p-2 bg-red-100 rounded">
						<strong>Response Headers:</strong>
						<div class="text-xs">
							{#each Object.entries(error.responseHeaders) as [key, value]}
								<div>{key}: {value}</div>
							{/each}
						</div>
					</div>
				{/if}
				{#if error.rawResponse}
					<div class="mt-3 p-2 bg-red-100 rounded">
						<strong>Raw Response:</strong>
						<pre class="text-xs overflow-x-auto">{error.rawResponse}</pre>
					</div>
				{/if}
				{#if error.stack}
					<div class="mt-3 p-2 bg-red-100 rounded">
						<strong>Stack Trace:</strong>
						<pre class="text-xs overflow-x-auto">{error.stack}</pre>
					</div>
				{/if}
				{#if error.tokenInfo}
					<div class="mt-3 p-2 bg-red-100 rounded">
						<strong>Token info:</strong>
						<div class="text-xs">
							<div>Account: {error.tokenInfo.accountEmail}</div>
							<div>Status: {error.tokenInfo.status}</div>
							<div>Refresh attempts: {error.tokenInfo.refreshAttempts}</div>
							<div>Expires at: {error.tokenInfo.expiresAt ? new Date(error.tokenInfo.expiresAt).toLocaleString('cs-CZ') : 'N/A'}</div>
						</div>
					</div>
				{/if}
			</div>
		</div>
	{/if}
	
	<!-- Fakturoid Documentation -->
	<div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
		<h2 class="text-lg font-semibold mb-3">Fakturoid API Dokumentace</h2>
		<div class="text-sm space-y-2">
			<p><strong>Endpoint:</strong> POST https://app.fakturoid.cz/api/v3/oauth/token</p>
			<p><strong>Headers:</strong></p>
			<ul class="list-disc list-inside ml-4">
				<li>Authorization: Basic [base64(client_id:client_secret)]</li>
				<li>Content-Type: application/x-www-form-urlencoded</li>
			</ul>
			<p><strong>Body:</strong></p>
			<pre class="bg-gray-100 p-2 rounded text-xs overflow-x-auto">
grant_type=refresh_token&refresh_token=[refresh_token]</pre>
		</div>
	</div>
</div> 