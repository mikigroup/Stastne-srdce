<script>
	import {cart, address} from "../routes/Stores/cart";
	
		const checkOut = () => {
		alert(JSON.stringify($cart))
		alert(JSON.stringify($address))
	}
	
</script>


<div class="shipping-address">
	<div>
		<p>Name</p>
		<input bind:value={$address.name} />

		<p>Email</p>
		<input bind:value={$address.email} />

		<p>Phone</p>
		<input bind:value={$address.phone} />

		<p>Address</p>
		<textarea bind:value={$address.street} cols="24" rows="6"></textarea>

		<p>City</p>
		<input bind:value={$address.city} />

		<p>State</p>
		<input bind:value={$address.state} />

		<p>PIN</p>
		<input bind:value={$address.pin} />
		
		<div>
			<button on:click={checkOut}>Checkout</button>
		</div>
		
	</div>
	
	<div class="current-address">
		<p>{$address.name}</p>
		<p>{$address.email}</p>
		<p>{$address.phone}</p>
		<p>{$address.street}</p>
		<p>{$address.city}</p>
		<p>{$address.state}</p>
		<p>{$address.pin}</p>
	</div>
</div>


<style>
	.shipping-address {
		display: grid;
		grid-template-columns: 1fr 1fr;
		grid-gap: 1em;
	}
	.current-address {
		padding: 2em;
		border: 2px dashed green;
	}
</style>