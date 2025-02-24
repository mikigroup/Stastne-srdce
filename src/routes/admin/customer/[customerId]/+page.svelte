<script lang="ts">
	import CustomerDetail from "../CustomerDetail.svelte";
	export let data;
	const { customers } = data;
</script>

<svelte:head>
	<title>LEO - Zákazník</title>
</svelte:head>

<CustomerDetail {data} customer={customers} />