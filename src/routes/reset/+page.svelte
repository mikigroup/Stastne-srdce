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
				class="flex flex-col w-full max-w-md px-4 py-8 mx-auto mt-20 bg-white rounded-lg shadow sm:px-6 md:px-8 lg:px-10"
			>
				<div class="self-center mb-4 text-3xl font-light text-gray-800 sm:text-2xl">Nové heslo</div>
				<div class="flex w-full text-xl">
					<span
						class="inline-flex items-center px-3 text-sm text-gray-500 bg-white border-t border-b border-l border-gray-300 shadow-sm rounded-l-md"
					>
						<svg
							width="15"
							height="15"
							fill="currentColor"
							viewBox="0 0 1792 1792"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								d="M1792 710v794q0 66-47 113t-113 47h-1472q-66 0-113-47t-47-113v-794q44 49 101 87 362 246 497 345 57 42 92.5 65.5t94.5 48 110 24.5h2q51 0 110-24.5t94.5-48 92.5-65.5q170-123 498-345 57-39 100-87zm0-294q0 79-49 151t-122 123q-376 261-468 325-10 7-42.5 30.5t-54 38-52 32.5-57.5 27-50 9h-2q-23 0-50-9t-57.5-27-52-32.5-54-38-42.5-30.5q-91-64-262-182.5t-205-142.5q-62-42-117-115.5t-55-136.5q0-78 41.5-130t118.5-52h1472q65 0 112.5 47t47.5 113z"
							/>
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
						required
					/>
					<input
						class="flex-1 w-full px-4 py-2 text-base text-gray-700 placeholder-gray-400 bg-white border border-gray-300 rounded-r-lg shadow-sm appearance-none focus:outline-none focus:border-green-600"
						name="newpassword"
						type="password"
						placeholder="Zadej nové heslo"						
						value={form?.newpassword ?? ""}
						minlength="6"
						required
					/>
          </div>         
				</div>
				<div class="flex w-full my-4">
					<button
						{loading}
						id="btn-success"
						type="submit"
						class="w-full px-4 py-2 text-base font-semibold text-center text-white transition duration-200 ease-in-out transform bg-green-800 rounded-lg shadow-md hover:scale-105">					
						Nastavit heslo
					</button>

					{#if form?.message}
						<div class="flex w-full p-2 my-4 border rounded-lg">
							<p class="error">{form.message.display}</p>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</form>
</section>
