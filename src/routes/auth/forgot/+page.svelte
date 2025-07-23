<script lang="ts">
	import { page } from "$app/stores";
	import { fade } from "svelte/transition";
	import type { Actions } from "@sveltejs/kit";
	import AuthCard from "$lib/component/AuthCard.svelte";
	
	type FormData = {
		message?: {
			success: boolean;
			display: string;
		};
		email?: string;
	};
	
	export let form: FormData | null = null;
	export let data;
	let { session, supabase, user } = data;
	$: ({ session, supabase, user } = data);

	let loading = false;

	const { generalSettings } = data;
</script>

<svelte:head>
	<title>Zapomenuté heslo - {generalSettings?.shopName}</title>
	<meta name="description" content="Obnovení hesla" />
</svelte:head>

<AuthCard 
	title="Zapomenuté heslo"
	subtitle="Zadejte svůj email a my vám pošleme odkaz pro obnovení hesla"
>
	<form method="POST" action="?/handleForgotPassword" class="space-y-6">
		<!-- Email input -->
		<div class="flex flex-col">
			<div class="relative flex">
				<span class="inline-flex items-center px-3 text-sm text-gray-500 bg-white border-t border-b border-l border-gray-300 shadow-sm rounded-l-md">
					<svg width="15" height="15" fill="currentColor" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg">
						<path d="M1792 710v794q0 66-47 113t-113 47h-1472q-66 0-113-47t-47-113v-794q44 49 101 87 362 246 497 345 57 42 92.5 65.5t94.5 48 110 24.5h2q51 0 110-24.5t94.5-48 92.5-65.5q170-123 498-345 57-39 100-87zm0-294q0 79-49 151t-122 123q-376 261-468 325-10 7-42.5 30.5t-54 38-52 32.5-57.5 27-50 9h-2q-23 0-50-9t-57.5-27-52-32.5-54-38-42.5-30.5q-91-64-262-182.5t-205-142.5q-62-42-117-115.5t-55-136.5q0-78 41.5-130t118.5-52h1472q65 0 112.5 47t47.5 113z" />
					</svg>
				</span>
				<input
					value={form?.email ?? ""}
					type="email"
					name="email"
					id="email"
					class="w-full px-4 py-2 text-base bg-white border border-gray-300 rounded-lg shadow-sm appearance-none text-gray-700 focus:outline-none focus:border-green-600"
					required
					placeholder="Email" />
			</div>
		</div>

		<!-- Submit button -->
		<button
			type="submit"
			class="w-full px-4 py-2 text-base font-semibold text-center text-white transition duration-200 ease-in-out transform bg-green-800 rounded-lg shadow-md hover:scale-105">
			Odeslat odkaz pro obnovení hesla
		</button>

		<!-- Back to login link -->
		<div class="text-center">
			<a href="/auth/login" class="text-sm text-gray-500 hover:text-gray-700 underline">
				Zpět na přihlášení
			</a>
		</div>

		<!-- Message -->
		{#if form?.message?.display}
			<div class="w-full p-3 border rounded-lg"
				class:border-green-200={form.message.success}
				class:border-red-200={!form.message.success}
				class:bg-green-50={form.message.success}
				class:bg-red-50={!form.message.success}
			>
				<p class="text-sm"
					class:text-green-700={form.message.success}
					class:text-red-700={!form.message.success}
				>
					{form.message.display}
				</p>
			</div>
		{/if}
	</form>
</AuthCard>
