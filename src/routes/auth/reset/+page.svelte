<script lang="ts">
	import { enhance } from "$app/forms";
	import { page } from "$app/stores";
	import { fade } from "svelte/transition";
	import type { Actions } from "@sveltejs/kit";
	import AuthCard from "$lib/component/AuthCard.svelte";
	import { ROUTES } from "$lib/constants/routes";
	
	type FormData = {
		message?: {
			success: boolean;
			display: string;
		};
		password?: string;
		repassword?: string;
	};
	
	export let form: FormData | null = null;
	export let data;
	let { generalSettings } = data;
	$: ({ generalSettings } = data);
</script>

<svelte:head>
	<title>Obnovení hesla - {generalSettings?.shopName}</title>
	<meta name="description" content="Obnovení hesla" />
</svelte:head>

<AuthCard 
	title="Obnovení hesla"
	subtitle="Zadejte nové heslo pro váš účet"
>
	<form
		method="POST"
		action="?/resetPass"
		use:enhance={() => {
			return async ({ update }) => {
				// Neinvalidovat celý layout – po chybném pokusu by se ztratila session
				await update({ invalidateAll: false });
			};
		}}
		class="space-y-6"
	>
		<!-- Password input -->
		<div class="flex flex-col">
			<div class="relative flex">
				<span class="inline-flex items-center px-3 text-sm text-gray-500 bg-white border-t border-b border-l border-gray-300 shadow-sm rounded-l-md">
					<svg width="15" height="15" fill="currentColor" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg">
						<path d="M1376 768q40 0 68 28t28 68v576q0 40-28 68t-68 28h-960q-40 0-68-28t-28-68v-576q0-40 28-68t68-28h32v-320q0-185 131.5-316.5t316.5-131.5 316.5 131.5 131.5 316.5q0 26-19 45t-45 19h-64q-26 0-45-19t-19-45q0-106-75-181t-181-75-181 75-75 181v320h736z" />
					</svg>
				</span>
				<input
					value={form?.password ?? ""}
					type="password"
					name="password"
					id="password"
					class="w-full px-4 py-2 text-base bg-white border border-gray-300 rounded-lg shadow-sm appearance-none text-gray-700 focus:outline-none focus:border-green-600"
					required
					placeholder="Nové heslo (min 8 znaků)" />
			</div>
		</div>

		<!-- Password confirmation -->
		<div class="flex flex-col">
			<div class="relative flex">
				<span class="inline-flex items-center px-3 text-sm text-gray-500 bg-white border-t border-b border-l border-gray-300 shadow-sm rounded-l-md">
					<svg width="15" height="15" fill="currentColor" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg">
						<path d="M1376 768q40 0 68 28t28 68v576q0 40-28 68t-68 28h-960q-40 0-68-28t-28-68v-576q0-40 28-68t68-28h32v-320q0-185 131.5-316.5t316.5-131.5 316.5 131.5 131.5 316.5q0 26-19 45t-45 19h-64q-26 0-45-19t-19-45q0-106-75-181t-181-75-181 75-75 181v320h736z" />
					</svg>
				</span>
				<input
					value={form?.repassword ?? ""}
					type="password"
					name="repassword"
					id="repassword"
					class="w-full px-4 py-2 text-base bg-white border border-gray-300 rounded-lg shadow-sm appearance-none text-gray-700 focus:outline-none focus:border-green-600"
					required
					placeholder="Potvrzení nového hesla" />
			</div>
		</div>

		<!-- Submit button -->
		<button
			type="submit"
			class="w-full px-4 py-2 text-base font-semibold text-center text-white transition duration-200 ease-in-out transform bg-green-800 rounded-lg shadow-md hover:scale-105">
			Obnovit heslo
		</button>

		<!-- Back to login link -->
		<div class="text-center">
			<a href={ROUTES.AUTH.LOGIN} class="text-sm text-gray-500 hover:text-gray-700 underline">
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
