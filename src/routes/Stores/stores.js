import { writable } from "svelte/store";
import { browser } from "$app/environment";

let initialStoreValue;
if (typeof localStorage == "undefined") {
	initialStoreValue = [];
} else {
	const storeCartItems = localStorage?.getItem("cart");
	initialStoreValue = storeCartItems == null ? [] : JSON.parse(storeCartItems);
}

const CartItemsStore = writable(initialStoreValue);

CartItemsStore.subscribe((value) => {
	if (typeof localStorage != "undefined") {
		localStorage.setItem("cart", JSON.stringify(value));
	}
});

export default CartItemsStore;
