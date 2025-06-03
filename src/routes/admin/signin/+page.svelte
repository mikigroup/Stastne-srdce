<script lang="ts">
	import { page } from "$app/stores";
	import { goto } from "$app/navigation";
	import { enhance } from "$app/forms";
	import type { ActionData } from "./+page.server";
	import { onMount } from "svelte";

	export let form: ActionData | null = null;
	export let data;
	let { session, supabase } = data;
	$: ({ session, supabase } = data);

	let loading = false;

	async function signInWithGoogle() {
		const { data, error } = await supabase.auth.signInWithOAuth({
			provider: "google",
			options: {
				queryParams: {
					access_type: "offline",
					prompt: "consent"
				}
			}
		});
	}

/*	if (form?.message?.success) {
		onMount(() => {
			setTimeout(() => {
				goto("/admin");
			}, 3000);
		});
	}*/
</script>

<svelte:head>
	<title>LEO - Přihlásit</title>
</svelte:head>

<section class="flex justify-center py-20">
	<div
		class="w-full max-w-sm p-4 bg-white border border-gray-200 rounded-lg shadow sm:p-6 md:p-8">
		<form method="POST" action="?/handleLogin">
			{#if $page.data.session}
				<div class="flex justify-center w-full text-xl">
					<p class="">Vítej uživateli</p>
				</div>
			{:else}
				<h1 class="text-3xl text-center text-gray-800">Přihlásit</h1>
				<div
					class="text-sm font-medium text-center text-gray-500 dark:text-gray-300">
					nebo <br />nejsi ještě registrován?
					<a
						href="/signup"
						class="text-blue-700 hover:underline dark:text-blue-500"
						>Pojď na to!</a>
				</div>
				<div>
					<label
						for="email"
						class="block mt-5 mb-2 text-sm font-medium text-gray-900 dark:text-white"
						>Email</label>
					<input
						value={form?.email ?? "@"}
						type="email"
						name="email"
						id="email"
						class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
						placeholder="novak@leo.cz"
						required />
				</div>
				<div>
					<label
						for="password"
						class="block mt-5 mb-2 text-sm font-medium text-gray-900"
						>Heslo</label>
					<input
						value={form?.password ?? ""}
						type="password"
						name="password"
						id="password"
						placeholder="••••••••"
						class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
						required />
				</div>
				<div class="flex items-start">
					<div class="flex items-start">
						<!-- <div class="flex items-center h-5">
                    <input id="remember" type="checkbox" value="" class="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800" required>
                </div>
                <label for="remember" class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Zapamatovat heslo</label> -->
					</div>
					<a
						href="/forgot"
						class="mt-5 ml-auto text-sm text-blue-700 hover:underline"
						>Pokud neznáš heslo</a>
				</div>
				<button
					type="submit"
					class="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center my-10"
					>Potvrdit</button>
				{#if form?.message?.display}
					<div class="flex w-full p-2 my-4 border rounded-lg">
						<p class="error">{form.message.display}</p>
					</div>
				{/if}
				<hr class="mb-10" />
			{/if}
		</form>
		{#if !$page.data.session}
			<button
				on:click={() => {
					signInWithGoogle();
				}}
				value={loading ? "Loading" : "Log in with Google"}
				disabled={loading}
				class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center mr-2 mb-2">
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
				Přihlásit se přes Google
			</button>
		{/if}
	</div>
</section>
