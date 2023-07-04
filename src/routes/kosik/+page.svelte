<script lang="ts">
	import Kosik from './Kosik.svelte'
	import { page } from "$app/stores";
</script>
<svelte:head>
	<title>Šťastné srdce - Košík</title>
	<meta name="description" content="Košík" />
</svelte:head>


{#if !$page.data.session}
	<p class="pt-10 mt-10">Přihlaš se</p>
{:else}
	<Kosik session={$page.data.session} />
{/if}
