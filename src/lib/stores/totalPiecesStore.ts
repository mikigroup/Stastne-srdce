/*
import { derived } from "svelte/store";
import CartItemsStore from "$lib/stores/store";

export const totalPiecesStore = derived(CartItemsStore, ($CartItemsStore) => {
	return $CartItemsStore.reduce((sum: any, item: any) => {
		if (item.variants) {
			return (
				sum +
				item.variants.reduce(
					(variantSum: any, variant: any) => variantSum + variant.quantity,
					0
				)
			);
		}
		return sum + item.quantity;
	}, 0);
});
*/
