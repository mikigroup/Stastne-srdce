export type DeliveryMethodPrice = {
	code?: string | null;
	name?: string | null;
	price?: number | null;
};

export type DeliveryPricingSettings = {
	freeDeliveryThreshold?: number | null;
	shippingMethods?: DeliveryMethodPrice[] | null;
};

/**
 * Cena vybrané metody. Neznámý kód je 0. Práh 0 dopravu zdarma nezapíná.
 * Při dnešních nulách Šťastného srdce vrací 0.
 */
export function shippingPriceForMethod(
	settings: DeliveryPricingSettings | null | undefined,
	methodCodeOrName: string | null | undefined,
	mealsSubtotal: number
): number {
	const method = (methodCodeOrName ?? "").trim();
	if (!method) return 0;

	const threshold = Number(settings?.freeDeliveryThreshold) || 0;
	const meals = Number(mealsSubtotal) || 0;
	if (threshold > 0 && meals >= threshold) return 0;

	const methods = Array.isArray(settings?.shippingMethods) ? settings.shippingMethods : [];
	const match = methods.find((item) => item?.code === method || item?.name === method);
	if (!match) return 0;

	const price = Number(match.price) || 0;
	return price > 0 ? Math.round(price) : 0;
}
