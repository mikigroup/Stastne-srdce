<!-- <script>
  import CheckoutItem from "../CheckoutItem.svelte";
  import { cart } from "../Stores/stores";
  let checkedOut = false;
  let cartItems = [];
  const unsubscribe = cart.subscribe(items => {
    cartItems = Object.values(items);
  });
  const checkout = () => {
    checkedOut = true;
    cart.update(n => {
      return {};
    });
  };
</script>



<div class="container">
  <h1>Obsah košíku</h1>
  <div class="row">
    

    <div class="col-sm">
  {#if cartItems.length === 0}
    {#if checkedOut}
      <p class="empty-message">Děkujeme za nákup</p>
    {:else}
      <p class="empty-message">Košík je prázdný</p>
    {/if}
  {:else}
  <div class="row">
    {#each cartItems as item (item.name)}
      <CheckoutItem {item} />
    {/each}
    </div>
 <br>
   <div class="btn btn-success btn-lg btn-block" on:click={checkout}>Potvrdit</div>
  {/if}
</div>
</div>
</div>
 -->