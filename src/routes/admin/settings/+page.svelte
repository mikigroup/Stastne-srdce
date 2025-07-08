<script lang="ts">
	import { enhance } from "$app/forms";
	import type { ActionData, PageData } from "./$types";
	import Rezervace from "./Rezervace.svelte";

	export let data: PageData;
	export let form: ActionData;

	let { session, profiles } = data;
	$: ({ session, profiles } = data);

	let loading = false;

	// Inicializace formuláře z dat nebo z předchozího odeslání
	$: formData = {
		first_name: form?.formData?.first_name ?? profiles?.first_name ?? "",
		last_name: form?.formData?.last_name ?? profiles?.last_name ?? "",		
	};

	const handleSubmit = () => {
		loading = true;
		return async () => {
			loading = false;
		};
	};
</script>

<div
	class="mx-auto border-gray-400 border p-5 rounded-lg bg-zinc-100 px-10 max-w-screen-md mx-auto">
	<h1
		class="mt-10 mb-10 text-4xl font-extrabold leading-none text-center md:text-5xl lg:text-6xl">
		Nastavení
	</h1>
	<form
		class=""
		method="POST"
		action="?/update"
		use:enhance={handleSubmit}>
		<h2>Uživatel</h2>
		<div class="grid mb-6 justify-items-center">
			<label
				for="email"
				class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
				>Email</label>
			<input
				value={session.user.email}
				disabled
				type="email"
				id="email"
				class="bg-gray-200 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 text-center md:w-1/4"
				placeholder="leon@zabijak.film" />
		</div>
		<div class="grid gap-6 mb-6 md:grid-cols-2">
			<div>
				<label
					for="first_name"
					class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
					>Jméno</label>
				<input
					type="text"
					id="first_name"
					class="input input-bordered w-full max-w-xs {form?.warnings?.first_name ? 'input-warning' : ''}"
					placeholder="Franta"
					value={formData.first_name}
					name="first_name" />
				{#if form?.warnings?.first_name}
					<p class="text-warning text-sm mt-1">{form.warnings.first_name}</p>
				{/if}
			</div>
			<div>
				<label
					for="last_name"
					class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
					>Příjmení</label>
				<input
					type="text"
					id="last_name"
					class="input input-bordered w-full max-w-xs {form?.warnings?.last_name ? 'input-warning' : ''}"
					placeholder="Omáčka"
					value={formData.last_name}
					name="last_name" />
				{#if form?.warnings?.last_name}
					<p class="text-warning text-sm mt-1">{form.warnings.last_name}</p>
				{/if}
			</div>			
		</div>


		<hr class="my-10" />
		<button
			disabled={loading}
			type="submit"
			class="w-full btn btn-outline btn-success">
			{loading ? "Ukládá se..." : "Potvrdit změnu"}
		</button>

		<!-- Další nastavení -->
		<hr class="my-10" />
		<div class="space-y-4">
			<h2 class="text-2xl font-bold text-gray-900">Další nastavení</h2>
			
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				<a 
					href="/admin/settings/loyalty"
					class="flex items-center p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
				>
					<div class="flex-shrink-0">
						<div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
							<span class="text-xl">💎</span>
						</div>
					</div>
					<div class="ml-4">
						<h3 class="text-lg font-medium text-gray-900">Věrnostní systém</h3>
						<p class="text-sm text-gray-600">Nastavení bodů, úrovní a výhod pro zákazníky</p>
					</div>
					<div class="ml-auto">
						<svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
						</svg>
					</div>
				</a>
			</div>
		</div>
		{#if form?.message}
			<div class="flex w-full p-2 my-4 border rounded-lg">
				<p
					class:success={form.message.success}
					class:error={!form.message.success}>
					{form.message.display}
				</p>
			</div>
		{/if}
	</form>
	<!-- <div class="flex justify-center">
<Rezervace {rezcalendar} />
</div> -->
</div>

<style>
	.success {
		@apply text-green-600;
	}
	.error {
		@apply text-red-600;
	}
	.warning {
		@apply text-yellow-600;
	}
	.input-warning {
		@apply border-yellow-500;
	}
</style>
