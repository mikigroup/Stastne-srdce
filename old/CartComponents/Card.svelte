<!-- <script context="module">
  import { get } from "svelte/store";

  
  export let item;


  let { name, price } = item;
  const cartItems = get(cart);
  let inCart = cartItems[name] ? cartItems[name].count : 0;
  function addToCart() {
    inCart++;
    cart.update(n => {
      return { ...n, [name]: { ...item, count: inCart } };
    });
  }
</script>


<div class="card">
  
  <div class="card-body">

  <h5 class="card-title">{name}</h5>
  

  <b class=alert alert-info > $ {price}</b>
  <p class=alert alert-info >{#if inCart > 0}
      <span>
        <em>({inCart} v košíku)</em>
      </span>
    {/if}</p> </div>
  <div class="btn-group" role="group">
    <button type="button" class="btn btn-primary" on:click={addToCart}>
      <object
        aria-label="shopping cart"
        type="image/svg+xml"
        data="img/svg/shopping-cart.svg" />
      Přidat do košíku
    </button>
  </div>

 
  
</div> -->
