import { readable, writable } from "svelte/store";

export interface MenuVariant {
	id: string;
	variant_number: string;
	description: string;
	price: number;
	quantity: number;
}

export interface CartItem {
	id: string;
	date: string;
	soup: string;
	variants: MenuVariant[];
}

function createCartStore() {
	const { subscribe, set, update } = writable<CartItem[]>([]);

	// Načtení dat z localStorage při inicializaci
	if (typeof window !== "undefined") {
		const stored = localStorage.getItem("cartItems");
		if (stored) {
			set(JSON.parse(stored));
		}
	}

	return {
		subscribe,
		addItem: (item: CartItem) => {
			update((items) => {
				const newItems = [...items];
				const existingItemIndex = items.findIndex((i) => i.id === item.id);

				if (existingItemIndex !== -1) {
					// Update existing item
					item.variants.forEach((newVariant) => {
						const existingVariantIndex = newItems[
							existingItemIndex
						].variants.findIndex((v) => v.id === newVariant.id);

						if (existingVariantIndex !== -1) {
							newItems[existingItemIndex].variants[
								existingVariantIndex
							].quantity += 1;
						} else {
							newItems[existingItemIndex].variants.push({
								...newVariant,
								quantity: 1
							});
						}
					});
				} else {
					// Add new item
					newItems.push({
						...item,
						variants: item.variants.map((v) => ({ ...v, quantity: 1 }))
					});
				}

				// Uložení do localStorage
				if (typeof window !== "undefined") {
					localStorage.setItem("cartItems", JSON.stringify(newItems));
				}

				return newItems;
			});
		},
		updateQuantity: (itemId: string, variantId: string, quantity: number) => {
			update((items) => {
				const newItems = items
					.map((item) => {
						if (item.id === itemId) {
							return {
								...item,
								variants: item.variants.map((v) =>
									v.id === variantId ? { ...v, quantity } : v
								)
							};
						}
						return item;
					})
					.filter((item) => item.variants.some((v) => v.quantity > 0));

				if (typeof window !== "undefined") {
					localStorage.setItem("cartItems", JSON.stringify(newItems));
				}

				return newItems;
			});
		},
		removeItem: (itemId: string, variantId: string) => {
			update((items) => {
				const newItems = items
					.map((item) => {
						if (item.id === itemId) {
							return {
								...item,
								variants: item.variants.filter((v) => v.id !== variantId)
							};
						}
						return item;
					})
					.filter((item) => item.variants.length > 0);

				if (typeof window !== "undefined") {
					localStorage.setItem("cartItems", JSON.stringify(newItems));
				}

				return newItems;
			});
		},
		clear: () => {
			set([]);
			if (typeof window !== "undefined") {
				localStorage.removeItem("cartItems");
			}
		}
	};
}

export const CartItemsStore = createCartStore();

// Create totalPiecesStore
function createTotalPiecesStore() {
	const { subscribe, set } = writable(0);

	// Initialize total from CartItemsStore
	CartItemsStore.subscribe(($cart) => {
		const total = $cart.reduce(
			(sum, item) =>
				sum +
				item.variants.reduce(
					(variantSum, variant) => variantSum + (variant.quantity || 0),
					0
				),
			0
		);
		set(total);
	});

	return {
		subscribe
	};
}

export const totalPiecesStore = createTotalPiecesStore();

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
