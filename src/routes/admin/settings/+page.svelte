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
	
	<!-- Profil uživatele -->
	<form
		class="mb-8"
		method="POST"
		action="?/update"
		use:enhance={handleSubmit}>
		<h2 class="text-2xl font-bold mb-4">Profil uživatele</h2>
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

		<button
			disabled={loading}
			type="submit"
			class="w-full btn btn-outline btn-success">
			{loading ? "Ukládá se..." : "Potvrdit změnu"}
		</button>
	</form>

	{#if form?.message}
		<div class="flex w-full p-2 my-4 border rounded-lg">
			<p
				class:success={form.message.success}
				class:error={!form.message.success}>
				{form.message.display}
			</p>
		</div>
	{/if}
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
