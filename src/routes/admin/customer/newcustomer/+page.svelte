<script lang="ts">
	import CustomerDetail from "../CustomerDetail.svelte";
	export let data;
</script>

<svelte:head>
	<title>LEO - Nový zákazník</title>
</svelte:head>

<CustomerDetail {data} />