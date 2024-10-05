<script lang="ts">
	import { enhance, type SubmitFunction } from "$app/forms";
	import type { ActionData, PageData } from "./$types";
	import Rezervace from "./Rezervace.svelte";

	export let data: PageData;
	export let form: ActionData;

	let { session, profiles } = data;
	$: ({ session, profiles } = data);

	let loading = false;

	let username: string = profiles?.username ?? "";
	let avatarUrl: string | null = profiles?.avatar_url ?? null;
	let first_name: string = profiles?.first_name ?? "";
	let last_name: string = profiles?.last_name ?? "";
	let telephone: string = profiles?.telephone ?? "";

	const handleSubmit: SubmitFunction = () => {
		loading = true;
		return async () => {
			loading = false;
		};
	};
</script>
<div class="form-widget">
	<h1
		class="mt-10 mb-10 text-4xl font-extrabold leading-none tracking-tight text-center text-gray-900 md:text-5xl lg:text-6xl dark:text-white">
		Nastavení
	</h1>
	<form
		class="form-widget"
		method="POST"
		action="?/update"
		use:enhance={handleSubmit}>
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
					class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
					placeholder="Franta"
					value={form?.firstName ?? first_name}
					name="first_name" />
			</div>
			<div>
				<label
					for="last_name"
					class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
					>Příjmení</label>
				<input
					type="text"
					id="last_name"
					class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
					placeholder="Omáčka"
					value={form?.lastName ?? last_name}
					name="last_name" />
			</div>
			<div>
				<label
					for="telephone"
					class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
					>Telefon</label>
				<input
					type="text"
					id="telephone"
					class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
					placeholder="+420 123 456 789"
					value={form?.telephone ?? telephone}
					name="telephone" />
			</div>
			<div>
				<label
					for="username"
					class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
					>Přezdívka</label>
				<input
					type="text"
					id="username"
					class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
					value={form?.username ?? username}
					name="username"
					placeholder="z mládí?" />
			</div>
		</div>
		<button
			disabled={loading}
			type="submit"
			class="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center my-10"
			>
			{loading ? "Ukládá se..." : "Potvrdit změnu"}
		</button>
		{#if form?.message}
			<div class="flex w-full p-2 my-4 border rounded-lg">
				<p class:success={form.message.success} class:error={!form.message.success}>{form.message.display}</p>
			</div>
		{/if}
	</form>
	<hr class="my-10" />
	<!-- <div class="flex justify-center">
<Rezervace {rezcalendar} />
</div> -->
</div>