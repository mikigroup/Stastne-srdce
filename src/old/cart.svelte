<!-- <script>
	import CartItemsStore from '../routes/Stores/stores';
	
	export let menu = [];

	$: cartItems = $CartItemsStore;

	const checkout = () => {
		alert(JSON.stringify($CartItemsStore))
	}
	
	$: totalCartItems = $CartItemsStore.length && $CartItemsStore.reduce((sum, item) => sum + item.quantity, 0)
	$: totalAmount = $CartItemsStore.length && $CartItemsStore.reduce((total, item) => total + item.price * item.quantity, 0)
</script>

<details>
	<summary>
		CartItemsStore({totalCartItems})
	</summary>
	<div class="CartItemsStore">
		{#if $cartItems.length}
		{#each cartItems as cartItem}
				<div class="flexible-grid">
					<input min="0" max="99" class="w-60" type="number" bind:value={cartItem.quantity}/>
					<p>₹{cartItem.price * cartItem.quantity}</p>
				</div>
			{/each}
			<div class="total-amount">
				<p>Total</p>
				<p></p>
				<p>{totalCartItems}</p>
				<p>₹{totalAmount}</p>
			</div>
			<div class="flex">
				<button on:click={checkout} class="ml-auto">Checkout</button>
			</div>

		{:else}
			<p>CartItemsStore is empty. Add items to CartItemsStore.</p>
		{/if}
	</div>
</details>

<style>
	.flexible-grid {
		display: grid;
		place-items: center;
		max-width: 300px;
		grid-template-columns: 1fr 1fr 1fr 1fr;
	}
	.total-amount {
		display: grid;
		place-items: center;
		grid-template-columns: 1fr 1fr 1fr 1fr;
		border-top: 2px dashed #eee
	}
	details {
		display: inline;
		border: 2px solid #eee;
		margin-bottom: 20px;
		cursor: pointer;
	}
	summary {
		padding: 0 10px;
	}
	.CartItemsStore {
		padding: 10px;
	}
	.flex{
		display: flex
	}
	.ml-auto {
		margin-left: auto;
	}
	.w-60 {
		width: 60px;
	}
</style>

 -->


<!-- <script>
	import {CartItemsStore } from "../routes/Stores/CartItemsStore";
	
	const minusItem = (product) => {
		for(let item of $CartItemsStore) {
				if(item.id === product.id) {
					if(product.quantity > 1 ) {
							product.quantity -= 1
							$CartItemsStore = $CartItemsStore
					} else {
							$CartItemsStore = $CartItemsStore.filter((CartItemsStoreItem) => CartItemsStoreItem != product)
					}
					return;
				}
		}
	}
	
	const plusItem = (product) => {
			for(let item of $CartItemsStore) {
							if(item.id === product.id) {
								product.quantity += 1
								$CartItemsStore = $CartItemsStore;
								return;
							}
					}
	}

		$: total = $CartItemsStore.reduce((sum, item) => sum + item.price * item.quantity, 0)
	
</script>

<div class="CartItemsStore-list">
	{#each $CartItemsStore as item }
		{#if item.quantity > 0}
		<div class="CartItemsStore-item">
			<img width="50" src={item.image} alt={item.name}/>
			<div>{item.quantity}
				<button on:click={() => plusItem(item)}>+</button>
				<button on:click={() => minusItem(item)}>-</button>
			</div>
			<p>₹{item.price * item.quantity}</p>
		</div>
		{/if}
	{/each}
	<div class="total">
		<h4>Total: ₹ {total}</h4>
	</div>
</div>


<style>
	.CartItemsStore-item {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
	}
	
	.total {
		text-align: right;
	}
	
	.CartItemsStore-list {
		border: 2px solid;
		padding: 10px;
	}
</style> -->