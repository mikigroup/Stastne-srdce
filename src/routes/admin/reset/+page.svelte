<script lang="ts">
	import { goto } from "$app/navigation";
	import type { ActionData } from "./$types";
	import { onMount } from "svelte";

	export let form: ActionData;

	let loading = false;

	onMount(() => {
		if (form?.message?.success) {
			setTimeout(() => {
				goto("/");
			}, 3000);
		}
	});
</script>

<svelte:head>
	<title>Leo - Reset hesla</title>
	<meta name="description" content="Reset" />
</svelte:head>

<section>
	<form method="POST" action="?/resetPass">
		<div class="pt-20 form-widget">
			<div
				class="flex flex-col w-full max-w-md px-4 py-8 mx-auto mt-20 bg-white rounded-lg shadow sm:px-6 md:px-8 lg:px-10">
				<div class="mb-4 text-3xl text-center text-gray-800">Nové heslo</div>
				<div class="flex w-full text-xl">
					<span
						class="inline-flex items-center px-3 text-sm text-gray-500 bg-white border-t border-b border-l border-gray-300 shadow-sm rounded-l-md">
						<svg
							width="15"
							height="15"
							fill="currentColor"
							viewBox="0 0 1792 1792"
							xmlns="http://www.w3.org/2000/svg">
							<path
								d="M1376 768q40 0 68 28t28 68v576q0 40-28 68t-68 28h-960q-40 0-68-28t-28-68v-576q0-40 28-68t68-28h32v-320q0-185 131.5-316.5t316.5-131.5 316.5 131.5 131.5 316.5q0 26-19 45t-45 19h-64q-26 0-45-19t-19-45q0-106-75-181t-181-75-181 75-75 181v320h736z" />
						</svg>
					</span>
					<div>
						<input
							class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
							name="password"
							type="password"
							placeholder="Zadej svoje nové heslo"
							value={form?.password ?? ""}
							minlength="6"
							required />
						<input
							class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
							name="newpassword"
							type="password"
							placeholder="Ještě jednou to samé"
							value={form?.newpassword ?? ""}
							minlength="6"
							required />
					</div>
				</div>
				<div class="flex w-full my-4">
					<button
						disabled={loading}
						id="btn-success"
						type="submit"
						class="w-full my-10 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
						{loading ? "Měnim heslo..." : "Změna hesla"}
					</button>
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
			</div>
		</div>
	</form>
</section>
