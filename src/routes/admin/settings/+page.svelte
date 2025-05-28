<script lang="ts">
	import { enhance, type SubmitFunction } from "$app/forms";
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
		username: form?.formData?.username ?? profiles?.username ?? "",
		telephone: form?.formData?.telephone ?? profiles?.telephone ?? "",
		company: form?.formData?.company ?? profiles?.company ?? "",
		ico: form?.formData?.ico ?? profiles?.ico ?? "",
		dic: form?.formData?.dic ?? profiles?.dic ?? "",
		street: form?.formData?.street ?? profiles?.street ?? "",
		street_number: form?.formData?.street_number ?? profiles?.street_number ?? "",
		city: form?.formData?.city ?? profiles?.city ?? "",
		zip_code: form?.formData?.zip_code ?? profiles?.zip_code ?? ""
	};

	const handleSubmit: SubmitFunction = () => {
		loading = true;
		return async () => {
			loading = false;
		};
	};
</script>

<div
	class="form-widget xl:w-1/2 mx-auto border-gray-400 border p-5 rounded-lg bg-zinc-100">
	<h1
		class="mt-10 mb-10 text-4xl font-extrabold leading-none text-center md:text-5xl lg:text-6xl">
		Nastavení
	</h1>
	<form
		class="form-widget"
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
					class="input input-bordered w-full max-w-xs {form?.errors?.first_name ? 'input-error' : ''}"
					placeholder="Franta"
					value={formData.first_name}
					name="first_name" />
				{#if form?.errors?.first_name}
					<p class="text-error text-sm mt-1">{form.errors.first_name}</p>
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
					class="input input-bordered w-full max-w-xs {form?.errors?.last_name ? 'input-error' : ''}"
					placeholder="Omáčka"
					value={formData.last_name}
					name="last_name" />
				{#if form?.errors?.last_name}
					<p class="text-error text-sm mt-1">{form.errors.last_name}</p>
				{/if}
			</div>
			<div>
				<label
					for="telephone"
					class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
					>Telefon</label>
				<input
					type="text"
					id="telephone"
					class="input input-bordered w-full max-w-xs {form?.warnings?.telephone ? 'input-warning' : ''}"
					placeholder="+420 123 456 789"
					value={formData.telephone}
					name="telephone" />
				{#if form?.warnings?.telephone}
					<p class="text-warning text-sm mt-1">{form.warnings.telephone}</p>
				{/if}
			</div>
			<div>
				<label
					for="username"
					class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
					>Přezdívka</label>
				<input
					type="text"
					id="username"
					class="input input-bordered w-full max-w-xs {form?.errors?.username ? 'input-error' : ''}"
					value={formData.username}
					name="username"
					placeholder="z mládí?" />
				{#if form?.errors?.username}
					<p class="text-error text-sm mt-1">{form.errors.username}</p>
				{/if}
			</div>
		</div>

		<h2 class="mt-8 mb-4">Fakturační údaje</h2>
		<div class="grid gap-6 mb-6 md:grid-cols-2">
			<div>
				<label
					for="company"
					class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
					>Společnost</label>
				<input
					type="text"
					id="company"
					class="input input-bordered w-full max-w-xs {form?.errors?.company ? 'input-error' : ''}"
					value={formData.company}
					name="company"
					placeholder="Název společnosti" />
				{#if form?.errors?.company}
					<p class="text-error text-sm mt-1">{form.errors.company}</p>
				{/if}
			</div>
			<div>
				<label
					for="ico"
					class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
					>IČO</label>
				<input
					type="text"
					id="ico"
					class="input input-bordered w-full max-w-xs {form?.warnings?.ico ? 'input-warning' : ''}"
					value={formData.ico}
					name="ico"
					placeholder="12345678" />
				{#if form?.warnings?.ico}
					<p class="text-warning text-sm mt-1">{form.warnings.ico}</p>
				{/if}
			</div>
			<div>
				<label
					for="dic"
					class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
					>DIČ</label>
				<input
					type="text"
					id="dic"
					class="input input-bordered w-full max-w-xs {form?.warnings?.dic ? 'input-warning' : ''}"
					value={formData.dic}
					name="dic"
					placeholder="CZ12345678" />
				{#if form?.warnings?.dic}
					<p class="text-warning text-sm mt-1">{form.warnings.dic}</p>
				{/if}
			</div>
		</div>

		<h2 class="mt-8 mb-4">Adresa</h2>
		<div class="grid gap-6 mb-6 md:grid-cols-2">
			<div>
				<label
					for="street"
					class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
					>Ulice</label>
				<input
					type="text"
					id="street"
					class="input input-bordered w-full max-w-xs {form?.errors?.street ? 'input-error' : ''}"
					value={formData.street}
					name="street"
					placeholder="Název ulice" />
				{#if form?.errors?.street}
					<p class="text-error text-sm mt-1">{form.errors.street}</p>
				{/if}
			</div>
			<div>
				<label
					for="street_number"
					class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
					>Číslo popisné</label>
				<input
					type="text"
					id="street_number"
					class="input input-bordered w-full max-w-xs {form?.errors?.street_number ? 'input-error' : ''}"
					value={formData.street_number}
					name="street_number"
					placeholder="123" />
				{#if form?.errors?.street_number}
					<p class="text-error text-sm mt-1">{form.errors.street_number}</p>
				{/if}
			</div>
			<div>
				<label
					for="city"
					class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
					>Město</label>
				<input
					type="text"
					id="city"
					class="input input-bordered w-full max-w-xs {form?.errors?.city ? 'input-error' : ''}"
					value={formData.city}
					name="city"
					placeholder="Název města" />
				{#if form?.errors?.city}
					<p class="text-error text-sm mt-1">{form.errors.city}</p>
				{/if}
			</div>
			<div>
				<label
					for="zip_code"
					class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
					>PSČ</label>
				<input
					type="text"
					id="zip_code"
					class="input input-bordered w-full max-w-xs {form?.warnings?.zip_code ? 'input-warning' : ''}"
					value={formData.zip_code}
					name="zip_code"
					placeholder="123 45" />
				{#if form?.warnings?.zip_code}
					<p class="text-warning text-sm mt-1">{form.warnings.zip_code}</p>
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
