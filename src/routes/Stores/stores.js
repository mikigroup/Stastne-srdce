import { subscribe } from 'svelte/internal';
import { writable  , readable } from 'svelte/store';
import { browser } from '$app/env';

/* const storeCartItems = localStorage?.getItem("cart");
const initialStoreValue = storeCartItems == null?[]:JSON.parse(storeCartItems) */

let initialStoreValue;
if (typeof localStorage == "undefined")
{ initialStoreValue = [];}
else {
	const storeCartItems = localStorage?.getItem("cart");
	initialStoreValue = storeCartItems == null?[]:JSON.parse(storeCartItems);
};  
 
//vytváří v localStorage key "cart"
const CartItemsStore = writable(initialStoreValue);
CartItemsStore.subscribe(value => {
	if (typeof localStorage != "undefined")
		{
			localStorage.setItem("cart" , JSON.stringify(value));
	}
});

export const note = writable();
	

//vytváří v localStorage key "totalPieces"
/* const totalPiecesStore = writable();
totalPiecesStore.subscribe(value => {
	if (typeof localStorage != "undefined")
		{
			localStorage.setItem("totalPieces" , JSON.stringify(value));
	}
}); */

// nebo
/* export const enabled = writable<User>(JSON.parse(localStorage.getItem('user')))
enabled.subscribe((value) => localStorage.user = JSON.stringify(value)) */

//finta browser
/* if (browser){
    variable.subscribe((value) => localStorage.user = JSON.stringify(value))
} */

//nebo
// check for localStorage, this won't run on SSR
/* if (typeof localStorage !== 'undefined') {
  user.subscribe((value) => localStorage.user = JSON.stringify(value))
} */

export const time = readable(new Date(), function start(set) {
	const interval = setInterval(() => {
		set(new Date());
	}, 1000);

	return function stop() {
		clearInterval(interval);
	};
});

// export const currentCartItems = writable();
export const user = writable();
export default CartItemsStore;


//modal kosik
export function booleanStore(initial) {
  const isOpen = writable(initial)
  const { set, update } = isOpen
  return {
    isOpen,
    open: () => set(true),
    close: () => set(false),
    toggle: () => update((n) => !n),
  }
}


