import { subscribe } from 'svelte/internal';
import { writable  , readable } from 'svelte/store';
import { browser } from '$app/environment';


/* const storeCartItems = localStorage?.getItem("cart");
const initialStoreValue = storeCartItems == null?[]:JSON.parse(storeCartItems) */

//vytváří v localStorage key "cart"
let initialStoreValue;
if (typeof localStorage == "undefined")
{ initialStoreValue = [];}
else {
	const storeCartItems = localStorage?.getItem("cart");
	initialStoreValue = storeCartItems == null?[]:JSON.parse(storeCartItems);
};  

const CartItemsStore = writable(initialStoreValue);
CartItemsStore.subscribe(value => {
	if (typeof localStorage != "undefined")
		{
			localStorage.setItem("cart" , JSON.stringify(value));
	}
});






//vytváří v localStorage key "totalPieces"
const userEmail = writable();
userEmail.subscribe(value => {
	if (typeof localStorage != "undefined")
		{
			localStorage.setItem("userEmail" , JSON.stringify(value));
	}
});

// nebo


// export const currentCartItems = writable();
export const user = writable(); //false ?
export default CartItemsStore;
export const session = writable(null);


//finta browser
/* if (browser){
    variable.subscribe((value) => localStorage.user = JSON.stringify(value))
} */

//nebo
// check for localStorage, this won't run on SSR
/* if (typeof localStorage !== 'undefined') {
  user.subscribe((value) => localStorage.user = JSON.stringify(value))
} */

/* export const time = readable(new Date(), function start(set) {
	const interval = setInterval(() => {
		set(new Date());
	}, 1000);

	return function stop() {
		clearInterval(interval);
	};
});
 */


/* export function getData() {
  return async (dispatch) => {
    try {
     const {
				data: { session },
			} = await supabase.auth.getSession()
			const { user } = session
    	} catch(err) {
      console.log('error: ', err)
    }
  }
} */


/* supabase.auth.onAuthStateChange((event, session) => {
	if (event == 'SIGNED_IN' && session) {
		userStore.set(session.user);
	} else if (event == 'SIGNED_OUT') {
		userStore.set(null);
	}
}); */

//modal kosik
/* export function booleanStore(initial) {
  const isOpen = writable(initial)
  const { set, update } = isOpen
  return {
    isOpen,
    open: () => set(true),
    close: () => set(false),
    toggle: () => update((n) => !n),
  }
} */


