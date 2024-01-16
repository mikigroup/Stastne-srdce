<script>
import Account from './Account.svelte';
import { page } from '$app/stores';

export let data;
</script>
<svelte:head>
	<title>Šťastné srdce - Účet</title>
	<meta name="description" content="Účet" />
</svelte:head>

{#if !$page.data.session}
	<p class="pt-10 mt-10">Přihlaš se</p>
{:else}
	<Account session={$page.data.session} />			
{/if}




