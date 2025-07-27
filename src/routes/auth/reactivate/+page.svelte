<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	export let data: PageData;

	// Auto-redirect po successful reactivation
	onMount(() => {
		if (data.justReactivated) {
			// Počkej 3 sekundy a pak přesměruj na login
			setTimeout(() => {
				goto('/login?message=Účet byl úspěšně reaktivován');
			}, 3000);
		}
	});
</script>

<svelte:head>
	<title>Reaktivace účtu - Šťastné srdce</title>
</svelte:head>

<div class="max-w-2xl mx-auto p-6">
	<div class="bg-white shadow-md rounded-lg p-8">
		{#if !data.isValid}
			<div class="text-center">
				<div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
					<svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.996-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
					</svg>
				</div>
				<h1 class="text-2xl font-bold text-gray-900 mb-4">Reaktivace se nezdařila</h1>
				<p class="text-gray-600 mb-6">{data.message}</p>
				
				<div class="space-y-4">
					<a href="/kontakt" class="inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors">
						Kontaktovat podporu
					</a>
					<br>
					<a href="/auth/login" class="text-blue-600 hover:text-blue-800 underline">
						Zpět na přihlášení
					</a>
				</div>
			</div>

		{:else if data.justReactivated}
			<div class="text-center">
				<div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
					<svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
					</svg>
				</div>
				<h1 class="text-2xl font-bold text-green-900 mb-4">✅ Účet byl úspěšně reaktivován!</h1>
				<p class="text-gray-600 mb-6">{data.message}</p>
				
				{#if data.profile}
				<div class="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
					<h3 class="font-semibold text-green-900 mb-2">🎉 Vítejte zpět!</h3>
					<p class="text-green-700">
						Dobrý den <strong>{data.profile.firstName} {data.profile.lastName}</strong>,<br>
						váš účet <strong>{data.profile.email}</strong> je opět aktivní.
					</p>
				</div>
				{/if}

				<div class="space-y-4">
					<p class="text-sm text-gray-500 mb-4">
						🔄 Budete automaticky přesměrováni na přihlašovací stránku za 3 sekundy...
					</p>
					<a href="/auth/login" class="inline-block bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition-colors">
						Přihlásit se nyní
					</a>
				</div>
			</div>

		{:else if data.alreadyReactivated}
			<div class="text-center">
				<div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
					<svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
					</svg>
				</div>
				<h1 class="text-2xl font-bold text-blue-900 mb-4">Účet je již aktivní</h1>
				<p class="text-gray-600 mb-6">
					Váš účet {data.profile?.email} je již aktivní a funkční.
				</p>
				
				<div class="space-y-4">
					<a href="/auth/login" class="inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors">
						Přihlásit se
					</a>
					<br>
					<a href="/" class="text-blue-600 hover:text-blue-800 underline">
						Zpět na hlavní stránku
					</a>
				</div>
			</div>
		{/if}
	</div>
</div> 