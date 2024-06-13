import { derived } from "svelte/store";
import CartItemsStore from "./stores";

export const totalPiecesStore = derived(CartItemsStore, ($CartItemsStore) => {
	return $CartItemsStore.reduce((sum, item) => {
		if (item.variants) {
			return (
				sum +
				item.variants.reduce(
					(variantSum, variant) => variantSum + variant.quantity,
					0
				)
			);
		}
		return sum + item.quantity;
	}, 0);
});
