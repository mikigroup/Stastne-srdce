<script lang="ts">
	import Kosik from './Kosik.svelte'
	import { page } from '$app/stores'
	import client from '../../lib/sanityClient'

	// export let data;
	// console.log(data.orders.orderNumber);

	/* const fetchLatestOrderId = async () => {
  try {
    // Fetch the schema for the 'order' type
    const orders = await client.fetch('*[_type == "order"]{_id}[0]');
    if (orders && orders._id) {
      // Extract the _id field
      const lastOrderId = orders._id;
      // You can use the lastOrderId as needed
      console.log('Last order ID:', lastOrderId);
    }
  } catch (error) {
    console.error('Error fetching latest order ID:', error);
  }
};
	console.log(data);
		console.log(orders); */
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
				<div class="flex">
					<a href="/login"
						class="w-full px-4 py-2 text-center text-white transition duration-200 ease-in bg-green-600 rounded-lg shadow-md w btn btn-success hover:bg-green-700 focus:ring-green-500 f ocus:ring-offset-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 s-H-c8uVOHPvWG">Přihlaš se
					</a>
				</div>
			</div>
		</section>
	</main>
{:else}
	<Kosik session={$page.data.session} />
{/if}
