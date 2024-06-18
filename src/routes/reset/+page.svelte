<script lang="ts">
	import { goto } from "$app/navigation";
	import type { Actions } from "@sveltejs/kit";
	export let form: Actions;

	let loading = false;

	/* async function reset() {
		if (!newPassword) {
			message = "Zadejte heslo"
			return
		}

		loading = true

		try {
			const { error } = await supabase.auth.updateUser({ password: newPassword })
			if (error) {
				throw error
			}

			messageSuc = "Heslo změněno."
			goto("/jidelnicek")
		} catch (error) {
			messageFalse = error.error_description || error.message
		} finally {
			loading = false
		}
	}

	supabaseClient.auth.onAuthStateChange((state, session) => {
		user.set(state === "PASSWORD_RECOVERY" && session.user)
	}) */
</script>

<svelte:head>
	<title>Šťastné srdce - Reset hesla</title>
	<meta name="description" content="Reset" />
</svelte:head>

<section class="footer_fix2">
	<form method="POST" class="" action="?/resetPass">
		<div class="pt-20 form-widget">
			<div
				class="flex flex-col w-full max-w-md px-4 py-8 mx-auto mt-20 bg-white rounded-lg shadow sm:px-6 md:px-8 lg:px-10">
				<div
					class="self-center mb-4 text-3xl font-light text-gray-800 sm:text-2xl">
					Nové heslo
				</div>
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
								d="M1376 768q40 0 68 28t28 68v576q0 40-28 68t-68 28h-960q-40
												0-68-28t-28-68v-576q0-40 28-68t68-28h32v-320q0-185 131.5-316.5t316.5-131.5
												316.5 131.5 131.5 316.5q0 26-19 45t-45 19h-64q-26
												0-45-19t-19-45q0-106-75-181t-181-75-181 75-75 181v320h736z" />
						</svg>
					</span>
					<div>
						<input
							class="flex-1 w-full px-4 py-2 text-base text-gray-700 placeholder-gray-400 bg-white border border-gray-300 rounded-r-lg shadow-sm appearance-none focus:outline-none focus:border-green-600"
							name="password"
							type="password"
							placeholder="Zadej nové heslo"
							value={form?.password ?? ""}
							minlength="6"
							required />
						<input
							class="flex-1 w-full px-4 py-2 text-base text-gray-700 placeholder-gray-400 bg-white border border-gray-300 rounded-r-lg shadow-sm appearance-none focus:outline-none focus:border-green-600"
							name="newpassword"
							type="password"
							placeholder="Zadej nové heslo"
							value={form?.newpassword ?? ""}
							minlength="6"
							required />
					</div>
				</div>
				<div class="flex w-full my-4">
					<button
						{loading}
						id="btn-success"
						type="submit"
						class="w-full px-4 py-2 text-base font-semibold text-center text-white transition duration-200 ease-in-out transform bg-green-800 rounded-lg shadow-md hover:scale-105">
						{loading ? "Měnim heslo..." : "Změna hesla"}
					</button>
				</div>
				{#if form?.message}
					<div class="flex w-full p-2 my-4 border rounded-lg">
						<p class="error">{form.message.display}</p>
					</div>
				{/if}
			</div>
		</div>
	</form>
</section>
