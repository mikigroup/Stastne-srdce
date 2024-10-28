<script lang="ts">
	import { page } from "$app/stores";
	import type { ActionData, PageData } from "./$types";
	import { enhance } from "$app/forms";

	export let form: ActionData;
	export let data: PageData;

	let { supabase } = data;
	$: ({ supabase } = data);

	let loading = false;

	async function signInWithGoogle() {
		loading = true;
		const { data, error } = await supabase.auth.signInWithOAuth({
			provider: "google",
			options: {
				queryParams: {
					access_type: "offline",
					prompt: "consent"
				}
			}
		});
		if (error) {
			console.error("Chyba při přihlášení pomocí Google:", error.message);
		} else {
			// Redirect or handle successful sign-in
		}
		loading = false;
	}
</script>

<svelte:head>
	<title>LEO - Registrace</title>
</svelte:head>

<section class="flex justify-center py-20">
	<div
		class="w-full max-w-sm p-4 bg-white border border-gray-200 rounded-lg shadow sm:p-6 md:p-8">
		<form method="POST" action="?/signUp" use:enhance>
			{#if $page.data.session}
				<div class="flex w-full text-xl text-center">
					<p>Vítej uživateli</p>
				</div>
			{:else}
				<h1 class="text-3xl text-center text-gray-800">Registrace</h1>
				<div class="text-sm font-medium text-center text-gray-500">
					nebo <br />se chceš přihlásit?
					<a
						href="/admin/signin"
						aria-current={$page.url.pathname === "/admin/signin"
							? "page"
							: undefined}
						class="text-blue-700 hover:underline dark:text-blue-500"
						>Klikni sem!</a>
				</div>
				<div>
					<label
						for="email"
						class="block mt-5 mb-2 text-sm font-medium text-gray-900 dark:text-white"
						>Email</label>
					<input
						type="email"
						id="email"
						name="email"
						value={form?.email ?? ""}
						placeholder="novak@leo.cz"
						required
						class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" />
				</div>
				<div>
					<label
						for="password"
						class="block mt-5 mb-2 text-sm font-medium text-gray-900"
						>Vymysli heslo</label>
					<input
						type="password"
						id="password"
						name="password"
						value={form?.password ?? ""}
						minlength="6"
						placeholder="••••••••"
						required
						class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" />
					<p class="mt-1 text-xs text-gray-500">*minimálně 6 místné</p>
				</div>
				<div>
					<label
						for="confirmpassword"
						class="block mt-5 mb-2 text-sm font-medium text-gray-900"
						>Zadej znovu heslo</label>
					<input
						type="password"
						id="confirmpassword"
						name="confirmpassword"
						value={form?.confirmpassword ?? ""}
						minlength="6"
						placeholder="••••••••"
						required
						class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" />
					<p class="mt-1 text-xs text-gray-500">*musí se shodovat</p>
				</div>
				<div class="flex items-start mt-5">
					<div class="flex items-center h-5">
						<input
							id="remember"
							type="checkbox"
							required
							class="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-blue-300" />
					</div>
					<p class="ml-2 text-sm font-medium text-gray-900">
						Souhlasím s <a
							href="/podminky"
							aria-current={$page.url.pathname === "/podminky"
								? "page"
								: undefined}>podmínkama</a>
					</p>
				</div>
				<button
					type="submit"
					class="w-full my-10 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
					disabled={loading}>
					{loading ? "Registrace..." : "Potvrdit"}
				</button>
				<hr class="mb-10" />
				{#if form?.message}
					<div class="flex w-full p-2 my-4 border rounded-lg">
						<p
							class:success={form.message.success}
							class:error={!form.message.success}>
							{form.message.display}
						</p>
					</div>
				{/if}
			{/if}
		</form>
		<button
			on:click={signInWithGoogle}
			class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center mr-2 mb-2"
			disabled={loading}>
			<svg
				class="w-4 h-4 mr-2"
				aria-hidden="true"
				xmlns="http://www.w3.org/2000/svg"
				fill="currentColor"
				viewBox="0 0 18 19">
				<path
					fill-rule="evenodd"
					d="M8.842 18.083a8.8 8.8 0 0 1-8.65-8.948 8.841 8.841 0 0 1 8.8-8.652h.153a8.464 8.464 0 0 1 5.7 2.257l-2.193 2.038A5.27 5.27 0 0 0 9.09 3.4a5.882 5.882 0 0 0-.2 11.76h.124a5.091 5.091 0 0 0 5.248-4.057L14.3 11H9V8h8.34c.066.543.095 1.09.088 1.636-.086 5.053-3.463 8.449-8.4 8.449l-.186-.002Z"
					clip-rule="evenodd" />
			</svg>
			{loading ? "Přihlašování..." : "Registrace přes Google"}
		</button>
	</div>
</section>

<style>
	.success {
		color: green;
	}

	.error {
		color: red;
	}
</style>
