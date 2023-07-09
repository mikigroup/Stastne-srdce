<script lang="ts">
	import Kosik from './Kosik.svelte'
	import { page } from '$app/stores'
</script>

<svelte:head>
	<title>Šťastné srdce - Košík</title>
	<meta name="description" content="Košík" />
</svelte:head>

{#if !$page.data.session}
	<main>
		<section>
			<div
				class="max-w-screen-lg px-4 py-8 py-16 mx-auto mt-20 mb-10 text-center rounded-lg bg-stone-100 footer_fix"
			>
				<div>
					<a href="/login"
						><button
							type="submit"
							value="submit"
							class="w-1/2 px-4 py-2 text-center text-white transition duration-200 ease-in bg-green-600 rounded-lg shadow-md w btn btn-success hover:bg-green-700 focus:ring-green-500 f ocus:ring-offset-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 s-H-c8uVOHPvWG"
							>Přihlaš se</button
						></a
					>
				</div>
			</div>
		</section>
	</main>
{:else}
	<Kosik session={$page.data.session} />
{/if}
