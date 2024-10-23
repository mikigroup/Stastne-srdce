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

	// Funkce pro řazení podle datumu
	function sortByDate(items: CartItem[]): CartItem[] {
		return [...items].sort((a, b) => {
			const dateA = new Date(a.date);
			const dateB = new Date(b.date);
			return dateA.getTime() - dateB.getTime();
		});
	}

	// Funkce pro řazení variant
	function sortVariants(variants: MenuVariant[]): MenuVariant[] {
		return [...variants].sort((a, b) => {
			const aNum = parseInt(a.variant_number);
			const bNum = parseInt(b.variant_number);
			return aNum - bNum;
		});
	}

	// Načtení a seřazení dat z localStorage při inicializaci
	if (typeof window !== "undefined") {
		const stored = localStorage.getItem("cartItems");
		if (stored) {
			const items = JSON.parse(stored);
			set(sortByDate(items));
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
							newItems[existingItemIndex].variants = sortVariants(
								newItems[existingItemIndex].variants
							);
						}
					});
				} else {
					// Add new item with sorted variants
					newItems.push({
						...item,
						variants: sortVariants(
							item.variants.map((v) => ({ ...v, quantity: 1 }))
						)
					});
				}

				// Sort by date and save
				const sortedItems = sortByDate(newItems);
				if (typeof window !== "undefined") {
					localStorage.setItem("cartItems", JSON.stringify(sortedItems));
				}

				return sortedItems;
			});
		},
		updateQuantity: (itemId: string, variantId: string, quantity: number) => {
			update((items) => {
				const newItems = items
					.map((item) => {
						if (item.id === itemId) {
							return {
								...item,
								variants: sortVariants(
									item.variants.map((v) =>
										v.id === variantId ? { ...v, quantity } : v
									)
								)
							};
						}
						return item;
					})
					.filter((item) => item.variants.some((v) => v.quantity > 0));

				// Sort by date and save
				const sortedItems = sortByDate(newItems);
				if (typeof window !== "undefined") {
					localStorage.setItem("cartItems", JSON.stringify(sortedItems));
				}

				return sortedItems;
			});
		},
		removeItem: (itemId: string, variantId: string) => {
			update((items) => {
				const newItems = items
					.map((item) => {
						if (item.id === itemId) {
							return {
								...item,
								variants: sortVariants(
									item.variants.filter((v) => v.id !== variantId)
								)
							};
						}
						return item;
					})
					.filter((item) => item.variants.length > 0);

				// Sort by date and save
				const sortedItems = sortByDate(newItems);
				if (typeof window !== "undefined") {
					localStorage.setItem("cartItems", JSON.stringify(sortedItems));
				}

				return sortedItems;
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

// Routes configuration
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
