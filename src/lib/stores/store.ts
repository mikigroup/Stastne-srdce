// src/lib/stores.ts

import { readable, writable } from "svelte/store";

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

export const ROUTES = readable({
	ADMIN: {
		BASE: "/admin",
		CUSTOMER: {
			LIST: "/admin/customer",
			NEW: "/admin/customer/newcustomer",
			EDIT: (id: string) => `/admin/customer/${id}`
		},
		MENU: {
			LIST: "/admin/menu",
			NEW: "/admin/menu/newmenu",
			EDIT: (id: string) => `/admin/menu/${id}`
		},
		ORDER: {
			LIST: "/admin/order",
			NEW: "/admin/order/neworder",
			EDIT: (id: string) => `/admin/order/${id}`
		},
		SETTINGS: "/admin/settings"
	},
	CUSTOMER: {
		HOME: "/",
		MENU: "/jidelnicek",
		CART: "/kosik",
		PROFILE: "/profile",
		CONTACT: "/kontakt",
		LOGIN: "/login",
		SIGNUP: "/signup"
	}
} as const);

export default CartItemsStore;
