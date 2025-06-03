<script lang="ts">
	import { page } from "$app/stores";
	import type { ActionData } from "./+page.server";

	export let form: ActionData | null = null;
	export let data;
	let { supabase } = data;
	$: ({ supabase } = data);

	let loading = false;
</script>

<svelte:head>
	<title>Malý Leo - Zapomenuté heslo</title>
	<meta name="description" content="Zapomenuté heslo" />
</svelte:head>

<section class="flex justify-center py-20">
	<div
		class="w-full max-w-sm p-4 bg-white border border-gray-200 rounded-lg shadow sm:p-6 md:p-8 dark:bg-gray-800 dark:border-gray-700">
		<form method="POST" action="?/forgotPass">
			<h5
				class="mb-4 text-3xl font-light text-center text-gray-800 sm:text-2xl">
				Zapomenuté heslo
			</h5>
			<div class="py-5">
				<label
					for="email"
					class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
					>Email</label>
				<input
					pattern="[^@]+@[^\.]+\..+"
					placeholder="novak@leo.cz"
					required
					type="email"
					value={form?.email ?? ""}
					name="email"
					id="email"
					class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" />
			</div>
			<div class="flex w-full my-4">
				<button
					disabled={loading}
					id="btn-success"
					type="submit"
					class="w-full my-10 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
					{loading ? "Odesílám..." : "Reset hesla"}
				</button>
			</div>
			{#if form?.message?.display}
				<div class="flex w-full p-2 my-4 border rounded-lg">
					<p class="error">{form.message.display}</p>
				</div>
			{/if}
		</form>
	</div>
</section>
